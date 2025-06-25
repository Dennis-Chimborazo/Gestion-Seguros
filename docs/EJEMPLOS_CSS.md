# Ejemplos de Uso del Sistema CSS - Gestión de Seguros

Este documento proporciona ejemplos prácticos sobre cómo usar nuestro sistema CSS estandarizado para crear nuevos componentes o migrar los existentes de CSS Modules.

## Índice
1. [Estructura de un Componente](#estructura-de-un-componente)
2. [Formularios](#formularios)
3. [Tablas de Datos](#tablas-de-datos)
4. [Cards Informativas](#cards-informativas)
5. [Migración de CSS Modules](#migración-de-css-modules)

## Estructura de un Componente

### Archivo JSX (ComponenteEjemplo.jsx)

```jsx
import React, { useState } from 'react';
import './ComponenteEjemplo.css'; // Importar CSS asociado

export function ComponenteEjemplo() {
  const [datos, setDatos] = useState({
    nombre: '',
    email: '',
    tipo: 'cliente'
  });

  const handleChange = (e) => {
    setDatos({
      ...datos,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="componente-container">
      <div className="componente-header">
        <h2 className="componente-title">Título del Componente</h2>
        <p className="componente-description">Descripción breve del componente</p>
      </div>
      
      <div className="componente-card">
        <form className="componente-form">
          <div className="componente-form-group">
            <label htmlFor="nombre" className="componente-form-label">Nombre</label>
            <input 
              type="text" 
              id="nombre" 
              name="nombre" 
              className="componente-form-input" 
              value={datos.nombre}
              onChange={handleChange}
            />
          </div>
          
          <div className="componente-form-group">
            <label htmlFor="email" className="componente-form-label">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              className="componente-form-input" 
              value={datos.email}
              onChange={handleChange}
            />
          </div>
          
          <div className="componente-form-group">
            <label htmlFor="tipo" className="componente-form-label">Tipo</label>
            <select 
              id="tipo" 
              name="tipo" 
              className="componente-form-select" 
              value={datos.tipo}
              onChange={handleChange}
            >
              <option value="cliente">Cliente</option>
              <option value="agente">Agente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          
          <div className="componente-form-actions">
            <button type="button" className="componente-button-cancel">
              Cancelar
            </button>
            <button type="submit" className="componente-button-submit">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

### Archivo CSS (ComponenteEjemplo.css)

```css
.componente-container {
  padding: var(--spacing-lg);
  max-width: 800px;
  margin: 0 auto;
}

.componente-header {
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.componente-title {
  font-size: var(--font-size-xl);
  color: var(--color-primary-dark);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.componente-description {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
}

.componente-card {
  background-color: var(--color-card-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-xl);
}

/* Estilos de formulario */
.componente-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.componente-form-group {
  display: flex;
  flex-direction: column;
}

.componente-form-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
  color: var(--color-text-primary);
}

.componente-form-input,
.componente-form-select {
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-md);
  transition: all 0.3s ease;
}

.componente-form-input:focus,
.componente-form-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.componente-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.componente-button-submit {
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.componente-button-submit:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.componente-button-cancel {
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.componente-button-cancel:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Media queries para responsividad */
@media (max-width: 768px) {
  .componente-form-actions {
    flex-direction: column;
  }
  
  .componente-button-submit,
  .componente-button-cancel {
    width: 100%;
  }
}
```

## Formularios

### Ejemplo de Formulario de Dos Columnas

```jsx
<div className="form-container">
  <h2 className="form-title">Registro de Cliente</h2>
  
  <form className="form">
    <div className="form-section">
      <h3 className="form-section-title">Información Personal</h3>
      
      <div className="form-row">
        <div className="form-column">
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input type="text" id="nombre" name="nombre" />
          </div>
        </div>
        
        <div className="form-column">
          <div className="form-group">
            <label htmlFor="apellido">Apellido</label>
            <input type="text" id="apellido" name="apellido" />
          </div>
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-column">
          <div className="form-group">
            <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
            <input type="date" id="fechaNacimiento" name="fechaNacimiento" />
          </div>
        </div>
        
        <div className="form-column">
          <div className="form-group">
            <label htmlFor="telefono">Teléfono</label>
            <input type="text" id="telefono" name="telefono" />
          </div>
        </div>
      </div>
    </div>
    
    <div className="form-section">
      <h3 className="form-section-title">Dirección</h3>
      
      <div className="form-row">
        <div className="form-column">
          <div className="form-group">
            <label htmlFor="calle">Calle</label>
            <input type="text" id="calle" name="calle" />
          </div>
        </div>
        
        <div className="form-column">
          <div className="form-group">
            <label htmlFor="ciudad">Ciudad</label>
            <input type="text" id="ciudad" name="ciudad" />
          </div>
        </div>
      </div>
    </div>
    
    <div className="form-actions">
      <button type="button" className="form-button-cancel">Cancelar</button>
      <button type="submit" className="form-button-submit">Guardar Cliente</button>
    </div>
  </form>
</div>
```

```css
.form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.form-title {
  font-size: var(--font-size-xl);
  color: var(--color-primary-dark);
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.form {
  background-color: var(--color-card-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-xl);
}

.form-section {
  margin-bottom: var(--spacing-xl);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--spacing-lg);
}

.form-section:last-child {
  border-bottom: none;
}

.form-section-title {
  font-size: var(--font-size-lg);
  color: var(--color-primary-dark);
  margin-bottom: var(--spacing-md);
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.form-column {
  flex: 1;
  min-width: 250px;
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  padding-top: var(--spacing-lg);
}

.form-button-submit,
.form-button-cancel {
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--border-radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.form-button-submit {
  background-color: var(--color-primary);
  color: white;
  border: none;
}

.form-button-submit:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.form-button-cancel {
  background-color: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.form-button-cancel:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .form-button-submit,
  .form-button-cancel {
    width: 100%;
  }
}
```

## Tablas de Datos

```jsx
<div className="table-container">
  <h2 className="table-title">Listado de Clientes</h2>
  
  <div className="table-actions">
    <div className="table-search">
      <input 
        type="text" 
        placeholder="Buscar cliente..." 
        className="table-search-input"
      />
      <button className="table-search-button">Buscar</button>
    </div>
    
    <button className="table-add-button">Nuevo Cliente</button>
  </div>
  
  <div className="table-responsive">
    <table className="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Email</th>
          <th>Teléfono</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Juan Pérez</td>
          <td>juan@example.com</td>
          <td>555-1234</td>
          <td className="table-actions-cell">
            <button className="table-button-edit">Editar</button>
            <button className="table-button-delete">Eliminar</button>
          </td>
        </tr>
        <tr>
          <td>2</td>
          <td>María García</td>
          <td>maria@example.com</td>
          <td>555-5678</td>
          <td className="table-actions-cell">
            <button className="table-button-edit">Editar</button>
            <button className="table-button-delete">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  
  <div className="table-pagination">
    <button className="pagination-button">Anterior</button>
    <span className="pagination-info">Página 1 de 5</span>
    <button className="pagination-button">Siguiente</button>
  </div>
</div>
```

```css
.table-container {
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.table-title {
  font-size: var(--font-size-xl);
  color: var(--color-primary-dark);
  margin-bottom: var(--spacing-lg);
}

.table-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.table-search {
  display: flex;
  gap: var(--spacing-sm);
  flex: 1;
}

.table-search-input {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  flex: 1;
  min-width: 200px;
}

.table-search-button {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-accent);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
}

.table-add-button {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.table-responsive {
  overflow-x: auto;
  box-shadow: var(--shadow-md);
  border-radius: var(--border-radius-sm);
  margin-bottom: var(--spacing-lg);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: var(--spacing-md);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.data-table th {
  background-color: var(--color-primary-light);
  color: white;
  font-weight: 600;
}

.data-table tbody tr:hover {
  background-color: rgba(76, 175, 80, 0.05);
}

.table-actions-cell {
  display: flex;
  gap: var(--spacing-sm);
}

.table-button-edit,
.table-button-delete {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
}

.table-button-edit {
  background-color: var(--color-accent);
  color: white;
  border: none;
}

.table-button-delete {
  background-color: var(--color-error);
  color: white;
  border: none;
}

.table-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
}

.pagination-button {
  padding: var(--spacing-xs) var(--spacing-md);
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
}

.pagination-info {
  color: var(--color-text-secondary);
}
```

## Cards Informativas

```jsx
<div className="dashboard-container">
  <h2 className="dashboard-title">Panel de Control</h2>
  
  <div className="card-grid">
    <div className="info-card">
      <div className="info-card-icon client-icon"></div>
      <div className="info-card-content">
        <h3 className="info-card-title">Clientes</h3>
        <p className="info-card-value">1,245</p>
        <p className="info-card-change increase">+12% este mes</p>
      </div>
    </div>
    
    <div className="info-card">
      <div className="info-card-icon policy-icon"></div>
      <div className="info-card-content">
        <h3 className="info-card-title">Pólizas</h3>
        <p className="info-card-value">3,872</p>
        <p className="info-card-change increase">+5% este mes</p>
      </div>
    </div>
    
    <div className="info-card">
      <div className="info-card-icon revenue-icon"></div>
      <div className="info-card-content">
        <h3 className="info-card-title">Ingresos</h3>
        <p className="info-card-value">$853,291</p>
        <p className="info-card-change decrease">-3% este mes</p>
      </div>
    </div>
    
    <div className="info-card">
      <div className="info-card-icon claims-icon"></div>
      <div className="info-card-content">
        <h3 className="info-card-title">Reclamaciones</h3>
        <p className="info-card-value">87</p>
        <p className="info-card-change neutral">Sin cambios</p>
      </div>
    </div>
  </div>
</div>
```

```css
.dashboard-container {
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-title {
  font-size: var(--font-size-xl);
  color: var(--color-primary-dark);
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.info-card {
  background-color: var(--color-card-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.info-card-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin-right: var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.client-icon {
  background-color: rgba(76, 175, 80, 0.1);
  color: var(--color-primary);
}

.policy-icon {
  background-color: rgba(14, 165, 233, 0.1);
  color: var(--color-accent);
}

.revenue-icon {
  background-color: rgba(255, 152, 0, 0.1);
  color: var(--color-warning);
}

.claims-icon {
  background-color: rgba(244, 67, 54, 0.1);
  color: var(--color-error);
}

.info-card-content {
  flex: 1;
}

.info-card-title {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.info-card-value {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.info-card-change {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.increase {
  color: var(--color-success);
}

.decrease {
  color: var(--color-error);
}

.neutral {
  color: var(--color-text-secondary);
}
```

## Migración de CSS Modules

Para migrar un componente de CSS Modules a nuestro nuevo sistema CSS estandarizado, sigue estos pasos:

### 1. Identifica el componente a migrar

Por ejemplo, supongamos que queremos migrar `ComponenteEjemplo` que usa CSS Modules.

### 2. Crea un nuevo archivo CSS

Crea un archivo CSS con el mismo nombre del componente.

```css
/* ComponenteEjemplo.css */
.componente-container {
  /* Estilos del contenedor */
}

.componente-title {
  /* Estilos del título */
}

/* ... más estilos ... */
```

### 3. Actualiza las importaciones

```jsx
// Antes
import styles from './ComponenteEjemplo.module.css';

// Después
import './ComponenteEjemplo.css';
```

### 4. Actualiza los nombres de clase

```jsx
// Antes
<div className={styles.container}>
  <h2 className={styles.title}>Título</h2>
</div>

// Después
<div className="componente-container">
  <h2 className="componente-title">Título</h2>
</div>
```

### 5. Utiliza las variables CSS

Asegúrate de usar las variables CSS definidas en global.css:

```css
/* Antes */
.title {
  font-size: 24px;
  color: #2e7d32;
  margin-bottom: 20px;
}

/* Después */
.componente-title {
  font-size: var(--font-size-xl);
  color: var(--color-primary-dark);
  margin-bottom: var(--spacing-lg);
}
```

### 6. Verifica y prueba

- Asegúrate de que todos los estilos se apliquen correctamente
- Verifica que el componente sea responsivo
- Comprueba la accesibilidad del componente

---

Este documento se debe usar como referencia al crear nuevos componentes o al migrar los existentes de CSS Modules al sistema CSS estandarizado.
