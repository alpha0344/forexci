import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/materials
 * Récupère tous les matériaux disponibles
 */
export async function GET() {
    try {
        const materials = await prisma.material.findMany({
            orderBy: { type: 'asc' }
        });

        return NextResponse.json({
            success: true,
            data: materials,
            message: 'Matériaux récupérés avec succès'
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des matériaux:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erreur lors de la récupération des matériaux',
                details: process.env.NODE_ENV === 'development' ? error : undefined
            },
            { status: 500 }
        );
    }
}