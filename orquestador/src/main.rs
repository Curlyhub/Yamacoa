//! yamacoa-orquestador
//!
//! Dos modos:
//!   `yamacoa-orquestador cron [--una-vez]` : planificador nocturno (03:00 Europe/Madrid).
//!   `yamacoa-orquestador serve-mcp`        : servidor MCP por stdio (tools para Claude Code).
//!
//! Flujo del tick nocturno:
//!   1. Lee de Supabase (service_role) los envios con estado 'pendiente'.
//!   2. Por cada uno: materializa ops/_inbox/<slug>/ (contenido.md + fichero.pdf),
//!      marca 'en_proceso'.
//!   3. Escanea ops/_inbox/ (incluye carpetas depositadas a mano por el admin).
//!   4. Por carpeta: `claude -p "/procesar-inbox <slug> --auto" ...` en el repo.
//!      - stdout contiene `RESULTADO_OK`  -> borra carpeta; si venia de BD: estado
//!        'procesado', fija tema_slug, borra el PDF del bucket y (si asi lo decides,
//!        BORRAR_REGISTRO=1) elimina el registro tras copiarlo a la vista de procedencia.
//!      - en otro caso -> estado 'error' + motivo; la carpeta SE CONSERVA para diagnostico.
//!
//! NOTA rmcp: el API de macros ha ido cambiando entre versiones. Este fichero sigue el
//! patron documentado (#[tool_router]/#[tool]); si tu workspace fija otra version del SDK,
//! ajusta las firmas (es mecanico, el diseno de tools no cambia).

use anyhow::{bail, Context, Result};
use serde::Deserialize;
use serde_json::json;
use std::{env, fs, path::PathBuf, process::Stdio};
use tokio::process::Command;
use tracing::{error, info, warn};

// ============================================================ config

#[derive(Clone)]
#[allow(dead_code)]
struct Cfg {
    supabase_url: String,
    service_key: String,
    repo: PathBuf,
    claude_bin: String,
    autopublicar: bool,
    borrar_registro: bool,
}

impl Cfg {
    fn from_env() -> Result<Self> {
        Ok(Self {
            supabase_url: env::var("SUPABASE_URL").context("SUPABASE_URL")?,
            service_key: env::var("SUPABASE_SERVICE_ROLE_KEY")
                .context("SUPABASE_SERVICE_ROLE_KEY")?,
            repo: PathBuf::from(env::var("YAMACOA_REPO").context("YAMACOA_REPO")?),
            claude_bin: env::var("CLAUDE_BIN").unwrap_or_else(|_| "claude".into()),
            autopublicar: env::var("YAMACOA_AUTOPUBLICAR").as_deref() != Ok("0"),
            borrar_registro: env::var("BORRAR_REGISTRO").as_deref() == Ok("1"),
        })
    }
    fn inbox(&self) -> PathBuf { self.repo.join("ops/_inbox") }
}

// ============================================================ supabase REST

#[derive(Debug, Deserialize)]
struct Envio {
    id: i64,
    autor_id: String,
    titulo: String,
    fecha: String,
    texto: String,
    pdf_path: Option<String>,
}

struct Supa {
    http: reqwest::Client,
    base: String,
    key: String,
}

impl Supa {
    fn new(cfg: &Cfg) -> Self {
        Self {
            http: reqwest::Client::new(),
            base: cfg.supabase_url.trim_end_matches('/').to_string(),
            key: cfg.service_key.clone(),
        }
    }
    fn auth(&self, rb: reqwest::RequestBuilder) -> reqwest::RequestBuilder {
        rb.header("apikey", &self.key)
            .header("Authorization", format!("Bearer {}", self.key))
    }

    async fn pendientes(&self) -> Result<Vec<Envio>> {
        let url = format!(
            "{}/rest/v1/envios?estado=eq.pendiente&select=id,autor_id,titulo,fecha,texto,pdf_path&order=creado.asc",
            self.base
        );
        Ok(self.auth(self.http.get(url)).send().await?.error_for_status()?
            .json::<Vec<Envio>>().await?)
    }

    async fn autor_email(&self, autor_id: &str) -> Result<String> {
        let url = format!("{}/rest/v1/perfiles?id=eq.{}&select=email", self.base, autor_id);
        let v: Vec<serde_json::Value> =
            self.auth(self.http.get(url)).send().await?.error_for_status()?.json().await?;
        Ok(v.first().and_then(|p| p["email"].as_str()).unwrap_or("desconocido").to_string())
    }

