import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateAuthToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        // Valider le token
        const payload = await validateAuthToken(request)
        if (!payload) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            )
        }

        // Récupérer l'utilisateur depuis la base de données
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                fullName: true,
                isActive: true,
                tokenVersion: true,
                lastLoginAt: true,
                createdAt: true
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Utilisateur introuvable' },
                { status: 404 }
            )
        }

        // Vérifier si l'utilisateur est toujours actif
        if (!user.isActive) {
            return NextResponse.json(
                { error: 'Compte désactivé' },
                { status: 401 }
            )
        }

        // Vérifier la version du token (pour invalider les anciens tokens)
        if (user.tokenVersion !== payload.tokenVersion) {
            return NextResponse.json(
                { error: 'Token expiré' },
                { status: 401 }
            )
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                lastLoginAt: user.lastLoginAt,
                createdAt: user.createdAt
            }
        })

    } catch (error) {
        console.error('Erreur lors de la vérification:', error)
        return NextResponse.json(
            { error: 'Erreur serveur interne' },
            { status: 500 }
        )
    }
}