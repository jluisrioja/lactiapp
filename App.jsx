
import { useEffect, useState } from "react";

export default function App() {
  const [feedings, setFeedings] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("feedings");
    if (stored) setFeedings(JSON.parse(stored));
  }, []);

  const handleNewFeeding = () => {
    const newEntry = {
      id: Date.now(),
      time: new Date().toLocaleString(),
    };
    const updated = [newEntry, ...feedings];
    setFeedings(updated);
    localStorage.setItem("feedings", JSON.stringify(updated));
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1 style={{ color: '#e91e63' }}>LactiApp</h1>
      <p>Tu app de lactancia, simple y confiable.</p>
      <button onClick={handleNewFeeding}>Registrar toma</button>
      <ul>
        {feedings.map((f) => (
          <li key={f.id}>🍼 {f.time}</li>
        ))}
      </ul>
    </div>
  );
}
