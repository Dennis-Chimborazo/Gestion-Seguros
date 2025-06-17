# Gestión de Seguros - Documentación del Proyecto

## Descripción General
Este proyecto es una aplicación web completa para la gestión de seguros que permite la administración de clientes, agentes, pólizas y contrataciones de seguros. La aplicación facilita procesos como la validación de usuarios, la contratación de pólizas, y la gestión de reembolsos.

## Tecnologías Utilizadas
- **Frontend**: React.js, CSS3, JavaScript ES6+
- **Backend**: Node.js, Express.js
- **Base de Datos**: MySQL
- **Autenticación**: JWT (JSON Web Tokens)
- **Testing**: Jest, React Testing Library

## Estructura del Proyecto
El proyecto está organizado en dos carpetas principales:

### Frontend
```
frontend/
├── public/                  # Archivos estáticos
├── src/
│   ├── App.js               # Componente principal
│   ├── global.css           # Estilos globales
│   ├── index.js             # Punto de entrada
│   ├── services/            # Servicios para API
│   └── views/               # Componentes de la interfaz
│       ├── agentes/         # Gestión de agentes
│       ├── cargando/        # Componentes de carga
│       ├── clientes/        # Gestión de clientes
│       ├── estilos/         # Archivos CSS
│       ├── gestionContratacion/  # Gestión de contrataciones
│       ├── reembolsos/      # Gestión de reembolsos
│       ├── seguros/         # Gestión de seguros
│       ├── segurosAdmin/    # Admin de seguros
│       ├── validaciones/    # Validación de usuarios/contratos
│       └── usuarios/        # Gestión de usuarios
```

### Backend
```
backend/
├── src/
│   ├── config.js            # Configuración de la API
│   ├── database.js          # Conexión a la base de datos
│   ├── index.js             # Punto de entrada
│   └── routes/              # Rutas de la API
├── middlewares/             # Middlewares (autenticación)
├── test/                    # Pruebas unitarias
└── uploads/                 # Archivos subidos por usuarios
```

## Patrones de Estilo CSS

### Estandarización de CSS
Hemos migrado de CSS Modules a CSS estándar siguiendo estas convenciones:

1. **Nomenclatura**: Usamos nombres de clases descriptivos con el formato `componente-elemento`. Ejemplo: `cliente-container`, `cliente-form-group`.

2. **Organización de Archivos**: Cada componente principal tiene su propio archivo CSS en `/views/estilos/`.

3. **Componentes Migrados**:
   - **Agentes**
     - AgentesPendientes.jsx → AgentesPendientes.css
     - CrearAgentes.jsx → CrearAgentes.css
   
   - **Clientes**
     - ValidacionCliente.jsx → ValidacionCliente.css
     - CrearClientes.jsx → CrearClientes.css
     - EditarClientes.jsx → EditarClientes.css
   
   - **Validaciones**
     - ValidarEmail.jsx → ValidarEmail.css
     - ValidarAgente.jsx (usa ValidarEmail.css)
     - ValidarContratacionSeguro.jsx (usa ValidarEmail.css)
   
   - **Autenticación**
     - Login.jsx → Login.css

## Sistema de Diseño

### Paleta de Colores
- **Primario**: #4caf50 (verde principal)
- **Primario Oscuro**: #2e7d32 (para títulos y énfasis)
- **Primario Hover**: #388e3c (para hover en botones)
- **Secundario**: #e0f7fa (fondo gradiente claro)
- **Error**: #f44336 (mensajes de error)
- **Texto Principal**: #1e293b (casi negro para texto general)
- **Texto Secundario**: #475569 (gris para texto menos importante)

### Tipografía
- **Familia Principal**: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Tamaños**:
  - Títulos principales: 24px - 28px
  - Subtítulos: 18px - 20px
  - Texto normal: 16px
  - Texto pequeño: 14px

### Componentes UI Comunes
- **Contenedores**: Cards con bordes redondeados (border-radius: 12px-20px)
- **Sombras**: box-shadow: 0 6px 30px rgba(0, 0, 0, 0.1)
- **Animaciones**: Transiciones suaves de 0.3s en hover y fadeIn para carga inicial
- **Botones**: Padding vertical de 12px, bordes redondeados, transiciones en hover

## Mejoras Realizadas

1. **Responsive Design**
   - Todos los formularios se adaptan a pantallas móviles
   - Media queries para ajustes en dispositivos pequeños
   - Uso de unidades flexibles (%, rem) en vez de píxeles fijos

2. **Accesibilidad**
   - Mejora de contraste para cumplir WCAG AA
   - Etiquetas descriptivas para campos de formulario
   - Estructura semántica mejorada

3. **UX/UI**
   - Formularios reorganizados en secciones lógicas
   - Validación de campos con feedback instantáneo
   - Mensajes de error y éxito más descriptivos
   - Animaciones sutiles para mejorar la experiencia

4. **Seguridad**
   - Campos de contraseña cambiados de type="text" a type="password"
   - Validación de datos mejorada

5. **Rendimiento**
   - Optimización de estilos para reducir especificidad
   - Eliminación de estilos duplicados

## Base de Datos

Se han creado dos archivos relacionados con la base de datos:

1. **SQLnuevo.txt**: Contiene las sentencias para crear la estructura de la base de datos
   - Definición de tablas
   - Relaciones y claves foráneas
   - Índices para optimizar consultas

2. **datosSQL.txt**: Contiene datos de ejemplo para todas las tablas
   - Datos de usuarios (administradores, agentes, clientes)
   - Información de seguros y tipos de seguros
   - Contrataciones y validaciones

## Recomendaciones para Desarrollo Futuro

1. **Sistema de Componentes**
   - Crear una librería de componentes UI reutilizables
   - Implementar componentes para formularios, tablas, modales
   - Documentar los componentes con ejemplos de uso

2. **CSS Avanzado**
   - Implementar variables CSS para mantener consistencia
   ```css
   :root {
     --color-primary: #4caf50;
     --color-primary-dark: #2e7d32;
     --radius-card: 12px;
     --shadow-card: 0 6px 30px rgba(0, 0, 0, 0.1);
   }
   ```
   - Considerar Sass o PostCSS para funcionalidades avanzadas

3. **Migración Completa de CSS Modules**
   - Convertir los componentes restantes al nuevo estilo
   - Priorizar: VentanaAdmin, VentanaCliente, SeguroAdminInformacion

4. **Optimización**
   - Implementar lazy loading para componentes grandes
   - Comprimir imágenes y usar formatos modernos (WebP)
   - Considerar estrategias de code splitting

5. **Testing**
   - Ampliar pruebas unitarias para todos los componentes
   - Implementar pruebas de integración para flujos críticos
   - Añadir pruebas E2E con Cypress

6. **Documentación**
   - Documentar APIs con Swagger/OpenAPI
   - Crear documentación para desarrolladores con ejemplos
   - Documentar el proceso de instalación y configuración

## Autores
Este proyecto ha sido desarrollado como parte del curso de Gestión de Pruebas e Implantación de Software.

## Licencia
Todos los derechos reservados © 2025
