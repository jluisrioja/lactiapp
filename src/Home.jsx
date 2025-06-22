import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

import EstadisticasTexto from "./components/EstadisticasTexto";
import GraficosEstadisticas from "./components/GraficosEstadisticas";

const Home = () => {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [side, setSide] = useState("izquierdo");
  const [note, setNote] = useState("");
  const [sessions, setSessions] = useState([]);

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

  const ultimoLado = sessions[0]?.side || "—";
  const ultimaNota = sessions.find((s) => s.note)?.note || "—";

  return (
    <div className="p-4 max-w-md mx-auto text-center pb-24 relative">
      {/* ... otros elementos como botones, cronómetro, formulario ... */}

      <EstadisticasTexto sessions={sessions} formatTime={formatTime} />

      <GraficosEstadisticas sessions={sessions} />

      {/* Historial */}
      <div className="text-left">
        <h2 className="text-lg font-semibold mb-2">Historial</h2>
        {sessions.length === 0 ? (
          <p className="text-gray-500">Aún no hay tomas registradas.</p>
        ) : (
          <ul className="space-y-3">
            {sessions.map((s) => (
              <li key={s.id} className="bg-pink-50 p-3 rounded shadow-sm">
                <div className="text-sm font-bold">
                  {new Date(
                    (s.timestamp.seconds || 0) * 1000
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Home;
