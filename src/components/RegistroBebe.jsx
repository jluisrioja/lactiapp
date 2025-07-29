import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const RegistroBebe = ({ user, onRegistro }) => {
  const [nombre, setNombre] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !fechaNacimiento || !user) {
      setError("Completa todos los campos.");
      return;
    }

    try {
      setLoading(true);
      const bebeRef = await addDoc(collection(db, "bebes"), {
        nombre,
        fechaNacimiento: new Date(fechaNacimiento),
        creadoPor: user.uid,
        timestamp: serverTimestamp(),
        miembros: [user.uid],
      });
      onRegistro(bebeRef.id); // devuelve el ID del bebé registrado
    } catch (e) {
      console.error("Error al registrar bebé:", e);
      setError("Hubo un error al registrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto text-center">
      <h2 className="text-xl font-semibold mb-4">Registrar bebé 👶</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nombre del bebé"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="date"
          value={fechaNacimiento}
          onChange={(e) => setFechaNacimiento(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-500 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Registrar"}
        </button>
      </form>
    </div>
  );
};

export default RegistroBebe;
