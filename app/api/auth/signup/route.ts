import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password, fullName } = body

        // Validation des données
        if (!email || !password || !fullName) {
            return NextResponse.json(
                { error: 'Email, mot de passe et nom complet requis' },
                { status: 400 }
            )
        }

        // Validation du format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Format d\'email invalide' },
                { status: 400 }
            )
        }

        // Validation du mot de passe
        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Le mot de passe doit contenir au moins 6 caractères' },
                { status: 400 }
            )
        }

        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            return NextResponse.json(
                { error: 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre' },
                { status: 400 }
            )
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'Un compte avec cet email existe déjà' },
                { status: 409 }
            )
        }

        // Hacher le mot de passe
        const saltRounds = 12
        const passwordHash = await bcrypt.hash(password, saltRounds)

        // Créer l'utilisateur
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                passwordHash,
                fullName: fullName.trim(),
                isActive: true,
                tokenVersion: 0
            }
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
                fullName: user.fullName,
            }
        }, { status: 201 })

        // Définir le cookie avec le token (30 jours)
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 // 30 jours en secondes
        })
        return response
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error)
        return NextResponse.json(
            { error: 'Erreur serveur interne' },
            { status: 500 }
        )
    }
}