import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log("Usuario autenticado:", user);
      navigate("/"); // Redirige al Home
    } catch (error) {
      console.error("Error en el login:", error);
      alert("Ocurrió un error al iniciar sesión.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-pink-50 p-4">
      <h1 className="text-2xl font-bold text-pink-600 mb-6">Bienvenida a LactiApp 👶</h1>
      <button
        onClick={handleLogin}
        className="bg-pink-600 text-white px-6 py-3 rounded text-lg font-medium shadow-md hover:bg-pink-700"
      >
        Iniciar sesión con Google
      </button>
    </div>
  );
};

export default Login;
