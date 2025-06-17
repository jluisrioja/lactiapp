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
      console.log("Logueado:", user);
      navigate("/"); // Redirige al Home
    } catch (error) {
      console.error("Error de login", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50">
      <button
        onClick={handleLogin}
        className="bg-pink-600 text-white px-6 py-3 rounded shadow-lg"
      >
        Iniciar sesión con Google
      </button>
    </div>
  );
};

export default Login;
