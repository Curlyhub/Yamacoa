"""Modelo de costes del caso de los Cinco / Red Avispa.
Monte Carlo con distribuciones triangulares; salida en USD corrientes y USD de 2025 (CPI-U BLS).
"""
import json, datetime as dt
import numpy as np

rng = np.random.default_rng(1998)
N = 200_000

# CPI-U media anual (BLS, 1982-84=100). 2012-2016 y 2024-2025 verificados en esta sesion;
# 1992-2011 de la serie BLS CUUR0000SA0 (verificar antes de publicar).
CPI = {1992:140.3,1993:144.5,1994:148.2,1995:152.4,1996:156.9,1997:160.5,1998:163.0,
       1999:166.6,2000:172.2,2001:177.1,2002:179.9,2003:184.0,2004:188.9,2005:195.3,
       2006:201.6,2007:207.342,2008:215.303,2009:214.537,2010:218.056,2011:224.939,
       2012:229.594,2013:232.957,2014:236.736,2015:237.017,2016:240.007}
CPI_2025 = 321.943

def factor(y0, y1):
    """Factor medio de conversion a USD 2025 para un gasto repartido uniformemente entre y0 e y1."""
    ys = range(y0, y1 + 1)
    return float(np.mean([CPI_2025 / CPI[y] for y in ys]))

def tri(lo, mode, hi):
    return rng.triangular(lo, mode, hi, N)

# ---------- Encarcelamiento (calculado) ----------
# COIF anual BOP (confirmado): 2003 23181; 2008 25895; 2010 28284 (US Courts); 2015 31977.65
anch = {2003:23181, 2008:25895, 2010:28284, 2015:31978}
xs = sorted(anch); ys = [anch[x] for x in xs]
def coif(y):
    if y < 2003:
        slope = (anch[2008]-anch[2003])/5
        return anch[2003] - slope*(2003-y)
    return float(np.interp(y, xs, ys))

arresto = dt.date(1998,9,12)
salidas = {
    "René González": dt.date(2011,10,7),
    "Fernando González": dt.date(2014,2,27),
    "Gerardo Hernández": dt.date(2014,12,17),
    "Ramón Labañino": dt.date(2014,12,17),
    "Antonio Guerrero": dt.date(2014,12,17),
}
dias_por_anio = {}
persona_anios = {}
for nombre, fin in salidas.items():
    persona_anios[nombre] = round((fin - arresto).days / 365.25, 2)
    d = arresto
    while d < fin:
        dias_por_anio[d.year] = dias_por_anio.get(d.year, 0) + 1
        d += dt.timedelta(days=1)
encarc_nominal = sum(n * coif(y)/365 for y, n in dias_por_anio.items())
encarc_2025 = sum(n * coif(y)/365 * CPI_2025/CPI[y] for y, n in dias_por_anio.items())
# Prisiones de alta seguridad (USP) cuestan mas que la media: multiplicador incierto (estimado)
mult_usp = tri(1.0, 1.15, 1.4)

# ---------- Partidas ----------
# libro: EEUU | CUBA | CONEXO ; conf: etiqueta Yamacoa; (lo, mode, hi) en USD corrientes
P = []
def add(id_, libro, nombre, conf, y0, y1, draws_nominal, nota, fuentes):
    P.append(dict(id=id_, libro=libro, nombre=nombre, conf=conf, y0=y0, y1=y1,
                  draws=draws_nominal, f=factor(y0, y1), nota=nota, fuentes=fuentes))

# EEUU
add("us_fbi","EEUU","Investigación del FBI (vigilancia FISA, descifrado, detenciones)","estimado",1995,1999,
    tri(8,14,25)*4*tri(100e3,125e3,155e3),
    "4 años de 8 a 25 equivalentes a tiempo completo con coste cargado de 100-155 mil USD/año. Sin cifra oficial; el FBI obtuvo autorización FISA en 1995.",
    ["havanatimes_habeas","washtimes_2001"])
