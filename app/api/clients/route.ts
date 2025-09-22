import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Schéma de validation pour la création d'un client
const createClientSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  location: z
    .string()
    .min(1, "La localisation est requise")
    .max(200, "La localisation ne peut pas dépasser 200 caractères"),
  contactName: z
    .string()
    .min(1, "Le nom de contact est requis")
    .max(100, "Le nom de contact ne peut pas dépasser 100 caractères"),
  phone: z
    .string()
    .optional()
    .refine((phone: string | undefined) => {
      if (!phone) return true; // Téléphone optionnel
      // Validation basique du format français
      const phoneRegex = /^(?:\+33|0)[1-9](?:[0-9]{8})$/;
      return phoneRegex.test(phone.replace(/\s/g, ""));
    }, "Format de téléphone invalide"),
});

/**
 * GET /api/clients
 * Récupère tous les clients avec leurs équipements
 */
export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      include: {
        equipments: {
          include: {
            material: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: clients,
      message: "Clients récupérés avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des clients:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération des clients",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/clients
 * Crée un nouveau client
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation des données
    const validationResult = createClientSchema.safeParse(body);

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

    const { name, location, contactName, phone } = validationResult.data;

    // Vérifier si un client avec le même nom et localisation existe déjà
    const existingClient = await prisma.client.findFirst({
      where: {
        AND: [{ name: name }, { location: location }],
      },
    });

    if (existingClient) {
      return NextResponse.json(
        {
          success: false,
          error: "Un client avec ce nom et cette localisation existe déjà",
        },
        { status: 409 },
      );
    }

    // Créer le nouveau client
    const newClient = await prisma.client.create({
      data: {
        name: name.trim(),
        location: location.trim(),
        contactName: contactName.trim(),
        ...(phone && { phone: phone.trim() }),
      },
      include: {
        equipments: {
          include: {
            material: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newClient,
        message: "Client créé avec succès",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erreur lors de la création du client:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la création du client",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    );
  }
}
