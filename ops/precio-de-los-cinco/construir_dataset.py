"""Convierte la salida del modelo en el dataset del tema (formato Yamacoa)."""
import json

M = json.load(open("modelo.json"))
F = json.load(open("fuentes.json"))
F["cpi"] = ["BLS: tabla histórica CPI-U, medias anuales", "https://www.bls.gov/regions/midwest/data/consumerpriceindexhistorical_us_table.pdf"]

def q3(a): return {"p5": round(a[0]), "p50": round(a[1]), "p95": round(a[2])}
LIB = {"EEUU": "eeuu", "CUBA": "cuba"}

partidas = [{
    "id": p["id"], "libro": LIB[p["libro"]], "nombre": p["nombre"], "confianza": p["confianza"],
    "periodo": p["periodo"], "en_total": p["en_total"],
    "usd2025": q3(p["usd2025_p5_p50_p95"]), "nominal": q3(p["nominal_p5_p50_p95"]),
    "factor_2025": p["factor_2025"], "nota": p["nota"], "fuentes": p["fuentes"],
} for p in M["partidas"]]

T = M["totales"]
E = M["encarcelamiento"]
personas = [
    {"nombre": "René González", "condena": "15 años", "salida": "2011-10-07", "motivo_salida": "fin de condena"},
    {"nombre": "Fernando González", "condena": "19 años, rebajados a 17 años y 9 meses", "salida": "2014-02-27", "motivo_salida": "fin de condena y deportación"},
    {"nombre": "Gerardo Hernández", "condena": "dos cadenas perpetuas más 15 años", "salida": "2014-12-17", "motivo_salida": "canje"},
    {"nombre": "Ramón Labañino", "condena": "perpetua, rebajada a 30 años", "salida": "2014-12-17", "motivo_salida": "canje"},
    {"nombre": "Antonio Guerrero", "condena": "perpetua, rebajada a 21 años y 10 meses", "salida": "2014-12-17", "motivo_salida": "canje"},
]
for p in personas:
    p["anios_custodia"] = E["persona_anios"][p["nombre"]]
    p["confianza"] = "calculado"

conexos = []
for c in M["conexos"]:
    conexos.append({"id": c["id"], "nombre": c["nombre"], "confianza": c["conf"],
                    "valor_usd": c["valor"], "anio": c["anio"], "nota": c["nota"], "fuentes": c["fuentes"]})

