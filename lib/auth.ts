import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development'

export interface JWTPayload {
    userId: string
    email: string
    tokenVersion: number
    iat?: number
    exp?: number
}

// Générer un token JWT (valable 30 jours)
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_SECRET as string, {
        expiresIn: process.env.EXPIRES_IN || '30d'
    } as jwt.SignOptions)
}

// Vérifier et décoder un token JWT
export function verifyToken(token: string): JWTPayload {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch (error) {
        throw new Error('Token invalide')
    }
}

// Extraire le token du header Authorization ou des cookies
export function extractToken(request: NextRequest): string | null {
    // Essayer d'abord l'en-tête Authorization
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7)
    }

    // Puis essayer les cookies
    const tokenCookie = request.cookies.get('auth-token')
    if (tokenCookie) {
        return tokenCookie.value
    }

    return null
}

// Middleware pour vérifier l'authentification
export async function validateAuthToken(request: NextRequest): Promise<JWTPayload | null> {
    try {
        const token = extractToken(request)
        if (!token) {
            return null
        }

        const payload = verifyToken(token)
        return payload
    } catch (error) {
        return null
    }
}