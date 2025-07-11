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
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import EstadisticasTexto from "./components/EstadisticasTexto";
import GraficosEstadisticas from "./components/GraficosEstadisticas";
import CalendarioTomas from "./components/CalendarioTomas";
import RegistroManual from "./components/RegistroManual";

const Home = () => {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [side, setSide] = useState("izquierdo");
  const [note, setNote] = useState("");
  const [sessions, setSessions] = useState([]);
  const [panales, setPanales] = useState([]);
  const [mostrarManual, setMostrarManual] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ duration: 0, side: "", note: "" });

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
    if (!user) return;

    const q = query(
      collection(db, "usuarios", user.uid, "panales"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPanales(data);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const saved = localStorage.getItem("lactiapp_toma");
    if (saved) {
      const { startTime, side: s, note: n, running } = JSON.parse(saved);
      if (running && startTime) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setTime(elapsed);
        setRunning(true);
        setSide(s);
        setNote(n);
        setStartTime(startTime);
      }
    }
  }, []);

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
      setStartTime(null);
      localStorage.removeItem("lactiapp_toma");
    } catch (error) {
      console.error("Error al guardar en Firestore:", error);
    }
  };

  const handleStartStop = () => {
    if (!running) {
      const now = Date.now();
      setStartTime(now);
      localStorage.setItem("lactiapp_toma", JSON.stringify({
        startTime: now,
        side,
        note,
        running: true
      }));
    } else {
      localStorage.removeItem("lactiapp_toma");
    }
    setRunning(!running);
  };

  const handleRegistrarPanial = async () => {
    if (!user) return;

    try {
      await addDoc(collection(db, "usuarios", user.uid, "panales"), {
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error al registrar pañal:", error);
    }
  };

  const handleDeleteToma = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "usuarios", user.uid, "tomas", id));
    } catch (error) {
      console.error("Error al borrar toma:", error);
    }
  };

  const handleDeletePanial = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "usuarios", user.uid, "panales", id));
    } catch (error) {
      console.error("Error al borrar pañal:", error);
    }
  };

  const handleChangeFecha = (fecha) => {
    setFechaSeleccionada(fecha);
  };

  const handleEditClick = (session) => {
    setEditingId(session.id);
    setEditValues({
      duration: session.duration,
      side: session.side,
      note: session.note || ""
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async (id) => {
    if (!user) return;
    try {
      const ref = doc(db, "usuarios", user.uid, "tomas", id);
      await updateDoc(ref, {
        duration: Number(editValues.duration),
        side: editValues.side,
        note: editValues.note
      });
      setEditingId(null);
    } catch (error) {
      console.error("Error al editar:", error);
    }
  };

  const tomasDelDia = sessions.filter((s) => {
    const fechaToma = new Date((s.timestamp?.seconds || 0) * 1000);
    return fechaToma.toDateString() === fechaSeleccionada.toDateString();
  });

  const panalesDelDia = panales.filter((p) => {
    const fecha = new Date((p.timestamp?.seconds || 0) * 1000);
    return fecha.toDateString() === fechaSeleccionada.toDateString();
  });

  const promedioDelDia =
    tomasDelDia.length > 0
      ? formatTime(
          Math.floor(
            tomasDelDia.reduce((acc, cur) => acc + (cur.duration || 0), 0) /
              tomasDelDia.length
          )
        )
      : "00:00";

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
          onClick={handleStartStop}
          className="px-4 py-2 bg-pink-500 text-white rounded-full"
        >
          {running ? "Detener" : "Iniciar"}
        </button>
        <button
          onClick={() => {
            setRunning(false);
            setTime(0);
            setStartTime(null);
            localStorage.removeItem("lactiapp_toma");
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
        className="w-full bg-blue-200 text-blue-800 py-2 rounded mb-4"
      >
        Registro manual
      </button>

      <button
        onClick={handleRegistrarPanial}
        className="w-full bg-yellow-100 text-yellow-800 py-2 rounded mb-6 hover:bg-yellow-200"
      >
        Registrar cambio de pañal 🧷
      </button>

      {mostrarManual && (
        <RegistroManual user={user} onClose={() => setMostrarManual(false)} />
      )}

      <EstadisticasTexto sessions={sessions} />
      <CalendarioTomas sessions={sessions} onChangeFecha={handleChangeFecha} />

      <div className="text-sm text-left text-gray-700 mt-2 mb-4">
        <p><strong>Tomas ese día:</strong> {tomasDelDia.length}</p>
        <p><strong>Promedio:</strong> {promedioDelDia}</p>
      </div>

      <GraficosEstadisticas
        sessions={sessions}
        panales={panales}
        fechaReferencia={fechaSeleccionada}
      />

      <div className="text-left mt-6">
        <h2 className="text-lg font-semibold mb-2">
          Historial del{" "}
          {fechaSeleccionada.toLocaleDateString("es-PE", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </h2>
        {tomasDelDia.length === 0 ? (
          <p className="text-gray-500">Aún no hay tomas registradas ese día.</p>
        ) : (
          <ul className="space-y-3">
            {tomasDelDia.map((s) => (
              <li key={s.id} className="bg-pink-50 p-3 rounded shadow-sm">
                {editingId === s.id ? (
                  <div className="space-y-2">
                    <input
                      type="number"
                      name="duration"
                      value={editValues.duration}
                      onChange={handleEditChange}
                      className="w-full border px-2 py-1 rounded"
                      placeholder="Duración en segundos"
                    />
                    <select
                      name="side"
                      value={editValues.side}
                      onChange={handleEditChange}
                      className="w-full border px-2 py-1 rounded"
                    >
                      <option value="izquierdo">Izquierdo</option>
                      <option value="derecho">Derecho</option>
                      <option value="ambos">Ambos</option>
                    </select>
                    <textarea
                      name="note"
                      value={editValues.note}
                      onChange={handleEditChange}
                      className="w-full border px-2 py-1 rounded"
                      placeholder="Nota"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSave(s.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-300 text-black px-3 py-1 rounded"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-sm font-bold">
                      {new Date((s.timestamp?.seconds || 0) * 1000).toLocaleString()}
                    </div>
                    <div>
                      ⏱️ {formatTime(s.duration)} – 🤱 {s.side}
                    </div>
                    {s.note && (
                      <blockquote className="italic text-gray-600 border-l-4 pl-2 border-pink-300">
                        “{s.note}”
                      </blockquote>
                    )}
                    <div className="flex gap-4 mt-2">
                      <button
                        onClick={() => handleEditClick(s)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDeleteToma(s.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        🗑️ Borrar
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="text-left mt-10">
        <h2 className="text-lg font-semibold mb-2">Historial de pañales 🧷</h2>
        {panalesDelDia.length === 0 ? (
          <p className="text-gray-500">Aún no hay cambios de pañal ese día.</p>
        ) : (
          <ul className="space-y-3">
            {panalesDelDia.map((p) => (
              <li key={p.id} className="bg-yellow-50 p-3 rounded shadow-sm flex justify-between items-center">
                <span>
                  {new Date((p.timestamp?.seconds || 0) * 1000).toLocaleString()}
                </span>
                <button
                  onClick={() => handleDeletePanial(p.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  🗑️ Borrar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Home;