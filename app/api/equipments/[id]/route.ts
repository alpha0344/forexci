import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schéma de validation pour la mise à jour d'un équipement
const updateEquipmentSchema = z.object({
  number: z.number().int().positive('Le numéro doit être un entier positif').optional(),
  commissioningDate: z.string().datetime('Date de mise en service invalide').optional(),
  lastVerificationDate: z.string().datetime().optional(),
  lastRechargeDate: z.string().datetime().optional(),
  rechargeType: z.enum(['WATER_ADD', 'POWDER']).optional(),
  volume: z.number().int().positive().optional(),
  notes: z.string().max(500, 'Les notes ne peuvent pas dépasser 500 caractères').optional()
});

/**
 * GET /api/equipments/[id]
 * Récupère un équipement spécifique
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID équipement requis' },
        { status: 400 }
      );
    }

    const equipment = await prisma.clientEquipment.findUnique({
      where: { id },
      include: {
        material: true,
        client: true
      }
    });

    if (!equipment) {
      return NextResponse.json(
        { success: false, error: 'Équipement non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: equipment,
      message: 'Équipement récupéré avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'équipement:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération de l\'équipement',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/equipments/[id]
 * Met à jour un équipement
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID équipement requis' },
        { status: 400 }
      );
    }

    // Validation des données
    const validationResult = updateEquipmentSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Données de validation invalides',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    // Vérifier que l'équipement existe
    const existingEquipment = await prisma.clientEquipment.findUnique({
      where: { id }
    });

    if (!existingEquipment) {
      return NextResponse.json(
        { success: false, error: 'Équipement non trouvé' },
        { status: 404 }
      );
    }

    const updateData = validationResult.data;

    // Si le numéro change, vérifier qu'il n'est pas déjà utilisé
    if (updateData.number && updateData.number !== existingEquipment.number) {
      const duplicateEquipment = await prisma.clientEquipment.findFirst({
        where: {
          clientId: existingEquipment.clientId,
          number: updateData.number,
          id: { not: id }
        }
      });

      if (duplicateEquipment) {
        return NextResponse.json(
          {
            success: false,
            error: `Un équipement avec le numéro ${updateData.number} existe déjà pour ce client`
          },
          { status: 409 }
        );
      }
    }

    // Préparer les données de mise à jour
    const dataToUpdate: any = {};

    if (updateData.number !== undefined) dataToUpdate.number = updateData.number;
    if (updateData.commissioningDate) dataToUpdate.commissioningDate = new Date(updateData.commissioningDate);
    if (updateData.lastVerificationDate !== undefined) {
      dataToUpdate.lastVerificationDate = updateData.lastVerificationDate ? new Date(updateData.lastVerificationDate) : null;
    }
    if (updateData.lastRechargeDate !== undefined) {
      dataToUpdate.lastRechargeDate = updateData.lastRechargeDate ? new Date(updateData.lastRechargeDate) : null;
    }
    if (updateData.rechargeType !== undefined) dataToUpdate.rechargeType = updateData.rechargeType || null;
    if (updateData.volume !== undefined) dataToUpdate.volume = updateData.volume || null;
    if (updateData.notes !== undefined) dataToUpdate.notes = updateData.notes?.trim() || null;

    // Mettre à jour l'équipement
    const updatedEquipment = await prisma.clientEquipment.update({
      where: { id },
      data: dataToUpdate,
      include: {
        material: true,
        client: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedEquipment,
      message: 'Équipement mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'équipement:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la mise à jour de l\'équipement',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/equipments/[id]
 * Supprime un équipement
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID équipement requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'équipement existe
    const existingEquipment = await prisma.clientEquipment.findUnique({
      where: { id }
    });

    if (!existingEquipment) {
      return NextResponse.json(
        { success: false, error: 'Équipement non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer l'équipement
    await prisma.clientEquipment.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Équipement supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'équipement:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la suppression de l\'équipement',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}