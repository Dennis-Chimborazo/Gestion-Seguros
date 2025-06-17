# Gestión de Seguros - Documentación del Desarrollo

## Descripción General
Este proyecto es una aplicación web para la gestión de seguros que permite la administración de clientes, agentes, pólizas y contrataciones de seguros. Está desarrollado con React para el frontend y Node.js con Express para el backend.

## Estructura del Proyecto
El proyecto está organizado en dos carpetas principales:

- **frontend**: Contiene la aplicación React con todos los componentes y vistas
- **backend**: Contiene la API REST desarrollada con Express.js

## Patrones de Estilo CSS

### Estandarización de CSS
Hemos migrado de CSS Modules a CSS estándar siguiendo estas convenciones:

1. **Nomenclatura**: Usamos nombres de clases descriptivos con el formato `componente-elemento`. Por ejemplo: `cliente-container`, `cliente-card`, `cliente-form`.

2. **Estructura de Archivos**: Cada componente principal tiene su propio archivo CSS en la carpeta `/views/estilos/`.

3. **Componentes Convertidos**:
   - AgentesPendientes.jsx → AgentesPendientes.css
   - CrearAgentes.jsx → CrearAgentes.css
   - ValidacionCliente.jsx → ValidacionCliente.css
   - CrearClientes.jsx → CrearClientes.css
   - EditarClientes.jsx → EditarClientes.css
   - ValidarEmail.jsx → ValidarEmail.css
   - ValidarAgente.jsx (usa ValidarEmail.css)
   - ValidarContratacionSeguro.jsx (usa ValidarEmail.css)
   - Login.jsx → Login.css

## Estilos Comunes
Todos los formularios y vistas siguen un patrón común:

- Contenedores principales con `display: flex` para centrado
- Cards con bordes redondeados y sombras suaves
- Formularios organizados en secciones lógicas
- Campos de formulario con estilos consistentes (bordes, transiciones, colores)
- Botones con efectos hover y transiciones suaves
- Colores primarios consistentes (#4caf50, #2e7d32, #388e3c)

## Mejoras Realizadas

1. **Responsive Design**: Todos los componentes son totalmente responsivos.
2. **Accesibilidad**: Mejoramos el contraste y los tamaños de fuente para una mejor legibilidad.
3. **Consistencia Visual**: Implementamos un sistema de diseño coherente en toda la aplicación.
4. **Usabilidad**: Reorganizamos los formularios para una mejor experiencia de usuario.
5. **Animaciones**: Añadimos animaciones sutiles para mejorar la experiencia del usuario.

## Base de Datos
Se ha creado un archivo con sentencias SQL para:
- Creación de tablas
- Inserción de datos de prueba
- Consultas de ejemplo

## Recomendaciones para Desarrollo Futuro

1. **Completar la migración de CSS Modules**: Convertir el resto de componentes que aún utilizan CSS Modules al nuevo estándar CSS.

2. **Estandarización de Componentes**: Crear componentes reutilizables para formularios, tablas y cards.

3. **Variables CSS**: Implementar variables CSS para colores, sombras y espaciados para facilitar cambios globales.

4. **Optimización de Imágenes**: Implementar lazy loading para imágenes y optimizar su tamaño.

5. **Testing**: Ampliar la cobertura de pruebas para incluir todos los componentes.

## Autor
Este proyecto ha sido desarrollado como parte del curso de Gestión de pruebas e implantación de Software.