add("us_fiscalia","EEUU","Fiscalía federal (SDFL): instrucción, juicio, apelaciones y hábeas","estimado",1998,2014,
    tri(3,4,5)*2.75*tri(140e3,165e3,200e3) + tri(0.5,0.8,1.5)*13*tri(140e3,165e3,200e3),
    "Equipo de 3-5 fiscales y apoyo hasta la sentencia (2,75 años) y 0,5-1,5 a tiempo completo durante 13 años de apelaciones, resentencias y hábeas.",
    ["campa_2008","jurist_2009"])
add("us_defensa_juicio","EEUU","Defensa de oficio en primera instancia (CJA + defensor público)","estimado",1998,2001,
    4*tri(2500,3800,5500)*tri(55,62,72) + 2.75*tri(120e3,150e3,180e3) + tri(0.15,0.35,0.7)*1e6,
    "Cuatro abogados del panel CJA (tarifa 50-75 USD/h en 2000-2001) más un defensor público, peritos, investigadores y declaraciones tomadas en Cuba.",
    ["herald_2001","cja_txs"])
add("us_defensa_apel","EEUU","Defensa en apelaciones y hábeas (2002-2014)","estimado",2002,2014,
    tri(0.2,0.6,1.5)*1e6,
    "Fuente de financiación no confirmada: parte fue trabajo pro bono o privado (Weinglass, Akin Gump). Rango amplio por esa razón.",
    ["scotus_appendix","weinglass"])
add("us_tribunal","EEUU","Tribunal: siete meses de juicio, jurado, alguaciles y seguridad","estimado",2000,2001,
    tri(0.4,0.8,1.6)*1e6,
    "Juicio de unos siete meses, el más largo del país en su momento según varias fuentes; más de 20.000 páginas de pruebas.",
    ["kimber_trial","wiki_cuban5"])
add("us_carcel","EEUU","Custodia y prisión (77,3 años-persona)","calculado",1998,2014,
    encarc_nominal*mult_usp,
    "Días de custodia de cada uno multiplicados por la tarifa media anual de la Oficina de Prisiones (COIF), interpolada entre los años publicados. El multiplicador 1,0-1,4 cubre el sobrecoste de las prisiones de alta seguridad.",
    ["bop_2003","bop_2008","uscourts_2010","bop_2015"])
add("us_libertad_sup","EEUU","Libertad supervisada de René González (2011-2013)","calculado",2011,2013,
    np.full(N, 1.6*365*10.79),
    "Unos 1,6 años a 10,79 USD/día (coste de supervisión federal en 2010).",
    ["uscourts_2010","ips_rene"])

# CUBA
add("cu_red","CUBA","Operación de la Red Avispa (14 miembros, ~1992-1998)","estimado",1992,1998,
    14*tri(5,6,7)*tri(8e3,15e3,31e3) + tri(0.3,0.8,2.0)*1e6,
    "Anclaje: un agente vivía con un presupuesto de 30.935 USD asignado por La Habana en 1996. Varios agentes tenían dos empleos para pagar el alquiler. Se suma el apoyo desde La Habana (control, radio, formación).",
    ["ap_2000_budget","guardian_lowbudget","cubanet_14"])
add("cu_visitas","CUBA","Viajes de familiares a las prisiones","estimado",2001,2014,
    tri(130,190,280)*tri(1500,2500,4000),
    "Menos de una visita al año por preso de media, según grupos de apoyo; a Olga Salanueva y Adriana Pérez se les negó el visado repetidamente. Se asume que el Estado cubano pagó los viajes.",
    ["amnesty_2009","bulatlat"])
add("cu_legal","CUBA","Apoyo legal pagado por Cuba","no_cuantificado",2001,2014,
    tri(0,0.3,1.5)*1e6,
    "No hay prueba de que Cuba pagara la defensa del juicio, que fue de oficio. Este rango cubre posibles pagos en apelaciones y no debe leerse como cifra.",
    ["herald_2001"])
