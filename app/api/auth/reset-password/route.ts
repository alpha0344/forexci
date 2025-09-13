import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    // Validation des données
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token et nouveau mot de passe requis' },
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

    // Rechercher l'utilisateur avec le token de reset
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date() // Token non expiré
        },
        isActive: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 400 }
      )
    }

    // Hacher le nouveau mot de passe
    const passwordHash = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS))

    // Mettre à jour l'utilisateur
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
        tokenVersion: user.tokenVersion + 1, // Invalider tous les tokens JWT existants
        updatedAt: new Date()
      }
    })

    // Générer un nouveau token JWT pour connecter l'utilisateur automatiquement
    const jwtToken = generateToken({
      userId: user.id,
      email: user.email,
      tokenVersion: user.tokenVersion + 1
    })

    // Créer la réponse avec le token en cookie sécurisé
    const response = NextResponse.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName
      }
    })

    // Définir le cookie avec le token (30 jours)
    response.cookies.set('auth-token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: parseInt(process.env.MAX_AGE || '2592000')
    })

    console.log(`Password successfully reset for user: ${user.email}`)
    
    return response

  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error)
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}