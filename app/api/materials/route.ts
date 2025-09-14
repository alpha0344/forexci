import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Récupérer tous les matériaux
export async function GET() {
    try {
        const materials = await prisma.material.findMany({
            orderBy: { type: 'asc' }
        })

        return NextResponse.json({
            success: true,
            materials
        })
    } catch (error) {
        console.error('Erreur lors de la récupération des matériaux:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des matériaux' },
            { status: 500 }
        )
    }
}