add("cu_coloquios","CUBA","Coloquios internacionales de Holguín (9 ediciones)","estimado",2005,2013,
    9*tri(100e3,200e3,400e3),
    "300-413 delegados de unos 50 países por edición, más marchas y actos locales. Los delegados pagaban en general su propio vuelo; Cuba cubría la logística en la isla.",
    ["rebelion_vi","rebelion_vii","vermelho_viii","counterpunch_ix"])
# Red exterior: países activos por año interpolados (27 en 2006, ~110 en 2011-2012)
anios = list(range(2001, 2015))
paises = np.interp(anios, [2001, 2006, 2011, 2014], [12, 27, 110, 111])
pais_anios = float(paises.sum())
add("cu_embajadas","CUBA","Red exterior: embajadas, ICAP y apoyo a comités","estimado",2001,2014,
    pais_anios*tri(4e3,15e3,60e3),
    f"{pais_anios:.0f} países-año con actividad documentada (comités en 27 países en 2006 y en unos 110 en 2011-2012), por un gasto marginal de 4.000-60.000 USD por país y año. No existe desglose por embajada.",
    ["wiki2006","rebelion_346","rebelion_2000asoc"])
add("cu_giras","CUBA","Giras internacionales de familiares y jornadas en Washington y Londres","estimado",2003,2014,
    tri(0.3,0.7,1.5)*1e6,
    "Giras de madres y esposas, las jornadas «5 días por los 5» (2012-2014) y la comisión de Londres (2014); parte las costearon los comités.",
    ["rebelion_5dias","watching_londres"])
add("cu_interna","CUBA","Propaganda interna: gasto en divisas","estimado",2001,2014,
    14*tri(0.15,0.4,1.0)*1e6,
    "Solo el gasto en divisas (papel, tinta, vallas, equipos, combustible). Las horas de trabajo movilizadas se pagaban en CUP y no se suman en dólares: ver la nota sobre coste de oportunidad.",
    ["cubanet_mesa","cubanet_batalla"])
add("cu_post2014","CUBA","Recibimientos, actos y giras tras el regreso (2015-2016)","estimado",2015,2016,
    tri(0.2,0.5,1.5)*1e6,
    "Los cargos posteriores (ICAP, CDR, ANEC) son puestos ordinarios y no se cuentan como coste del caso.",
    ["ecured_fgl","periodicocubano_cdr"])

# CONEXOS (fuera del total)
conexos = [
    dict(id="cx_gross", nombre="Acuerdo USAID-DAI por Alan Gross", conf="confirmado", valor=3.2e6, anio=2014,
         nota="Pago de USAID en diciembre de 2014 dentro de un acuerdo con DAI, que reclamaba 7 millones. Está ligado al canje, pero lo causó la detención de Gross, no el caso de los Cinco. Se muestra aparte.",
         fuentes=["npr_gross","tablet_gross"]),
    dict(id="cx_ocb", nombre="Pagos de Radio y TV Martí a periodistas de Miami", conf="no_cuantificado", valor=None, anio=None,
         nota="Documentados por solicitudes FOIA y citados en el hábeas. Eran pagos por colaborar con Radio y TV Martí, no por cubrir el juicio, así que su atribución al caso es discutida. Una cifra de 175.000 USD a un periodista circula sin documento primario a la vista.",
         fuentes=["nyt_ocb","justiceonline","havanatimes_habeas"]),
    dict(id="cx_anuncios", nombre="Anuncios en NYT (2004) y Washington Post (2013)", conf="reportado", valor=50e3, anio=2004,
         nota="Pagados con colectas de comités: la meta era 50.000 USD y 10.000 los aportaron grupos de Miami. No consta financiación del Estado cubano; no es coste de ningún gobierno.",
         fuentes=["greenleft_nyt","herald_2004","havanatimes_wapo"]),
]

