import React, { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const GraficosEstadisticas = ({ sessions }) => {
  // 1️⃣ Agregar métricas por día
  const { porDia, ladoCounts } = useMemo(() => {
    const dayMap = {};
    const sideMap = { izquierdo: 0, derecho: 0, ambos: 0 };

    sessions.forEach(({ duration = 0, timestamp, side }) => {
      // Firestore Timestamp → JS Date
      const dateObj = timestamp.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);
      const dayKey = dateObj.toLocaleDateString("es-PE");

      dayMap[dayKey] = (dayMap[dayKey] || 0) + duration / 60; // minutos
      sideMap[side] = (sideMap[side] || 0) + 1;
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

  const colores = ["#ec4899", "#f9a8d4", "#fda4af"]; // tonos neutros rosa

  return (
    <div className="space-y-8">
      {/* Duración total (min) por día */}
      <div className="w-full h-72">
        <h3 className="text-center font-semibold mb-2">
          Minutos de lactancia por día
        </h3>
        <ResponsiveContainer>
          <BarChart data={porDia}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="min" radius={[6, 6, 0, 0]} />
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
