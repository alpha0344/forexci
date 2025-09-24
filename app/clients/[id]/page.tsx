"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  PhoneIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import EditClientModal from "@/components/EditClientModal";
import AddEquipmentModal from "@/components/AddEquipmentModal";
import EditEquipmentModal from "@/components/EditEquipmentModal";
import UpdateVerificationModal from "@/components/UpdateVerificationModal";
import {
  isEquipmentValid,
  isControlValid,
  type EquipmentWithMaterial,
} from "@/lib/equipmentValidation";

// Types basés sur votre schéma Prisma
interface Material {
  id: string;
  type: "PA" | "PP" | "ALARM" | "CO2";
  validityTime: number;
  timeBeforeControl: number;
  timeBeforeReload?: number | null;
}

interface ClientEquipment {
  id: string;
  number: number;
  commissioningDate: string;
  lastVerificationDate?: string | null;
  lastRechargeDate?: string | null;
  rechargeType?: "WATER_ADD" | "POWDER" | null;
  volume?: number | null;
  notes?: string | null;
  material: Material;
}

interface Client {
  id: string;
  name: string;
  location: string;
  contactName: string;
  email?: string | null;
  phone?: string | null;
  equipments: ClientEquipment[];
  createdAt: string;
  updatedAt: string;
}

/**
 * ============================================================================
 * HELPER FUNCTIONS POUR LES STYLES DES ÉQUIPEMENTS - VALIDITÉ ET CONTRÔLE
 * ============================================================================
 */

/**
 * Détermine le statut de validité d'un équipement
 */
