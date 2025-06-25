import React from "react";

const EstadisticasTexto = ({ sessions }) => {
  const formatTime = (s) => {
    const min = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  // Filtrar solo las tomas del día actual
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sesionesHoy = sessions.filter((s) => {
    const fecha = new Date((s.timestamp?.seconds || 0) * 1000);
    return fecha >= today;
  });

  const totalTomas = sesionesHoy.length;

  const promDuracion =
    totalTomas > 0
      ? formatTime(
          Math.floor(
            sesionesHoy.reduce((sum, s) => sum + (s.duration || 0), 0) /
              totalTomas
          )
        )
      : "00:00";

  const ultimoLado = sesionesHoy[0]?.side || "—";
  const ultimaNota = sesionesHoy.find((s) => s.note)?.note || "—";

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-white shadow rounded-2xl p-4 text-center">
        <p className="text-sm text-gray-500">Tomas de hoy</p>
        <p className="text-2xl font-bold text-pink-600">{totalTomas}</p>
      </div>
      <div className="bg-white shadow rounded-2xl p-4 text-center">
        <p className="text-sm text-gray-500">Prom. Duración</p>
        <p className="text-2xl font-bold text-pink-600">{promDuracion}</p>
      </div>
      <div className="bg-white shadow rounded-2xl p-4 text-center">
        <p className="text-sm text-gray-500">Último Lado</p>
        <p className="text-2xl font-bold text-pink-600">{ultimoLado}</p>
      </div>
      <div className="bg-white shadow rounded-2xl p-4 text-center">
        <p className="text-sm text-gray-500">Notas recientes</p>
        <p className="text-sm text-gray-700">{ultimaNota}</p>
      </div>
    </div>
  );
};

export default EstadisticasTexto;
