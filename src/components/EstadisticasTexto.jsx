import React, { useMemo } from "react";

const EstadisticasTexto = ({ sessions, formatTime }) => {
  const stats = useMemo(() => {
    const total = sessions.length;
    if (total === 0) return null;

    const totalDuration = sessions.reduce(
      (acc, s) => acc + (s.duration || 0),
      0
    );
    const avg = Math.floor(totalDuration / total);

    const sideCounts = {
      izquierdo: sessions.filter((s) => s.side === "izquierdo").length,
      derecho: sessions.filter((s) => s.side === "derecho").length,
      ambos: sessions.filter((s) => s.side === "ambos").length,
    };

    return { total, avg, sideCounts };
  }, [sessions]);

  if (!stats) return null;

  return (
    <div className="text-left bg-pink-50 p-4 rounded-lg shadow mb-6">
      <h2 className="text-lg font-semibold mb-2">Estadísticas</h2>
      <p>
        Total de tomas: <strong>{stats.total}</strong>
      </p>
      <p>
        Duración promedio: <strong>{formatTime(stats.avg)}</strong>
      </p>
      <p className="mt-2 font-semibold">Distribución por lado:</p>
      <ul className="ml-4 list-disc text-sm text-gray-700">
        <li>Izquierdo: {stats.sideCounts.izquierdo}</li>
        <li>Derecho: {stats.sideCounts.derecho}</li>
        <li>Ambos: {stats.sideCounts.ambos}</li>
      </ul>
    </div>
  );
};

export default EstadisticasTexto;
