import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const RegistroManual = ({ user, onClose }) => {
  const [manualFecha, setManualFecha] = useState(new Date());
  const [manualDuracion, setManualDuracion] = useState(0);
  const [manualSide, setManualSide] = useState("izquierdo");
  const [manualNote, setManualNote] = useState("");
  const [guardando, setGuardando] = useState(false);

  const handleGuardar = async () => {
    if (!user || manualDuracion <= 0) return;

    setGuardando(true);

    try {
      await addDoc(collection(db, "usuarios", user.uid, "tomas"), {
        timestamp: manualFecha,
        duration: manualDuracion,
        side: manualSide,
        note: manualNote,
      });

      // Reiniciar y cerrar
      setManualDuracion(0);
      setManualNote("");
      onClose();
    } catch (error) {
      console.error("Error al guardar manualmente:", error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left shadow">
      <h3 className="font-semibold text-gray-700 mb-3">Registro manual</h3>

      <label className="block text-sm mb-1">Fecha y hora:</label>
      <input
        type="datetime-local"
        className="w-full mb-2 border rounded px-2 py-1"
        value={manualFecha.toISOString().slice(0, 16)}
        onChange={(e) => setManualFecha(new Date(e.target.value))}
      />

      <label className="block text-sm mb-1">Duración (segundos):</label>
      <input
        type="number"
        className="w-full mb-2 border rounded px-2 py-1"
        value={manualDuracion}
        onChange={(e) => setManualDuracion(Number(e.target.value))}
      />

      <label className="block text-sm mb-1">Lado:</label>
      <select
        value={manualSide}
        onChange={(e) => setManualSide(e.target.value)}
        className="w-full mb-2 border rounded px-2 py-1"
      >
        <option value="izquierdo">Izquierdo</option>
        <option value="derecho">Derecho</option>
        <option value="ambos">Ambos</option>
      </select>

      <label className="block text-sm mb-1">Notas:</label>
      <textarea
        className="w-full mb-3 border rounded px-2 py-1"
        value={manualNote}
        onChange={(e) => setManualNote(e.target.value)}
      />

      <div className="flex gap-2">
        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="flex-1 bg-blue-600 text-white py-2 rounded disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Guardar"}
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-gray-300 text-black py-2 rounded"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default RegistroManual;
