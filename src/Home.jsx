import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [side, setSide] = useState("izquierdo");
  const [note, setNote] = useState("");
  const [sessions, setSessions] = useState(() => {
    const stored = localStorage.getItem("lactiapp_sesiones");
    return stored ? JSON.parse(stored) : [];
  });

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => setTime(t => t + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    localStorage.setItem("lactiapp_sesiones", JSON.stringify(sessions));
  }, [sessions]);

  const formatTime = (s) => {
    const min = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${min}:${sec}`;
  };

  const handleSave = () => {
    if (time === 0) return;

    const newSession = {
      id: Date.now(),
      duration: time,
      side,
      note,
      timestamp: new Date().toLocaleString()
    };

    setSessions([newSession, ...sessions]);
    setTime(0);
    setNote("");
    setRunning(false);
  };

  return (
    <div className="p-4 max-w-md mx-auto text-center pb-24 relative">
      {/* Botón de cerrar sesión */}
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 text-sm bg-pink-100 text-pink-700 px-3 py-1 rounded hover:bg-pink-200"
      >
        Cerrar sesión
      </button>

      <h1 className="text-2xl font-bold text-pink-600 mb-4">Registrar toma 🍼</h1>

      <div className="text-4xl font-mono mb-4">{formatTime(time)}</div>

      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={() => setRunning(!running)}
          className="px-4 py-2 bg-pink-500 text-white rounded-full"
        >
          {running ? "Detener" : "Iniciar"}
        </button>
        <button
          onClick={() => { setRunning(false); setTime(0); }}
          className="px-4 py-2 bg-gray-300 text-black rounded-full"
        >
          Reiniciar
        </button>
      </div>

      <select
        value={side}
        onChange={(e) => setSide(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-2"
      >
        <option value="izquierdo">Izquierdo</option>
        <option value="derecho">Derecho</option>
        <option value="ambos">Ambos</option>
      </select>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Notas opcionales"
        className="w-full border rounded px-3 py-2 mb-4"
      />

      <button
        onClick={handleSave}
        disabled={time === 0}
        className="w-full bg-green-500 text-white py-2 rounded mb-6 disabled:opacity-50"
      >
        Registrar toma
      </button>

      <div className="text-left">
        <h2 className="text-lg font-semibold mb-2">Historial</h2>
        {sessions.length === 0 ? (
          <p className="text-gray-500">Aún no hay tomas registradas.</p>
        ) : (
          <ul className="space-y-3">
            {sessions.map((s) => (
              <li key={s.id} className="bg-pink-50 p-3 rounded shadow-sm">
                <div className="text-sm font-bold">{s.timestamp}</div>
                <div>⏱️ {formatTime(s.duration)} – 🤱 {s.side}</div>
                {s.note && (
                  <blockquote className="italic text-gray-600 border-l-4 pl-2 border-pink-300">
                    “{s.note}”
                  </blockquote>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Home;

