import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Schéma de validation pour la création d'un équipement
const createEquipmentSchema = z.object({
  materialId: z.string().min(1, "Le matériel est requis"),
  number: z.number().int().positive("Le numéro doit être un entier positif"),
  commissioningDate: z.string().datetime("Date de mise en service invalide"),
  lastVerificationDate: z.string().datetime().optional(),
  lastRechargeDate: z.string().datetime().optional(),
  rechargeType: z.enum(["WATER_ADD", "POWDER"]).optional(),
  volume: z.number().int().positive().optional(),
  notes: z
    .string()
    .max(500, "Les notes ne peuvent pas dépasser 500 caractères")
    .optional(),
});

/**
 * GET /api/clients/[id]/equipments
 * Récupère tous les équipements d'un client
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID client requis" },
        { status: 400 },
      );
    }

    // Vérifier que le client existe
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client non trouvé" },
        { status: 404 },
      );
    }

    // Récupérer les équipements du client
    const equipments = await prisma.clientEquipment.findMany({
      where: { clientId: id },
      include: {
        material: true,
      },
      orderBy: {
        commissioningDate: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: equipments,
      message: "Équipements récupérés avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des équipements:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération des équipements",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/clients/[id]/equipments
 * Ajoute un nouvel équipement au client
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID client requis" },
        { status: 400 },
      );
    }

    // Validation des données
    const validationResult = createEquipmentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Données de validation invalides",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    // Vérifier que le client existe
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client non trouvé" },
        { status: 404 },
      );
    }

    const {
      materialId,
      number,
      commissioningDate,
      lastVerificationDate,
      lastRechargeDate,
      rechargeType,
      volume,
      notes,
    } = validationResult.data;

    // Vérifier que le matériel existe
    const material = await prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!material) {
      return NextResponse.json(
        { success: false, error: "Matériel non trouvé" },
        { status: 404 },
      );
    }

    // Créer le nouvel équipement
    const newEquipment = await prisma.clientEquipment.create({
      data: {
        clientId: id,
        materialId,
        number,
        commissioningDate: new Date(commissioningDate),
        lastVerificationDate: lastVerificationDate
          ? new Date(lastVerificationDate)
          : null,
        lastRechargeDate: lastRechargeDate ? new Date(lastRechargeDate) : null,
        rechargeType: rechargeType || null,
        volume: volume || null,
        notes: notes?.trim() || null,
      },
      include: {
        material: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newEquipment,
        message: "Équipement ajouté avec succès",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erreur lors de la création de l'équipement:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la création de l'équipement",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    );
  }
}