    async fn marcar(&self, id: i64, estado: &str, motivo: Option<&str>, slug: Option<&str>) -> Result<()> {
        let url = format!("{}/rest/v1/envios?id=eq.{}", self.base, id);
        let mut body = json!({ "estado": estado });
        if let Some(m) = motivo { body["motivo_error"] = json!(m); }
        if let Some(s) = slug { body["tema_slug"] = json!(s); }
        self.auth(self.http.patch(url)).json(&body).send().await?.error_for_status()?;
        Ok(())
    }

    async fn descargar_pdf(&self, path: &str) -> Result<Vec<u8>> {
        let url = format!("{}/storage/v1/object/envios-pdf/{}", self.base, path);
        Ok(self.auth(self.http.get(url)).send().await?.error_for_status()?
            .bytes().await?.to_vec())
    }

    async fn borrar_pdf(&self, path: &str) -> Result<()> {
        let url = format!("{}/storage/v1/object/envios-pdf/{}", self.base, path);
        self.auth(self.http.delete(url)).send().await?.error_for_status()?;
        Ok(())
    }

    async fn borrar_registro(&self, id: i64) -> Result<()> {
        let url = format!("{}/rest/v1/envios?id=eq.{}", self.base, id);
        self.auth(self.http.delete(url)).send().await?.error_for_status()?;
        Ok(())
    }
}

// ============================================================ utilidades

fn slugificar(titulo: &str, id: i64) -> String {
    let base: String = titulo.to_lowercase().chars()
        .map(|c| match c {
            'a'..='z' | '0'..='9' => c,
            'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' | 'ü' => 'u', 'ñ' => 'n',
            _ => '_',
        })
        .collect();
    let base = base.split('_').filter(|s| !s.is_empty())
        .take(4).collect::<Vec<_>>().join("_");
    format!("{}_{}", if base.is_empty() { "envio".into() } else { base }, id)
}


#[derive(Debug, Deserialize)]
struct Resultado {
    ok: bool,
    tema_slug: String,
    #[serde(default)]
    motivo: Option<String>,
}

/// Veredicto independiente: centinela RESULTADO.json + artefactos reales en disco.
fn verificar_resultado(cfg: &Cfg, slug_inbox: &str) -> Option<String> {
    let dir = cfg.inbox().join(slug_inbox);
    let r: Resultado = serde_json::from_str(
        &fs::read_to_string(dir.join("RESULTADO.json")).ok()?).ok()?;
    if !r.ok { return None; }
    let t = &r.tema_slug;
    let artefactos = [
        cfg.repo.join(format!("src/temas/{t}.jsx")),
        cfg.repo.join(format!("public/data/{t}.json")),
        cfg.repo.join(format!("public/data/{t}.schema.json")),
    ];
    if !artefactos.iter().all(|p| p.is_file()) { return None; }
    let registry = fs::read_to_string(cfg.repo.join("src/temas/registry.js")).ok()?;
    if !registry.contains(t.as_str()) { return None; }
    Some(r.tema_slug)
}

/// Materializa la carpeta del inbox para un envio de BD.
async fn materializar(cfg: &Cfg, supa: &Supa, e: &Envio) -> Result<String> {
    let slug = slugificar(&e.titulo, e.id);
    let dir = cfg.inbox().join(&slug);
    fs::create_dir_all(&dir)?;
    let autor = supa.autor_email(&e.autor_id).await.unwrap_or_default();
    // Cabecera YAML: /procesar-inbox la usa para la procedencia. El cuerpo es DATO
    // no confiable y el comando lo trata como tal.
    let contenido = format!(
        "---\nenvio_id: {}\nautor: {}\norigen: envio\ntitulo: {}\nfecha: {}\n---\n\n{}\n",
        e.id, autor, e.titulo.replace('\n', " "), e.fecha, e.texto
    );
    fs::write(dir.join("contenido.md"), contenido)?;
    if let Some(p) = &e.pdf_path {
        match supa.descargar_pdf(p).await {
            Ok(bytes) => fs::write(dir.join("fichero.pdf"), bytes)?,
            Err(err) => warn!(envio = e.id, "PDF no descargable: {err}"),
        }
    }
    Ok(slug)
}

/// Lanza Claude Code headless sobre el repo para procesar una carpeta.
async fn procesar_carpeta(cfg: &Cfg, slug: &str) -> Result<Option<String>> {
    let auto = if cfg.autopublicar { " --auto" } else { "" };
    let prompt = format!("/procesar-inbox {slug}{auto}");
    info!(%slug, "claude -p \"{prompt}\"");
    let out = Command::new(&cfg.claude_bin)
        .current_dir(&cfg.repo)
        .args(["-p", &prompt, "--output-format", "text",
               "--allowedTools",
               "Read,Write,Edit,Glob,Grep,WebFetch,Task,Bash"])
        .stdin(Stdio::null())
        .output().await.context("no se pudo lanzar claude")?;
    // El exit code y el stdout ya no deciden: solo informan el log.
    let stdout = String::from_utf8_lossy(&out.stdout);
    let veredicto = verificar_resultado(cfg, slug);
    if veredicto.is_none() {
        error!(%slug, "sin veredicto valido; cola de stdout: {}",
            &stdout.chars().rev().take(400).collect::<String>()
                .chars().rev().collect::<String>());
    }
    Ok(veredicto)
}

