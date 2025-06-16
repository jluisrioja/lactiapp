import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";

const Home = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-pink-600 mb-4">Inicio</h1>
      <p>Aquí va el cronómetro y el guardado de sesiones (implementado).</p>
    </div>
  );
};

const Historial = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-pink-600 mb-4">Historial</h1>
      <p>Sesiones anteriores se mostrarán aquí.</p>
    </div>
  );
};

const Estadisticas = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-pink-600 mb-4">Estadísticas</h1>
      <p>Resumen gráfico y estadísticas de lactancia.</p>
    </div>
  );
};

const Perfil = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-pink-600 mb-4">Perfil</h1>
      <p>Opciones del usuario, configuración.</p>
    </div>
  );
};

const BottomNav = () => {
  const location = useLocation();
  const current = (path) => location.pathname === path ? "text-pink-600 font-bold" : "text-gray-500";

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t shadow-md flex justify-around py-2">
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
      <div className="pb-16"> {/* padding bottom para no tapar contenido */}
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
