import { jest } from '@jest/globals';

// Mock para el objeto de respuesta express
const mockJson = jest.fn().mockImplementation(function() { return this; });
const mockStatus = jest.fn().mockImplementation(function() { return this; });
const mockRes = { 
  json: mockJson, 
  status: mockStatus 
};

// Definimos rutas para capturar los controladores
const routes = {};

// Mock de multer más específico
let diskStorageConfig = {};
const mockSingle = jest.fn((fieldName) => {
  return (req, res, next) => {
    // Capturar la ruta actual basándose en el fieldName
    const currentRoute = fieldName === 'profilePhoto' ? 'POST:/foto-perfil/:subfolder' : 'POST:/cedula-pdf/:subfolder';
    routes[currentRoute] = (req, res) => {
      if (!req.file) {
        return res.status(400).json({ 
          error: fieldName === 'profilePhoto' ? 'No se recibió la foto de perfil' : 'No se recibió el PDF de la cédula'
        });
      }
      res.json({ 
        message: fieldName === 'profilePhoto' ? 'Foto de perfil subida correctamente' : 'PDF de cédula subido correctamente',
        filename: req.file.filename 
      });
    };
    next();
  };
});

const mockDiskStorage = jest.fn((config) => {
  diskStorageConfig = config;
  return {
    destination: config.destination,
    filename: config.filename
  };
});

jest.mock('multer', () => {
  const multerMock = jest.fn(() => ({
    single: mockSingle
  }));
  multerMock.diskStorage = mockDiskStorage;
  return multerMock;
});

// Mock de express
jest.mock('express', () => {
  const router = {
    get: jest.fn((path, handler) => {
      routes[`GET:${path}`] = handler;
      return router;
    }),
    post: jest.fn((path, ...middlewares) => {
      // El último argumento es el handler real
      const handler = middlewares[middlewares.length - 1];
      routes[`POST:${path}`] = handler;
      return router;
    })
  };
  
  return {
    Router: jest.fn(() => router),
  };
});

// Mock de path
const mockJoin = jest.fn();
const mockExtname = jest.fn();
const mockBasename = jest.fn();
jest.mock('path', () => ({
  join: mockJoin,
  extname: mockExtname,
  basename: mockBasename
}));

// Mock de fs
const mockExistsSync = jest.fn();
const mockMkdirSync = jest.fn();
const mockReaddir = jest.fn();
jest.mock('fs', () => ({
  existsSync: mockExistsSync,
  mkdirSync: mockMkdirSync,
  readdir: mockReaddir
}));

// Importamos el módulo a probar después de configurar todos los mocks
let routerInstance;
try {
  routerInstance = require('../src/routes/archivos.routes.js');
  console.log('Rutas capturadas de archivos:', Object.keys(routes));
} catch (error) {
  console.error('Error al importar el módulo archivos.routes.js:', error);
}

