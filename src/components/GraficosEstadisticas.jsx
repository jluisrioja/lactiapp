import React, { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LabelList,
} from "recharts";
import { format, subDays, isAfter } from "date-fns";
import { es } from "date-fns/locale";

const GraficosEstadisticas = ({ sessions, fechaReferencia }) => {
  const [modo, setModo] = useState("minutos"); // 'minutos' o 'cantidad'

  const { porDiaMin, porDiaCantidad, ladoCounts } = useMemo(() => {
    const hoy = fechaReferencia || new Date();
    const hace6dias = subDays(hoy, 5);

    const minutosMap = {};
    const cantidadMap = {};
    const sideMap = { izquierdo: 0, derecho: 0, ambos: 0 };

    sessions.forEach(({ duration = 0, timestamp, side }) => {
      const fecha = timestamp.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);

      if (isAfter(fecha, subDays(hoy, 6))) {
        const key = format(fecha, "dd-MMM", { locale: es });

        minutosMap[key] = (minutosMap[key] || 0) + duration / 60;
        cantidadMap[key] = (cantidadMap[key] || 0) + 1;
        sideMap[side] = (sideMap[side] || 0) + 1;
      }
    });

    const porDiaMin = Object.entries(minutosMap).map(([day, min]) => ({
      day,
      value: Math.round(min),
    }));

    const porDiaCantidad = Object.entries(cantidadMap).map(([day, count]) => ({
      day,
      value: count,
    }));

    const ladoCounts = Object.entries(sideMap).map(([name, value]) => ({
      name,
      value,
    }));

    return { porDiaMin, porDiaCantidad, ladoCounts };
  }, [sessions, fechaReferencia]);

  const colores = ["#ec4899", "#f9a8d4", "#fda4af"];

  const datos = modo === "minutos" ? porDiaMin : porDiaCantidad;
  const etiqueta = modo === "minutos" ? "min" : "tomas";
  const titulo = modo === "minutos"
    ? "Minutos de lactancia por día"
    : "Cantidad de tomas por día";

  return (
    <div className="space-y-8">
      {/* Toggle y gráfico de barras */}
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
            <Tooltip formatter={(v) => `${v} ${etiqueta}`} />
            <Bar dataKey="value" fill="#ec4899" radius={[6, 6, 0, 0]}>
              <LabelList dataKey="value" position="top" fill="#000" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de torta */}
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
    </div>
  );
};

export default GraficosEstadisticas;