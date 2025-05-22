import request from 'supertest';
import app from '../src/index.js';

const RUTA_BASE = '/direccion';

const ID_PAIS = 1;       
const ID_PROVINCIA = 1;  
const ID_CIUDAD = 1;     

describe('Pruebas para la ruta de direcciones', () => {
  
  // Prueba para GET /pais
  describe(`GET ${RUTA_BASE}/pais`, () => {
    it('debería retornar la lista de países', async () => {
      const res = await request(app)
        .get(`${RUTA_BASE}/pais`)
        .expect(200)
        .expect('Content-Type', /json/);

      // Verificar si devuelve el objeto PostgreSQL completo o solo las filas
      const data = res.body.rows || res.body;
      expect(Array.isArray(data)).toBe(true);
      
      if (data.length > 0) {
        expect(data[0]).toHaveProperty('id_pais');
        expect(data[0]).toHaveProperty('nom_pais');
      }
    });
  });

  // Prueba para GET /provincia
  describe(`GET ${RUTA_BASE}/provincia`, () => {
    it('debería fallar si no se proporciona el ID de país', async () => {
      const res = await request(app)
        .get(`${RUTA_BASE}/provincia`)
        .expect(400);

      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('parámetro');
    });

    it('debería retornar provincias según el ID de país proporcionado', async () => {
      const res = await request(app)
        .get(`${RUTA_BASE}/provincia?id=${ID_PAIS}`)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(Array.isArray(res.body)).toBe(true);
      
      // Si hay provincias, verificar estructura
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('id_provin');
        expect(res.body[0]).toHaveProperty('nom_provin');
        expect(res.body[0]).toHaveProperty('id_pais');
        // Verificar que sean del país solicitado
        expect(res.body[0].id_pais).toBe(ID_PAIS);
      }
    });
  });

  // Prueba para GET /ciudad
  describe(`GET ${RUTA_BASE}/ciudad`, () => {
    it('debería fallar si no se proporciona el ID de provincia', async () => {
      const res = await request(app)
        .get(`${RUTA_BASE}/ciudad`)
        .expect(400);

      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('parámetro');
    });

    it('debería retornar ciudades según el ID de provincia proporcionado', async () => {
      const res = await request(app)
        .get(`${RUTA_BASE}/ciudad?id=${ID_PROVINCIA}`)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(Array.isArray(res.body)).toBe(true);
      
      // Si hay ciudades, verificar estructura
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('id_ciud');
        expect(res.body[0]).toHaveProperty('nom_ciud');
        expect(res.body[0]).toHaveProperty('id_provin');
        // Verificar que sean de la provincia solicitada
        expect(res.body[0].id_provin).toBe(ID_PROVINCIA);
      }
    });
  });

  // Prueba para GET /client
  describe(`GET ${RUTA_BASE}/client`, () => {
    it('debería fallar si no se proporciona el ID de ciudad', async () => {
      const res = await request(app)
        .get(`${RUTA_BASE}/client`)
        .expect(400);

      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('parámetro');
    });

    it('debería retornar información de la ciudad según el ID proporcionado', async () => {
      const res = await request(app)
        .get(`${RUTA_BASE}/client?id=${ID_CIUDAD}`)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(Array.isArray(res.body)).toBe(true);
      
      // Si hay resultados, verificar la estructura completa
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('nom_ciud');
        expect(res.body[0]).toHaveProperty('id_ciud');
        expect(res.body[0]).toHaveProperty('nom_provin');
        expect(res.body[0]).toHaveProperty('id_provin');
        expect(res.body[0]).toHaveProperty('nom_pais');
        expect(res.body[0]).toHaveProperty('id_pais');
        
        // Verificar que sea la ciudad solicitada
        expect(res.body[0].id_ciud).toBe(ID_CIUDAD);
      }
    });
  });
});