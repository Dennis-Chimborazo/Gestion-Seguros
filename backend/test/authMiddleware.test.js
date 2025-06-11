import { jest } from '@jest/globals';

// Mock de jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

// Mock dotenv para evitar cargar variables de entorno reales
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Configurar proceso.env directamente para las pruebas
process.env.JWT_SECRET = 'test_secret_key';

// Importar el módulo después de configurar los mocks
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authMiddleware');

describe('Pruebas para authMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Restablecer mocks
    jest.clearAllMocks();
    
    // Mock de req, res y next
    req = {
      headers: {}
    };
    
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
    
    next = jest.fn();
  });

  it('debería retornar error si no se proporciona token', () => {
    // Configurar req sin Authorization header
    req.headers.authorization = undefined;

    // Ejecutar el middleware
    authMiddleware(req, res, next);

    // Verificar que se llamó a res.json con mensaje de error
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Token no proporcionado"
    });
    
    // Verificar que no se llamó a next
    expect(next).not.toHaveBeenCalled();
  });

  it('debería retornar error si el header authorization no comienza con "Bearer "', () => {
    // Configurar req con header Authorization incorrecto
    req.headers.authorization = 'NotBearer token123';

    // Ejecutar el middleware
    authMiddleware(req, res, next);

    // Verificar que se llamó a res.json con mensaje de error
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Token no proporcionado"
    });
    
    // Verificar que no se llamó a next
    expect(next).not.toHaveBeenCalled();
  });

  it('debería continuar a next() si el token es válido', () => {
    // Configurar req con un token válido
    req.headers.authorization = 'Bearer valid_token';
    
    // Mock de jwt.verify para simular un token válido
    const decodedToken = { userId: 123, email: 'user@example.com' };
    jwt.verify.mockReturnValue(decodedToken);

    // Ejecutar el middleware
    authMiddleware(req, res, next);

    // Verificar que jwt.verify fue llamado con el token y el secreto
    expect(jwt.verify).toHaveBeenCalledWith('valid_token', 'test_secret_key');
    
    // Verificar que el usuario decodificado se guardó en req.user
    expect(req.user).toEqual(decodedToken);
    
    // Verificar que se llamó a next()
    expect(next).toHaveBeenCalled();
  });

  it('debería retornar error si el token es inválido', () => {
    // Configurar req con un token
    req.headers.authorization = 'Bearer invalid_token';
    
    // Mock de jwt.verify para simular un token inválido
    jwt.verify.mockImplementation(() => {
      throw new Error('Token inválido');
    });

    // Ejecutar el middleware
    authMiddleware(req, res, next);

    // Verificar que jwt.verify fue llamado con el token y el secreto
    expect(jwt.verify).toHaveBeenCalledWith('invalid_token', 'test_secret_key');
    
    // Verificar que se llamó a res.json con mensaje de error
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Token inválido o expirado"
    });
    
    // Verificar que no se llamó a next
    expect(next).not.toHaveBeenCalled();
  });

  it('debería retornar error si el token ha expirado', () => {
    // Configurar req con un token
    req.headers.authorization = 'Bearer expired_token';
    
    // Mock de jwt.verify para simular un token expirado
    jwt.verify.mockImplementation(() => {
      const error = new Error('jwt expired');
      error.name = 'TokenExpiredError';
      throw error;
    });

    // Ejecutar el middleware
    authMiddleware(req, res, next);

    // Verificar que jwt.verify fue llamado con el token y el secreto
    expect(jwt.verify).toHaveBeenCalledWith('expired_token', 'test_secret_key');
    
    // Verificar que se llamó a res.json con mensaje de error
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Token inválido o expirado"
    });
    
    // Verificar que no se llamó a next
    expect(next).not.toHaveBeenCalled();
  });
});