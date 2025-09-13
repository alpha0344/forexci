import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        // Validation des données
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email et mot de passe requis' },
                { status: 400 }
            )
        }

        // Rechercher l'utilisateur
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Email ou mot de passe incorrect' },
                { status: 401 }
            )
        }

        // Vérifier si l'utilisateur est actif
        if (!user.isActive) {
            return NextResponse.json(
                { error: 'Compte désactivé' },
                { status: 401 }
            )
        }

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Email ou mot de passe incorrect' },
                { status: 401 }
            )
        }

        // Mettre à jour la date de dernière connexion
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        })

        // Générer le token JWT
        const token = generateToken({
            userId: user.id,
            email: user.email,
            tokenVersion: user.tokenVersion
        })

        // Créer la réponse avec le token en cookie sécurisé
        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName
            }
        })

        // Définir le cookie avec le token (30 jours)
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 // 30 jours en secondes
        })

        return response

    } catch (error) {
        console.error('Erreur lors de la connexion:', error)
        return NextResponse.json(
            { error: 'Erreur serveur interne' },
            { status: 500 }
        )
    }
}