// ============================================================ tick nocturno

// ============================================================ tick nocturno

async fn tick(cfg: &Cfg) -> Result<()> {
    let supa = Supa::new(cfg);
    fs::create_dir_all(cfg.inbox())?;

    // 1-2) BD -> inbox
    let mut de_bd: Vec<(String, Envio)> = Vec::new();
    for e in supa.pendientes().await? {
        match materializar(cfg, &supa, &e).await {
            Ok(slug) => {
                supa.marcar(e.id, "en_proceso", None, Some(&slug)).await?;
                de_bd.push((slug, e));
            }
            Err(err) => {
                error!(envio = e.id, "materializacion fallida: {err}");
                supa.marcar(e.id, "error", Some(&err.to_string()), None).await?;
            }
        }
    }

    // 2b) Sin trabajo nuevo, no se toca el inbox. Evita que un tick sin envios
    // reprocese carpetas viejas conservadas para diagnostico.
    // Con PROCESAR_MANUALES=1 se fuerza el barrido aunque no haya cola.
    let incluir_manuales = env::var("PROCESAR_MANUALES").as_deref() == Ok("1");
    if de_bd.is_empty() && !incluir_manuales {
        info!("sin envios pendientes; nada que hacer");
        return Ok(());
    }

    // 3) inventario del inbox (incluye carpetas manuales del admin)
    let carpetas: Vec<String> = fs::read_dir(cfg.inbox())?
        .filter_map(|d| d.ok())
        .filter(|d| d.path().is_dir())
        .map(|d| d.file_name().to_string_lossy().to_string())
        .collect();

    // 4) procesar en serie (una instancia de Claude Code a la vez)
    for slug in carpetas {
        let origen_bd = de_bd.iter().find(|(s, _)| *s == slug).map(|(_, e)| e);

        // Una carpeta sin fila en BD es residuo de un fallo anterior o un deposito
        // manual del admin. No entra en el tick nocturno salvo peticion explicita.
        if origen_bd.is_none() && !incluir_manuales {
            info!(%slug, "carpeta sin fila en BD; omitida (PROCESAR_MANUALES=1 para incluirla)");
            continue;
        }

        match procesar_carpeta(cfg, &slug).await {
            Ok(Some(tema_slug)) => {
                fs::remove_dir_all(cfg.inbox().join(&slug)).ok();
                if let Some(e) = origen_bd {
                    supa.marcar(e.id, "procesado", None, Some(&tema_slug)).await?;
                    if let Some(p) = &e.pdf_path { supa.borrar_pdf(p).await.ok(); }
                    if cfg.borrar_registro { supa.borrar_registro(e.id).await.ok(); }
                }
                info!(%slug, %tema_slug, "procesado y limpiado");
            }
            Ok(None) | Err(_) => {
                if let Some(e) = origen_bd {
                    supa.marcar(e.id, "error",
                        Some("sin RESULTADO.json valido o artefactos incompletos; carpeta conservada"),
                        Some(&slug)).await?;
                }
                warn!(%slug, "carpeta conservada para diagnostico");
            }
        }
    }
    Ok(())
}

// ============================================================ modo cron

async fn modo_cron(una_vez: bool) -> Result<()> {
    let cfg = Cfg::from_env()?;
    if una_vez {
        info!("ejecucion unica supervisada");
        return tick(&cfg).await;
    }
    use tokio_cron_scheduler::{Job, JobScheduler};
    let sched = JobScheduler::new().await?;
    let tz: chrono_tz::Tz = "Europe/Madrid".parse().unwrap();
    // seg min hora dia mes dow  -> 03:00 cada dia, hora de Madrid
    let job = Job::new_async_tz("0 0 3 * * *", tz, move |_id, _l| {
        Box::pin(async move {
            let cfg = match Cfg::from_env() { Ok(c) => c, Err(e) => { error!("{e}"); return; } };
            if let Err(e) = tick(&cfg).await { error!("tick fallido: {e:#}"); }
        })
    })?;
    sched.add(job).await?;
    sched.start().await?;
    info!("orquestador en marcha; proxima corrida 03:00 Europe/Madrid");
    tokio::signal::ctrl_c().await?;
    Ok(())
}

// ============================================================ modo MCP (rmcp)

