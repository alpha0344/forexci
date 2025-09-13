import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        // Créer la réponse de succès
        const response = NextResponse.json({
            success: true,
            message: 'Déconnexion réussie'
        })

        // Supprimer le cookie d'authentification
        response.cookies.set('auth-token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 0 // Expire immédiatement
        })

        return response

    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
        return NextResponse.json(
            { error: 'Erreur serveur interne' },
            { status: 500 }
        )
    }
}