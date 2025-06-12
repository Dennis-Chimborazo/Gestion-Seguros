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

    describe('POST /agente/save-agente', () => {
        const nuevoAgente = {
            ced_agente: '1234567890',
            nom_agente: 'Carlos',
            ape_agente: 'Rodríguez',
            email_agente: 'carlos@email.com',
            dire_agente: 'Calle 123',
            tel_agente: '0991234567'
        };

        it('debería crear un nuevo agente exitosamente', async () => {
            // Mock para verificar que no existe el agente
            mockDatabase.query.mockResolvedValueOnce({ rows: [] });
            // Mock para la inserción
            mockDatabase.query.mockResolvedValueOnce({ rows: [{ id_agente: 1 }] });

            const response = await request(app)
                .post('/agente/save-agente')
                .send(nuevoAgente)
                .expect(200);

            expect(response.body).toEqual({
                message: 'Agente guardado exitosamente',
                id_agente: 1
            });

            expect(mockDatabase.query).toHaveBeenCalledTimes(2);
            expect(mockDatabase.query).toHaveBeenNthCalledWith(1,
                'SELECT 1 FROM agente WHERE ced_agente = $1 LIMIT 1',
                [nuevoAgente.ced_agente]
            );
        });

        it('debería rechazar agente con cédula duplicada', async () => {
            mockDatabase.query.mockResolvedValue({ rows: [{ id: 1 }] });

            const response = await request(app)
                .post('/agente/save-agente')
                .send(nuevoAgente)
                .expect(400);

            expect(response.body).toEqual({
                message: 'El agente con esa cédula ya existe.'
            });
        });

        it('debería manejar errores en la creación', async () => {
            mockDatabase.query.mockResolvedValueOnce({ rows: [] });
            mockDatabase.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .post('/agente/save-agente')
                .send(nuevoAgente)
                .expect(500);

            expect(response.body.message).toBe('Error al guardar agente');
        });
    });


});