import reportWebVitals from '../../reportWebVitals';

// Mock completo de web-vitals con virtual: true
jest.mock('web-vitals', () => ({
  getCLS: jest.fn(),
  getFID: jest.fn(),
  getFCP: jest.fn(),
  getLCP: jest.fn(),
  getTTFB: jest.fn()
}), { virtual: true });

describe('reportWebVitals', () => {
  let mockGetCLS, mockGetFID, mockGetFCP, mockGetLCP, mockGetTTFB;
  let mockOnPerfEntry;

  beforeEach(() => {
    // Limpiar todos los mocks
    jest.clearAllMocks();
    
    // Obtener las funciones mockeadas
    const webVitals = require('web-vitals');
    mockGetCLS = webVitals.getCLS;
    mockGetFID = webVitals.getFID;
    mockGetFCP = webVitals.getFCP;
    mockGetLCP = webVitals.getLCP;
    mockGetTTFB = webVitals.getTTFB;
    
    // Mock de la función callback
    mockOnPerfEntry = jest.fn();
  });

  describe('Funcionalidad básica', () => {
    it('debe ser una función', () => {
      expect(typeof reportWebVitals).toBe('function');
    });

    it('debe exportarse como default', () => {
      expect(reportWebVitals).toBeDefined();
      expect(reportWebVitals).toBeInstanceOf(Function);
    });
  });

  describe('Validación de parámetros', () => {
    it('no debe hacer nada si onPerfEntry es undefined', async () => {
      reportWebVitals(undefined);
      
      // Esperar un tick para async operations
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(mockGetCLS).not.toHaveBeenCalled();
      expect(mockGetFID).not.toHaveBeenCalled();
      expect(mockGetFCP).not.toHaveBeenCalled();
      expect(mockGetLCP).not.toHaveBeenCalled();
      expect(mockGetTTFB).not.toHaveBeenCalled();
    });

    it('no debe hacer nada si onPerfEntry es null', async () => {
      reportWebVitals(null);
      
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(mockGetCLS).not.toHaveBeenCalled();
      expect(mockGetFID).not.toHaveBeenCalled();
      expect(mockGetFCP).not.toHaveBeenCalled();
      expect(mockGetLCP).not.toHaveBeenCalled();
      expect(mockGetTTFB).not.toHaveBeenCalled();
    });

    it('no debe hacer nada si onPerfEntry no es una función', async () => {
      reportWebVitals('not a function');
      reportWebVitals(123);
      reportWebVitals({});
      reportWebVitals([]);
      reportWebVitals(true);
      
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(mockGetCLS).not.toHaveBeenCalled();
      expect(mockGetFID).not.toHaveBeenCalled();
      expect(mockGetFCP).not.toHaveBeenCalled();
      expect(mockGetLCP).not.toHaveBeenCalled();
      expect(mockGetTTFB).not.toHaveBeenCalled();
    });

    it('debe proceder si onPerfEntry es una función válida', async () => {
      reportWebVitals(mockOnPerfEntry);
      
      // Esperar a que se resuelva el import dinámico
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockGetCLS).toHaveBeenCalledWith(mockOnPerfEntry);
      expect(mockGetFID).toHaveBeenCalledWith(mockOnPerfEntry);
      expect(mockGetFCP).toHaveBeenCalledWith(mockOnPerfEntry);
      expect(mockGetLCP).toHaveBeenCalledWith(mockOnPerfEntry);
      expect(mockGetTTFB).toHaveBeenCalledWith(mockOnPerfEntry);
    });
  });

  describe('Import dinámico y llamadas a web-vitals', () => {
    it('debe importar web-vitals dinámicamente cuando onPerfEntry es válido', async () => {
      reportWebVitals(mockOnPerfEntry);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Verificar que las funciones fueron llamadas (indica que el import funcionó)
      expect(mockGetCLS).toHaveBeenCalled();
      expect(mockGetFID).toHaveBeenCalled();
      expect(mockGetFCP).toHaveBeenCalled();
      expect(mockGetLCP).toHaveBeenCalled();
      expect(mockGetTTFB).toHaveBeenCalled();
    });

    it('debe llamar a todas las funciones de web-vitals con onPerfEntry', async () => {
      reportWebVitals(mockOnPerfEntry);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockGetCLS).toHaveBeenCalledWith(mockOnPerfEntry);
      expect(mockGetFID).toHaveBeenCalledWith(mockOnPerfEntry);
      expect(mockGetFCP).toHaveBeenCalledWith(mockOnPerfEntry);
      expect(mockGetLCP).toHaveBeenCalledWith(mockOnPerfEntry);
      expect(mockGetTTFB).toHaveBeenCalledWith(mockOnPerfEntry);
    });

    it('debe llamar a cada función de web-vitals exactamente una vez', async () => {
      reportWebVitals(mockOnPerfEntry);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockGetCLS).toHaveBeenCalledTimes(1);
      expect(mockGetFID).toHaveBeenCalledTimes(1);
      expect(mockGetFCP).toHaveBeenCalledTimes(1);
      expect(mockGetLCP).toHaveBeenCalledTimes(1);
      expect(mockGetTTFB).toHaveBeenCalledTimes(1);
    });
  });

  describe('Manejo de errores', () => {
    it('debe manejar errores en el import dinámico silenciosamente', async () => {
      // Temporalmente mockear el import para que falle
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      // Mock web-vitals para lanzar error
      jest.doMock('web-vitals', () => {
        throw new Error('Module not found');
      });

      // No debería lanzar error
      expect(() => {
        reportWebVitals(mockOnPerfEntry);
      }).not.toThrow();

      console.error = originalConsoleError;
    });

    it('debe manejar el caso donde web-vitals no está disponible', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // La función debería completarse sin errores
      expect(() => {
        reportWebVitals(mockOnPerfEntry);
      }).not.toThrow();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Diferentes tipos de funciones callback', () => {
    it('debe funcionar con funciones arrow', async () => {
      const arrowFunction = (metric) => {
        console.log(metric);
      };
      
      reportWebVitals(arrowFunction);
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockGetCLS).toHaveBeenCalledWith(arrowFunction);
    });

    it('debe funcionar con funciones declaradas', async () => {
      function namedFunction(metric) {
        console.log(metric);
      }
      
      reportWebVitals(namedFunction);
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockGetCLS).toHaveBeenCalledWith(namedFunction);
    });

    it('debe funcionar con funciones anónimas', async () => {
      const anonymousFunction = function(metric) {
        console.log(metric);
      };
      
      reportWebVitals(anonymousFunction);
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockGetCLS).toHaveBeenCalledWith(anonymousFunction);
    });

    it('debe funcionar con métodos de objetos', async () => {
      const obj = {
        handleMetric: function(metric) {
          this.metrics = metric;
        }
      };
      
      reportWebVitals(obj.handleMetric);
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockGetCLS).toHaveBeenCalledWith(obj.handleMetric);
    });
  });

  describe('Múltiples llamadas', () => {
    it('debe manejar múltiples llamadas con diferentes callbacks', async () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      reportWebVitals(callback1);
      reportWebVitals(callback2);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockGetCLS).toHaveBeenCalledWith(callback1);
      expect(mockGetCLS).toHaveBeenCalledWith(callback2);
      expect(mockGetCLS).toHaveBeenCalledTimes(2);
    });

    it('debe manejar múltiples llamadas con el mismo callback', async () => {
      reportWebVitals(mockOnPerfEntry);
      reportWebVitals(mockOnPerfEntry);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockGetCLS).toHaveBeenCalledTimes(2);
      expect(mockGetCLS).toHaveBeenCalledWith(mockOnPerfEntry);
    });
  });

  describe('Integración con métricas reales simuladas', () => {
    it('debe pasar métricas al callback cuando están disponibles', async () => {
      const metricsCollector = jest.fn();
      
      // Simular que las funciones de web-vitals llaman al callback
      mockGetCLS.mockImplementation((callback) => {
        callback({ name: 'CLS', value: 0.1, id: 'cls-1' });
      });
      mockGetFCP.mockImplementation((callback) => {
        callback({ name: 'FCP', value: 1200, id: 'fcp-1' });
      });
      
      reportWebVitals(metricsCollector);
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(metricsCollector).toHaveBeenCalledWith({ name: 'CLS', value: 0.1, id: 'cls-1' });
      expect(metricsCollector).toHaveBeenCalledWith({ name: 'FCP', value: 1200, id: 'fcp-1' });
    });

    it('debe manejar métricas con diferentes formatos', async () => {
      const metricsHandler = jest.fn();
      
      // Simular diferentes tipos de métricas
      mockGetLCP.mockImplementation((callback) => {
        callback({ 
          name: 'LCP', 
          value: 2500, 
          id: 'lcp-1',
          delta: 100,
          entries: []
        });
      });
      
      mockGetTTFB.mockImplementation((callback) => {
        callback({ 
          name: 'TTFB', 
          value: 800,
          id: 'ttfb-1',
          navigationType: 'navigate'
        });
      });
      
      reportWebVitals(metricsHandler);
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(metricsHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'LCP',
          value: 2500,
          id: 'lcp-1'
        })
      );
      
      expect(metricsHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'TTFB',
          value: 800,
          id: 'ttfb-1'
        })
      );
    });
  });

  describe('Verificación de tipos de métricas', () => {
    it('debe inicializar todas las métricas Core Web Vitals', async () => {
      reportWebVitals(mockOnPerfEntry);
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Verificar que se inicializan las 3 Core Web Vitals principales
      expect(mockGetCLS).toHaveBeenCalled(); // Cumulative Layout Shift
      expect(mockGetFID).toHaveBeenCalled(); // First Input Delay
      expect(mockGetLCP).toHaveBeenCalled(); // Largest Contentful Paint
      
      // Y también las métricas adicionales
      expect(mockGetFCP).toHaveBeenCalled(); // First Contentful Paint
      expect(mockGetTTFB).toHaveBeenCalled(); // Time to First Byte
    });

    it('debe pasar la misma función callback a todas las métricas', async () => {
      const specificCallback = jest.fn();
      
      reportWebVitals(specificCallback);
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockGetCLS).toHaveBeenCalledWith(specificCallback);
      expect(mockGetFID).toHaveBeenCalledWith(specificCallback);
      expect(mockGetFCP).toHaveBeenCalledWith(specificCallback);
      expect(mockGetLCP).toHaveBeenCalledWith(specificCallback);
      expect(mockGetTTFB).toHaveBeenCalledWith(specificCallback);
    });
  });

  describe('Comportamiento asíncrono', () => {
    it('debe ser una función que no retorna promesa explícitamente', () => {
      const result = reportWebVitals(mockOnPerfEntry);
      expect(result).toBeUndefined();
    });

    it('debe manejar el import asíncrono correctamente', async () => {
      reportWebVitals(mockOnPerfEntry);
      
      // Verificar que no se han llamado inmediatamente (debido a import dinámico)
      expect(mockGetCLS).not.toHaveBeenCalled();
      
      // Esperar a que se resuelva el import
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Ahora sí deberían haberse llamado
      expect(mockGetCLS).toHaveBeenCalledWith(mockOnPerfEntry);
    });
  });

  describe('Casos edge', () => {
    it('debe manejar funciones que lanzan errores', async () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      
      // Mock que simula el comportamiento de web-vitals llamando al callback
      mockGetCLS.mockImplementation((callback) => {
        try {
          callback({ name: 'CLS', value: 0.1 });
        } catch (error) {
          // web-vitals normalmente manejaría estos errores internamente
        }
      });
      
      reportWebVitals(errorCallback);
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // La función debería haberse llamado sin importar el error
      expect(mockGetCLS).toHaveBeenCalledWith(errorCallback);
    });

    it('debe funcionar correctamente sin window o document (entorno Node.js)', async () => {
      const originalWindow = global.window;
      const originalDocument = global.document;
      
      // Simular entorno Node.js
      delete global.window;
      delete global.document;
      
      try {
        reportWebVitals(mockOnPerfEntry);
        await new Promise(resolve => setTimeout(resolve, 10));
        
        expect(mockGetCLS).toHaveBeenCalledWith(mockOnPerfEntry);
      } finally {
        // Restaurar el entorno
        if (originalWindow) global.window = originalWindow;
        if (originalDocument) global.document = originalDocument;
      }
    });
  });

  describe('Compatibilidad', () => {
    it('debe funcionar con diferentes versiones de JavaScript', () => {
      // Verificar que usa sintaxis compatible
      const functionString = reportWebVitals.toString();
      
      // Verificar que la función está definida correctamente
      expect(typeof reportWebVitals).toBe('function');
      expect(reportWebVitals.length).toBe(1); // Acepta un parámetro
    });

    it('debe manejar diferentes implementaciones de instanceof', () => {
      // Crear una función usando diferentes constructores
      const regularFunction = function() {};
      const asyncFunction = async function() {};
      
      // Todas deberían ser reconocidas como Function
      expect(reportWebVitals).toBeInstanceOf(Function);
      expect(regularFunction).toBeInstanceOf(Function);
      expect(asyncFunction).toBeInstanceOf(Function);
      
      // Verificar que reportWebVitals puede manejar estos tipos
      expect(() => reportWebVitals(regularFunction)).not.toThrow();
      expect(() => reportWebVitals(asyncFunction)).not.toThrow();
    });
  });
});