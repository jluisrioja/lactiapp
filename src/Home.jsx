import React, { useState, useEffect, useMemo } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";

import EstadisticasTexto from "./components/EstadisticasTexto";
import GraficosEstadisticas from "./components/GraficosEstadisticas";
import CalendarioTomas from "./components/CalendarioTomas";
import RegistroManual from "./components/RegistroManual";

const Home = () => {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [side, setSide] = useState("izquierdo");
  const [note, setNote] = useState("");
  const [sessions, setSessions] = useState([]);
  const [mostrarManual, setMostrarManual] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [nuevaDuracion, setNuevaDuracion] = useState(0);

  const navigate = useNavigate();
  const user = auth.currentUser;
  const displayName = user?.displayName || "Usuario";
  const photoURL = user?.photoURL;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "usuarios", user.uid, "tomas"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSessions(data);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => setTime((t) => t + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [running]);

  const formatTime = (s) => {
    const min = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  const handleSave = async () => {
    if (time === 0 || !user) return;

    const newSession = {
      duration: time,
      side,
      note,
      timestamp: new Date(),
    };

    try {
      await addDoc(collection(db, "usuarios", user.uid, "tomas"), newSession);
      setTime(0);
      setNote("");
      setRunning(false);
    } catch (error) {
      console.error("Error al guardar en Firestore:", error);
    }
  };

  const handleUpdateDuration = async (id) => {
    if (!user || nuevaDuracion <= 0) return;
    try {
      const ref = doc(db, "usuarios", user.uid, "tomas", id);
      await updateDoc(ref, { duration: nuevaDuracion * 60 });
      setEditandoId(null);
    } catch (error) {
      console.error("Error al actualizar duración:", error);
    }
  };

  const totalTomas = sessions.length;
  const promDuracion =
    totalTomas > 0
      ? formatTime(
          Math.floor(
            sessions.reduce((sum, s) => sum + (s.duration || 0), 0) /
              totalTomas
          )
        )
      : "00:00";
  const ultimoLado = sessions[0]?.side || "—";
  const ultimaNota = sessions.find((s) => s.note)?.note || "—";

  return (
    <div className="p-4 max-w-md mx-auto text-center pb-24 relative">
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 text-sm bg-pink-100 text-pink-700 px-3 py-1 rounded hover:bg-pink-200"
      >
        Cerrar sesión
      </button>

      <div className="flex items-center justify-center gap-3 mt-2 mb-4">
        {photoURL && (
          <img
            src={photoURL}
            alt="Foto de perfil"
            className="w-10 h-10 rounded-full border-2 border-pink-300"
          />
        )}
        <span className="text-sm text-gray-700 font-medium">
          ¡Hola, {displayName}!
        </span>
      </div>

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
          onClick={() => {
            setRunning(false);
            setTime(0);
          }}
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

      <button
        onClick={() => setMostrarManual(true)}
        className="w-full bg-blue-200 text-blue-800 py-2 rounded mb-6"
      >
        Registro manual
      </button>

      {mostrarManual && (
        <RegistroManual user={user} onClose={() => setMostrarManual(false)} />
      )}

      <CalendarioTomas sesiones={sessions} />
      <EstadisticasTexto sessions={sessions} />
      <GraficosEstadisticas sessions={sessions} />

      <div className="text-left mt-6">
        <h2 className="text-lg font-semibold mb-2">Historial</h2>
        {Array.isArray(sessions) && sessions.length > 0 ? (
          <ul className="space-y-3">
            {sessions.map((s) => (
              <li key={s.id} className="bg-pink-50 p-3 rounded shadow-sm">
                <div className="text-sm font-bold">
                  {new Date(
                    (s.timestamp?.seconds || 0) * 1000
                  ).toLocaleString()}
                </div>
                <div>
                  ⏱️ {formatTime(s.duration)} – 🤱 {s.side}
                </div>
                {s.note && (
                  <blockquote className="italic text-gray-600 border-l-4 pl-2 border-pink-300">
                    “{s.note}”
                  </blockquote>
                )}
                {editandoId === s.id ? (
                  <div className="mt-2">
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-24 mr-2"
                      value={nuevaDuracion}
                      onChange={(e) => setNuevaDuracion(Number(e.target.value))}
                      placeholder="Minutos"
                    />
                    <button
                      onClick={() => handleUpdateDuration(s.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditandoId(null)}
                      className="bg-gray-400 text-white px-3 py-1 rounded"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditandoId(s.id);
                      setNuevaDuracion(Math.floor((s.duration || 0) / 60));
                    }}
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    Editar duración
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Aún no hay tomas registradas.</p>
        )}
      </div>
    </div>
  );
};

export default Home;