import React, { useState, useEffect } from "react";

const Home = () => {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [side, setSide] = useState("izquierdo");
  const [note, setNote] = useState("");
  const [history, setHistory] = useState(() => {
    const stored = localStorage.getItem("lactiapp-history");
    return stored ? JSON.parse(stored) : [];
  });

  // 🕒 Cronómetro
  useEffect(() => {
    let timer;
    if (running) {
      timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (!running && seconds !== 0) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [running]);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60).toString().padStart(2, "0");
    const secs = (s % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleRegister = () => {
    const newEntry = {
      time: new Date().toLocaleString(),
      duration: seconds,
      side,
      note,
    };
    const updated = [newEntry, ...history];
    setHistory(updated);
    localStorage.setItem("lactiapp-history", JSON.stringify(updated));
    // Reset
    setSeconds(0);
    setRunning(false);
    setNote("");
  };

  return (
    <div className="p-6 pb-24 space-y-4">
      <h1 className="text-xl font-bold text-pink-600">Registro de Lactancia</h1>

      <div className="text-center text-3xl font-mono">{formatTime(seconds)}</div>
      <div className="flex justify-center space-x-2">
        <button onClick={() => setRunning(!running)} className="px-4 py-2 rounded bg-pink-500 text-white">
          {running ? "Pausar" : "Iniciar"}
        </button>
        <button onClick={() => { setSeconds(0); setRunning(false); }} className="px-4 py-2 rounded bg-gray-300">
          Reset
        </button>
      </div>

      <div>
        <label className="block font-medium">Lado:</label>
        <select
          value={side}
          onChange={(e) => setSide(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="izquierdo">Izquierdo</option>
          <option value="derecho">Derecho</option>
          <option value="ambos">Ambos</option>
        </select>
      </div>

      <div>
        <label className="block font-medium">Notas:</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Ej. bebé se quedó dormida"
        />
      </div>

      <button onClick={handleRegister} className="w-full bg-pink-600 text-white py-2 rounded font-semibold">
        Registrar toma
      </button>

      <div>
        <h2 className="text-lg font-semibold mt-6 mb-2">Historial</h2>
        {history.length === 0 ? (
          <p className="text-gray-500">No hay registros aún.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((entry, i) => (
              <li key={i} className="border p-2 rounded text-sm">
                <strong>{entry.time}</strong> – {formatTime(entry.duration)} – {entry.side}
                {entry.note && <div className="text-gray-600">📝 {entry.note}</div>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Home;
