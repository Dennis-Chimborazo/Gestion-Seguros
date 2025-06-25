# Plan de Trabajo Futuro - Gestión de Seguros

## Pendientes de Migración CSS

### Prioridad Alta
1. **Componentes de Usuarios**
   - [ ] VentanaAdmin.jsx (convertir de VentanaAdmin.module.css)
   - [ ] VentanaCliente.jsx (convertir de VentanaCliente.module.css)
   - [ ] VentanaAgente.jsx (usa VentanaAdmin.module.css)

2. **Componentes de Seguros**
   - [ ] SegurosAdmin.jsx (parcialmente migrado)
   - [ ] SeguroAdminInformacion.jsx (convertir de SeguroAdminInformacion.module.css)
   - [ ] CrearSeguroAdmin.jsx (convertir de Seguros.module.css)
   - [ ] EditarSeguroAdmin.jsx (convertir de Seguros.module.css)

### Prioridad Media
1. **Componentes de Clientes**
   - [ ] ClientesInformacion.jsx (convertir de ClientesInformacion.module.css)
   - [ ] ClientesArchivos.jsx (convertir de ClientesArchivos.module.css)

2. **Componentes de Reembolsos**
   - [ ] ReembolsoCliente.jsx (convertir de ReembolsoCliente.module.css)

### Prioridad Baja
1. **Componentes Temporales**
   - [ ] Los componentes en carpeta /tmp/ que se sigan utilizando

## Mejoras Técnicas Propuestas

### Sistema de Diseño
1. **Variables CSS**
   ```css
   :root {
     /* Colores */
     --color-primary: #4caf50;
     --color-primary-dark: #2e7d32;
     --color-primary-hover: #388e3c;
     --color-error: #f44336;
     --color-background: #f8fafc;
     
     /* Espaciado */
     --spacing-xs: 5px;
     --spacing-sm: 10px;
     --spacing-md: 15px;
     --spacing-lg: 20px;
     --spacing-xl: 30px;
     
     /* Bordes y Sombras */
     --border-radius-sm: 8px;
     --border-radius-md: 12px;
     --border-radius-lg: 20px;
     --shadow-card: 0 10px 30px rgba(0, 0, 0, 0.1);
     --shadow-button-hover: 0 4px 12px rgba(0, 0, 0, 0.15);
     
     /* Tipografía */
     --font-size-sm: 14px;
     --font-size-md: 16px;
     --font-size-lg: 18px;
     --font-size-xl: 24px;
     --font-size-xxl: 32px;
   }
   ```

2. **Componentes Base**
   - [ ] Crear Button.css para estandarizar estilos de botones
   - [ ] Crear Form.css para estandarizar estilos de formularios
   - [ ] Crear Card.css para estandarizar tarjetas y contenedores
   - [ ] Crear Table.css para estandarizar tablas de datos

### Optimización
1. **Rendimiento**
   - [ ] Implementar React.lazy() y Suspense para componentes grandes
   - [ ] Optimizar imágenes con formatos modernos
   - [ ] Revisar y eliminar dependencias no utilizadas

2. **Accesibilidad**
   - [ ] Añadir atributos ARIA a componentes interactivos
   - [ ] Mejorar navegación por teclado
   - [ ] Verificar contraste de colores según WCAG 2.1 AA

## Mejoras de Funcionalidad

### Validación de Formularios
- [ ] Implementar validación consistente en todos los formularios
- [ ] Crear mensajes de error más descriptivos
- [ ] Añadir validación en tiempo real

### Experiencia de Usuario
- [ ] Añadir confirmación antes de acciones destructivas
- [ ] Mejorar mensajes de feedback
- [ ] Implementar estados de carga para operaciones asíncronas

## Plan de Testing

### Pruebas Unitarias
- [ ] Expandir pruebas para todos los componentes principales
- [ ] Añadir pruebas para utilidades y servicios

### Pruebas de Integración
- [ ] Probar flujos completos (registro, login, contratación)
- [ ] Probar integración entre componentes

### Pruebas E2E
- [ ] Configurar Cypress para pruebas de extremo a extremo
- [ ] Automatizar escenarios de usuario críticos

## Documentación Adicional

### Para Desarrolladores
- [ ] Crear documentación de API con ejemplos
- [ ] Documentar convenciones de código y estilos
- [ ] Crear guía de contribución

### Para Usuarios
- [ ] Manual de usuario con capturas de pantalla
- [ ] FAQ con preguntas comunes
- [ ] Guía de resolución de problemas

---

## Notas de Progreso

### Componentes Migrados (Completados)
- ✅ AgentesPendientes.jsx → AgentesPendientes.css
- ✅ CrearAgentes.jsx → CrearAgentes.css
- ✅ ValidacionCliente.jsx → ValidacionCliente.css
- ✅ CrearClientes.jsx → CrearClientes.css
- ✅ EditarClientes.jsx → EditarClientes.css
- ✅ ValidarEmail.jsx → ValidarEmail.css
- ✅ ValidarAgente.jsx (usa ValidarEmail.css)
- ✅ ValidarContratacionSeguro.jsx (usa ValidarEmail.css)
- ✅ Login.jsx → Login.css

### Próximas Tareas
1. Migrar VentanaAdmin y VentanaCliente (componentes de mayor uso)
2. Implementar variables CSS en global.css
3. Crear componentes base reutilizables
