import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/emailService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validation de l'email
    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
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

    // Rechercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // Pour des raisons de sécurité, on retourne toujours un succès
    // même si l'utilisateur n'existe pas (évite l'énumération d'emails)
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`)
      return NextResponse.json({
        success: true,
        message: 'Si cet email existe dans notre système, vous recevrez un lien de réinitialisation.'
      })
    }

    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      console.log(`Password reset requested for inactive user: ${email}`)
      return NextResponse.json({
        success: true,
        message: 'Si cet email existe dans notre système, vous recevrez un lien de réinitialisation.'
      })
    }

    // Générer un token de réinitialisation
    const resetToken = emailService.generateToken()
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 heure

    // Mettre à jour l'utilisateur avec le token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // Envoyer l'email de réinitialisation
    try {
      await emailService.sendPasswordResetEmail(
        user.email,
        user.fullName || '',
        resetToken
      )
      
      console.log(`Password reset email sent to: ${user.email}`)
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
      
      // Nettoyer le token si l'email échoue
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetTokenExpiry: null
        }
      })
      
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Si cet email existe dans notre système, vous recevrez un lien de réinitialisation.'
    })

  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}