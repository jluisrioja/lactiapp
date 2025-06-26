import React, { useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

const CalendarioTomas = ({ onChangeFecha }) => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());

  const handleChange = (date) => {
    setFechaSeleccionada(date);
    onChangeFecha(date); // enviamos la fecha al padre
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow">
      <Calendar
        onChange={handleChange}
        value={fechaSeleccionada}
        locale="es-PE"
        maxDate={new Date()}
      />
    </div>
  );
};

export default CalendarioTomas;
