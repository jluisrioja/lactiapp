
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";

const Home = () => {
  const [duration, setDuration] = useState("");
  const [side, setSide] = useState("izquierdo");
  const [note, setNote] = useState("");
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("lactancia_sesiones");
    return saved ? JSON.parse(saved) : [];
  });

  const handleRegister = () => {
    if (!duration) return;

    const newSession = {
      id: Date.now(),
      duration: duration,
      side,
      note,
      timestamp: new Date().toLocaleString()
    };

    setSessions([newSession, ...sessions]);
    setDuration("");
    setNote("");
  };

  useEffect(() => {
    localStorage.setItem("lactancia_sesiones", JSON.stringify(sessions));
  }, [sessions]);

  return (
    <div className="p-4 max-w-md mx-auto text-center">
      <h1 className="text-3xl font-bold text-pink-600 mb-1">LactiApp</h1>
      <p className="text-sm text-gray-500 mb-6">Tu app de lactancia, simple y confiable.</p>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Registrar nueva toma 🍼</h2>
        <input
          type="number"
          className="w-full mb-2 border rounded px-3 py-2"
          placeholder="Minutos"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <select
          className="w-full mb-2 border rounded px-3 py-2"
          value={side}
          onChange={(e) => setSide(e.target.value)}
        >
          <option value="izquierdo">Izquierdo</option>
          <option value="derecho">Derecho</option>
        </select>
        <textarea
          className="w-full mb-4 border rounded px-3 py-2"
          placeholder="Notas opcionales"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button
          onClick={handleRegister}
          className="w-full bg-pink-500 text-white py-2 rounded font-semibold"
        >
          Registrar toma
        </button>
      </div>

      <div>
        {sessions.map((s, i) => (
          <div key={s.id} className="mb-4 text-left bg-pink-50 rounded p-3 shadow-sm">
            <div className="text-sm font-semibold">{s.timestamp}</div>
            <div className="text-sm">⏱️ {s.duration} min – 🤱 {s.side}</div>
            {s.note && <div className="text-sm italic text-gray-600">“{s.note}”</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

const Historial = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-pink-600 mb-4">Historial</h1>
    <p>Sesiones anteriores se mostrarán aquí.</p>
  </div>
);

const Estadisticas = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-pink-600 mb-4">Estadísticas</h1>
    <p>Resumen gráfico y estadísticas de lactancia.</p>
  </div>
);

const Perfil = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-pink-600 mb-4">Perfil</h1>
    <p>Opciones del usuario, configuración.</p>
  </div>
);

const BottomNav = () => {
  const location = useLocation();
  const current = (path) =>
    location.pathname === path ? "text-pink-600 font-bold" : "text-gray-500";

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t shadow-md flex justify-around py-2 z-50">
      <Link to="/" className={current("/")}>
        🏠<div className="text-xs">Inicio</div>
      </Link>
      <Link to="/historial" className={current("/historial")}>
        📜<div className="text-xs">Historial</div>
      </Link>
      <Link to="/estadisticas" className={current("/estadisticas")}>
        📊<div className="text-xs">Estadísticas</div>
      </Link>
      <Link to="/perfil" className={current("/perfil")}>
        👤<div className="text-xs">Perfil</div>
      </Link>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="pb-24">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/estadisticas" element={<Estadisticas />} />
          <Route path="/perfil" element={<Perfil />} />
        </Routes>
      </div>
      <BottomNav />
    </Router>
  );
}

export default App;
