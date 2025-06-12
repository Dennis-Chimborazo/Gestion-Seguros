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

describe('POST /agente/generar-token', () => {
    const tokenData = {
        id_pers: 1,
        pass: 'password123',
        url: 'test-url-123'
    };

    it('debería generar token exitosamente', async () => {
        mockDatabase.query.mockResolvedValue({ rows: [] });

        const response = await request(app)
            .post('/agente/generar-token')
            .send(tokenData)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.token).toBeDefined();
        expect(response.body.message).toBe('Token creado y guardado exitosamente.');

        // Verificar que el token es válido
        const decodedToken = jwt.verify(response.body.token, 'emailAgente');
        expect(decodedToken.id_pers).toBe(tokenData.id_pers);
        expect(decodedToken.pass).toBe(tokenData.pass);
    });

    it('debería manejar errores en la generación de token', async () => {
        mockDatabase.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .post('/agente/generar-token')
            .send(tokenData)
            .expect(500);

        expect(response.body).toEqual({
            success: false,
            message: 'Error del servidor'
        });
    });
});

describe('POST /agente/validar-token-email', () => {
    it('debería validar token correctamente', async () => {
        const validToken = jwt.sign({ id_pers: 1, pass: 'test' }, 'emailAgente', { expiresIn: '1h' });

        mockDatabase.query.mockResolvedValue({
            rowCount: 1,
            rows: [{ token_val: validToken, id_val: 1 }]
        });

        const response = await request(app)
            .post('/agente/validar-token-email')
            .send({ url: 'test-url' })
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Token válido.');
        expect(response.body.data.id_pers).toBe(1);
        expect(response.body.idvalid).toBe(1);
    });

    it('debería rechazar URL no encontrada', async () => {
        mockDatabase.query.mockResolvedValue({ rowCount: 0 });

        const response = await request(app)
            .post('/agente/validar-token-email')
            .send({ url: 'url-inexistente' })
            .expect(404);

        expect(response.body).toEqual({
            success: false,
            message: 'URL no encontrada.'
        });
    });

    it('debería rechazar token inválido', async () => {
        mockDatabase.query.mockResolvedValue({
            rowCount: 1,
            rows: [{ token_val: 'token-invalido', id_val: 1 }]
        });

        const response = await request(app)
            .post('/agente/validar-token-email')
            .send({ url: 'test-url' })
            .expect(401);

        expect(response.body).toEqual({
            success: false,
            message: 'Token inválido o expirado.'
        });
    });
});
describe('GET /agente/buscar-agente', () => {
    it('debería buscar agente por ID exitosamente', async () => {
        const mockAgente = {
            rows: [{
                id_agente: 1,
                ced_agente: '1234567890',
                nom_agente: 'Juan',
                ape_agente: 'Pérez'
            }]
        };

        mockDatabase.query.mockResolvedValue(mockAgente);

        const response = await request(app)
            .get('/agente/buscar-agente?id=1')
            .expect(200);

        expect(response.body).toEqual(mockAgente.rows);
        expect(mockDatabase.query).toHaveBeenCalledWith(
            'SELECT * FROM agente WHERE id_agente = $1',
            ['1']
        );
    });

    it('debería manejar arrays en el parámetro ID', async () => {
        const mockAgente = { rows: [{ id_agente: 1 }] };
        mockDatabase.query.mockResolvedValue(mockAgente);

        const response = await request(app)
            .get('/agente/buscar-agente?id=1&id=2')
            .expect(200);

        expect(mockDatabase.query).toHaveBeenCalledWith(
            'SELECT * FROM agente WHERE id_agente = $1',
            ['1']
        );
    });
});

describe('PUT /agente/activar-cuenta', () => {
    it('debería activar cuenta exitosamente', async () => {
        mockDatabase.query.mockResolvedValueOnce({ rowCount: 1 });
        mockDatabase.query.mockResolvedValueOnce({ rowCount: 1 });

        const response = await request(app)
            .put('/agente/activar-cuenta')
            .send({ id: 1, idvalid: 1 })
            .expect(200);

        expect(response.body).toEqual({
            message: 'Cuenta activada con éxito.'
        });

        expect(mockDatabase.query).toHaveBeenCalledTimes(2);
    });

    it('debería rechazar datos faltantes', async () => {
        const response = await request(app)
            .put('/agente/activar-cuenta')
            .send({ id: 1 })
            .expect(400);

        expect(response.body).toEqual({
            error: 'Faltan datos requeridos (id o idvalid).'
        });
    });

    it('debería manejar agente no encontrado', async () => {
        mockDatabase.query.mockResolvedValue({ rowCount: 0 });

        const response = await request(app)
            .put('/agente/activar-cuenta')
            .send({ id: 999, idvalid: 1 })
            .expect(404);

        expect(response.body).toEqual({
            error: 'Agente no encontrado.'
        });
    });
});

describe('PUT /agente/update-agente', () => {
    const agenteActualizado = {
        id_agente: 1,
        nom_agente: 'Juan Carlos',
        ape_agente: 'Pérez López',
        email_agente: 'juan.carlos@email.com',
        dire_agente: 'Nueva Dirección 456',
        tel_agente: '0987654321',
        ced_agente: '1234567890'
    };

    it('debería actualizar agente exitosamente', async () => {
        mockDatabase.query.mockResolvedValue({ rowCount: 1 });

        const response = await request(app)
            .put('/agente/update-agente')
            .send(agenteActualizado)
            .expect(200);

        expect(response.body).toEqual({
            message: 'Agente actualizado correctamente'
        });

        expect(mockDatabase.query).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE agente SET'),
            [
                agenteActualizado.nom_agente,
                agenteActualizado.ape_agente,
                agenteActualizado.email_agente,
                agenteActualizado.dire_agente,
                agenteActualizado.tel_agente,
                agenteActualizado.ced_agente,
                agenteActualizado.id_agente
            ]
        );
    });

    it('debería manejar errores en la actualización', async () => {
        mockDatabase.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .put('/agente/update-agente')
            .send(agenteActualizado)
            .expect(500);

        expect(response.body).toEqual({
            error: 'Error al actualizar agente'
        });
    });
});

describe('PUT /agente/update-correo', () => {
    it('debería actualizar correo exitosamente', async () => {
        mockDatabase.query.mockResolvedValue({ rowCount: 1 });

        const response = await request(app)
            .put('/agente/update-correo')
            .send({
                newEmail: 'nuevo@email.com',
                id_agente: 1
            })
            .expect(200);

        expect(response.body).toEqual({
            message: 'Cliente actualizado correctamente'
        });
    });
});

describe('PUT /agente/actualizar-token-email', () => {
    it('debería actualizar token exitosamente', async () => {
        mockDatabase.query.mockResolvedValue({ rowCount: 1 });

        const response = await request(app)
            .put('/agente/actualizar-token-email')
            .send({
                id_agente: 1,
                url: 'nueva-url',
                pass: 'nueva-password'
            })
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.token).toBeDefined();
        expect(response.body.message).toBe('Token actualizado exitosamente.');
    });

    it('debería manejar registro no encontrado', async () => {
        mockDatabase.query.mockResolvedValue({ rowCount: 0 });

        const response = await request(app)
            .put('/agente/actualizar-token-email')
            .send({
                id_agente: 999,
                url: 'nueva-url',
                pass: 'nueva-password'
            })
            .expect(404);

        expect(response.body).toEqual({
            success: false,
            message: 'No se encontró el registro para actualizar.'
        });
    });
});
