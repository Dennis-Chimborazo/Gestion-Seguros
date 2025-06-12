// __tests__/agente.routes.test.js
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

const mockDatabase = {
  query: jest.fn()
};

const mockDbInstance = {
  getConexion: jest.fn(() => mockDatabase)
};

// Mock completo del módulo database
jest.mock('../src/database.js', () => ({
  DataBase: jest.fn(() => mockDbInstance)
}));


const agenteRouter = require('../src/routes/agente.routes');

describe('Agente Router - Pruebas de Integración', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/agente', agenteRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  
    mockDatabase.query.mockReset();
  });

  describe('GET /agente/listar', () => {
    it('debería listar todos los agentes activos exitosamente', async () => {
      const mockAgentes = {
        rows: [
          {
            id_agente: 1,
            ced_agente: '1234567890',
            nom_agente: 'Juan',
            ape_agente: 'Pérez',
            email_agente: 'juan@email.com',
            id_estado: '1'
          }
        ]
      };

      mockDatabase.query.mockResolvedValue(mockAgentes);

      const response = await request(app)
        .get('/agente/listar')
        .expect(200);

      expect(response.body).toEqual(mockAgentes);
      expect(mockDatabase.query).toHaveBeenCalledWith(
        'SELECT * FROM agente WHERE id_estado = $1',
        ['1']
      );
    });

    it('debería manejar errores de base de datos', async () => {
      const errorMessage = 'Database connection failed';
      mockDatabase.query.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .get('/agente/listar')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Error al obtener datos',
        error: errorMessage
      });
    });
  });

 
});