D = {
  "slug": "precio-de-los-cinco",
  "titulo": "El precio de los Cinco",
  "subtitulo": "Cuánto costó, a cada gobierno, detener, juzgar y encarcelar a cinco agentes de la Red Avispa, y cuánto gastó La Habana en la campaña para traerlos de vuelta. Un modelo con dos libros de cuentas, cada partida con su fuente y su grado de confianza.",
  "version_datos": "2026-10-19",
  "expediente": {
    "caso": "98-00721-CR-JAL", "tribunal": "Distrito Sur de Florida",
    "hitos": [
      {"fecha": "1998-09-12", "evento": "Detención", "confianza": "confirmado"},
      {"fecha": "2001-06-08", "evento": "Veredicto", "confianza": "confirmado"},
      {"fecha": "2014-12-17", "evento": "Canje", "confianza": "confirmado"}
    ]
  },
  "totales": {
    "eeuu": {**q3(T["EEUU_2025"]), "confianza": "estimado"},
    "cuba": {**q3(T["CUBA_2025"]), "confianza": "estimado"},
    "total": {**q3(T["TOTAL_2025"]), "confianza": "estimado"},
    "total_nominal": {**q3(T["TOTAL_nominal"]), "confianza": "estimado"}
  },
  "partidas": partidas,
  "sensibilidad": [{"id": s["id"], "cuota_varianza": s["cuota_varianza"]} for s in M["sensibilidad"]],
  "encarcelamiento": {
    "coif_anclas": [
      {"anio": 2003, "usd": 23181, "confianza": "confirmado", "fuente": "bop_2003"},
      {"anio": 2008, "usd": 25895, "confianza": "confirmado", "fuente": "bop_2008"},
      {"anio": 2010, "usd": 28284, "confianza": "reportado", "fuente": "uscourts_2010"},
      {"anio": 2015, "usd": 31978, "confianza": "confirmado", "fuente": "bop_2015"}
    ],
    "personas": personas,
    "total_persona_anios": E["total_persona_anios"],
    "base_nominal_usd": E["base_nominal"], "base_usd2025": E["base_2025"],
    "multiplicador_alta_seguridad": [1.0, 1.15, 1.4]
  },
  "correcciones": [
    {"confianza": "reportado", "antes": "Cuba pagó buena parte de los abogados.",
     "ahora": "Cuatro de los cinco tuvieron abogados privados designados y pagados por el tribunal; el quinto, un defensor público. La defensa del juicio la pagó el contribuyente de EE. UU.", "fuentes": ["herald_2001"]},
    {"confianza": "reportado", "antes": "Montar la Red Avispa costó de 8 a 20 millones.",
     "ahora": "Era una operación de bajo presupuesto: un agente vivía con 30.935 USD al año y varios tenían dos empleos. El modelo da 1,7–3,5 millones de la época (3,6–7,4 en dólares de 2025).", "fuentes": ["ap_2000_budget", "guardian_lowbudget"]},
    {"confianza": "reportado", "antes": "Visitas familiares periódicas: 6 a 13 millones.",
     "ahora": "A dos esposas se les negó el visado durante años y la media fue de menos de una visita anual por preso. El modelo da menos de un millón.", "fuentes": ["amnesty_2009", "bulatlat"]},
    {"confianza": "reportado", "antes": "El anuncio del New York Times formó parte del gasto del régimen.",
     "ahora": "Se pagó con colectas de comités (meta de 50.000 USD, 10.000 de grupos de Miami). Queda fuera de los dos libros.", "fuentes": ["greenleft_nyt", "herald_2004"]},
    {"confianza": "confirmado", "antes": "Los Cinco salieron juntos en 2014 y uno fue vicepresidente del ICAP.",
     "ahora": "René salió en 2011 y Fernando en febrero de 2014; solo tres llegaron con el canje. Fernando González preside el ICAP desde 2017.", "fuentes": ["voa_2014", "ecured_fgl"]}
  ],
  "borrador_original": {"campana_cuba_usd": [46000000, 124000000], "red_avispa_usd": [8400000, 20300000], "confianza": "estimado"},
  "conexos": conexos,
  "sin_precio": [
    {"titulo": "El tiempo movilizado en Cuba", "texto": "Marchas, tribunas, actos escolares y horas de televisión se pagaban en pesos cubanos. Pasarlos a dólares al cambio oficial o al informal mueve el resultado en un orden de magnitud, así que el modelo solo suma el gasto en divisas y deja este coste de oportunidad sin cifra."},
    {"titulo": "Los cuatro muertos del 24 de febrero de 1996", "texto": "Gerardo Hernández fue condenado por conspiración para asesinato por el derribo de las avionetas de Hermanos al Rescate; Cuba lo niega. Ninguna cifra de este modelo mide esas vidas."},
    {"titulo": "Las familias", "texto": "Años sin visitas y una pareja que no se vio en dieciséis años no aparecen en ningún libro de cuentas."},
    {"titulo": "El valor de inteligencia", "texto": "No se estima lo que obtuvo Cuba de la red ni lo que ganó EE. UU. con su desarticulación, incluido el papel de Rolando Sarraff, liberado en el mismo canje."}
  ],
  "textos": {
    "intro_correcciones": "El punto de partida fue un bosquejo que situaba la campaña cubana entre 46 y 124 millones y la Red Avispa entre 8 y 20 millones. Al contrastarlo con fuentes, cinco de sus supuestos no se sostienen.",
    "intro_sensibilidad": "Una sola partida explica casi toda la incertidumbre del total, y es justo la que menos documentación tiene: el gasto marginal de la red exterior cubana. Si algún día se publica el presupuesto del ICAP o de las embajadas para la campaña, el intervalo se estrechará más que con cualquier otro dato.",
    "carcel": [
      "El encarcelamiento es la única partida grande que se puede reconstruir con números oficiales. La Oficina de Prisiones publica cada año el coste medio de un recluso; multiplicado por los días que pasó cada uno bajo custodia, sale la base en dólares de cada año.",
      "Los cinco pasaron la mayor parte del tiempo en prisiones de alta seguridad, más caras que la media, por eso el modelo aplica un multiplicador de 1,0 a 1,4. Incluso con él, la cárcel pesa menos que la investigación o la fiscalía: lo caro fue el proceso, no la condena."
    ],
    "intro_conexos": "Tres gastos aparecen a menudo junto a este caso. Están ligados a él, pero sumarlos inflaría la cifra con costes que tienen otra causa o que no pagó ningún gobierno."
  },
  "leyendas": {
    "totales": "Cada número es la mediana de 200.000 simulaciones; debajo va el intervalo que contiene el 90 % de ellas. Ninguno de los dos gobiernos ha publicado estos gastos: casi todo es estimación con anclas documentadas, no contabilidad.",
    "partidas": "Millones de USD de 2025, eje lineal. Cada partida se distribuye por igual entre sus años y se deflacta con el IPC-U del BLS. Las distribuciones son triangulares (mínimo, moda, máximo) salvo el encarcelamiento, que es un cálculo con tarifas publicadas y un multiplicador por prisiones de alta seguridad. Las partidas sin cuantificar se muestran atenuadas y no se suman.",
    "sensibilidad": "Cuota de la varianza del total explicada por cada partida. Las partidas son independientes, así que las cuotas suman cerca de 1. Se muestran las seis mayores.",
    "tabla": "Millones de USD de 2025. Las filas atenuadas no entran en el total."
  },
  "metodologia": {
    "iteraciones": M["meta"]["iteraciones"], "semilla": M["meta"]["semilla"],
    "deflactor": "IPC-U del BLS, media anual, llevado a 2025 (321,943).",
    "notas": [
      "Monte Carlo con partidas independientes; el intervalo publicado es el percentil 5 a 95.",
      "Cada partida se reparte por igual entre los años de su periodo para deflactarla.",
      "Encarcelamiento: días exactos de custodia desde el 12 de septiembre de 1998 hasta cada salida, por la tarifa COIF del año, interpolada entre los años publicados y extrapolada antes de 2003.",
      "Red exterior: países con actividad documentada interpolados entre 12 (2001), 27 (2006), 110 (2011) y 111 (2014), unos 833 países-año. El gasto marginal por país y año es el supuesto más débil del modelo."
    ],
    "falsacion": "Si un presupuesto oficial cubano o un informe del Departamento de Justicia sitúa cualquier partida fuera de su rango del 90 %, esa partida y el total deben recalcularse y la corrección se publica en el tema.",
    "pendientes": ["Las tarifas CJA proceden del distrito sur de Texas como aproximación; las del distrito sur de Florida en 2000-2001 deben verificarse."]
  },
  "fuentes": [{"id": k, "titulo": v[0], "url": v[1]} for k, v in F.items()]
}
out = "precio-de-los-cinco.json"
json.dump(D, open(out, "w"), ensure_ascii=False, indent=2)
print(out, len(D["partidas"]), "partidas", len(D["fuentes"]), "fuentes")
