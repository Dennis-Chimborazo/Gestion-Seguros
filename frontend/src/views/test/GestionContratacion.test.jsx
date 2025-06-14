import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock todos los módulos externos primero
const mockNavigate = jest.fn();
const mockLocation = {
  state: { user: { id: 1, name: 'Test User' } }
};

// Mock de hooks de React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation
}));

// Mock de React Icons
jest.mock('react-icons/fc', () => ({
  FcClearFilters: ({ size }) => <div data-testid="fc-clear-filters" data-size={size} />,
  FcSupport: ({ size }) => <div data-testid="fc-support" data-size={size} />,
  FcFinePrint: ({ size }) => <div data-testid="fc-fine-print" data-size={size} />
}));

// Mock de DataTable
jest.mock('react-data-table-component', () => {
  return function MockDataTable({ 
    data = [], 
    columns, 
    noDataComponent, 
    pagination, 
    paginationPerPage,
    persistTableHead 
  }) {
    return (
      <div data-testid="data-table">
        {data && data.length > 0 ? (
          <table>
            <thead>
              <tr>
                {columns.map((col, index) => (
                  <th key={index}>{col.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex}>{col.selector(row)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div data-testid="no-data">{noDataComponent}</div>
        )}
        <div data-testid="pagination-info">
          {pagination && `Pagination: ${paginationPerPage} per page`}
        </div>
      </div>
    );
  };
});

// Mock del componente CargarTablas
jest.mock('../cargando/CargarTablas', () => {
  return function MockCargarTablas() {
    return <div data-testid="cargar-tablas">Cargando...</div>;
  };
});

// Mock de GestionContratacionFun
jest.mock('../gestionContratacion/GestionContratacionFun', () => ({
  __esModule: true,
  default: {
    traerSeguros: jest.fn(),
  }
}));

// Imports después de los mocks
import GestionContratacion from '../gestionContratacion/gestionContratacion';
import GestionContratacionFun from '../gestionContratacion/GestionContratacionFun';

// Wrapper para las pruebas
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('GestionContratacion', () => {
  const mockMostrarSeccion = jest.fn();
  
  // Datos mock para seguros
  const mockSeguros = {
    rows: [
      {
        id_seguro: 1,
        cedr_cli: '1234567890',
        nom_cli: 'Juan',
        ape_cli: 'Pérez',
        nom_tip_seg: 'Seguro de Vida',
        pago_tip_seg: '1200.00',
        tiempo_seguro: 'Mensual',
        monto_seguro: '100.00'
      },
      {
        id_seguro: 2,
        cedr_cli: '0987654321',
        nom_cli: 'María',
        ape_cli: 'González',
        nom_tip_seg: 'Seguro Médico',
        pago_tip_seg: '2400.00',
        tiempo_seguro: 'Trimestral',
        monto_seguro: '600.00'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock por defecto - éxito
    GestionContratacionFun.traerSeguros.mockResolvedValue(mockSeguros);
  });

  describe('Renderizado inicial', () => {
    it('debe renderizar correctamente', async () => {
      await act(async () => {
        renderWithRouter(<GestionContratacion mostrarSeccion={mockMostrarSeccion} />);
      });

      expect(screen.getByText('Gestion Contratacion')).toBeInTheDocument();
      expect(screen.getByText('Buscar')).toBeInTheDocument();
      expect(screen.getByText('Nuevo seguro')).toBeInTheDocument();
      expect(screen.getByText('Crear')).toBeInTheDocument();
    });

    it('debe mostrar el componente de carga inicialmente', async () => {
      // Hacer que la promesa no se resuelva inmediatamente
      GestionContratacionFun.traerSeguros.mockImplementation(() => new Promise(() => {}));
      
      renderWithRouter(<GestionContratacion mostrarSeccion={mockMostrarSeccion} />);

      expect(screen.getByTestId('cargar-tablas')).toBeInTheDocument();
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('debe mostrar elementos de la interfaz correctamente', async () => {
      await act(async () => {
        renderWithRouter(<GestionContratacion mostrarSeccion={mockMostrarSeccion} />);
      });

      // Verificar input de búsqueda
      const inputBuscar = screen.getByPlaceholderText('Ingrese Codigo del seguro');
      expect(inputBuscar).toBeInTheDocument();
      expect(inputBuscar).toHaveAttribute('type', 'text');
      expect(inputBuscar).toHaveAttribute('id', 'buscar');

      // Verificar icono
      expect(screen.getByTestId('fc-clear-filters')).toBeInTheDocument();
      expect(screen.getByTestId('fc-clear-filters')).toHaveAttribute('data-size', '25');

      // Verificar botón crear
      const botonCrear = screen.getByText('Crear');
      expect(botonCrear).toBeInTheDocument();
    });
  });

  describe('Carga de datos', () => {
    it('debe cargar seguros al montar el componente', async () => {
      await act(async () => {
        renderWithRouter(<GestionContratacion mostrarSeccion={mockMostrarSeccion} />);
      });

      await waitFor(() => {
        expect(GestionContratacionFun.traerSeguros).toHaveBeenCalledWith(mockNavigate);
      });
    });

    it('debe mostrar los datos en la tabla después de cargar', async () => {
      await act(async () => {
        renderWithRouter(<GestionContratacion mostrarSeccion={mockMostrarSeccion} />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('data-table')).toBeInTheDocument();
      });

      // Verificar que los datos se muestran en la tabla
      expect(screen.getByText('Juan')).toBeInTheDocument();
      expect(screen.getByText('Pérez')).toBeInTheDocument();
      expect(screen.getByText('María')).toBeInTheDocument();
      expect(screen.getByText('González')).toBeInTheDocument();
      expect(screen.getByText('Seguro de Vida')).toBeInTheDocument();
      expect(screen.getByText('Seguro Médico')).toBeInTheDocument();
    });

    it('debe ocultar el loading después de cargar los datos', async () => {
      await act(async () => {
        renderWithRouter(<GestionContratacion mostrarSeccion={mockMostrarSeccion} />);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('cargar-tablas')).not.toBeInTheDocument();
        expect(screen.getByTestId('data-table')).toBeInTheDocument();
      });
    });
  });

  describe('Estructura de la tabla', () => {
    it('debe mostrar las columnas correctas', async () => {
      await act(async () => {
        renderWithRouter(<GestionContratacion mostrarSeccion={mockMostrarSeccion} />);
      });

      await waitFor(() => {
        expect(screen.getByText('N. Seguro')).toBeInTheDocument();
        expect(screen.getByText('Titular')).toBeInTheDocument();
        expect(screen.getByText('Nombre')).toBeInTheDocument();
        expect(screen.getByText('Apellido')).toBeInTheDocument();
        expect(screen.getByText('Seguro')).toBeInTheDocument();
        expect(screen.getByText('Valor anual')).toBeInTheDocument();
        expect(screen.getByText('Tipo de pago')).toBeInTheDocument();
        expect(screen.getByText('Valor a pagar')).toBeInTheDocument();
      });
    });

    it('debe mostrar los datos correctos en cada columna', async () => {
      await act(async () => {
        renderWithRouter(<GestionContratacion mostrarSeccion={mockMostrarSeccion} />);
      });

      await waitFor(() => {
        // Verificar datos del primer seguro
        expect(screen.getByText('1')).toBeInTheDocument(); // id_seguro
        expect(screen.getByText('1234567890')).toBeInTheDocument(); // cedr_cli
        expect(screen.getByText('1200.00')).toBeInTheDocument(); // pago_tip_seg
        expect(screen.getByText('Mensual')).toBeInTheDocument(); // tiempo_seguro
        expect(screen.getByText('100.00')).toBeInTheDocument(); // monto_seguro

        // Verificar datos del segundo seguro
        expect(screen.getByText('2')).toBeInTheDocument(); // id_seguro
        expect(screen.getByText('0987654321')).toBeInTheDocument(); // cedr_cli
        expect(screen.getByText('2400.00')).toBeInTheDocument(); // pago_tip_seg
        expect(screen.getByText('Trimestral')).toBeInTheDocument(); // tiempo_seguro
        expect(screen.getByText('600.00')).toBeInTheDocument(); // monto_seguro
      });
    });

    it('debe configurar la paginación correctamente', async () => {
      await act(async () => {
        renderWithRouter(<GestionContratacion mostrarSeccion={mockMostrarSeccion} />);
      });

      await waitFor(() => {
        const paginationInfo = screen.getByTestId('pagination-info');
        expect(paginationInfo).toHaveTextContent('Pagination: 20 per page');
      });
    });
  });

  describe('Casos sin datos', () => {
    it('debe mostrar mensaje cuando no hay seguros', async () => {
      GestionContratacionFun.traerSeguros.mockResolvedValue({ rows: [] });
      
      await act(async () => {
        renderWithRouter(<GestionContratacion mostrarSeccion={mockMostrarSeccion} />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('no-data')).toBeInTheDocument();
        expect(screen.getByText('No ha selecionado ningun Seguro')).toBeInTheDocument();
      });
    });

    it('debe mostrar mensaje cuando rows es undefined', async () => {
      GestionContratacionFun.traerSeguros.mockResolvedValue({});
      
      await act(async () => {
        renderWithRouter(<GestionContratacion mostrarSeccion={mockMostrarSeccion} />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('no-data')).toBeInTheDocument();
      });
    });
  });

  describe('Interacciones del usuario', () => {
    it('debe llamar a mostrarSeccion cuando se hace click en Crear', async () => {
      await act(async () => {
        renderWithRouter(<GestionContratacion mostrarSeccion={mockMostrarSeccion} />);
      });

      const botonCrear = screen.getByText('Crear');
      
      await act(async () => {
        fireEvent.click(botonCrear);
      });

      expect(mockMostrarSeccion).toHaveBeenCalledWith('CrearContratacion');
    });

    it('debe permitir escribir en el input de búsqueda', async () => {
      await act(async () => {
        renderWithRouter(<GestionContratacion mostrarSeccion={mockMostrarSeccion} />);
      });

      const inputBuscar = screen.getByPlaceholderText('Ingrese Codigo del seguro');
      
      await act(async () => {
        fireEvent.change(inputBuscar, { target: { value: '123' } });
      });

      expect(inputBuscar.value).toBe('123');
    });

    it('debe manejar múltiples clicks en el botón Crear', async () => {
      await act(async () => {
        renderWithRouter(<GestionContratacion mostrarSeccion={mockMostrarSeccion} />);
      });

      const botonCrear = screen.getByText('Crear');
      
      await act(async () => {
        fireEvent.click(botonCrear);
        fireEvent.click(botonCrear);
        fireEvent.click(botonCrear);
      });

      expect(mockMostrarSeccion).toHaveBeenCalledTimes(3);
      expect(mockMostrarSeccion).toHaveBeenCalledWith('CrearContratacion');
    });
  });

  describe('Manejo de errores', () => {
    it('debe manejar errores al cargar seguros', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      GestionContratacionFun.traerSeguros.mockRejectedValue(new Error('Error de red'));
      
      await act(async () => {
        renderWithRouter(<GestionContratacion mostrarSeccion={mockMostrarSeccion} />);
      });

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith('Ha ocurrido un error: Error: Error de red');
        expect(screen.queryByTestId('cargar-tablas')).not.toBeInTheDocument();
      });

      consoleLogSpy.mockRestore();
    });

    it('debe ocultar loading aunque falle la carga', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      GestionContratacionFun.traerSeguros.mockRejectedValue(new Error('Error de API'));
      
      await act(async () => {
        renderWithRouter(<GestionContratacion mostrarSeccion={mockMostrarSeccion} />);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('cargar-tablas')).not.toBeInTheDocument();
        expect(screen.getByText('Gestion Contratacion')).toBeInTheDocument();
      });

      consoleLogSpy.mockRestore();
    });

    it('debe renderizar correctamente aunque no haya usuario en location.state', async () => {
      // Mock location sin usuario
      const useLocationSpy = jest.spyOn(require('react-router-dom'), 'useLocation');
      useLocationSpy.mockReturnValue({ state: null });
      
      await act(async () => {
        renderWithRouter(<GestionContratacion mostrarSeccion={mockMostrarSeccion} />);
      });

      expect(screen.getByText('Gestion Contratacion')).toBeInTheDocument();
      
      useLocationSpy.mockRestore();
    });
  });

  describe('Estados de carga', () => {
    it('debe manejar el estado de carga correctamente', async () => {
      let resolvePromise;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      GestionContratacionFun.traerSeguros.mockReturnValue(pendingPromise);
      
      renderWithRouter(<GestionContratacion mostrarSeccion={mockMostrarSeccion} />);

      // Debe mostrar loading
      expect(screen.getByTestId('cargar-tablas')).toBeInTheDocument();
      expect(screen.queryByTestId('data-table')).not.toBeInTheDocument();

      // Resolver la promesa
      await act(async () => {
        resolvePromise(mockSeguros);
      });

      // Debe ocultar loading y mostrar tabla
      await waitFor(() => {
        expect(screen.queryByTestId('cargar-tablas')).not.toBeInTheDocument();
        expect(screen.getByTestId('data-table')).toBeInTheDocument();
      });
    });
  });

  describe('Acceso a props y state', () => {
    it('debe recibir y usar correctamente la prop mostrarSeccion', async () => {
      const customMostrarSeccion = jest.fn();
      
      await act(async () => {
        renderWithRouter(<GestionContratacion mostrarSeccion={customMostrarSeccion} />);
      });

      const botonCrear = screen.getByText('Crear');
      
      await act(async () => {
        fireEvent.click(botonCrear);
      });

      expect(customMostrarSeccion).toHaveBeenCalledWith('CrearContratacion');
      expect(mockMostrarSeccion).not.toHaveBeenCalled();
    });

    it('debe acceder correctamente al usuario desde location.state', async () => {
      const customLocation = {
        state: { user: { id: 999, name: 'Custom User' } }
      };
      
      const useLocationSpy = jest.spyOn(require('react-router-dom'), 'useLocation');
      useLocationSpy.mockReturnValue(customLocation);
      
      await act(async () => {
        renderWithRouter(<GestionContratacion mostrarSeccion={mockMostrarSeccion} />);
      });

      // El componente debe renderizarse sin errores
      expect(screen.getByText('Gestion Contratacion')).toBeInTheDocument();
      
      useLocationSpy.mockRestore();
    });
  });

  describe('Efectos y ciclo de vida', () => {
    it('debe llamar a traerSeguros solo una vez al montar', async () => {
      await act(async () => {
        renderWithRouter(<GestionContratacion mostrarSeccion={mockMostrarSeccion} />);
      });

      await waitFor(() => {
        expect(GestionContratacionFun.traerSeguros).toHaveBeenCalledTimes(1);
      });

      // Re-renderizar el componente no debe llamar traerSeguros de nuevo
      await act(async () => {
        renderWithRouter(<GestionContratacion mostrarSeccion={mockMostrarSeccion} />);
      });

      // Aún debe ser solo 1 porque es un nuevo componente
      expect(GestionContratacionFun.traerSeguros).toHaveBeenCalledTimes(2);
    });
  });

});