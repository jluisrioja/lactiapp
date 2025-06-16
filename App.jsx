import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";

const Home = () => <div className="p-6"><h1 className="text-xl text-pink-600">Inicio</h1></div>;
const Perfil = () => <div className="p-6"><h1 className="text-xl text-pink-600">Perfil</h1></div>;

const BottomNav = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? "text-pink-600 font-bold" : "text-gray-500";
  return (
    <nav className="fixed bottom-0 w-full bg-white border-t shadow-md flex justify-around py-2 z-50">
      <Link to="/" className={isActive("/")}>🏠<div className="text-xs">Inicio</div></Link>
      <Link to="/perfil" className={isActive("/perfil")}>👤<div className="text-xs">Perfil</div></Link>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/perfil" element={<Perfil />} />
        </Routes>
      </div>
      <BottomNav />
    </Router>
  );
}

export default App;