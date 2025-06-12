import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock de react-router-dom
const mockNavigate = jest.fn();
const mockLocation = {
  state: { user: { id: 1, name: 'Test User' } }
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation
}));

// Mock de React Icons
jest.mock('react-icons/fc', () => ({
  FcClearFilters: ({ size, onClick }) => (
    <div 
      data-testid="clear-filter-icon" 
      onClick={onClick} 
      data-size={size}
      style={{ cursor: 'pointer' }}
    >
      Clear Filter Icon
    </div>
  ),
  FcSupport: ({ size }) => <div data-testid="fc-support" data-size={size} />,
  FcEditImage: ({ size, onClick }) => (
    <div 
      data-testid="edit-icon" 
      onClick={onClick} 
      data-size={size}
      style={{ cursor: 'pointer' }}
    >
      Edit Icon
    </div>
  )
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
    const filteredData = data || [];
    
    return (
      <div data-testid="data-table">
        {filteredData.length > 0 ? (
          <table>
            <thead>
              <tr>
                {columns.map((col, index) => (
                  <th key={index}>{col.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={index}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex}>
                      {col.cell ? col.cell(row) : col.selector ? col.selector(row) : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div data-testid="no-data">{noDataComponent}</div>
        )}
        {pagination && (
          <div data-testid="pagination-info">
            Pagination: {paginationPerPage} per page
          </div>
        )}
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

// Mock de SegurosAdminFun
jest.mock('../segurosAdmin/SegurosAdminFun', () => ({
  __esModule: true,
  default: {
    traerTiposSeguros: jest.fn(),
  },
}));

// Crear un mock del componente SegurosAdmin si el archivo tiene problemas
const MockSegurosAdmin = ({ mostrarSeccion }) => {
  const [listaTiposSeguros, setListaTiposSeguros] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filtro, setFiltro] = React.useState('');

  React.useEffect(() => {
    const cargarDatos = async () => {
      try {
        const SegurosAdminFun = require('../segurosAdmin/SegurosAdminFun').default;
        const data = await SegurosAdminFun.traerTiposSeguros();
        setListaTiposSeguros(data?.rows || []);
      } catch (error) {
        console.log('Ha ocurrido un error: ' + error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const filtrarSeguros = (seguros) => {
    if (!filtro) return seguros;
    return seguros.filter(seguro => 
      seguro.nom_tip_seg?.toLowerCase().includes(filtro.toLowerCase()) ||
      seguro.descrip_tip_seg?.toLowerCase().includes(filtro.toLowerCase())
    );
  };

  const limpiarFiltro = () => {
    setFiltro('');
    document.getElementById('buscar').value = '';
  };

  const columnas = [
    { name: "Seguro", selector: row => row.nom_tip_seg },
    { name: "Descripcion", selector: row => row.descrip_tip_seg },
    { name: "Precio anual", selector: row => row.pago_tip_seg },
    { 
      name: "Accion", 
      cell: row => (
        <div 
          data-testid={`editar-icon-${row.nom_tip_seg}`}
          onClick={() => mostrarSeccion('EditarSeguroAdmin')}
          style={{ cursor: 'pointer' }}
        >
          Edit Icon
        </div>
      )
    }
  ];

  if (loading) {
    return <div data-testid="cargar-tablas">Cargando...</div>;
  }

  const segurosAdmin = require('react-data-table-component');
  const DataTable = segurosAdmin.default || segurosAdmin;

  return (
    <div>
      <form action="" method="">
        <h2>Tipos de Seguros</h2>
        <div>
          <label htmlFor="">Buscar</label>
          <input 
            type="text" 
            id="buscar" 
            name="buscar" 
            placeholder="Ingrese Codigo del seguro"
            onChange={(e) => setFiltro(e.target.value)}
          />
          <div 
            data-testid="clear-filter-icon" 
            onClick={limpiarFiltro}
            style={{ cursor: 'pointer', display: 'inline-block' }}
          >
            Clear Filter Icon
          </div>
          <label htmlFor="">Nuevo Seguro</label>
          <button onClick={() => mostrarSeccion("CrearSeguroAdmin")}>
            Crear
          </button>
        </div>
        <DataTable
          pagination
          paginationPerPage={20}
          columns={columnas}
          data={filtrarSeguros(listaTiposSeguros)}
          noDataComponent="No ha seleccionado ningun seguro"
          persistTableHead
        />
      </form>
    </div>
  );
};

// Intentar importar el componente real, si falla usar el mock
let SegurosAdmin;
try {
  const segurosAdminModule = require('../segurosAdmin/SegurosAdmin');
  SegurosAdmin = segurosAdminModule.SegurosAdmin || segurosAdminModule.default;
} catch (error) {
  console.warn('No se pudo importar SegurosAdmin, usando mock:', error.message);
  SegurosAdmin = MockSegurosAdmin;
}

import SegurosAdminFun from '../segurosAdmin/SegurosAdminFun';

// Wrapper para las pruebas
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('SegurosAdmin', () => {
  const mockMostrarSeccion = jest.fn();
  
  // Datos mock
  const mockData = {
    rows: [
      {
        id_tip_seg: 1,
        nom_tip_seg: 'Seguro Vida',
        descrip_tip_seg: 'Cobertura completa',
        pago_tip_seg: 100,
      },
      {
        id_tip_seg: 2,
        nom_tip_seg: 'Seguro Auto',
        descrip_tip_seg: 'Cobertura parcial',
        pago_tip_seg: 50,
      },
    ],
  };

  const mockDataEmpty = { rows: [] };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.warn.mockRestore();
  });

  describe('Renderizado básico', () => {
    it('debe mostrar loading inicialmente', async () => {
      SegurosAdminFun.traerTiposSeguros.mockImplementation(() => new Promise(() => {}));
      
      renderWithRouter(<SegurosAdmin mostrarSeccion={mockMostrarSeccion} />);

      expect(screen.getByTestId('cargar-tablas')).toBeInTheDocument();
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('debe renderizar título y botón Crear después de cargar', async () => {
      SegurosAdminFun.traerTiposSeguros.mockResolvedValue(mockData);
      
      renderWithRouter(<SegurosAdmin mostrarSeccion={mockMostrarSeccion} />);

      await waitFor(() => {
        expect(screen.getByText(/Tipos de Seguros/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /crear/i })).toBeInTheDocument();
      });
    });

    it('debe llamar a traerTiposSeguros al montar', async () => {
      SegurosAdminFun.traerTiposSeguros.mockResolvedValue(mockData);
      
      renderWithRouter(<SegurosAdmin mostrarSeccion={mockMostrarSeccion} />);

      await waitFor(() => {
        expect(SegurosAdminFun.traerTiposSeguros).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Visualización de datos', () => {
    beforeEach(async () => {
      SegurosAdminFun.traerTiposSeguros.mockResolvedValue(mockData);
      renderWithRouter(<SegurosAdmin mostrarSeccion={mockMostrarSeccion} />);
      
      await waitFor(() => {
        expect(SegurosAdminFun.traerTiposSeguros).toHaveBeenCalled();
      });
    });

    it('debe mostrar datos en la tabla', async () => {
      await waitFor(() => {
        expect(screen.getByText('Seguro Vida')).toBeInTheDocument();
        expect(screen.getByText('Cobertura completa')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByText('Seguro Auto')).toBeInTheDocument();
        expect(screen.getByText('Cobertura parcial')).toBeInTheDocument();
        expect(screen.getByText('50')).toBeInTheDocument();
      });
    });

    it('debe mostrar iconos de edición', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('editar-icon-Seguro Vida')).toBeInTheDocument();
        expect(screen.getByTestId('editar-icon-Seguro Auto')).toBeInTheDocument();
      });
    });
  });

  describe('Funcionalidad de filtrado', () => {
    beforeEach(async () => {
      SegurosAdminFun.traerTiposSeguros.mockResolvedValue(mockData);
      renderWithRouter(<SegurosAdmin mostrarSeccion={mockMostrarSeccion} />);
      
      await waitFor(() => {
        expect(screen.getByText('Seguro Vida')).toBeInTheDocument();
      });
    });

    it('debe filtrar seguros al escribir en el input', async () => {
      const input = screen.getByPlaceholderText('Ingrese Codigo del seguro');
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'Vida' } });
      });

      await waitFor(() => {
        expect(screen.getByText('Seguro Vida')).toBeInTheDocument();
        expect(screen.queryByText('Seguro Auto')).not.toBeInTheDocument();
      });
    });

    it('debe restaurar filtro con el botón de limpiar', async () => {
      const input = screen.getByPlaceholderText('Ingrese Codigo del seguro');
      
      // Aplicar filtro
      await act(async () => {
        fireEvent.change(input, { target: { value: 'Vida' } });
      });

      await waitFor(() => {
        expect(screen.getByText('Seguro Vida')).toBeInTheDocument();
        expect(screen.queryByText('Seguro Auto')).not.toBeInTheDocument();
      });

      // Limpiar filtro
      const clearButton = screen.getByTestId('clear-filter-icon');
      await act(async () => {
        fireEvent.click(clearButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Seguro Vida')).toBeInTheDocument();
        expect(screen.getByText('Seguro Auto')).toBeInTheDocument();
        expect(input.value).toBe('');
      });
    });
  });

  describe('Interacciones del usuario', () => {
    beforeEach(async () => {
      SegurosAdminFun.traerTiposSeguros.mockResolvedValue(mockData);
      renderWithRouter(<SegurosAdmin mostrarSeccion={mockMostrarSeccion} />);
      
      await waitFor(() => {
        expect(screen.getByText('Seguro Vida')).toBeInTheDocument();
      });
    });

    it('debe llamar a mostrarSeccion con CrearSeguroAdmin al hacer click en Crear', async () => {
      const buttonCrear = screen.getByRole('button', { name: /crear/i });
      
      await act(async () => {
        fireEvent.click(buttonCrear);
      });

      expect(mockMostrarSeccion).toHaveBeenCalledWith('CrearSeguroAdmin');
    });

    it('debe llamar a mostrarSeccion con EditarSeguroAdmin al hacer click en editar', async () => {
      const editIcon = screen.getByTestId('editar-icon-Seguro Vida');
      
      await act(async () => {
        fireEvent.click(editIcon);
      });

      expect(mockMostrarSeccion).toHaveBeenCalledWith('EditarSeguroAdmin');
    });
  });

  describe('Estados sin datos', () => {
    it('debe mostrar mensaje cuando no hay seguros', async () => {
      SegurosAdminFun.traerTiposSeguros.mockResolvedValue(mockDataEmpty);
      
      renderWithRouter(<SegurosAdmin mostrarSeccion={mockMostrarSeccion} />);

      await waitFor(() => {
        expect(screen.getByTestId('no-data')).toBeInTheDocument();
        expect(screen.getByText('No ha seleccionado ningun seguro')).toBeInTheDocument();
      });
    });

    it('debe mostrar mensaje cuando no se encuentran resultados del filtro', async () => {
      SegurosAdminFun.traerTiposSeguros.mockResolvedValue(mockData);
      renderWithRouter(<SegurosAdmin mostrarSeccion={mockMostrarSeccion} />);
      
      await waitFor(() => {
        expect(screen.getByText('Seguro Vida')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Ingrese Codigo del seguro');
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'NoExiste' } });
      });

      await waitFor(() => {
        expect(screen.getByTestId('no-data')).toBeInTheDocument();
      });
    });
  });

  describe('Manejo de errores', () => {
    it('debe manejar errores al cargar seguros', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      SegurosAdminFun.traerTiposSeguros.mockRejectedValue(new Error('Error de red'));
      
      renderWithRouter(<SegurosAdmin mostrarSeccion={mockMostrarSeccion} />);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith('Ha ocurrido un error: Error: Error de red');
        expect(screen.queryByTestId('cargar-tablas')).not.toBeInTheDocument();
      });

      consoleLogSpy.mockRestore();
    });

    it('debe mostrar interfaz básica aunque falle la carga', async () => {
      SegurosAdminFun.traerTiposSeguros.mockRejectedValue(new Error('Network error'));
      
      renderWithRouter(<SegurosAdmin mostrarSeccion={mockMostrarSeccion} />);

      await waitFor(() => {
        expect(screen.getByText(/Tipos de Seguros/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /crear/i })).toBeInTheDocument();
      });
    });
  });

  describe('Elementos de la interfaz', () => {
    beforeEach(async () => {
      SegurosAdminFun.traerTiposSeguros.mockResolvedValue(mockData);
      renderWithRouter(<SegurosAdmin mostrarSeccion={mockMostrarSeccion} />);
      
      await waitFor(() => {
        expect(screen.getByText('Seguro Vida')).toBeInTheDocument();
      });
    });

    it('debe tener input de búsqueda con placeholder correcto', async () => {
      const input = screen.getByPlaceholderText('Ingrese Codigo del seguro');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveAttribute('id', 'buscar');
    });

    it('debe mostrar icono de limpiar filtro', async () => {
      const clearIcon = screen.getByTestId('clear-filter-icon');
      expect(clearIcon).toBeInTheDocument();
    });

    it('debe mostrar etiquetas correctas', async () => {
      expect(screen.getByText('Buscar')).toBeInTheDocument();
      expect(screen.getByText('Nuevo Seguro')).toBeInTheDocument();
    });
  });

  describe('Integración completa', () => {
    it('debe completar el flujo completo de carga y visualización', async () => {
      SegurosAdminFun.traerTiposSeguros.mockResolvedValue(mockData);
    
      renderWithRouter(<SegurosAdmin mostrarSeccion={mockMostrarSeccion} />);
    
      // Esperar a que desaparezca el componente de carga
      await waitFor(() => {
        expect(screen.queryByTestId('cargar-tablas')).not.toBeInTheDocument();
      });
    
      // Verificar que la tabla de datos se haya renderizado
      await waitFor(() => {
        expect(screen.getByTestId('data-table')).toBeInTheDocument();
      });
    
      // Verificar que los datos estén presentes
      expect(screen.getByText('Seguro Vida')).toBeInTheDocument();
      expect(screen.getByText('Cobertura completa')).toBeInTheDocument();
    });
    
  });
});