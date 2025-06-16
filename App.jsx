
import React, { useState, useEffect } from 'react';

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [side, setSide] = useState("izquierdo");
  const [note, setNote] = useState("");
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("lactancia_sesiones");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!isRunning && elapsedTime !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    localStorage.setItem("lactancia_sesiones", JSON.stringify(sessions));
  }, [sessions]);

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return \`\${mins}:\${secs}\`;
  };

  const handleSaveSession = () => {
    const newSession = {
      id: Date.now(),
      time: formatTime(elapsedTime),
      side,
      note,
      timestamp: new Date().toLocaleString()
    };
    setSessions([newSession, ...sessions]);
    setElapsedTime(0);
    setNote("");
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold text-pink-600 mb-4">LactiApp</h1>
      <div className="text-4xl font-mono mb-4">{formatTime(elapsedTime)}</div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="px-4 py-2 bg-pink-500 text-white rounded-full"
        >
          {isRunning ? "Detener" : "Iniciar"}
        </button>
        <button
          onClick={() => {
            setElapsedTime(0);
            setIsRunning(false);
          }}
          className="px-4 py-2 bg-gray-300 text-black rounded-full"
        >
          Reiniciar
        </button>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium">Lado:</label>
        <select
          value={side}
          onChange={(e) => setSide(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="izquierdo">Izquierdo</option>
          <option value="derecho">Derecho</option>
        </select>
      </div>
      <div className="mb-4 w-full max-w-sm">
        <label className="block text-sm font-medium">Notas:</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border rounded px-2 py-1"
          rows="2"
        />
      </div>
      <button
        onClick={handleSaveSession}
        className="px-6 py-2 bg-green-500 text-white rounded-full mb-6"
        disabled={elapsedTime === 0}
      >
        Guardar sesión
      </button>

      <div className="w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">Historial</h2>
        <ul className="space-y-2">
          {sessions.map((session) => (
            <li key={session.id} className="p-3 border rounded bg-white">
              <div><strong>Duración:</strong> {session.time}</div>
              <div><strong>Lado:</strong> {session.side}</div>
              {session.note && <div><strong>Nota:</strong> {session.note}</div>}
              <div className="text-sm text-gray-500">{session.timestamp}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