mod mcp {
    use super::*;
    use rmcp::{
        handler::server::{wrapper::Parameters, ServerHandler},
        model::*, schemars, tool, tool_handler, tool_router,
        transport::stdio, ErrorData as McpError, ServiceExt,
    };

    #[allow(dead_code)]
    #[derive(Clone)]
    pub struct InboxServer {
        pub cfg: Cfg,
        tool_router: rmcp::handler::server::tool::ToolRouter<Self>,
    }

    #[derive(Debug, serde::Deserialize, schemars::JsonSchema)]
    pub struct MarcarArgs {
        /// id del envio en la tabla public.envios
        pub envio_id: i64,
        /// pendiente | en_proceso | procesado | error | eliminado
        pub estado: String,
        pub motivo: Option<String>,
        pub tema_slug: Option<String>,
    }

    #[derive(Debug, serde::Deserialize, schemars::JsonSchema)]
    pub struct ProcedenciaArgs {
        pub tema_slug: String,
        pub envio_id: Option<i64>,
        pub autor: String,
        /// "envio" | "manual"
        pub origen: String,
    }

    #[tool_router]
    impl InboxServer {
        pub fn new(cfg: Cfg) -> Self {
            Self { cfg, tool_router: Self::tool_router() }
        }

        /// Lista los envios pendientes de la tabla public.envios.
        #[tool(description = "Lista envios pendientes (id, titulo, fecha, autor_id, pdf_path)")]
        async fn inbox_pendientes(&self) -> Result<CallToolResult, McpError> {
            let supa = Supa::new(&self.cfg);
            let v = supa.pendientes().await
                .map_err(|e| McpError::internal_error(e.to_string(), None))?;
            Ok(CallToolResult::success(vec![ContentBlock::text(
                serde_json::to_string_pretty(&serde_json::json!(v.iter().map(|e| json!({
                    "id": e.id, "titulo": e.titulo, "fecha": e.fecha,
                    "autor_id": e.autor_id, "pdf": e.pdf_path,
                })).collect::<Vec<_>>())).unwrap(),
            )]))
        }

        /// Cambia el estado de un envio.
        #[tool(description = "Marca el estado de un envio (en_proceso/procesado/error/eliminado)")]
        async fn marcar_estado(
            &self,
            Parameters(a): Parameters<MarcarArgs>,
        ) -> Result<CallToolResult, McpError> {
            let supa = Supa::new(&self.cfg);
            supa.marcar(a.envio_id, &a.estado, a.motivo.as_deref(), a.tema_slug.as_deref())
                .await.map_err(|e| McpError::internal_error(e.to_string(), None))?;
            Ok(CallToolResult::success(vec![ContentBlock::text("ok")]))
        }

        /// Registra la procedencia de un tema en ops/registro_creaciones.json del repo.
        #[tool(description = "Anota tema_slug + autor + origen en ops/registro_creaciones.json")]
        async fn registrar_procedencia(
            &self,
            Parameters(a): Parameters<ProcedenciaArgs>,
        ) -> Result<CallToolResult, McpError> {
            let path = self.cfg.repo.join("ops/registro_creaciones.json");
            let mut arr: Vec<serde_json::Value> = fs::read_to_string(&path).ok()
                .and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default();
            arr.push(json!({
                "tema": a.tema_slug, "envio_id": a.envio_id, "autor": a.autor,
                "origen": a.origen, "fecha": chrono::Utc::now().to_rfc3339(),
            }));
            fs::write(&path, serde_json::to_string_pretty(&arr).unwrap())
                .map_err(|e| McpError::internal_error(e.to_string(), None))?;
            Ok(CallToolResult::success(vec![ContentBlock::text("ok")]))
        }
    }

    #[tool_handler]
    impl ServerHandler for InboxServer {
        fn get_info(&self) -> ServerInfo {
            ServerInfo::new(ServerCapabilities::builder().enable_tools().build())
                .with_instructions(
                    "Tools del orquestador Yamacoa: inbox de envios y procedencia.".to_string())
        }
    }

    pub async fn servir() -> Result<()> {
        let cfg = Cfg::from_env()?;
        let service = InboxServer::new(cfg).serve(stdio()).await?;
        service.waiting().await?;
        Ok(())
    }
}

// ============================================================ main

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env()
            .add_directive("yamacoa_orquestador=info".parse().unwrap()))
        .init();

    let args: Vec<String> = env::args().collect();
    match args.get(1).map(String::as_str) {
        Some("cron") => modo_cron(args.iter().any(|a| a == "--una-vez")).await,
        Some("serve-mcp") => mcp::servir().await,
        _ => bail!("uso: yamacoa-orquestador <cron [--una-vez] | serve-mcp>"),
    }
}
