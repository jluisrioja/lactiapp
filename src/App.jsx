// LactiApp - App mejorada con duración, lado y notas
import { useEffect, useState } from "react";

export default function App() {
  const [feedings, setFeedings] = useState([]);
  const [duration, setDuration] = useState(10);
  const [side, setSide] = useState("izquierdo");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("feedings");
    if (stored) setFeedings(JSON.parse(stored));
  }, []);

  const handleNewFeeding = () => {
    const newEntry = {
      id: Date.now(),
      time: new Date().toLocaleString(),
      duration: Number(duration),
      side,
      notes,
    };
    const updated = [newEntry, ...feedings];
    setFeedings(updated);
    localStorage.setItem("feedings", JSON.stringify(updated));

    // Resetear formulario
    setDuration(10);
    setSide("izquierdo");
    setNotes("");
  };

  return (
    <div className="min-h-screen bg-pink-50 text-center p-4">
      <h1 className="text-3xl font-bold text-pink-600">LactiApp</h1>
      <p className="text-sm text-gray-600 mb-4">Tu app de lactancia, simple y confiable.</p>

      <div className="max-w-md mx-auto bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Registrar nueva toma 🍼</h2>

        <input
          type="number"
          placeholder="Duración (min)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full border rounded p-2 mb-2"
        />

        <select
          value={side}
          onChange={(e) => setSide(e.target.value)}
          className="w-full border rounded p-2 mb-2"
        >
          <option value="izquierdo">Izquierdo</option>
          <option value="derecho">Derecho</option>
          <option value="ambos">Ambos</option>
        </select>

        <textarea
          placeholder="Notas opcionales"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border rounded p-2 mb-4"
        />

        <button
          onClick={handleNewFeeding}
          className="bg-pink-500 text-white px-4 py-2 rounded-xl hover:bg-pink-600 w-full"
        >
          Registrar toma
        </button>
      </div>

      <ul className="mt-6 text-left max-w-md mx-auto">
        {feedings.map((f) => (
          <li key={f.id} className="border-b border-pink-100 py-3">
            <div><strong>{f.time}</strong></div>
            <div>⏱ {f.duration} min - 🤱 {f.side}</div>
            {f.notes && <div className="text-sm text-gray-500">📝 {f.notes}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}