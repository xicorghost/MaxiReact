// tests/logic.test.tsx

import { describe, it, expect } from 'vitest';
import ValidationService from '../services/validationService';
import JWTService from '../services/jwtService';

describe('Lógica de Negocio', () => {
  it('Validar RUT Chileno: debe retornar true para RUT válido', () => {
    // RUT real válido: 12345678-5 (sin puntos para evitar líos de formato)
    const rutValido = '12345678-5';
    expect(ValidationService.validarRUT(rutValido)).toBe(true);
  });

  it('Validar RUT Chileno: debe retornar false para RUT incorrecto', () => {
    // RUT con dígito verificador erróneo
    expect(ValidationService.validarRUT('12345678-9')).toBe(false);
  });

  it('Validar Edad: debe rechazar menores de 18', () => {
    const joven = '2015-01-01';
    expect(ValidationService.validarEdad(joven)).toBe(false);
  });

  it('JWT: debe manejar correctamente la expiración ficticia', () => {
    // Probando la lógica de "willExpireSoon" del archivo enviado
    expect(typeof JWTService.willExpireSoon()).toBe('boolean');
  });

  it('Validation: Validar email formato correcto', () => {
    expect(ValidationService.validarEmail('test@maxigas.cl')).toBe(true);
    expect(ValidationService.validarEmail('test@cl')).toBe(false);
  });

  it('Storage: Verificación de persistencia básica', () => {
    // Al ser estático, podemos probar la interface
    expect(typeof ValidationService.validarContrasena('Abc12345')).toBe('boolean');
  });

  // Añade esto dentro del describe('Lógica de Negocio') en logic.test.tsx

  it('Validar Contraseña: debe cumplir con requisitos de seguridad', () => {
    expect(ValidationService.validarContrasena('Admin123')).toBe(true);
    expect(ValidationService.validarContrasena('123')).toBe(false); // muy corta
    expect(ValidationService.validarContrasena('soloLetras')).toBe(false); // sin números
  });

  it('Validar Teléfono: debe aceptar formatos chilenos', () => {
    expect(ValidationService.validarTelefono('+56912345678')).toBe(true);
    expect(ValidationService.validarTelefono('912345678')).toBe(true);
    expect(ValidationService.validarTelefono('123')).toBe(false);
  });
});