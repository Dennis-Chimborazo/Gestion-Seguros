import React, { useState } from 'react';

const Buscador = () => {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);

  const buscar = async (texto) => {
    // Aquí va tu lógica real de búsqueda (API, local, etc.)
    // Simulamos resultados por ahora:
    const datosSimulados = [
      'Juan Pérez',
      'Juana Martínez',
      'Julio López',
      'Julia Torres',
    ];
    const filtrados = datosSimulados.filter(nombre =>
      nombre.toLowerCase().includes(texto.toLowerCase())
    );
    setResultados(filtrados);
  };

  const handleChange = (e) => {
    const texto = e.target.value;
    setQuery(texto);
    if (texto.length > 1) {
      buscar(texto);
    } else {
      setResultados([]);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <label htmlFor="titular">Buscar</label>
      <input
        type="text"
        name="titular"
        id="titular"
        value={query}
        onChange={handleChange}
        className="border p-2 w-full"
      />
      {resultados.length > 0 && (
        <ul className="absolute bg-white border w-full z-10 mt-1 shadow-md rounded">
          {resultados.map((item, index) => (
            <li key={index} className="p-2 hover:bg-gray-100 cursor-pointer">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Buscador;
