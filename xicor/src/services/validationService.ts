// services/validationService.ts

class ValidationService {
    // Validar solo letras (para nombres y apellidos)
    static validarTexto(texto: string): boolean {
        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        return regex.test(texto) && texto.trim().length >= 2;
    }

    // Validar RUT chileno
    static validarRUT(rut: string): boolean {
        // Eliminar puntos y guión
        rut = rut.replace(/\./g, '').replace(/-/g, '');

        if (rut.length < 8) return false;

        const cuerpo = rut.slice(0, -1);
        const dv = rut.slice(-1).toUpperCase();

        // Calcular dígito verificador
        let suma = 0;
        let multiplicador = 2;

        for (let i = cuerpo.length - 1; i >= 0; i--) {
            suma += parseInt(cuerpo.charAt(i)) * multiplicador;
            multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
        }

        const dvEsperado = 11 - (suma % 11);
        const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();

        return dv === dvCalculado;
    }

    // Formatear RUT
    static formatearRUT(rut: string): string {
        let valor = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();

        if (valor.length === 0) return '';

        // Separar cuerpo y dígito verificador
        const cuerpo = valor.slice(0, -1);
        const dv = valor.slice(-1);

        // Agregar puntos cada 3 dígitos desde la derecha
        if (cuerpo.length > 0) {
            const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            return cuerpoFormateado + (dv ? '-' + dv : '');
        }

        return valor;
    }

    // Validar edad mayor a 18 años
    static validarEdad(fechaNacimiento: string): boolean {
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();

        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }

        return edad >= 18;
    }

    // Validar contraseña (mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número)
    static validarContrasena(contrasena: string): boolean {
        if (contrasena.length < 8) return false;

        const tieneMayuscula = /[A-Z]/.test(contrasena);
        const tieneMinuscula = /[a-z]/.test(contrasena);
        const tieneNumero = /[0-9]/.test(contrasena);

        return tieneMayuscula && tieneMinuscula && tieneNumero;
    }

    // Validar email
    static validarEmail(email: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Validar teléfono chileno
    static validarTelefono(telefono: string): boolean {
        const regex = /^(\+?56)?[\s]?[9]\s?[0-9]{4}[\s]?[0-9]{4}$/;
        return regex.test(telefono);
    }

    // Validar campos requeridos
    static validarRequerido(valor: string): boolean {
        return valor.trim().length > 0;
    }

    // Validar número positivo
    static validarNumeroPositivo(numero: number): boolean {
        return numero > 0 && !isNaN(numero);
    }
}

export default ValidationService;