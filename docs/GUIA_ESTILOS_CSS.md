# Guía de Estilos CSS - Gestión de Seguros

## Introducción

Este documento define los estándares y convenciones de CSS para el proyecto Gestión de Seguros. Seguir estas pautas asegura consistencia visual, facilita el mantenimiento, y mejora la calidad del código en toda la aplicación.

## Principios Generales

1. **Simplicidad**: Mantener los estilos simples y legibles.
2. **Reutilización**: Crear componentes reutilizables para evitar duplicación.
3. **Responsividad**: Todos los componentes deben ser totalmente responsivos.
4. **Accesibilidad**: Seguir estándares WCAG para asegurar que la aplicación sea accesible.

## Convenciones de Nomenclatura

### Formato de Nombres de Clases

Usamos un enfoque basado en componentes con nomenclatura descriptiva:

```css
/* Formato: [componente]-[elemento]-[modificador] */
.login-container
.cliente-form-group
.agente-table-header
.validar-email-button-cancel
```

### Jerarquía de Clases

Mantener una jerarquía clara en los selectores CSS:

```css
/* Contenedor principal */
.componente-container {
  /* Estilos del contenedor */
}

/* Elementos secundarios */
.componente-header {
  /* Estilos del encabezado */
}

.componente-content {
  /* Estilos del contenido */
}

/* Sub-elementos */
.componente-form-group {
  /* Estilos del grupo de formulario */
}

.componente-form-label {
  /* Estilos de etiquetas */
}
```

## Sistema de Diseño

### Paleta de Colores

```css
/* Colores Primarios */
--color-primary: #4caf50;          /* Verde principal */
--color-primary-dark: #2e7d32;     /* Verde oscuro */
--color-primary-light: #66bb6a;    /* Verde claro */

/* Colores de Acento */
--color-accent: #0ea5e9;           /* Azul para enlaces y elementos secundarios */
--color-error: #f44336;            /* Rojo para errores */
--color-warning: #ff9800;          /* Naranja para advertencias */
--color-success: #4caf50;          /* Verde para éxito */

/* Colores Neutros */
--color-text-primary: #1e293b;     /* Texto principal */
--color-text-secondary: #475569;   /* Texto secundario */
--color-background: #f1f5f9;       /* Fondo general */
--color-card-background: #ffffff;  /* Fondo de tarjetas */
--color-border: #d4d4d8;           /* Bordes */
```

### Tipografía

```css
/* Familia tipográfica */
--font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

/* Tamaños de fuente */
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-md: 16px;
--font-size-lg: 18px;
--font-size-xl: 24px;
--font-size-xxl: 32px;

/* Pesos de fuente */
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-bold: 600;
--font-weight-extrabold: 700;
```

### Espaciado

```css
/* Espaciado interno y externo */
--spacing-xs: 5px;
--spacing-sm: 10px;
--spacing-md: 15px;
--spacing-lg: 20px;
--spacing-xl: 30px;
--spacing-xxl: 40px;
```

### Bordes y Sombras

```css
/* Bordes */
--border-radius-sm: 8px;
--border-radius-md: 12px;
--border-radius-lg: 20px;
--border-width: 1px;

/* Sombras */
--shadow-sm: 0 2px 5px rgba(0, 0, 0, 0.05);
--shadow-md: 0 6px 15px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 30px rgba(0, 0, 0, 0.1);
--shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.15);
```

## Componentes Comunes

### Contenedores

```css
/* Contenedor principal */
.component-container {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-lg);
}

/* Tarjeta */
.component-card {
  background-color: var(--color-card-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-xl);
}
```

### Formularios

```css
/* Grupo de formulario */
.component-form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: var(--spacing-md);
}

/* Etiquetas */
.component-form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-xs);
  color: var(--color-text-primary);
}

/* Campos de entrada */
.component-form-input {
  padding: var(--spacing-md);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-md);
  transition: all 0.3s ease;
}

.component-form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

/* Mensajes de error */
.component-form-error {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
}
```

### Botones

```css
/* Botón base */
.component-button {
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-sm);
  font-weight: var(--font-weight-medium);
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  font-size: var(--font-size-md);
}

/* Botón primario */
.component-button-primary {
  background-color: var(--color-primary);
  color: white;
}

.component-button-primary:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

/* Botón secundario */
.component-button-secondary {
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.component-button-secondary:hover {
  background-color: rgba(76, 175, 80, 0.05);
}

/* Botón de peligro */
.component-button-danger {
  background-color: var(--color-error);
  color: white;
}

.component-button-danger:hover {
  background-color: #d32f2f;
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}
```

## Responsive Design

### Breakpoints

```css
/* Móvil pequeño */
@media (min-width: 320px) {
  /* Estilos para móviles pequeños */
}

/* Móvil */
@media (min-width: 480px) {
  /* Estilos para móviles */
}

/* Tablet */
@media (min-width: 768px) {
  /* Estilos para tablets */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Estilos para desktop */
}

/* Desktop grande */
@media (min-width: 1440px) {
  /* Estilos para pantallas grandes */
}
```

### Layout Responsivo

```css
/* Grid Responsive */
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: var(--spacing-md);
}

@media (min-width: 768px) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## Animaciones

### Transiciones

```css
/* Transiciones para elementos interactivos */
.interactive-element {
  transition-property: transform, box-shadow, background-color, color;
  transition-duration: 0.3s;
  transition-timing-function: ease;
}
```

### Animaciones Keyframe

```css
/* Animación de entrada */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease forwards;
}
```

## Buenas Prácticas

1. **Evitar !important**: Usar solo cuando sea absolutamente necesario.
2. **Limitar anidación**: No anidar selectores más de 3 niveles.
3. **Comentar código**: Documentar secciones complejas o no obvias.
4. **Mantener especificidad baja**: Evitar selectores innecesariamente específicos.
5. **Validación CSS**: Verificar CSS con validadores como W3C.
6. **Prefijos de proveedores**: Usar postcss o autoprefixer para compatibilidad.
7. **Optimización**: Minimizar CSS en producción.

## Ejemplos de Componentes

### Tarjeta de Información

```css
.info-card {
  background-color: var(--color-card-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.info-card-header {
  margin-bottom: var(--spacing-md);
}

.info-card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.info-card-subtitle {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
}

.info-card-content {
  font-size: var(--font-size-md);
  line-height: 1.6;
  color: var(--color-text-primary);
}
```

### Formulario de Ejemplo

```css
.form-container {
  max-width: 600px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: var(--spacing-xl);
}

.form-section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-md);
  color: var(--color-primary-dark);
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

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-xl);
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .form-actions button {
    width: 100%;
  }
}
```

## Conclusión

Esta guía de estilos se debe utilizar como referencia al desarrollar nuevos componentes o modificar los existentes. Mantener consistencia en los estilos mejora la experiencia del usuario y facilita el mantenimiento del código.

---

Documento creado: 17 de junio de 2025  
Última actualización: 17 de junio de 2025
