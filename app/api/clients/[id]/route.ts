import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Schéma de validation pour la mise à jour d'un client
const updateClientSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .optional(),
  location: z
    .string()
    .min(1, "La localisation est requise")
    .max(200, "La localisation ne peut pas dépasser 200 caractères")
    .optional(),
  contactName: z
    .string()
    .min(1, "Le nom de contact est requis")
    .max(100, "Le nom de contact ne peut pas dépasser 100 caractères")
    .optional(),
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
 * GET /api/clients/[id]
 * Récupère un client spécifique avec tous ses équipements
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

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        equipments: {
          include: {
            material: true,
          },
          orderBy: {
            commissioningDate: "desc",
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client non trouvé" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: client,
      message: "Client récupéré avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du client:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération du client",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/clients/[id]
 * Met à jour les informations d'un client
 */
export async function PUT(
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
    const validationResult = updateClientSchema.safeParse(body);

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
    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return NextResponse.json(
        { success: false, error: "Client non trouvé" },
        { status: 404 },
      );
    }

    const updateData = validationResult.data;

    // Nettoyer les données
    if (updateData.name) updateData.name = updateData.name.trim();
    if (updateData.location) updateData.location = updateData.location.trim();
    if (updateData.contactName)
      updateData.contactName = updateData.contactName.trim();
    if (updateData.phone !== undefined) {
      updateData.phone = updateData.phone ? updateData.phone.trim() : undefined;
    }

    // Vérifier si un autre client avec le même nom et localisation existe déjà
    if (updateData.name && updateData.location) {
      const duplicateClient = await prisma.client.findFirst({
        where: {
          AND: [
            { name: updateData.name },
            { location: updateData.location },
            { id: { not: id } }, // Exclure le client actuel
          ],
        },
      });

      if (duplicateClient) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Un autre client avec ce nom et cette localisation existe déjà",
          },
          { status: 409 },
        );
      }
    }

    // Mettre à jour le client
    const updatedClient = await prisma.client.update({
      where: { id },
      data: updateData,
      include: {
        equipments: {
          include: {
            material: true,
          },
          orderBy: {
            commissioningDate: "desc",
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedClient,
      message: "Client mis à jour avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du client:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la mise à jour du client",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/clients/[id]
 * Supprime un client (seulement s'il n'a pas d'équipements)
 */
export async function DELETE(
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
    const existingClient = await prisma.client.findUnique({
      where: { id },
      include: {
        equipments: true,
      },
    });

    if (!existingClient) {
      return NextResponse.json(
        { success: false, error: "Client non trouvé" },
        { status: 404 },
      );
    }

    // Vérifier qu'il n'y a pas d'équipements associés
    if (existingClient.equipments.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Impossible de supprimer un client qui possède des équipements. Supprimez d'abord tous les équipements.",
        },
        { status: 409 },
      );
    }

    // Supprimer le client
    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Client supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du client:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la suppression du client",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    );
  }
}