const getEquipmentValidityStatus = (equipment: ClientEquipment) => {
  const commissioningDate = new Date(equipment.commissioningDate);
  const validityDays = equipment.material.validityTime;
  const expirationDate = new Date(
    commissioningDate.getTime() + validityDays * 24 * 60 * 60 * 1000,
  );
  const today = new Date();

  const isExpired = expirationDate < today;
  const daysDifference = Math.ceil(
    Math.abs(expirationDate.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const isSoon = !isExpired && daysDifference <= 30;

  return {
    isExpired,
    isSoon,
    daysDifference,
    expirationDate,
    isValid: !isExpired,
  };
};

/**
 * Détermine le statut de contrôle d'un équipement
 */
const getEquipmentControlStatus = (equipment: ClientEquipment) => {
  const commissioningDate = new Date(equipment.commissioningDate);
  const today = new Date();

  let nextControlDate: Date;

  if (equipment.lastVerificationDate) {
    const lastVerif = new Date(equipment.lastVerificationDate);
    nextControlDate = new Date(
      lastVerif.getTime() +
        equipment.material.timeBeforeControl * 24 * 60 * 60 * 1000,
    );
  } else {
    nextControlDate = new Date(
      commissioningDate.getTime() +
        equipment.material.timeBeforeControl * 24 * 60 * 60 * 1000,
    );
  }

  const isExpired = nextControlDate < today;
  const daysDifference = Math.ceil(
    Math.abs(nextControlDate.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const isSoon = !isExpired && daysDifference <= 30;

  return {
    isExpired,
    isSoon,
    daysDifference,
    nextControlDate,
    isValid: !isExpired,
    hasNeverBeenControlled: !equipment.lastVerificationDate,
  };
};

/**
 * Détermine le statut de recharge d'un équipement PA
 */
const getEquipmentRechargeStatus = (equipment: ClientEquipment) => {
  // Vérifier si l'équipement est de type PA et a un timeBeforeReload défini
  if (
    equipment.material.type !== "PA" ||
    !equipment.material.timeBeforeReload
  ) {
    return {
      isApplicable: false,
      isExpired: false,
      isSoon: false,
      daysDifference: 0,
      nextRechargeDate: null,
      isValid: true,
      hasNeverBeenRecharged: false,
    };
  }

  const commissioningDate = new Date(equipment.commissioningDate);
  const today = new Date();

  let nextRechargeDate: Date;

  if (equipment.lastRechargeDate) {
    const lastRecharge = new Date(equipment.lastRechargeDate);
    nextRechargeDate = new Date(
      lastRecharge.getTime() +
        equipment.material.timeBeforeReload * 24 * 60 * 60 * 1000,
    );
  } else {
    nextRechargeDate = new Date(
      commissioningDate.getTime() +
        equipment.material.timeBeforeReload * 24 * 60 * 60 * 1000,
    );
  }

  const isExpired = nextRechargeDate < today;
  const daysDifference = Math.ceil(
    Math.abs(nextRechargeDate.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const isSoon = !isExpired && daysDifference <= 30;

  return {
    isApplicable: true,
    isExpired,
    isSoon,
    daysDifference,
    nextRechargeDate,
    isValid: !isExpired,
    hasNeverBeenRecharged: !equipment.lastRechargeDate,
  };
};

/**
 * Détermine le statut global d'un équipement
 */
const getEquipmentGlobalStatus = (equipment: ClientEquipment) => {
  const validityStatus = getEquipmentValidityStatus(equipment);
  const controlStatus = getEquipmentControlStatus(equipment);
  const rechargeStatus = getEquipmentRechargeStatus(equipment);

  let priority = "normal";
  let statusType = "valid";

  // Priorité 1 (Critique) : Validité expirée
  if (validityStatus.isExpired) {
    priority = "critical";
    statusType = "validity-expired";
  }
  // Priorité 2 (Important) : Contrôle expiré ou recharge expirée (PA uniquement)
  else if (controlStatus.isExpired) {
    priority = "important";
    statusType = "control-expired";
  } else if (rechargeStatus.isApplicable && rechargeStatus.isExpired) {
    priority = "important";
    statusType = "recharge-expired";
  }
  // Priorité 3 (Modéré) : Validité bientôt expirée
  else if (validityStatus.isSoon) {
    priority = "moderate";
    statusType = "validity-soon";
  }
  // Priorité 4 (Attention) : Contrôle ou recharge bientôt dus
  else if (controlStatus.isSoon) {
    priority = "attention";
    statusType = "control-soon";
  } else if (rechargeStatus.isApplicable && rechargeStatus.isSoon) {
    priority = "attention";
    statusType = "recharge-soon";
  }

  return {
    validity: validityStatus,
    control: controlStatus,
    recharge: rechargeStatus,
    priority,
    statusType,
  };
};

/**
 * Classes CSS pour le nom selon le statut global
 */
const getEquipmentNameClasses = (equipment: ClientEquipment): string => {
  const globalStatus = getEquipmentGlobalStatus(equipment);

  if (
    globalStatus.priority === "critical" ||
    globalStatus.priority === "important"
  ) {
    return "text-red-600 font-semibold";
  }

  if (globalStatus.priority === "moderate") {
    return "text-yellow-600 font-semibold";
  }

  if (globalStatus.priority === "attention") {
    return "text-orange-600 font-medium";
  }

  return "text-gray-900";
};

/**
 * Classes CSS pour la card selon le statut global
 */
const getEquipmentCardClasses = (equipment: ClientEquipment): string => {
  const baseClasses = "bg-white rounded-lg shadow-sm border p-6";
  const globalStatus = getEquipmentGlobalStatus(equipment);

  if (
    globalStatus.priority === "critical" ||
    globalStatus.priority === "important"
  ) {
    return `${baseClasses} border-red-300 bg-red-50/30`;
  }

  if (globalStatus.priority === "moderate") {
    return `${baseClasses} border-yellow-300 bg-yellow-50/30`;
  }

  if (globalStatus.priority === "attention") {
    return `${baseClasses} border-orange-300 bg-orange-50/30`;
  }

  return `${baseClasses} border-gray-200`;
};

/**
 * ============================================================================
 * COMPOSANTS
 * ============================================================================
 */

/**
 * Composant Card pour les informations client
 */
interface ClientInfoCardProps {
  client: Client;
  onEdit: () => void;
}

const ClientInfoCard: React.FC<ClientInfoCardProps> = ({ client, onEdit }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Informations Client
        </h2>
        <button
          onClick={onEdit}
          className="inline-flex items-center p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Modifier les informations"
        >
          <PencilIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Entreprise</p>
              <p className="text-gray-900">{client.name}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Localisation</p>
              <p className="text-gray-900">{client.location}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-gray-900">{client.email || "Non renseigné"}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">
                Contact principal
              </p>
              <p className="text-gray-900">{client.contactName}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Téléphone</p>
              <p className="text-gray-900">{client.phone || "Non renseigné"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 text-sm text-gray-500">
          <CalendarIcon className="h-4 w-4" />
          <span>
            Client depuis le{" "}
            {new Date(client.createdAt).toLocaleDateString("fr-FR")}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Composant pour les statistiques
 */
interface EquipmentStatsProps {
  equipments: ClientEquipment[];
}

const EquipmentStats: React.FC<EquipmentStatsProps> = ({ equipments }) => {
  const stats = {
    total: equipments.length,
    validityExpired: equipments.filter((eq) => {
      const status = getEquipmentValidityStatus(eq);
      return status.isExpired;
    }).length,
    controlExpired: equipments.filter((eq) => {
      const status = getEquipmentControlStatus(eq);
      return status.isExpired;
    }).length,
    rechargeExpired: equipments.filter((eq) => {
      const status = getEquipmentRechargeStatus(eq);
      return status.isApplicable && status.isExpired;
    }).length,
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 text-center">
        <p className="text-xl sm:text-2xl font-bold text-gray-900">
          {stats.total}
        </p>
        <p className="text-xs sm:text-sm text-gray-500">Total équipements</p>
      </div>
      <div className="bg-red-50 rounded-lg border border-red-200 p-3 sm:p-4 text-center">
        <p className="text-xl sm:text-2xl font-bold text-red-900">
          {stats.validityExpired}
        </p>
        <p className="text-xs sm:text-sm text-red-600">Matériels expirés</p>
      </div>
      <div className="bg-orange-50 rounded-lg border border-orange-200 p-3 sm:p-4 text-center">
        <p className="text-xl sm:text-2xl font-bold text-orange-900">
          {stats.controlExpired}
        </p>
        <p className="text-xs sm:text-sm text-orange-600">
          Contrôles en retard
        </p>
      </div>
      <div className="bg-purple-50 rounded-lg border border-purple-200 p-3 sm:p-4 text-center">
        <p className="text-xl sm:text-2xl font-bold text-purple-900">
          {stats.rechargeExpired}
        </p>
        <p className="text-xs sm:text-sm text-purple-600">
          Recharges en retard
        </p>
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * COMPOSANT PRINCIPAL
 * ============================================================================
 */
export default function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddEquipmentModalOpen, setIsAddEquipmentModalOpen] = useState(false);
  const [isEditEquipmentModalOpen, setIsEditEquipmentModalOpen] =
    useState(false);
  const [isUpdateVerificationModalOpen, setIsUpdateVerificationModalOpen] =
    useState(false);
  const [equipmentToEdit, setEquipmentToEdit] =
    useState<ClientEquipment | null>(null);

  // Optimisation performances
  const equipmentStatuses = useMemo(() => {
    if (!client?.equipments) return new Map();

    const statusMap = new Map();

    client.equipments.forEach((equipment) => {
      const globalStatus = getEquipmentGlobalStatus(equipment);

      statusMap.set(equipment.id, {
        global: globalStatus,
        validity: globalStatus.validity,
        control: globalStatus.control,
        recharge: globalStatus.recharge,
        nameClasses: getEquipmentNameClasses(equipment),
        cardClasses: getEquipmentCardClasses(equipment),
      });
    });

    return statusMap;
  }, [client?.equipments]);

  // Charger les données du client
  const fetchClient = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/clients/${params.id}`);
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setError("Client non trouvé");
        } else {
          throw new Error(
            result.error || "Erreur lors du chargement du client",
          );
        }
        return;
      }

      setClient(result.data);
    } catch (error) {
      console.error("Erreur lors du chargement du client:", error);
      setError(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClient();
  }, [params.id]);

  // Gestionnaires d'événements
  const handleEditClient = () => {
    setIsEditModalOpen(true);
  };

  const handleClientUpdated = (updatedClient: any) => {
    const clientWithEquipments = {
      ...updatedClient,
      equipments: updatedClient.equipments || client?.equipments || [],
    };
    setClient(clientWithEquipments);
  };

  const handleAddEquipment = () => {
    setIsAddEquipmentModalOpen(true);
  };

  const handleEquipmentAdded = (newEquipment: ClientEquipment) => {
    if (client) {
      setClient({
        ...client,
        equipments: [...client.equipments, newEquipment],
      });
    }
  };

  const handleEditEquipment = (equipmentId: string) => {
    const equipment = client?.equipments.find((eq) => eq.id === equipmentId);
    if (equipment) {
      setEquipmentToEdit(equipment);
      setIsEditEquipmentModalOpen(true);
    }
  };

  const handleEquipmentUpdated = (updatedEquipment: ClientEquipment) => {
    if (client) {
      setClient({
        ...client,
        equipments: client.equipments.map((eq) =>
          eq.id === updatedEquipment.id ? updatedEquipment : eq,
        ),
      });
    }
  };

  const handleUpdateVerifications = () => {
    setIsUpdateVerificationModalOpen(true);
  };

  const handleVerificationUpdated = () => {
    console.log("Verification updated - modal en cours");
  };

  const handleVerificationCompleted = () => {
    fetchClient();
    setIsUpdateVerificationModalOpen(false);
  };

  const handleDeleteEquipment = async (equipmentId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet équipement ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/equipments/${equipmentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchClient();
      } else {
        const result = await response.json();
        alert(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'équipement:", error);
      alert("Erreur lors de la suppression de l'équipement");
    }
  };

  const handleDeleteClient = async () => {
    if (!client) return;

    if (client.equipments.length > 0) {
      alert("Impossible de supprimer un client qui possède des équipements.");
      return;
    }

    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/clients/${params.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/clients");
      } else {
        const result = await response.json();
        alert(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression du client");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center">
              <svg
                className="animate-spin h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p className="ml-3 text-gray-600">Chargement du client...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-12">
              <p className="text-red-600 text-lg mb-2">Erreur</p>
              <p className="text-gray-500 mb-4">{error}</p>
              <div className="space-x-4">
                <button
                  onClick={fetchClient}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Réessayer
                </button>
                <Link
                  href="/clients"
                  className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Retour à la liste
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* En-tête avec navigation */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Link
                href="/clients"
                className="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                  {client.name}
                </h1>
                <p className="text-gray-600 text-sm sm:text-base truncate">
                  {client.location}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleEditClient}
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Modifier
              </button>
              <button
                onClick={handleDeleteClient}
                disabled={client.equipments.length > 0}
                className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={
                  client.equipments.length > 0
                    ? "Supprimez d'abord tous les équipements"
                    : "Supprimer le client"
                }
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Supprimer</span>
                <span className="sm:hidden">Suppr.</span>
              </button>
            </div>
          </div>
        </div>

        {/* Informations client */}
        <div className="mb-6 sm:mb-8">
          <ClientInfoCard client={client} onEdit={handleEditClient} />
        </div>

        {/* Bouton de mise à jour des vérifications */}
        {client.equipments.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">
                    Mise à jour des vérifications
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Mettre à jour la date de dernière vérification de tous les
                    équipements en une seule fois
                  </p>
                </div>
                <button
                  onClick={handleUpdateVerifications}
                  className="inline-flex items-center justify-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">
                    Mettre à jour toutes les vérifications
                  </span>
                  <span className="sm:hidden">Mettre à jour</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistiques des équipements */}
        <div className="mb-6 sm:mb-8">
          <EquipmentStats equipments={client.equipments} />
        </div>

        {/* Section équipements */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Équipements ({client.equipments.length})
            </h2>
            <button
              onClick={handleAddEquipment}
              className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Ajouter un équipement</span>
              <span className="sm:hidden">Ajouter</span>
            </button>
          </div>

          {client.equipments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-12 text-center">
              <p className="text-gray-500 text-lg mb-2">Aucun équipement</p>
              <p className="text-gray-400 mb-4 text-sm sm:text-base">
                Ce client n'a pas encore d'équipement enregistré
              </p>
              <button
                onClick={handleAddEquipment}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Ajouter le premier équipement
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6">
              {client.equipments.map((equipment) => {
                const status = equipmentStatuses.get(equipment.id);
                return (
                  <div
                    key={equipment.id}
                    className={
                      status?.cardClasses || getEquipmentCardClasses(equipment)
                    }
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3
                          className={`text-lg font-medium ${
                            status?.nameClasses ||
                            getEquipmentNameClasses(equipment)
                          }`}
                        >
                          Équipement #{equipment.number}
                          {/* Badges de statut */}
                          {status?.global && (
                            <>
                              {status.global.statusType ===
                                "validity-expired" && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  ⚠️ Matériel expiré
                                </span>
                              )}
                              {status.global.statusType ===
                                "control-expired" && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  🔍 Contrôle en retard
                                </span>
                              )}
                              {status.global.statusType === "validity-soon" && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                  📅 Expire bientôt
                                </span>
                              )}
                              {status.global.statusType === "control-soon" && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                  📋 Contrôle bientôt
                                </span>
                              )}
                              {status.global.statusType ===
                                "recharge-expired" && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                  🔋 Recharge en retard
                                </span>
                              )}
                              {status.global.statusType === "recharge-soon" && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                  ⚡ Recharge bientôt
                                </span>
                              )}
                            </>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Type: {equipment.material.type}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          equipment.material.type === "PA"
                            ? "bg-blue-100 text-blue-800"
                            : equipment.material.type === "PP"
                              ? "bg-green-100 text-green-800"
                              : equipment.material.type === "CO2"
                                ? "bg-purple-100 text-purple-800"
                              : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {equipment.material.type}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      {/* Affichage conditionnel selon le type d'équipement */}
                      {equipment.material.type === "PA" && (
                        /* Affichage pour les équipements PA - Prochaine recharge */
                        <div>
                          <span className="text-gray-500">
                            Prochaine recharge:
                          </span>
                          <span
                            className={`ml-2 font-medium ${
                              status?.recharge?.isExpired
                                ? "text-red-600"
                                : status?.recharge?.isSoon
                                  ? "text-yellow-600"
                                  : "text-green-600"
                            }`}
                          >
                            {status?.recharge?.isApplicable &&
                            status?.recharge?.nextRechargeDate
                              ? new Date(
                                  status.recharge.nextRechargeDate,
                                ).toLocaleDateString("fr-FR")
                              : "Non applicable"}
                            {status?.recharge?.isExpired && (
                              <span className="text-red-600 text-xs ml-1">
                                (en retard de {status.recharge.daysDifference}{" "}
                                j)
                              </span>
                            )}
                            {status?.recharge?.isSoon && (
                              <span className="text-yellow-600 text-xs ml-1">
                                (dans {status.recharge.daysDifference} j)
                              </span>
                            )}
                          </span>
                        </div>
                      )}

                      {/* Informations de validité */}
                      <div>
                        <span className="text-gray-500">
                          Validité matériel:
                        </span>
                        <span
                          className={`ml-2 font-medium ${
                            status?.validity?.isExpired
                              ? "text-red-600"
                              : status?.validity?.isSoon
                                ? "text-yellow-600"
                                : "text-green-600"
                          }`}
                        >
                          {status?.validity?.expirationDate
                            ? new Date(
                                status.validity.expirationDate,
                              ).toLocaleDateString("fr-FR")
                            : "Non calculée"}
                          {status?.validity?.isExpired && (
                            <span className="text-red-600 text-xs ml-1">
                              (expiré il y a {status.validity.daysDifference} j)
                            </span>
                          )}
                          {status?.validity?.isSoon && (
                            <span className="text-yellow-600 text-xs ml-1">
                              (expire dans {status.validity.daysDifference} j)
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Informations de contrôle */}
                      <div>
                        <span className="text-gray-500">
                          Prochain contrôle:
                        </span>
                        <span
                          className={`ml-2 font-medium ${
                            status?.control?.isExpired
                              ? "text-red-600"
                              : status?.control?.isSoon
                                ? "text-yellow-600"
                                : "text-green-600"
                          }`}
                        >
                          {status?.control?.nextControlDate
                            ? new Date(
                                status.control.nextControlDate,
                              ).toLocaleDateString("fr-FR")
                            : "Non calculé"}
                          {status?.control?.isExpired && (
                            <span className="text-red-600 text-xs ml-1">
                              (en retard de {status.control.daysDifference} j)
                            </span>
                          )}
                          {status?.control?.isSoon && (
                            <span className="text-yellow-600 text-xs ml-1">
                              (dans {status.control.daysDifference} j)
                            </span>
                          )}
                        </span>
                      </div>

                      {equipment.volume && (
                        <div>
                          <span className="text-gray-500">Volume:</span>
                          <span className="ml-2 text-gray-900">
                            {equipment.volume}L
                          </span>
                        </div>
                      )}

                      {equipment.notes && (
                        <div>
                          <span className="text-gray-500">Notes:</span>
                          <p className="text-gray-900 text-xs mt-1">
                            {equipment.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditEquipment(equipment.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteEquipment(equipment.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EditClientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        client={client}
        onClientUpdated={handleClientUpdated}
      />

      <AddEquipmentModal
        isOpen={isAddEquipmentModalOpen}
        onClose={() => setIsAddEquipmentModalOpen(false)}
        clientId={params.id}
        onEquipmentAdded={handleEquipmentAdded}
      />

      <EditEquipmentModal
        isOpen={isEditEquipmentModalOpen}
        onClose={() => {
          setIsEditEquipmentModalOpen(false);
          setEquipmentToEdit(null);
        }}
        equipment={equipmentToEdit}
        onEquipmentUpdated={handleEquipmentUpdated}
      />

      <UpdateVerificationModal
        isOpen={isUpdateVerificationModalOpen}
        onClose={handleVerificationCompleted}
        clientId={params.id}
        clientName={client.name}
        equipments={client.equipments}
        onVerificationUpdated={handleVerificationUpdated}
      />
    </div>
  );
}
