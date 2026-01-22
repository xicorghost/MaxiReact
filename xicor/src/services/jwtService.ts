// services/jwtService.ts (CON SESSION STORAGE - PESTAÑAS INDEPENDIENTES)

import type { User } from '../types';

const SECRET_KEY = 'MAXIGAS_SECRET_KEY_2025_SUPER_SEGURA';
const TOKEN_EXPIRATION = 24 * 60 * 60 * 1000;

interface TokenPayload {
    userId: number;
    email: string;
    rol: string;
    exp: number;
    iat: number;
}

class JWTService {
    private static base64UrlEncode(str: string): string {
        return btoa(str)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    private static base64UrlDecode(str: string): string {
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        while (str.length % 4) {
            str += '=';
        }
        return atob(str);
    }

    private static createSignature(data: string, secret: string): string {
        let hash = 0;
        const combined = data + secret;
        for (let i = 0; i < combined.length; i++) {
            const char = combined.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return this.base64UrlEncode(Math.abs(hash).toString(36));
    }

    static generateToken(user: User): string {
        const now = Date.now();
        const payload: TokenPayload = {
            userId: user.id,
            email: user.email,
            rol: user.rol,
            iat: now,
            exp: now + TOKEN_EXPIRATION
        };

        const header = { alg: 'HS256', typ: 'JWT' };
        const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
        const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
        const signature = this.createSignature(`${encodedHeader}.${encodedPayload}`, SECRET_KEY);

        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }

    static verifyToken(token: string): TokenPayload | null {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;

            const [encodedHeader, encodedPayload, signature] = parts;
            const expectedSignature = this.createSignature(`${encodedHeader}.${encodedPayload}`, SECRET_KEY);

            if (signature !== expectedSignature) {
                console.error('❌ Firma inválida');
                return null;
            }

            const payload: TokenPayload = JSON.parse(this.base64UrlDecode(encodedPayload));

            if (Date.now() > payload.exp) {
                console.error('❌ Token expirado');
                return null;
            }

            return payload;
        } catch (error) {
            console.error('❌ Error al verificar token:', error);
            return null;
        }
    }

    // ⚠️ CAMBIO: Usar sessionStorage en lugar de localStorage
    static saveToken(token: string): void {
        sessionStorage.setItem('jwt_token', token);
    }

    static getToken(): string | null {
        return sessionStorage.getItem('jwt_token');
    }

    static removeToken(): void {
        sessionStorage.removeItem('jwt_token');
    }

    static isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) return false;
        return this.verifyToken(token) !== null;
    }

    static getTokenPayload(): TokenPayload | null {
        const token = this.getToken();
        if (!token) return null;
        return this.verifyToken(token);
    }

    static getCurrentUserId(): number | null {
        const payload = this.getTokenPayload();
        return payload ? payload.userId : null;
    }

    static getCurrentUserRole(): string | null {
        const payload = this.getTokenPayload();
        return payload ? payload.rol : null;
    }

    static willExpireSoon(): boolean {
        const payload = this.getTokenPayload();
        if (!payload) return false;
        const oneHour = 60 * 60 * 1000;
        return payload.exp - Date.now() < oneHour;
    }

    static refreshTokenIfNeeded(user: User): void {
        if (this.willExpireSoon()) {
            const newToken = this.generateToken(user);
            this.saveToken(newToken);
            console.log('🔄 Token renovado automáticamente');
        }
    }
}

export default JWTService;