import { useEffect, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:8000").replace(/\/$/, "");

async function fetchExcelJson(pk, signal) {
  const base = API_BASE;
  const urls = [
    `${base}/api/trabajador/${pk}/excel-json/`,
    `${base}/api/trabajador/${pk}/excel-json`,
    `${base}/api/trabajador/excel-json/${pk}/`,
    `${base}/api/trabajador/excel-json/${pk}`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: "GET", credentials: "include", signal });
      if (res.ok) {
        console.debug("useWorkerData OK:", url);
        return res.json();
      }
      console.debug("useWorkerData try:", url, res.status);
    } catch (e) {
      if (e?.name === "AbortError") throw e;
      console.debug("useWorkerData error:", e?.message);
    }
  }
  throw new Error("No se pudo obtener excel-json");
}

export default function useWorkerData(pk) {
  const [data, setData] = useState({
    planificacion: null,
    memoriaTrabajo: null,
    flexibilidad: null,
    secciones: [],
  });
  const [loading, setLoading] = useState(false);

  const normalize = (str) =>
    (str || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  const anyColorToRgba = (color, a = 0.15) => `rgba(0,0,0,${a})`;
  const buildSection = (title, iconKey, metricsObj, extra = {}) => {
    const color = "rgb(31,41,55)";
    return {
      title,
      icon: iconKey,
      miniDesc: title,
      metrics: Object.entries(metricsObj).map(([label, value]) => ({ label, value })),
      color,
      background: anyColorToRgba(color),
      ...extra,
    };
  };
  const buildNormDict = (row) => {
    const dict = {};
    for (const [k, v] of Object.entries(row || {})) dict[normalize(k)] = v;
    return dict;
  };
  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const pickNum = (row, keys) => {
    for (const k of keys) {
      if (k in row && row[k] !== "" && row[k] != null) {
        const n = num(row[k]);
        if (n != null) return n;
      }
    }
    return null;
  };
  const pickNumNorm = (dict, keys) => {
    for (const k of keys) {
      const nk = normalize(k);
      if (nk in dict && dict[nk] !== "" && dict[nk] != null) {
        const n = num(dict[nk]);
        if (n != null) return n;
      }
    }
    return null;
  };
  const resolveFirstSheetArray = (contenido) => {
    if (!contenido || typeof contenido !== "object") return [];
    if (Array.isArray(contenido.Hoja1)) return contenido.Hoja1;
    const firstKey = Object.keys(contenido)[0];
    return Array.isArray(contenido[firstKey]) ? contenido[firstKey] : [];
  };

  useEffect(() => {
    if (!pk) return;
    const ac = new AbortController();
    setLoading(true);

    (async () => {
      try {
        const json = await fetchExcelJson(pk, ac.signal);

        const rows = resolveFirstSheetArray(json?.contenido);
        const row = rows?.[0] || {};
        const dict = buildNormDict(row);

        // --------- PLANIFICACIÓN (PD1/PT1/PC1, PD2/PT2/PC2, Totales y series) ----------
        const A_PD1 = pickNum(row, ["Planificacion Aciertos PD1", "Planificación Aciertos PD1"]);
        const A_PT1 = pickNum(row, ["Planificacion Aciertos PT1", "Planificación Aciertos PT1"]);
        const A_PC1 = pickNum(row, ["Planificacion Aciertos PC1", "Planificación Aciertos PC1"]);
        const A_PD2 = pickNum(row, ["Planificacion Aciertos PD2", "Planificación Aciertos PD2"]);
        const A_PT2 = pickNum(row, ["Planificacion Aciertos PT2", "Planificación Aciertos PT2"]);
        const A_PC2 = pickNum(row, ["Planificacion Aciertos PC2", "Planificación Aciertos PC2"]);
        const A_TOT_PD = pickNum(row, ["Total Planificacion Aciertos PD", "Total Planificación Aciertos PD"]);
        const A_TOT_PT = pickNum(row, ["Total Planificacion Aciertos PT", "Total Planificación Aciertos PT"]);
        const A_TOT_PC = pickNum(row, ["Total Planificacion Aciertos PC", "Total Planificación Aciertos PC"]);

        const T_PD1 = pickNum(row, ["Planificacion Tiempo Asignación PD1", "Planificación Tiempo Asignación PD1"]);
        const T_PT1 = pickNum(row, ["Planificacion Tiempo Asignación PT1", "Planificación Tiempo Asignación PT1"]);
        const T_PC1 = pickNum(row, ["Planificacion Tiempo Asignación PC1", "Planificación Tiempo Asignación PC1"]);
        const T_PD2 = pickNum(row, ["Planificacion Tiempo Asignación PD2", "Planificación Tiempo Asignación PD2"]);
        const T_PT2 = pickNum(row, ["Planificacion Tiempo Asignación PT2", "Planificación Tiempo Asignación PT2"]);
        const T_PC2 = pickNum(row, ["Planificacion Tiempo Asignación PC2", "Planificación Tiempo Asignación PC2"]);
        const T_TOT_PD = pickNum(row, ["Total Planificacion Tiempo Asignación PD", "Total Planificación Tiempo Asignación PD"]);
        const T_TOT_PT = pickNum(row, ["Total Planificacion Tiempo Asignación PT", "Total Planificación Tiempo Asignación PT"]);
        const T_TOT_PC = pickNum(row, ["Total Planificacion Tiempo Asignación PC", "Total Planificación Tiempo Asignación PC"]);

        const rounds = Array.from({ length: 14 }, (_, i) => i + 1);
        const planifAciertosR = rounds.map((r) =>
          pickNum(row, [
            `Planificación Ejecución Aciertos R${r}`,
            `Planificacion Ejecucion Aciertos R${r}`,
            `Planificacion Ejecución Aciertos R${r}`,
          ]) ?? 0
        );
        const planifTiempoR = rounds.map((r) =>
          pickNum(row, [
            `Planificación Tiempo R${r}`,
            `Planificacion Tiempo R${r}`,
          ]) ?? 0
        );

        const planifTotals = {
          aciertosParte1: pickNum(row, [
            "Total Planificación Ejecución Aciertos Parte 1",
            "Total Planificacion Ejecución Aciertos Parte 1",
            "Total Planificacion Ejecucion Aciertos Parte 1",
          ]),
          aciertosParte2: pickNum(row, [
            "Total Planificación Ejecución Aciertos Parte 2",
            "Total Planificacion Ejecución Aciertos Parte 2",
            "Total Planificacion Ejecucion Aciertos Parte 2",
          ]),
          aciertosTotal: pickNum(row, [
            "Total PlanificaciónEjecución AciertosTotal",
            "Total Planificación Ejecución Aciertos Total",
            "Total Planificacion Ejecución Aciertos Total",
            "Total Planificacion Ejecucion Aciertos Total",
          ]),
          tiempoParte1: pickNum(row, ["Total Planificación Tiempo Parte 1", "Total Planificacion Tiempo Parte 1"]),
          tiempoParte2: pickNum(row, ["Total Planificación Tiempo Parte 2", "Total Planificacion Tiempo Parte 2"]),
          tiempoTotal: pickNum(row, ["Total Planificación Tiempo Total", "Total Planificacion Tiempo Total"]),
        };

        const planningMetrics = {
          "Aciertos PD": A_TOT_PD ?? 0,
          "Aciertos PT": A_TOT_PT ?? 0,
          "Aciertos PC": A_TOT_PC ?? 0,
          "Tiempo Asignación PD": T_TOT_PD ?? 0,
          "Tiempo Asignación PT": T_TOT_PT ?? 0,
          "Tiempo Asignación PC": T_TOT_PC ?? 0,
        };

        const planningData = {
          aciertos: {
            P1: { PD: A_PD1 ?? null, PT: A_PT1 ?? null, PC: A_PC1 ?? null },
            P2: { PD: A_PD2 ?? null, PT: A_PT2 ?? null, PC: A_PC2 ?? null },
            Total: { PD: A_TOT_PD ?? null, PT: A_TOT_PT ?? null, PC: A_TOT_PC ?? null },
          },
          tiempoAsignacion: {
            P1: { PD: T_PD1 ?? null, PT: T_PT1 ?? null, PC: T_PC1 ?? null },
            P2: { PD: T_PD2 ?? null, PT: T_PT2 ?? null, PC: T_PC2 ?? null },
            Total: { PD: T_TOT_PD ?? null, PT: T_TOT_PT ?? null, PC: T_TOT_PC ?? null },
          },
          series: {
            aciertos: planifAciertosR,
            tiempo: planifTiempoR,
          },
          totales: planifTotals,
        };

        const planificacion = buildSection("Planning", "planification", planningMetrics, {
          raw: { row, dict },
          data: planningData,
        });

        // --------- MEMORIA DE TRABAJO (PD1/PT1/PC1, PD2/PT2/PC2, Totales y series) ----------
        const S_PD1 = pickNum(row, ["Memoria de Trabajo Servicio Correcto PD1"]);
        const S_PT1 = pickNum(row, ["Memoria de Trabajo Servicio Correcto PT1"]);
        const S_PC1 = pickNum(row, ["Memoria de Trabajo Servicio Correcto PC1"]);
        const S_PD2 = pickNum(row, ["Memoria de Trabajo Servicio Correcto PD2"]);
        const S_PT2 = pickNum(row, ["Memoria de Trabajo Servicio Correcto PT2"]);
        const S_PC2 = pickNum(row, ["Memoria de Trabajo Servicio Correcto PC2"]);
        const S_TOT_PD = pickNum(row, ["Total Planificacion Servicio Correcto  PD", "Total Planificacion Servicio Correcto PD"]);
        const S_TOT_PT = pickNum(row, ["Total Planificacion Servicio Correcto PT"]);
        const S_TOT_PC = pickNum(row, ["Total Planificacion Servicio Correcto PC"]);

        const C_PD1 = pickNum(row, ["Memoria de Trabajo Consultas PD1"]);
        const C_PT1 = pickNum(row, ["Memoria de Trabajo Consultas PT1"]);
        const C_PC1 = pickNum(row, ["Memoria de Trabajo Consultas PC1"]);
        const C_PD2 = pickNum(row, ["Memoria de Trabajo Consultas PD2"]);
        const C_PT2 = pickNum(row, ["Memoria de Trabajo Consultas PT2"]);
        const C_PC2 = pickNum(row, ["Memoria de Trabajo Consultas PC2"]);
        const C_TOT_PD = pickNum(row, ["Total Planificacion Consultas  PD", "Total Planificacion Consultas PD"]);
        const C_TOT_PT = pickNum(row, ["Total Planificacion Consultas PT"]);
        const C_TOT_PC = pickNum(row, ["Total Planificacion Consultas PC"]);

        const AN_PD1 = pickNum(row, ["Memoria de Trabajo Aciertos Netos PD1"]);
        const AN_PT1 = pickNum(row, ["Memoria de Trabajo Aciertos Netos PT1"]);
        const AN_PC1 = pickNum(row, ["Memoria de Trabajo Aciertos Netos PC1"]);
        const AN_PD2 = pickNum(row, ["Memoria de Trabajo Aciertos Netos PD2"]);
        const AN_PT2 = pickNum(row, ["Memoria de Trabajo Aciertos Netos PT2"]);
        const AN_PC2 = pickNum(row, ["Memoria de Trabajo Aciertos Netos PC2"]);
        const AN_TOT_PD = pickNum(row, ["Total Planificacion Aciertos Netos  PD", "Total Planificacion Aciertos Netos PD"]);
        const AN_TOT_PT = pickNum(row, ["Total Planificacion Aciertos Netos PT"]);
        const AN_TOT_PC = pickNum(row, ["Total Planificacion Aciertos Netos PC"]);

        const TS_PD1 = pickNum(row, ["Memoria de Trabajo Tiempo de Servicio PD1"]);
        const TS_PT1 = pickNum(row, ["Memoria de Trabajo Tiempo de Servicio PT1"]);
        const TS_PC1 = pickNum(row, ["Memoria de Trabajo Tiempo de Servicio PC1"]);
        const TS_PD2 = pickNum(row, ["Memoria de Trabajo Tiempo de Servicio PD2"]);
        const TS_PT2 = pickNum(row, ["Memoria de Trabajo Tiempo de Servicio PT2"]);
        const TS_PC2 = pickNum(row, ["Memoria de Trabajo Tiempo de Servicio PC2"]);
        const TS_TOT_PD = pickNum(row, ["Total Planificacion Tiempo de Servicio  PD", "Total Planificacion Tiempo de Servicio PD"]);
        const TS_TOT_PT = pickNum(row, ["Total Planificacion Tiempo de Servicio PT"]);
        const TS_TOT_PC = pickNum(row, ["Total Planificacion Tiempo de Servicio PC"]);

        const memAciertosR = rounds.map((r) => pickNum(row, [`Memoria Trabajo Aciertos R${r}`]) ?? 0);
        const memTiempoR = rounds.map((r) => pickNum(row, [`Memoria Trabajo R${r}`]) ?? 0);
        const memoriaTotals = {
          aciertosParte1: pickNum(row, ["Total Memoria Trabajo Aciertos Parte 1"]),
          aciertosParte2: pickNum(row, ["Total Memoria Trabajo Aciertos Parte 2"]),
          aciertosTotal: pickNum(row, ["Total Memoria Trabajo Aciertos Total"]),
          tiempoParte1: pickNum(row, ["Total Memoria Trabajo Tiempo Parte 1"]),
          tiempoParte2: pickNum(row, ["Total Memoria Trabajo Tiempo Parte 2"]),
          tiempoTotal: pickNum(row, ["Total Memoria Trabajo Tiempo Total"]),
        };

        const memoryMetrics = {
          "Servicios PD": S_TOT_PD ?? 0,
          "Servicios PT": S_TOT_PT ?? 0,
          "Servicios PC": S_TOT_PC ?? 0,
          "Consultas PD": C_TOT_PD ?? 0,
          "Consultas PT": C_TOT_PT ?? 0,
          "Consultas PC": C_TOT_PC ?? 0,
          "Aciertos Netos PD": AN_TOT_PD ?? 0,
          "Aciertos Netos PT": AN_TOT_PT ?? 0,
          "Aciertos Netos PC": AN_TOT_PC ?? 0,
          "Tiempo Servicio PD": TS_TOT_PD ?? 0,
          "Tiempo Servicio PT": TS_TOT_PT ?? 0,
          "Tiempo Servicio PC": TS_TOT_PC ?? 0,
        };

        const memoryData = {
          serviciosCorrectos: {
            P1: { PD: S_PD1 ?? null, PT: S_PT1 ?? null, PC: S_PC1 ?? null },
            P2: { PD: S_PD2 ?? null, PT: S_PT2 ?? null, PC: S_PC2 ?? null },
            Total: { PD: S_TOT_PD ?? null, PT: S_TOT_PT ?? null, PC: S_TOT_PC ?? null },
          },
          consultas: {
            P1: { PD: C_PD1 ?? null, PT: C_PT1 ?? null, PC: C_PC1 ?? null },
            P2: { PD: C_PD2 ?? null, PT: C_PT2 ?? null, PC: C_PC2 ?? null },
            Total: { PD: C_TOT_PD ?? null, PT: C_TOT_PT ?? null, PC: C_TOT_PC ?? null },
          },
          aciertosNetos: {
            P1: { PD: AN_PD1 ?? null, PT: AN_PT1 ?? null, PC: AN_PC1 ?? null },
            P2: { PD: AN_PD2 ?? null, PT: AN_PT2 ?? null, PC: AN_PC2 ?? null },
            Total: { PD: AN_TOT_PD ?? null, PT: AN_TOT_PT ?? null, PC: AN_TOT_PC ?? null },
          },
          tiempoServicio: {
            P1: { PD: TS_PD1 ?? null, PT: TS_PT1 ?? null, PC: TS_PC1 ?? null },
            P2: { PD: TS_PD2 ?? null, PT: TS_PT2 ?? null, PC: TS_PC2 ?? null },
            Total: { PD: TS_TOT_PD ?? null, PT: TS_TOT_PT ?? null, PC: TS_TOT_PC ?? null },
          },
          series: {
            aciertos: memAciertosR,
            tiempo: memTiempoR,
          },
          totales: memoriaTotals,
        };

        const memoriaTrabajo = buildSection("Memory", "workingMemory", memoryMetrics, {
          raw: { row, dict },
          data: memoryData,
        });

        // --------- FLEXIBILIDAD COGNITIVA ----------
        const FX_SW = {
          PD: pickNum(row, ["Flexibilidad Switching PD"]),
          PT: pickNum(row, ["Flexibilidad Switching PT"]),
          PC: pickNum(row, ["Flexibilidad Switching PC"]),
          aciertos: {
            PD: pickNum(row, ["Flexibilidad Switching Aciertos PD"]),
            PT: pickNum(row, ["Flexibilidad Switching Aciertos PT"]),
            PC: pickNum(row, ["Flexibilidad Switching Aciertos PC"]),
          },
          tiempo: {
            PD: pickNum(row, ["Flexibilidad Switching Tiempo PD"]),
            PT: pickNum(row, ["Flexibilidad Switching Tiempo PT"]),
            PC: pickNum(row, ["Flexibilidad Switching Tiempo PC"]),
          },
        };
        const FX_INT = {
          PD: pickNum(row, ["Flexibilidad Interferencia PD"]),
          PT: pickNum(row, ["Flexibilidad Interferencia PT"]),
          PC: pickNum(row, ["Flexibilidad Interferencia PC"]),
        };
        const FX_PER = {
          PD: pickNum(row, ["Flexibilidad Perseveraciones PD"]),
          PT: pickNum(row, ["Flexibilidad Perseveraciones PT"]),
          PC: pickNum(row, ["Flexibilidad Perseveraciones PC"]),
        };
        const FX_TSERV = {
          PD: pickNum(row, ["Flexibilidad Tiempo Servicios PD"]),
          PT: pickNum(row, ["Flexibilidad Tiempo Servicios PT"]),
          PC: pickNum(row, ["Flexibilidad Tiempo Servicios PC"]),
        };

        const flexibilityMetrics = {
          "Switching PD": FX_SW.PD ?? 0,
          "Switching PT": FX_SW.PT ?? 0,
          "Switching PC": FX_SW.PC ?? 0,
          "Interferencia PD": FX_INT.PD ?? 0,
          "Interferencia PT": FX_INT.PT ?? 0,
          "Interferencia PC": FX_INT.PC ?? 0,
          "Perseveraciones PD": FX_PER.PD ?? 0,
          "Perseveraciones PT": FX_PER.PT ?? 0,
          "Perseveraciones PC": FX_PER.PC ?? 0,
          "Tiempo Servicios PD": FX_TSERV.PD ?? 0,
          "Tiempo Servicios PT": FX_TSERV.PT ?? 0,
          "Tiempo Servicios PC": FX_TSERV.PC ?? 0,
        };

        const flexibilidad = buildSection("Flexibility", "flexibilityCognitive", flexibilityMetrics, {
          raw: { row, dict },
          data: {
            switching: FX_SW,
            interferencia: FX_INT,
            perseveraciones: FX_PER,
            tiempoServicios: FX_TSERV,
          },
        });

        setData({
          planificacion,
          memoriaTrabajo,
          flexibilidad,
          secciones: [planificacion, memoriaTrabajo, flexibilidad],
        });
      } catch (e) {
        if (e?.name !== "AbortError") {
          console.error("useWorkerData error:", e);
          setData({ planificacion: null, memoriaTrabajo: null, flexibilidad: null, secciones: [] });
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [pk]);

  return { ...data, loading };
}