def q(a): return [float(np.percentile(a, p)) for p in (5, 50, 95)]

out = {"partidas": [], "conexos": conexos}
tot = {"EEUU": 0, "CUBA": 0}
tot25 = {"EEUU": 0, "CUBA": 0}
for p in P:
    nom = p["draws"]; r = nom * p["f"]
    p["en_total"] = p["conf"] != "no_cuantificado"
    if not p["en_total"]:
        out["partidas"].append(dict(id=p["id"], libro=p["libro"], nombre=p["nombre"], confianza=p["conf"],
            periodo=[p["y0"], p["y1"]], nominal_p5_p50_p95=q(nom), usd2025_p5_p50_p95=q(r), en_total=False,
            factor_2025=round(p["f"], 3), nota=p["nota"], fuentes=p["fuentes"]))
        continue
    tot[p["libro"]] = tot[p["libro"]] + nom
    tot25[p["libro"]] = tot25[p["libro"]] + r
    out["partidas"].append(dict(id=p["id"], libro=p["libro"], nombre=p["nombre"], confianza=p["conf"],
        periodo=[p["y0"], p["y1"]], nominal_p5_p50_p95=q(nom), usd2025_p5_p50_p95=q(r),
        factor_2025=round(p["f"], 3), nota=p["nota"], fuentes=p["fuentes"], en_total=True))

total25 = tot25["EEUU"] + tot25["CUBA"]
out["totales"] = {
    "EEUU_nominal": q(tot["EEUU"]), "CUBA_nominal": q(tot["CUBA"]),
    "EEUU_2025": q(tot25["EEUU"]), "CUBA_2025": q(tot25["CUBA"]),
    "TOTAL_2025": q(total25), "TOTAL_nominal": q(tot["EEUU"] + tot["CUBA"]),
}
# Sensibilidad: correlacion de rangos (Spearman) de cada partida con el total
def rank(a): return np.argsort(np.argsort(a))
rt = rank(total25)
sens = []
for p in P:
    r = p["draws"] * p["f"]
    if np.std(r) == 0 or not p["en_total"]: continue
    rho = float(np.corrcoef(rank(r), rt)[0, 1])
    var_share = float(np.var(r) / np.var(total25))
    sens.append(dict(id=p["id"], nombre=p["nombre"], rho=round(rho, 3), cuota_varianza=round(var_share, 3)))
out["sensibilidad"] = sorted(sens, key=lambda s: -s["cuota_varianza"])
out["encarcelamiento"] = {"persona_anios": persona_anios, "total_persona_anios": round(sum(persona_anios.values()), 2),
    "dias_por_anio": dias_por_anio, "coif_usado": {y: round(coif(y)) for y in sorted(dias_por_anio)},
    "base_nominal": round(encarc_nominal), "base_2025": round(encarc_2025)}
out["borrador_original"] = {"campana_cuba": [46e6, 124e6], "red_avispa": [8.4e6, 20.3e6]}
out["meta"] = {"iteraciones": N, "semilla": 1998, "deflactor": "CPI-U BLS, media anual; USD de 2025 (321,943)",
               "fecha_modelo": "2026-10-13"}
json.dump(out, open("modelo.json", "w"), ensure_ascii=False, indent=1)

M = 1e6
for p in out["partidas"]:
    a = p["usd2025_p5_p50_p95"]
    print(f'{p["libro"]:5} {p["id"]:18} {a[0]/M:7.2f} {a[1]/M:7.2f} {a[2]/M:7.2f}  ({p["confianza"]})')
for k, v in out["totales"].items():
    print(k, [round(x/M, 2) for x in v])
print("persona-años", out["encarcelamiento"]["total_persona_anios"], "base", out["encarcelamiento"]["base_nominal"])
print("sens", [(s["id"], s["cuota_varianza"]) for s in out["sensibilidad"][:6]])
print("pais-anios", pais_anios)
