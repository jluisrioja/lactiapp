import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log("Logueado:", user);
      navigate("/"); // Redirige al Home
    } catch (error) {
      console.error("Error de login", error);
      setErrorMsg("Ocurrió un error al iniciar sesión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50 px-4">
      <button
        onClick={handleLogin}
        disabled={loading}
        className={`px-6 py-3 rounded shadow-lg text-white transition ${
          loading ? "bg-pink-300 cursor-not-allowed" : "bg-pink-600 hover:bg-pink-700"
        }`}
      >
        {loading ? "Ingresando..." : "Iniciar sesión con Google"}
      </button>
      {errorMsg && <p className="text-red-600 mt-4 text-center">{errorMsg}</p>}
    </div>
  );
};

export default Login;