describe('Pruebas unitarias para la ruta de archivos', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configuraciones por defecto
    mockJoin.mockImplementation((...args) => args.join('/'));
    mockExtname.mockReturnValue('.jpg');
    mockBasename.mockReturnValue('foto');
    
    // Mock por defecto de process.cwd()
    global.process = {
      ...global.process,
      cwd: jest.fn().mockReturnValue('/app')
    };
  });

  describe('Configuración de multer y getDynamicStorage', () => {
    it('debería configurar multer correctamente', () => {
      // Verificar que las funciones se han configurado correctamente
      expect(typeof diskStorageConfig.destination).toBe('function');
      expect(typeof diskStorageConfig.filename).toBe('function');
      expect(mockSingle).toHaveBeenCalledWith('profilePhoto');
      expect(mockSingle).toHaveBeenCalledWith('cedulaPdf');
    });

    it('debería crear directorio si no existe en destination callback', () => {
      mockExistsSync.mockReturnValue(false);
      const mockCb = jest.fn();
      const mockReq = { params: { subfolder: 'test' } };
      const mockFile = {};

      diskStorageConfig.destination(mockReq, mockFile, mockCb);

      expect(mockJoin).toHaveBeenCalledWith('uploads/cliente/', 'test');
      expect(mockExistsSync).toHaveBeenCalled();
      expect(mockMkdirSync).toHaveBeenCalledWith('uploads/cliente//test', { recursive: true });
      expect(mockCb).toHaveBeenCalledWith(null, 'uploads/cliente//test');
    });

    it('debería no crear directorio si ya existe', () => {
      mockExistsSync.mockReturnValue(true);
      const mockCb = jest.fn();
      const mockReq = { params: { subfolder: 'existing' } };
      const mockFile = {};

      diskStorageConfig.destination(mockReq, mockFile, mockCb);

      expect(mockMkdirSync).not.toHaveBeenCalled();
      expect(mockCb).toHaveBeenCalledWith(null, 'uploads/cliente//existing');
    });

    it('debería sanitizar subfolder y usar default si es inválido', () => {
      mockExistsSync.mockReturnValue(true);
      const mockCb = jest.fn();
      const mockReq = { params: { subfolder: '../../../malicious' } };
      const mockFile = {};

      diskStorageConfig.destination(mockReq, mockFile, mockCb);

      expect(mockJoin).toHaveBeenCalledWith('uploads/cliente/', 'malicious');
    });

    it('debería usar default cuando subfolder es undefined', () => {
      mockExistsSync.mockReturnValue(true);
      const mockCb = jest.fn();
      const mockReq = { params: {} };
      const mockFile = {};

      diskStorageConfig.destination(mockReq, mockFile, mockCb);

      expect(mockJoin).toHaveBeenCalledWith('uploads/cliente/', 'default');
    });

    it('debería generar filename único correctamente', () => {
      mockExtname.mockReturnValue('.jpg');
      mockBasename.mockReturnValue('mi foto con espacios');
      
      const mockCb = jest.fn();
      const mockReq = {};
      const mockFile = { originalname: 'mi foto con espacios.jpg' };

      diskStorageConfig.filename(mockReq, mockFile, mockCb);

      expect(mockExtname).toHaveBeenCalledWith('mi foto con espacios.jpg');
      expect(mockBasename).toHaveBeenCalledWith('mi foto con espacios.jpg', '.jpg');
      expect(mockCb).toHaveBeenCalledWith(null, 'miundefinedfotoundefinedconundefinedespacios.jpg');
    });

    it('debería manejar archivos sin extensión', () => {
      mockExtname.mockReturnValue('');
      mockBasename.mockReturnValue('archivo sin extension');
      
      const mockCb = jest.fn();
      const mockReq = {};
      const mockFile = { originalname: 'archivo sin extension' };

      diskStorageConfig.filename(mockReq, mockFile, mockCb);

      expect(mockCb).toHaveBeenCalledWith(null, 'archivoundefinedsinundefinedextension');
    });
  });

  describe('POST /foto-perfil/:subfolder', () => {
    it('debería subir foto de perfil exitosamente', async () => {
      const routeHandler = routes['POST:/foto-perfil/:subfolder'];
      expect(routeHandler).toBeDefined();

      const mockReq = {
        file: {
          filename: 'foto.jpg'
        },
        params: {
          subfolder: 'usuario1'
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith({
        message: 'Foto de perfil subida correctamente',
        filename: 'foto.jpg'
      });
    });

    it('debería fallar si no se recibe archivo', async () => {
      const routeHandler = routes['POST:/foto-perfil/:subfolder'];

      const mockReq = {
        file: undefined,
        params: {
          subfolder: 'usuario1'
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'No se recibió la foto de perfil'
      });
    });

    it('debería fallar si file es null', async () => {
      const routeHandler = routes['POST:/foto-perfil/:subfolder'];

      const mockReq = {
        file: null,
        params: {
          subfolder: 'usuario1'
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'No se recibió la foto de perfil'
      });
    });
  });

  describe('POST /cedula-pdf/:subfolder', () => {
    it('debería subir PDF de cédula exitosamente', async () => {
      const routeHandler = routes['POST:/cedula-pdf/:subfolder'];
      expect(routeHandler).toBeDefined();

      const mockReq = {
        file: {
          filename: 'cedula.pdf'
        },
        params: {
          subfolder: 'documentos'
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith({
        message: 'PDF de cédula subido correctamente',
        filename: 'cedula.pdf'
      });
    });

    it('debería fallar si no se recibe archivo PDF', async () => {
      const routeHandler = routes['POST:/cedula-pdf/:subfolder'];

      const mockReq = {
        file: undefined,
        params: {
          subfolder: 'documentos'
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'No se recibió el PDF de la cédula'
      });
    });

    it('debería fallar si file es null para PDF', async () => {
      const routeHandler = routes['POST:/cedula-pdf/:subfolder'];

      const mockReq = {
        file: null,
        params: {
          subfolder: 'documentos'
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'No se recibió el PDF de la cédula'
      });
    });
  });

  describe('GET /buscar/:subfolder', () => {
    it('debería encontrar archivo de imagen correctamente', async () => {
      const routeHandler = routes['GET:/buscar/:subfolder'];
      expect(routeHandler).toBeDefined();

      mockExistsSync.mockReturnValue(true);
      mockReaddir.mockImplementation((dir, callback) => {
        callback(null, ['foto.jpg', 'documento.pdf']);
      });

      const mockReq = {
        params: { subfolder: 'usuario1' },
        query: { tipo: 'imagen' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockExistsSync).toHaveBeenCalledWith('/app/uploads/cliente/usuario1');
      expect(mockReaddir).toHaveBeenCalledWith('/app/uploads/cliente/usuario1', expect.any(Function));
      expect(mockJson).toHaveBeenCalledWith({
        url: 'http://localhost:4000/uploads/cliente/usuario1/foto.jpg'
      });
    });

    it('debería encontrar archivo PDF correctamente', async () => {
      const routeHandler = routes['GET:/buscar/:subfolder'];

      mockExistsSync.mockReturnValue(true);
      mockReaddir.mockImplementation((dir, callback) => {
        callback(null, ['foto.jpg', 'documento.pdf']);
      });

      const mockReq = {
        params: { subfolder: 'docs' },
        query: { tipo: 'pdf' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith({
        url: 'http://localhost:4000/uploads/cliente/docs/documento.pdf'
      });
    });

    it('debería retornar primer archivo si no hay filtro tipo', async () => {
      const routeHandler = routes['GET:/buscar/:subfolder'];

      mockExistsSync.mockReturnValue(true);
      mockReaddir.mockImplementation((dir, callback) => {
        callback(null, ['primer.doc', 'segundo.jpg']);
      });

      const mockReq = {
        params: { subfolder: 'mixed' },
        query: {}
      };

      await routeHandler(mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith({
        url: 'http://localhost:4000/uploads/cliente/mixed/primer.doc'
      });
    });

    it('debería retornar primer archivo cuando tipo es undefined', async () => {
      const routeHandler = routes['GET:/buscar/:subfolder'];

      mockExistsSync.mockReturnValue(true);
      mockReaddir.mockImplementation((dir, callback) => {
        callback(null, ['archivo.txt']);
      });

      const mockReq = {
        params: { subfolder: 'test' },
        query: { tipo: undefined }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith({
        url: 'http://localhost:4000/uploads/cliente/test/archivo.txt'
      });
    });

    it('debería manejar carpeta no existente', async () => {
      const routeHandler = routes['GET:/buscar/:subfolder'];
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mockExistsSync.mockReturnValue(false);

      const mockReq = {
        params: { subfolder: 'noexiste' },
        query: {}
      };

      await routeHandler(mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalledWith('No existe la carpeta');
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Carpeta no encontrada'
      });

      consoleSpy.mockRestore();
    });

    it('debería manejar error de lectura de archivos', async () => {
      const routeHandler = routes['GET:/buscar/:subfolder'];
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      mockExistsSync.mockReturnValue(true);
      mockReaddir.mockImplementation((dir, callback) => {
        callback(new Error('Permission denied'), null);
      });

      const mockReq = {
        params: { subfolder: 'error' },
        query: {}
      };

      await routeHandler(mockReq, mockRes);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error leyendo archivos:', new Error('Permission denied'));
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Error leyendo archivos'
      });

      consoleErrorSpy.mockRestore();
    });

    it('debería manejar cuando no hay archivos del tipo imagen', async () => {
      const routeHandler = routes['GET:/buscar/:subfolder'];
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mockExistsSync.mockReturnValue(true);
      mockReaddir.mockImplementation((dir, callback) => {
        callback(null, ['documento.pdf', 'texto.txt']);
      });

      const mockReq = {
        params: { subfolder: 'sinimg' },
        query: { tipo: 'imagen' }
      };

      await routeHandler(mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalledWith('No se encontraron archivos del tipo especificado');
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'No se encontró archivo del tipo especificado'
      });

      consoleSpy.mockRestore();
    });

    it('debería manejar cuando no hay archivos del tipo PDF', async () => {
      const routeHandler = routes['GET:/buscar/:subfolder'];
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mockExistsSync.mockReturnValue(true);
      mockReaddir.mockImplementation((dir, callback) => {
        callback(null, ['foto.jpg', 'imagen.png']);
      });

      const mockReq = {
        params: { subfolder: 'sinpdf' },
        query: { tipo: 'pdf' }
      };

      await routeHandler(mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalledWith('No se encontraron archivos del tipo especificado');
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'No se encontró archivo del tipo especificado'
      });

      consoleSpy.mockRestore();
    });

    it('debería manejar carpeta vacía', async () => {
      const routeHandler = routes['GET:/buscar/:subfolder'];
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mockExistsSync.mockReturnValue(true);
      mockReaddir.mockImplementation((dir, callback) => {
        callback(null, []);
      });

      const mockReq = {
        params: { subfolder: 'vacia' },
        query: {}
      };

      await routeHandler(mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalledWith('No se encontraron archivos del tipo especificado');
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'No se encontró archivo del tipo especificado'
      });

      consoleSpy.mockRestore();
    });

    it('debería sanitizar subfolder en búsqueda', async () => {
      const routeHandler = routes['GET:/buscar/:subfolder'];

      mockExistsSync.mockReturnValue(true);
      mockReaddir.mockImplementation((dir, callback) => {
        callback(null, ['archivo.txt']);
      });

      const mockReq = {
        params: { subfolder: '../../../malicious' },
        query: {}
      };

      await routeHandler(mockReq, mockRes);

      expect(mockExistsSync).toHaveBeenCalledWith('/app/uploads/cliente/malicious');
      expect(mockJson).toHaveBeenCalledWith({
        url: 'http://localhost:4000/uploads/cliente/malicious/archivo.txt'
      });
    });

    it('debería usar default cuando subfolder es undefined en búsqueda', async () => {
      const routeHandler = routes['GET:/buscar/:subfolder'];

      mockExistsSync.mockReturnValue(true);
      mockReaddir.mockImplementation((dir, callback) => {
        callback(null, ['archivo.txt']);
      });

      const mockReq = {
        params: {},
        query: {}
      };

      await routeHandler(mockReq, mockRes);

      expect(mockExistsSync).toHaveBeenCalledWith('/app/uploads/cliente/default');
    });

    it('debería filtrar correctamente archivos de imagen con diferentes extensiones', async () => {
      const routeHandler = routes['GET:/buscar/:subfolder'];

      mockExistsSync.mockReturnValue(true);
      mockReaddir.mockImplementation((dir, callback) => {
        callback(null, ['foto.JPG', 'imagen.JPEG', 'pic.PNG', 'ani.GIF', 'doc.pdf']);
      });

      const mockReq = {
        params: { subfolder: 'imgs' },
        query: { tipo: 'imagen' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith({
        url: 'http://localhost:4000/uploads/cliente/imgs/foto.JPG'
      });
    });

    it('debería filtrar correctamente archivos PDF case-insensitive', async () => {
      const routeHandler = routes['GET:/buscar/:subfolder'];

      mockExistsSync.mockReturnValue(true);
      mockReaddir.mockImplementation((dir, callback) => {
        callback(null, ['documento.PDF', 'archivo.TXT']);
      });

      const mockReq = {
        params: { subfolder: 'pdfs' },
        query: { tipo: 'pdf' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith({
        url: 'http://localhost:4000/uploads/cliente/pdfs/documento.PDF'
      });
    });
  });

  describe('Casos edge y validaciones especiales', () => {
    it('debería manejar subfolder con caracteres especiales eliminados', async () => {
      mockExistsSync.mockReturnValue(true);
      const mockCb = jest.fn();
      const mockReq = { params: { subfolder: 'test@#$%folder!' } };
      const mockFile = {};

      diskStorageConfig.destination(mockReq, mockFile, mockCb);

      expect(mockJoin).toHaveBeenCalledWith('uploads/cliente/', 'testfolder');
    });

    it('debería manejar filename con múltiples espacios', () => {
      mockExtname.mockReturnValue('.pdf');
      mockBasename.mockReturnValue('mi   archivo   con   espacios');
      
      const mockCb = jest.fn();
      const mockReq = {};
      const mockFile = { originalname: 'mi   archivo   con   espacios.pdf' };

      diskStorageConfig.filename(mockReq, mockFile, mockCb);

      expect(mockCb).toHaveBeenCalledWith(null, 'miundefinedarchivoundefinedconundefinedespacios.pdf');
    });

    it('debería manejar archivo con solo espacios en el nombre', () => {
      mockExtname.mockReturnValue('.jpg');
      mockBasename.mockReturnValue('   ');
      
      const mockCb = jest.fn();
      const mockReq = {};
      const mockFile = { originalname: '   .jpg' };

      diskStorageConfig.filename(mockReq, mockFile, mockCb);

      expect(mockCb).toHaveBeenCalledWith(null, 'undefined.jpg');
    });
  });

  describe('Verificación de configuración y rutas', () => {
    it('debería verificar que todas las rutas esperadas están registradas', () => {
      const rutasEsperadas = [
        'POST:/foto-perfil/:subfolder',
        'POST:/cedula-pdf/:subfolder',
        'GET:/buscar/:subfolder'
      ];

      rutasEsperadas.forEach(ruta => {
        expect(routes[ruta]).toBeDefined();
        expect(typeof routes[ruta]).toBe('function');
      });

      expect(Object.keys(routes).length).toBe(rutasEsperadas.length);
    });

    it('debería verificar que el módulo se exporta correctamente', () => {
      expect(routerInstance).toBeDefined();
    });

    it('debería verificar que multer fue configurado correctamente', () => {
      // Verificar que las configuraciones de storage existen
      expect(typeof diskStorageConfig.destination).toBe('function');
      expect(typeof diskStorageConfig.filename).toBe('function');
    });
  });

  describe('Cobertura de expresiones regulares', () => {
    it('debería probar regex de imágenes con todos los formatos', async () => {
      const routeHandler = routes['GET:/buscar/:subfolder'];

      const extensionesImagen = ['jpg', 'jpeg', 'png', 'gif', 'JPG', 'JPEG', 'PNG', 'GIF'];
      
      for (const ext of extensionesImagen) {
        jest.clearAllMocks();
        
        mockExistsSync.mockReturnValue(true);
        mockReaddir.mockImplementation((dir, callback) => {
          callback(null, [`archivo.${ext}`]);
        });

        const mockReq = {
          params: { subfolder: 'test' },
          query: { tipo: 'imagen' }
        };

        await routeHandler(mockReq, mockRes);

        expect(mockJson).toHaveBeenCalledWith({
          url: `http://localhost:4000/uploads/cliente/test/archivo.${ext}`
        });
      }
    });

    it('debería probar regex de PDF case-insensitive', async () => {
      const routeHandler = routes['GET:/buscar/:subfolder'];

      const extensionesPdf = ['pdf', 'PDF', 'Pdf', 'pDf'];
      
      for (const ext of extensionesPdf) {
        jest.clearAllMocks();
        
        mockExistsSync.mockReturnValue(true);
        mockReaddir.mockImplementation((dir, callback) => {
          callback(null, [`documento.${ext}`]);
        });

        const mockReq = {
          params: { subfolder: 'test' },
          query: { tipo: 'pdf' }
        };

        await routeHandler(mockReq, mockRes);

        expect(mockJson).toHaveBeenCalledWith({
          url: `http://localhost:4000/uploads/cliente/test/documento.${ext}`
        });
      }
    });
  });
});