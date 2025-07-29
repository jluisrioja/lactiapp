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
import RegistroBebe from "./components/RegistroBebe";

const Home = () => {
  const [bebeId, setBebeId] = useState(null);
  const [bebes, setBebes] = useState([]);
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
    const q = query(collection(db, "bebes"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bebesUser = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((b) => b.miembros.includes(user.uid));
      setBebes(bebesUser);
      if (bebesUser.length > 0) setBebeId(bebesUser[0].id);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || !bebeId) return;
    const q = query(collection(db, "bebes", bebeId, "tomas"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSessions(data);
    });
    return () => unsubscribe();
  }, [user, bebeId]);

  useEffect(() => {
    if (!user || !bebeId) return;
    const q = query(collection(db, "bebes", bebeId, "panales"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPanales(data);
    });
    return () => unsubscribe();
  }, [user, bebeId]);

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
    if (running && startTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setTime(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [running, startTime]);

  const formatTime = (s) => {
    const min = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  const handleSave = async () => {
    if (time === 0 || !user || !bebeId) return;
    const newSession = { duration: time, side, note, timestamp: new Date() };
    try {
      await addDoc(collection(db, "bebes", bebeId, "tomas"), newSession);
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
      localStorage.setItem("lactiapp_toma", JSON.stringify({ startTime: now, side, note, running: true }));
    } else {
      localStorage.removeItem("lactiapp_toma");
    }
    setRunning(!running);
  };

  const handleRegistrarPanial = async () => {
    if (!user || !bebeId) return;
    try {
      await addDoc(collection(db, "bebes", bebeId, "panales"), { timestamp: new Date() });
    } catch (error) {
      console.error("Error al registrar pañal:", error);
    }
  };

  const handleDeleteToma = async (id) => {
    if (!user || !bebeId) return;
    try {
      await deleteDoc(doc(db, "bebes", bebeId, "tomas", id));
    } catch (error) {
      console.error("Error al borrar toma:", error);
    }
  };

  const handleDeletePanial = async (id) => {
    if (!user || !bebeId) return;
    try {
      await deleteDoc(doc(db, "bebes", bebeId, "panales", id));
    } catch (error) {
      console.error("Error al borrar pañal:", error);
    }
  };

  const handleChangeFecha = (fecha) => setFechaSeleccionada(fecha);

  const handleEditClick = (session) => {
    setEditingId(session.id);
    setEditValues({ duration: session.duration, side: session.side, note: session.note || "" });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async (id) => {
    if (!user || !bebeId) return;
    try {
      const ref = doc(db, "bebes", bebeId, "tomas", id);
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
            tomasDelDia.reduce((acc, cur) => acc + (cur.duration || 0), 0) / tomasDelDia.length
          )
        )
      : "00:00";

  if (!bebeId) {
    return <RegistroBebe user={user} onRegistro={(id) => setBebeId(id)} />;
  }

  return (
    <div className="p-4 max-w-md mx-auto text-center pb-24 relative">
      <h2 className="text-xl font-semibold">¡Hola, {displayName}!</h2>
      {photoURL && <img src={photoURL} alt="Perfil" className="w-16 h-16 rounded-full mx-auto my-2" />}
      <div className="text-2xl font-bold mt-4">Registrar toma 🍼</div>
      <div className="text-4xl my-2">{formatTime(time)}</div>
      <div className="space-x-2">
        <button onClick={handleStartStop} className="bg-pink-500 text-white px-4 py-2 rounded">
          {running ? "Detener" : "Iniciar"}
        </button>
        <button
          onClick={() => {
            setTime(0);
            setRunning(false);
            setStartTime(null);
            localStorage.removeItem("lactiapp_toma");
          }}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Reiniciar
        </button>
      </div>
      <select
        value={side}
        onChange={(e) => setSide(e.target.value)}
        className="mt-4 w-full border px-2 py-1 rounded"
      >
        <option value="izquierdo">Izquierdo</option>
        <option value="derecho">Derecho</option>
      </select>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Notas opcionales"
        className="w-full border mt-2 px-2 py-1 rounded"
      />
      <button onClick={handleSave} className="w-full mt-2 bg-green-400 text-white py-2 rounded">
        Registrar toma
      </button>
      <button
        onClick={() => setMostrarManual(!mostrarManual)}
        className="w-full mt-2 bg-blue-200 py-2 rounded"
      >
        {mostrarManual ? "Ocultar registro manual" : "Registro manual"}
      </button>
      {mostrarManual && (
        <RegistroManual
          user={user}
          bebeId={bebeId}
          onClose={() => setMostrarManual(false)}
        />
      )}
      <button onClick={handleRegistrarPanial} className="w-full mt-2 bg-yellow-100 py-2 rounded">
        Registrar cambio de pañal 🧷
      </button>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-white border rounded p-2">
          <div className="text-sm">Tomas de hoy</div>
          <div className="text-xl font-bold">{tomasDelDia.length}</div>
        </div>
        <div className="bg-white border rounded p-2">
          <div className="text-sm">Prom. Duración</div>
          <div className="text-xl font-bold">{promedioDelDia}</div>
        </div>
      </div>
      <EstadisticasTexto sesiones={tomasDelDia} panales={panalesDelDia} />
      <GraficosEstadisticas sesiones={tomasDelDia} panales={panalesDelDia} />
      <CalendarioTomas
        onFechaSeleccionada={handleChangeFecha}
        fechaSeleccionada={fechaSeleccionada}
      />
      <div className="mt-8 space-y-4">
        <div className="text-lg font-bold">Historial del día</div>
        {tomasDelDia.map((session) =>
          editingId === session.id ? (
            <div key={session.id} className="border rounded p-2 bg-yellow-50">
              <input
                type="number"
                name="duration"
                value={editValues.duration}
                onChange={handleEditChange}
                className="w-full border rounded px-2 py-1 mb-1"
              />
              <select
                name="side"
                value={editValues.side}
                onChange={handleEditChange}
                className="w-full border rounded px-2 py-1 mb-1"
              >
                <option value="izquierdo">Izquierdo</option>
                <option value="derecho">Derecho</option>
              </select>
              <textarea
                name="note"
                value={editValues.note}
                onChange={handleEditChange}
                placeholder="Nota"
                className="w-full border rounded px-2 py-1 mb-1"
              />
              <button
                onClick={() => handleEditSave(session.id)}
                className="bg-green-500 text-white px-2 py-1 rounded mr-2"
              >
                Guardar
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="bg-gray-300 px-2 py-1 rounded"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div key={session.id} className="border rounded p-2">
              <div>
                {formatTime(session.duration)} - {session.side}
                {session.note && <span> - {session.note}</span>}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(session.timestamp?.seconds * 1000).toLocaleTimeString()}
              </div>
              <button
                onClick={() => handleEditClick(session)}
                className="text-blue-500 text-sm mr-2"
              >
                Editar
              </button>
              <button
                onClick={() => handleDeleteToma(session.id)}
                className="text-red-500 text-sm"
              >
                Eliminar
              </button>
            </div>
          )
        )}
        {panalesDelDia.map((panial) => (
          <div key={panial.id} className="border rounded p-2 bg-blue-50">
            Cambio de pañal - {new Date(panial.timestamp?.seconds * 1000).toLocaleTimeString()}
            <button
              onClick={() => handleDeletePanial(panial.id)}
              className="text-red-500 text-sm ml-2"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={handleLogout}
        className="absolute top-2 right-2 text-sm text-pink-500 border px-2 py-1 rounded"
      >
        Cerrar sesión
      </button>
    </div>
  );
};

export default Home;

