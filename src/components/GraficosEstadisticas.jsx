import React, { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LabelList,
} from "recharts";
import { format, subDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";

const GraficosEstadisticas = ({ sessions, panales = [], fechaReferencia }) => {
  const [modo, setModo] = useState("minutos");

  const {
    porDiaMin,
    porDiaCantidad,
    ladoCounts,
    panalesPorDia,
  } = useMemo(() => {
    const referencia = fechaReferencia || new Date();
    const dias = Array.from({ length: 6 }).map((_, i) =>
      subDays(referencia, 5 - i)
    );

    const keyList = dias.map((d) => format(d, "dd-MMM", { locale: es }));
    const minutosMap = Object.fromEntries(keyList.map((k) => [k, null]));
    const cantidadMap = Object.fromEntries(keyList.map((k) => [k, null]));
    const panalMap = Object.fromEntries(keyList.map((k) => [k, 0]));

    const sideMap = { izquierdo: 0, derecho: 0, ambos: 0 };

    sessions.forEach(({ duration = 0, timestamp, side }) => {
      const fecha = timestamp?.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);

      dias.forEach((d) => {
        if (isSameDay(fecha, d)) {
          const key = format(d, "dd-MMM", { locale: es });
          minutosMap[key] = (minutosMap[key] || 0) + duration / 60;
          cantidadMap[key] = (cantidadMap[key] || 0) + 1;
          sideMap[side] = (sideMap[side] || 0) + 1;
        }
      });
    });

    panales.forEach(({ timestamp }) => {
      const fecha = timestamp?.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);

      dias.forEach((d) => {
        if (isSameDay(fecha, d)) {
          const key = format(d, "dd-MMM", { locale: es });
          panalMap[key] = (panalMap[key] || 0) + 1;
        }
      });
    });

    const porDiaMin = keyList.map((day) => ({
      day,
      value: minutosMap[day] !== null ? Math.round(minutosMap[day]) : null,
    }));

    const porDiaCantidad = keyList.map((day) => ({
      day,
      value: cantidadMap[day] !== null ? cantidadMap[day] : null,
    }));

    const panalesPorDia = keyList.map((day) => ({
      day,
      value: panalMap[day],
    }));

    const ladoCounts = Object.entries(sideMap).map(([name, value]) => ({
      name,
      value,
    }));

    return { porDiaMin, porDiaCantidad, ladoCounts, panalesPorDia };
  }, [sessions, panales, fechaReferencia]);

  const colores = ["#ec4899", "#f9a8d4", "#fda4af"];
  const datos = modo === "minutos" ? porDiaMin : porDiaCantidad;
  const etiqueta = modo === "minutos" ? "min" : "tomas";
  const titulo = modo === "minutos"
    ? "Minutos de lactancia por día"
    : "Cantidad de tomas por día";

  return (
    <div className="space-y-8">
      <div className="w-full h-72">
        <div className="flex justify-between items-center mb-2 px-2">
          <h3 className="text-center font-semibold">{titulo}</h3>
          <button
            onClick={() =>
              setModo((prev) => (prev === "minutos" ? "cantidad" : "minutos"))
            }
            className="text-sm text-pink-600 bg-pink-100 px-3 py-1 rounded hover:bg-pink-200"
          >
            Ver {modo === "minutos" ? "cantidad de tomas" : "minutos de lactancia"}
          </button>
        </div>

        <ResponsiveContainer>
          <BarChart data={datos} margin={{ top: 20, bottom: 30 }}>
            <XAxis
              dataKey="day"
              angle={-25}
              textAnchor="end"
              interval={0}
              height={50}
            />
            <YAxis />
            <Tooltip
              formatter={(v) => (v !== null ? `${v} ${etiqueta}` : "ND")}
            />
            <Bar dataKey="value" fill="#ec4899" radius={[6, 6, 0, 0]}>
              <LabelList
                dataKey="value"
                position="top"
                fill="#000"
                formatter={(v) => (v !== null ? v : "ND")}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full h-72">
        <h3 className="text-center font-semibold mb-2">
          Distribución de tomas por lado
        </h3>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={ladoCounts}
              dataKey="value"
              nameKey="name"
              innerRadius="50%"
              outerRadius="80%"
              label
            >
              {ladoCounts.map((entry, index) => (
                <Cell key={entry.name} fill={colores[index % colores.length]} />
              ))}
            </Pie>
            <Legend verticalAlign="bottom" height={36} />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {panalesPorDia.length > 0 && (
        <div className="w-full h-72">
          <h3 className="text-center font-semibold mb-2">
            Cambios de pañal por día
          </h3>
          <ResponsiveContainer>
            <BarChart data={panalesPorDia} margin={{ top: 20, bottom: 30 }}>
              <XAxis
                dataKey="day"
                angle={-25}
                textAnchor="end"
                interval={0}
                height={50}
              />
              <YAxis />
              <Tooltip formatter={(v) => `${v} cambios`} />
              <Bar dataKey="value" fill="#facc15" radius={[6, 6, 0, 0]}>
                <LabelList dataKey="value" position="top" fill="#000" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default GraficosEstadisticas;