import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./Home";

const Perfil = () => (
  <div className="p-6 pb-24">
    <h1 className="text-xl text-pink-600">Perfil</h1>
  </div>
);

const BottomNav = () => {
  const location = useLocation();
  const isActive = (path) =>
    location.pathname === path ? "text-pink-600 font-bold" : "text-gray-500";

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t shadow-md flex justify-around py-2 z-50">
      <Link to="/" className={\`flex flex-col items-center \${isActive("/")}\`}>
        🏠<span className="text-xs">Inicio</span>
      </Link>
      <Link to="/perfil" className={\`flex flex-col items-center \${isActive("/perfil")}\`}>
        👤<span className="text-xs">Perfil</span>
      </Link>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/perfil" element={<Perfil />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
