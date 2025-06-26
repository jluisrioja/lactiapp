import React, { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LabelList,
} from "recharts";
import { format, subDays, isAfter } from "date-fns";
import { es } from "date-fns/locale";

const GraficosEstadisticas = ({ sessions }) => {
  const { porDia, ladoCounts } = useMemo(() => {
    const hoy = new Date();
    const hace6dias = subDays(hoy, 5); // incluye hoy y 5 días atrás

    const dayMap = {};
    const sideMap = { izquierdo: 0, derecho: 0, ambos: 0 };

    sessions.forEach(({ duration = 0, timestamp, side }) => {
      const fecha = timestamp.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);

      if (isAfter(fecha, subDays(hoy, 6))) {
        const dayKey = format(fecha, "dd-MMM", { locale: es });
        dayMap[dayKey] = (dayMap[dayKey] || 0) + duration / 60;
        sideMap[side] = (sideMap[side] || 0) + 1;
      }
    });

    const porDia = Object.entries(dayMap).map(([day, min]) => ({
      day,
      min: Math.round(min),
    }));

    const ladoCounts = Object.entries(sideMap).map(([name, value]) => ({
      name,
      value,
    }));

    return { porDia, ladoCounts };
  }, [sessions]);

  const colores = ["#ec4899", "#f9a8d4", "#fda4af"];

  return (
    <div className="space-y-8">
      {/* Duración total (min) por día */}
      <div className="w-full h-72">
        <h3 className="text-center font-semibold mb-2">
          Minutos de lactancia por día
        </h3>
        <ResponsiveContainer>
          <BarChart data={porDia} margin={{ top: 20, bottom: 30 }}>
            <XAxis
              dataKey="day"
              angle={-25}
              textAnchor="end"
              interval={0}
              height={50}
            />
            <YAxis />
            <Tooltip formatter={(v) => `${v} min`} />
            <Bar dataKey="min" fill="#ec4899" radius={[6, 6, 0, 0]}>
              <LabelList dataKey="min" position="top" fill="#000" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Distribución de lados */}
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