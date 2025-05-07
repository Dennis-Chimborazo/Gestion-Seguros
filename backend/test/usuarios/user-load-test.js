import http from 'k6/http';
import { check, group } from 'k6';
import { SharedArray } from 'k6/data';

// 1. Configuración
export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Escalado gradual
    { duration: '1m', target: 100 },  // Carga sostenida
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],   // Menos del 1% de errores
    http_req_duration: ['p(95)<500'], // 95% de requests bajo 500ms
  },
};

// 2. Datos de prueba (similar a tus constantes)
const users = new SharedArray('credenciales', () => [
  { user: 'admin', pass: 'admin' },  // Válido
  { user: 'fake', pass: 'fake' },    // Inválido
]);

// 3. Prueba de login
export default function () {
  group('Pruebas de autenticación', () => {
    // Escenario 1: Login exitoso
    let resValid = http.post(
      'http://localhost:3000/user/ingreso',
      JSON.stringify(users[0]), // Usuario válido
      { headers: { 'Content-Type': 'application/json' } }
    );

    check(resValid, {
      'Login válido retorna 200': (r) => r.status === 200,
      'Token generado': (r) => JSON.parse(r.body).token !== null,
    });

    // Escenario 2: Login fallido
    let resInvalid = http.post(
      'http://localhost:3000/user/ingreso',
      JSON.stringify(users[1]), // Usuario inválido
      { headers: { 'Content-Type': 'application/json' } }
    );

    check(resInvalid, {
      'Login inválido retorna 200': (r) => r.status === 200,
      'Sin token en respuesta': (r) => !JSON.parse(r.body).token,
    });
  });
}