// Barra común del portal (2026-10-18): Estudio automático · Opinión · Podcast · Administración.
// Cada página la monta tras comprobar la sesión. Solo se ven las opciones que la cuenta tiene
// permitidas (perfiles.puede_opinar, puede_grabar, es_admin); «Estudio automático» (el envío de
// documentos, index.html) es la opción por defecto. «Salir» cierra la sesión y vuelve al inicio.
const OPCIONES = [
  { id: "envios", href: "./index.html", texto: "Estudio automático", permiso: () => true },
  { id: "opinion", href: "./opinion.html", texto: "Opinión", permiso: (p) => p.puede_opinar },
  { id: "podcast", href: "./estudio.html", texto: "Podcast", permiso: (p) => p.puede_grabar },
  { id: "admin", href: "./admin.html", texto: "Administración", permiso: (p) => p.es_admin },
];

const CSS = `
.ypn{max-width:900px; margin:-8px auto 22px; padding:0 16px; display:flex; gap:6px; flex-wrap:wrap; align-items:center;}
.ypn a, .ypn button{font:600 13.5px 'Manrope',system-ui,sans-serif; color:#4a3f36; text-decoration:none; padding:9px 15px;
  border-radius:999px; background:#f5efe7; border:0; cursor:pointer; line-height:1.2;}
.ypn a:hover, .ypn button:hover{color:#1f1a16; box-shadow:inset 0 0 0 1px rgba(60,40,20,.25);}
.ypn a[aria-current="page"]{background:#3a2418; color:#fcf9f4;}
.ypn .ypn-salir{margin-left:auto; background:transparent; box-shadow:inset 0 0 0 1px rgba(60,40,20,.2);}
.ypn--hdr{margin:16px auto 0; max-width:892px;}  /* index.html: la cabecera ocupa todo el ancho */
@media (max-width:560px){ .ypn{margin-top:0;} .ypn a, .ypn button{font-size:12.5px; padding:8px 12px;} }
`;

export async function montarNav(sb, actual) {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return;
  const { data: perfil } = await sb.from("perfiles").select("puede_grabar,puede_opinar,es_admin").eq("id", session.user.id).single();
  if (!perfil) return;
  const visibles = OPCIONES.filter((o) => o.permiso(perfil));
  const nav = document.createElement("nav");
  nav.className = "ypn"; nav.setAttribute("aria-label", "Secciones del portal");
  const estilo = document.createElement("style"); estilo.textContent = CSS; document.head.append(estilo);
  for (const o of visibles) {
    const a = document.createElement("a"); a.href = o.href; a.textContent = o.texto;
    if (o.id === actual) a.setAttribute("aria-current", "page");
    nav.append(a);
  }
  if (!document.getElementById("b-salir")) { // index.html ya tiene su propio «Salir»
    const s = document.createElement("button"); s.type = "button"; s.className = "ypn-salir"; s.textContent = "Salir";
    s.onclick = async () => { await sb.auth.signOut(); location.href = "./index.html"; };
    nav.append(s);
  }
  const cab = document.querySelector("header");
  if (cab?.classList.contains("hdr")) nav.classList.add("ypn--hdr");
  cab?.after(nav);
}
