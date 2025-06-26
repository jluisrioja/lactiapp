import React, { useState, useMemo, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

const CalendarioTomas = ({ onChangeFecha, sessions = [] }) => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());

  useEffect(() => {
    onChangeFecha && onChangeFecha(fechaSeleccionada);
  }, [fechaSeleccionada, onChangeFecha]);

  const handleChange = (date) => {
    setFechaSeleccionada(date);
  };

  const fechasConTomas = useMemo(() => {
    if (!Array.isArray(sessions)) return new Set();
    return new Set(
      sessions.map((s) =>
        new Date((s.timestamp?.seconds || 0) * 1000).toDateString()
      )
    );
  }, [sessions]);

  return (
    <div className="mb-4 bg-white p-3 rounded-lg shadow">
      <Calendar
        onChange={handleChange}
        value={fechaSeleccionada}
        locale="es-PE"
        maxDate={new Date()}
        tileContent={({ date, view }) =>
          view === 'month' && fechasConTomas.has(date.toDateString()) ? (
            <div className="flex justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-600 mt-1" />
            </div>
          ) : null
        }
      />
    </div>
  );
};

export default CalendarioTomas;