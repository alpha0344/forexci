"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  EyeIcon,
  UserGroupIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import AddClientModal from "@/components/AddClientModal";

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
  phone?: string | null;
  equipments: ClientEquipment[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Composant Card réutilisable pour les statistiques
 */
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  variant?: "default" | "warning" | "danger";
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  variant = "default",
  subtitle,
}) => {
  const baseClasses =
    "rounded-lg p-4 sm:p-6 shadow-sm border transition-all duration-200 hover:shadow-md";
  const variantClasses = {
    default: "bg-white border-gray-200",
    warning: "bg-orange-50 border-orange-200",
    danger: "bg-red-50 border-red-200",
  };

  const iconClasses = {
    default: "text-blue-600",
    warning: "text-orange-600",
    danger: "text-red-600",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1 leading-tight">
              {subtitle}
            </p>
          )}
        </div>
        <Icon
          className={`h-6 w-6 sm:h-8 sm:w-8 ${iconClasses[variant]} flex-shrink-0 ml-3`}
        />
      </div>
    </div>
  );
};

/**
 * Composant Table responsive pour la liste des clients
 */
interface ClientTableProps {
  clients: Client[];
}

const ClientTable: React.FC<ClientTableProps> = ({ clients }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header du tableau - masqué sur mobile */}
      <div className="hidden md:grid md:grid-cols-5 bg-gray-50 px-6 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider">
        <div>Client / Entreprise</div>
        <div>Contact</div>
        <div>Téléphone</div>
        <div>Matériels</div>
        <div className="text-center">Actions</div>
      </div>

      {/* Corps du tableau */}
      <div className="divide-y divide-gray-200">
        {clients.map((client) => (
          <div
            key={client.id}
            className="grid grid-cols-1 md:grid-cols-5 gap-4 p-6 hover:bg-gray-50 transition-colors"
          >
            {/* Nom et localisation */}
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-900">{client.name}</h3>
              <p className="text-sm text-gray-500">{client.location}</p>
            </div>

            {/* Contact - responsive */}
            <div className="space-y-1">
              <span className="md:hidden text-sm font-medium text-gray-500">
                Contact:
              </span>
              <p className="text-gray-900">{client.contactName}</p>
            </div>

            {/* Téléphone - responsive */}
            <div className="space-y-1">
              <span className="md:hidden text-sm font-medium text-gray-500">
                Téléphone:
              </span>
              <p className="text-gray-900">{client.phone || "Non renseigné"}</p>
            </div>

            {/* Nombre de matériels - responsive */}
            <div className="space-y-1">
              <span className="md:hidden text-sm font-medium text-gray-500">
                Matériels:
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {client.equipments.length} équipement
                {client.equipments.length > 1 ? "s" : ""}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center md:justify-center">
              <Link
                href={`/clients/${client.id}`}
                className="inline-flex items-center p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                title="Voir les détails"
              >
                <EyeIcon className="h-5 w-5" />
                <span className="ml-2 md:hidden group-hover:text-blue-600">
                  Voir détails
                </span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Page principale de gestion des clients
 */
export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Charger les clients depuis l'API
  const fetchClients = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/clients");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Erreur lors du chargement des clients",
        );
      }

      setClients(result.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des clients:", error);
      setError(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les clients au montage du composant
  useEffect(() => {
    fetchClients();
  }, []);

  // Gestionnaire d'ajout de client
  const handleClientAdded = (newClient: Client) => {
    setClients((prev) => [newClient, ...prev]);
  };

  // Calcul des statistiques réelles
  const totalClients = clients.length;

  // Calcul des actions à venir et à effectuer basé sur les équipements
  const { actionsTocome, actionsToDo } = useMemo(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000,
    );

    let upcomingActions = 0; // Actions à venir (dans les 30 jours)
    let urgentActions = 0; // Actions à effectuer (en retard ou imminentes)

    clients.forEach((client) => {
      client.equipments?.forEach((equipment) => {
        // Vérification de sécurité
        if (!equipment.material || !equipment.commissioningDate) return;

        const commissioningDate = new Date(equipment.commissioningDate);

        // 1. Vérification de la validité
        if (equipment.material.validityTime) {
          const validityTime = equipment.material.validityTime;
          const expirationDate = new Date(
            commissioningDate.getTime() + validityTime * 24 * 60 * 60 * 1000,
          );

          if (expirationDate < now) {
            urgentActions++; // Équipement expiré = action urgente
          } else if (expirationDate <= thirtyDaysFromNow) {
            upcomingActions++; // Expire dans les 30 jours = action à venir
          }
        }

        // 2. Vérification des contrôles
        if (equipment.material.timeBeforeControl) {
          const timeBeforeControl = equipment.material.timeBeforeControl;
          let nextControlDate: Date;

          if (equipment.lastVerificationDate) {
            const lastVerification = new Date(equipment.lastVerificationDate);
            nextControlDate = new Date(
              lastVerification.getTime() +
                timeBeforeControl * 24 * 60 * 60 * 1000,
            );
          } else {
            nextControlDate = new Date(
              commissioningDate.getTime() +
                timeBeforeControl * 24 * 60 * 60 * 1000,
            );
          }

          if (nextControlDate < now) {
            urgentActions++; // Contrôle en retard = action urgente
          } else if (nextControlDate <= thirtyDaysFromNow) {
            upcomingActions++; // Contrôle dans les 30 jours = action à venir
          }
        }

        // 3. Vérification des recharges (pour équipements PA uniquement)
        if (
          equipment.material.type === "PA" &&
          equipment.material.timeBeforeReload
        ) {
          const timeBeforeReload = equipment.material.timeBeforeReload;
          let nextRechargeDate: Date;

          if (equipment.lastRechargeDate) {
            const lastRecharge = new Date(equipment.lastRechargeDate);
            nextRechargeDate = new Date(
              lastRecharge.getTime() + timeBeforeReload * 24 * 60 * 60 * 1000,
            );
          } else {
            nextRechargeDate = new Date(
              commissioningDate.getTime() +
                timeBeforeReload * 24 * 60 * 60 * 1000,
            );
          }

          if (nextRechargeDate < now) {
            urgentActions++; // Recharge en retard = action urgente
          } else if (nextRechargeDate <= thirtyDaysFromNow) {
            upcomingActions++; // Recharge dans les 30 jours = action à venir
          }
        }
      });
    });

    return {
      actionsTocome: upcomingActions,
      actionsToDo: urgentActions,
    };
  }, [clients]);

  // Filtrage des clients basé sur la recherche
  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;

    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.location.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [clients, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Container principal avec padding responsive */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* En-tête de page */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Gestion des Clients
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Suivi et gestion de votre portefeuille client
          </p>
        </div>

        {/* Cartes de statistiques - responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Total Clients"
            value={totalClients}
            icon={UserGroupIcon}
            variant="default"
          />
          <StatCard
            title="Actions à venir"
            value={actionsTocome}
            icon={ClockIcon}
            variant="warning"
            subtitle={`Équipements à vérifier dans les 30 jours`}
          />
          <StatCard
            title="Actions urgentes"
            value={actionsToDo}
            icon={ExclamationTriangleIcon}
            variant="danger"
            subtitle={`Équipements expirés ou contrôles en retard`}
          />
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="max-w-md">
            <label htmlFor="search" className="sr-only">
              Rechercher un client
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des clients */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Liste des Clients
              {searchTerm && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({filteredClients.length} résultat
                  {filteredClients.length > 1 ? "s" : ""})
                </span>
              )}
            </h2>

            {/* Bouton Ajouter un client */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Ajouter un client
            </button>
          </div>

          {/* État de chargement */}
          {isLoading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="flex items-center justify-center">
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
                <p className="ml-3 text-gray-600">Chargement des clients...</p>
              </div>
            </div>
          ) : error ? (
            /* État d'erreur */
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-12 text-center">
              <p className="text-red-600 text-lg mb-2">
                Erreur lors du chargement
              </p>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={fetchClients}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : filteredClients.length > 0 ? (
            <ClientTable clients={filteredClients} />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-lg mb-2">Aucun client trouvé</p>
              <p className="text-gray-400">
                {searchTerm
                  ? "Essayez de modifier votre recherche"
                  : "Aucun client enregistré pour le moment"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'ajout de client */}
      <AddClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClientAdded={handleClientAdded}
      />
    </div>
  );
}
