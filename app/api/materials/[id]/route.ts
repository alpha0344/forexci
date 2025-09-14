import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MaterialType } from '@/types/material'

// GET - Récupérer un matériau par ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const material = await prisma.material.findUnique({
            where: { id: params.id }
        })

        if (!material) {
            return NextResponse.json(
                { error: 'Matériau non trouvé' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            material
        })
    } catch (error) {
        console.error('Erreur lors de la récupération du matériau:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la récupération du matériau' },
            { status: 500 }
        )
    }
}

// PUT - Mettre à jour un matériau
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const { type, validityTime, timeBeforeControl, timeBeforeReload } = body

        // Vérifier que le matériau existe
        const existingMaterial = await prisma.material.findUnique({
            where: { id: params.id }
        })

        if (!existingMaterial) {
            return NextResponse.json(
                { error: 'Matériau non trouvé' },
                { status: 404 }
            )
        }

        // Validation des champs obligatoires
        if (!type || !validityTime || !timeBeforeControl) {
            return NextResponse.json(
                { error: 'Le type, le temps de validité et le temps avant contrôle sont obligatoires' },
                { status: 400 }
            )
        }

        // Validation du type de matériel
        if (!Object.values(MaterialType).includes(type)) {
            return NextResponse.json(
                { error: 'Type de matériel invalide' },
                { status: 400 }
            )
        }

        // Vérifier qu'on ne change pas vers un type qui existe déjà
        if (existingMaterial.type !== type) {
            const conflictingMaterial = await prisma.material.findFirst({
                where: {
                    type,
                    id: { not: params.id }
                }
            })

            if (conflictingMaterial) {
                return NextResponse.json(
                    { error: `Un template ${type} existe déjà. Vous ne pouvez avoir qu'un seul template par type.` },
                    { status: 409 }
                )
            }
        }

        // Validation des valeurs numériques
        if (validityTime <= 0) {
            return NextResponse.json(
                { error: 'Le temps de validité doit être positif' },
                { status: 400 }
            )
        }

        if (timeBeforeControl <= 0) {
            return NextResponse.json(
                { error: 'Le temps avant contrôle doit être positif' },
                { status: 400 }
            )
        }

        if (timeBeforeReload !== null && timeBeforeReload !== undefined && timeBeforeReload <= 0) {
            return NextResponse.json(
                { error: 'Le temps avant recharge doit être positif' },
                { status: 400 }
            )
        }

        const material = await prisma.material.update({
            where: { id: params.id },
            data: {
                type,
                validityTime: parseInt(validityTime),
                timeBeforeControl: parseInt(timeBeforeControl),
                timeBeforeReload: timeBeforeReload ? parseInt(timeBeforeReload) : null
            }
        })

        return NextResponse.json({
            success: true,
            material
        })

    } catch (error) {
        console.error('Erreur lors de la mise à jour du matériau:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la mise à jour du matériau' },
            { status: 500 }
        )
    }
}