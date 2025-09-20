"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import {
  isEquipmentValid,
  type EquipmentWithMaterial,
} from "@/lib/equipmentValidation";

// ============================================================================
// TYPES ET INTERFACES
// ============================================================================

interface Material {
  id: string;
  type: "PA" | "PP" | "ALARM";
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

interface MonthData {
  month: number;
  year: number;
  name: string;
  shortName: string;
  isSelected: boolean;
  isCurrent: boolean;
}

interface ClientAction {
  clientId: string;
  clientName: string;
  clientLocation: string;
  contactName: string;
  phone?: string | null;
  actions: {
    equipmentId: string;
    equipmentNumber: number;
    materialType: string;
    actionType: "validity" | "control" | "recharge";
    actionLabel: string;
    dueDate: Date;
    isOverdue: boolean;
    daysDifference: number;
    priority: 1 | 2 | 3;
  }[];
  totalActions: number;
  highestPriority: 1 | 2 | 3;
}

// ============================================================================
// HELPER FUNCTIONS POUR LES CALCULS DE DATES
// ============================================================================

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
        equipment.material.timeBeforeControl * 24 * 60 * 60 * 1000
    );
  } else {
    nextControlDate = new Date(
      commissioningDate.getTime() +
        equipment.material.timeBeforeControl * 24 * 60 * 60 * 1000
    );
  }

  const isExpired = nextControlDate < today;
  const daysDifference = Math.ceil(
    Math.abs(nextControlDate.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
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
  if (equipment.material.type !== "PA" || !equipment.material.timeBeforeReload) {
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
        equipment.material.timeBeforeReload * 24 * 60 * 60 * 1000
    );
  } else {
    nextRechargeDate = new Date(
      commissioningDate.getTime() +
        equipment.material.timeBeforeReload * 24 * 60 * 60 * 1000
    );
  }

  const isExpired = nextRechargeDate < today;
  const daysDifference = Math.ceil(
    Math.abs(nextRechargeDate.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
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

// ============================================================================
// COMPOSANTS
// ============================================================================

/**
 * Composant de sélection de mois
 */
interface MonthSelectorProps {
  months: MonthData[];
  selectedYear: number;
  availableYears: number[];
  onMonthSelect: (month: number, year: number) => void;
  onYearSelect: (year: number) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  months,
  selectedYear,
  availableYears,
  onMonthSelect,
  onYearSelect,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-3 sm:mb-0">
          <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
          Sélectionner une période
        </h2>

        {/* Sélecteur d'année */}
        <div className="flex items-center space-x-2">
          <label
            htmlFor="year-select"
            className="text-sm font-medium text-gray-700"
          >
            Année :
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => onYearSelect(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-3">
        {months.map((month) => (
          <button
            key={`${month.year}-${month.month}`}
            onClick={() => onMonthSelect(month.month, month.year)}
            className={`
              relative px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
              ${
                month.isSelected
                  ? "bg-blue-600 text-white shadow-md transform scale-105"
                  : "bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm"
              }
              ${
                month.isCurrent && !month.isSelected
                  ? "ring-2 ring-blue-200"
                  : ""
              }
            `}
          >
            <div className="text-center">
              <div className="font-semibold">{month.shortName}</div>
              <div className="text-xs opacity-75">{month.year}</div>
            </div>

            {month.isCurrent && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Composant pour afficher une action d'équipement
 */
interface EquipmentActionBadgeProps {
  action: ClientAction["actions"][0];
}

const EquipmentActionBadge: React.FC<EquipmentActionBadgeProps> = ({
  action,
}) => {
  const getActionColor = () => {
    if (action.isOverdue) {
      // Différencier les couleurs selon le type d'action
      if (action.actionType === "validity") {
        return "bg-red-100 text-red-800 border-red-200";
      } else if (action.actionType === "control") {
        return "bg-orange-100 text-orange-800 border-orange-200";
      } else if (action.actionType === "recharge") {
        return "bg-purple-100 text-purple-800 border-purple-200";
      }
    } else {
      // Actions à venir
      if (action.actionType === "validity") {
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      } else if (action.actionType === "control") {
        return "bg-blue-100 text-blue-800 border-blue-200";
      } else if (action.actionType === "recharge") {
        return "bg-green-100 text-green-800 border-green-200";
      }
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getActionIcon = () => {
    if (action.isOverdue) {
      if (action.actionType === "validity") return "⚠️";
      if (action.actionType === "control") return "🔧";
      if (action.actionType === "recharge") return "🔋";
    } else {
      if (action.actionType === "validity") return "📅";
      if (action.actionType === "control") return "🔍";
      if (action.actionType === "recharge") return "⚡";
    }
    return "📋";
  };

  const getActionLabel = () => {
    if (action.isOverdue) {
      if (action.actionType === "validity") return "Matériel expiré";
      if (action.actionType === "control") return "Contrôle en retard";
      if (action.actionType === "recharge") return "Recharge en retard";
    } else {
      if (action.actionType === "validity") return "Expiration prochaine";
      if (action.actionType === "control") return "Contrôle à venir";
      if (action.actionType === "recharge") return "Recharge à venir";
    }
    return "Action à venir";
  };

  const getActionDescription = () => {
    return action.actionLabel;
  };

  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getActionColor()}`}
    >
      <span className="mr-1">{getActionIcon()}</span>
      <span className="mr-2">#{action.equipmentNumber}</span>
      <span className="mr-2">{getActionDescription()}</span>
      <span className="text-xs opacity-75">({getActionLabel()})</span>
      {action.isOverdue && (
        <span className={`ml-2 font-semibold ${
          action.actionType === "validity" ? "text-red-600" : 
          action.actionType === "control" ? "text-orange-600" : 
          action.actionType === "recharge" ? "text-purple-600" : "text-gray-600"
        }`}>
          ({action.daysDifference} j retard)
        </span>
      )}
      {!action.isOverdue && (
        <span className={`ml-2 font-medium ${
          action.actionType === "validity" ? "text-yellow-600" : 
          action.actionType === "control" ? "text-blue-600" : 
          action.actionType === "recharge" ? "text-green-600" : "text-gray-600"
        }`}>
          (dans {action.daysDifference} j)
        </span>
      )}
    </div>
  );
};

/**
 * Composant pour afficher un client avec ses actions
 */
interface ClientActionCardProps {
  clientAction: ClientAction;
}

const ClientActionCard: React.FC<ClientActionCardProps> = ({
  clientAction,
}) => {
  // Déterminer s'il y a des actions en retard
  const hasOverdueActions = clientAction.actions.some(action => action.isOverdue);
  
  const getPriorityColor = () => {
    if (hasOverdueActions) return "border-l-red-500 bg-red-50/50";
    return "border-l-yellow-500 bg-yellow-50/50";
  };

  const getPriorityIcon = () => {
    if (hasOverdueActions) return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
    return <ClockIcon className="h-5 w-5 text-yellow-500" />;
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 p-6 ${getPriorityColor()}`}
    >
      {/* En-tête du client */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            {getPriorityIcon()}
            <h3 className="text-lg font-semibold text-gray-900">
              {clientAction.clientName}
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {clientAction.totalActions} action
              {clientAction.totalActions > 1 ? "s" : ""}
            </span>
          </div>

          <div className="mt-2 space-y-1">
            <div className="flex items-center text-sm text-gray-600">
              <MapPinIcon className="h-4 w-4 mr-2" />
              {clientAction.clientLocation}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <UserIcon className="h-4 w-4 mr-2" />
              {clientAction.contactName}
            </div>
            {clientAction.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <PhoneIcon className="h-4 w-4 mr-2" />
                {clientAction.phone}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions à réaliser */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Actions à réaliser :
        </h4>
        <div className="flex flex-wrap gap-2">
          {clientAction.actions.map((action, index) => (
            <EquipmentActionBadge
              key={`${action.equipmentId}-${action.actionType}-${index}`}
              action={action}
            />
          ))}
        </div>
      </div>

      {/* Bouton d'action */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
        <Link
          href={`/clients/${clientAction.clientId}`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
          Voir le client
        </Link>
      </div>
    </div>
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function CalendrierPage() {
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // ANNÉES DISPONIBLES
  // ============================================================================

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];

    // 2 années passées, année actuelle, 3 années futures
    for (let year = currentYear - 2; year <= currentYear + 3; year++) {
      years.push(year);
    }

    return years;
  }, []);

  // ============================================================================
  // DONNÉES STATIQUES - MOIS
  // ============================================================================

  const months = useMemo((): MonthData[] => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const monthNames = [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ];

    const shortNames = [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Jun",
      "Jul",
      "Aoû",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ];

    return monthNames.map((name, index) => ({
      month: index + 1,
      year: selectedYear,
      name,
      shortName: shortNames[index],
      isSelected: selectedMonth === index + 1 && selectedYear === selectedYear,
      isCurrent: currentMonth === index + 1 && currentYear === selectedYear,
    }));
  }, [selectedMonth, selectedYear]);

  // ============================================================================
  // CHARGEMENT DES DONNÉES
  // ============================================================================

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/clients");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des clients");
      }

      const result = await response.json();
      setClients(result.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des clients:", error);
      setError(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // ============================================================================
  // LOGIQUE DE CALCUL DES ACTIONS - VALIDITÉ ET CONTRÔLE
  // ============================================================================

  const clientsWithActions = useMemo((): ClientAction[] => {
    if (!clients.length) return [];

    // Calculer les bornes du mois sélectionné
    const startOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
    const endOfMonth = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);
    const today = new Date();

    const clientActions: ClientAction[] = [];

    clients.forEach((client) => {
      const actions: ClientAction["actions"] = [];

      client.equipments.forEach((equipment) => {
        // ========================================================================
        // CALCUL POUR LA VALIDITÉ DU MATÉRIEL
        // ========================================================================
        
        // Calculer la date d'expiration du matériel
        const commissioningDate = new Date(equipment.commissioningDate);
        const validityDays = equipment.material.validityTime;
        const expirationDate = new Date(
          commissioningDate.getTime() + validityDays * 24 * 60 * 60 * 1000
        );

        // Déterminer si cet équipement doit être affiché pour la validité
        let shouldDisplayValidity = false;
        let isValidityOverdue = false;
        let validityDaysDifference = 0;

        // Cas 1: L'équipement expire pendant le mois sélectionné
        if (expirationDate >= startOfMonth && expirationDate <= endOfMonth) {
          shouldDisplayValidity = true;
          validityDaysDifference = Math.ceil(
            (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );
          isValidityOverdue = expirationDate < today;
        }
        // Cas 2: L'équipement a déjà expiré ET on regarde un mois actuel ou passé
        else if (expirationDate < today) {
          // Calculer si le mois sélectionné est antérieur ou égal au mois actuel
          const currentMonth = today.getMonth() + 1;
          const currentYear = today.getFullYear();
          const isCurrentOrPastMonth = 
            selectedYear < currentYear || 
            (selectedYear === currentYear && selectedMonth <= currentMonth);
          
          // N'afficher les matériels expirés que pour les mois actuels/passés
          if (isCurrentOrPastMonth) {
            shouldDisplayValidity = true;
            isValidityOverdue = true;
            validityDaysDifference = Math.ceil(
              (today.getTime() - expirationDate.getTime()) / (1000 * 60 * 60 * 24)
            );
          }
        }

        // Si on doit afficher cet équipement pour la validité, l'ajouter aux actions
        if (shouldDisplayValidity) {
          actions.push({
            equipmentId: equipment.id,
            equipmentNumber: equipment.number,
            materialType: equipment.material.type,
            actionType: "validity",
            actionLabel: "Renouvellement matériel",
            dueDate: expirationDate,
            isOverdue: isValidityOverdue,
            daysDifference: Math.abs(validityDaysDifference),
            priority: 1, // Toujours priorité 1 pour la validité
          });
        }

        // ========================================================================
        // CALCUL POUR LE CONTRÔLE DU MATÉRIEL
        // ========================================================================
        
        const controlStatus = getEquipmentControlStatus(equipment);
        const nextControlDate = controlStatus.nextControlDate;

        // Déterminer si cet équipement doit être affiché pour le contrôle
        let shouldDisplayControl = false;
        let isControlOverdue = false;
        let controlDaysDifference = 0;

        // Cas 1: Le contrôle est dû pendant le mois sélectionné
        if (nextControlDate >= startOfMonth && nextControlDate <= endOfMonth) {
          shouldDisplayControl = true;
          controlDaysDifference = Math.ceil(
            (nextControlDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );
          isControlOverdue = nextControlDate < today;
        }
        // Cas 2: Le contrôle est déjà en retard ET on regarde un mois actuel ou passé
        else if (nextControlDate < today) {
          // Calculer si le mois sélectionné est antérieur ou égal au mois actuel
          const currentMonth = today.getMonth() + 1;
          const currentYear = today.getFullYear();
          const isCurrentOrPastMonth = 
            selectedYear < currentYear || 
            (selectedYear === currentYear && selectedMonth <= currentMonth);
          
          // N'afficher les contrôles en retard que pour les mois actuels/passés
          if (isCurrentOrPastMonth) {
            shouldDisplayControl = true;
            isControlOverdue = true;
            controlDaysDifference = Math.ceil(
              (today.getTime() - nextControlDate.getTime()) / (1000 * 60 * 60 * 24)
            );
          }
        }

        // Si on doit afficher cet équipement pour le contrôle, l'ajouter aux actions
        if (shouldDisplayControl) {
          actions.push({
            equipmentId: equipment.id,
            equipmentNumber: equipment.number,
            materialType: equipment.material.type,
            actionType: "control",
            actionLabel: controlStatus.hasNeverBeenControlled ? "Premier contrôle" : "Contrôle périodique",
            dueDate: nextControlDate,
            isOverdue: isControlOverdue,
            daysDifference: Math.abs(controlDaysDifference),
            priority: isControlOverdue ? 1 : 2, // Priorité 1 si en retard, 2 sinon
          });
        }

        // ========================================================================
        // CALCUL POUR LA RECHARGE DU MATÉRIEL PA
        // ========================================================================
        
        const rechargeStatus = getEquipmentRechargeStatus(equipment);
        
        // Traiter uniquement les équipements PA avec timeBeforeReload défini
        if (rechargeStatus.isApplicable && rechargeStatus.nextRechargeDate) {
          const nextRechargeDate = rechargeStatus.nextRechargeDate;

          // Déterminer si cet équipement doit être affiché pour la recharge
          let shouldDisplayRecharge = false;
          let isRechargeOverdue = false;
          let rechargeDaysDifference = 0;

          // Cas 1: La recharge est due pendant le mois sélectionné
          if (nextRechargeDate >= startOfMonth && nextRechargeDate <= endOfMonth) {
            shouldDisplayRecharge = true;
            rechargeDaysDifference = Math.ceil(
              (nextRechargeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );
            isRechargeOverdue = nextRechargeDate < today;
          }
          // Cas 2: La recharge est déjà en retard ET on regarde un mois actuel ou passé
          else if (nextRechargeDate < today) {
            // Calculer si le mois sélectionné est antérieur ou égal au mois actuel
            const currentMonth = today.getMonth() + 1;
            const currentYear = today.getFullYear();
            const isCurrentOrPastMonth = 
              selectedYear < currentYear || 
              (selectedYear === currentYear && selectedMonth <= currentMonth);
            
            // N'afficher les recharges en retard que pour les mois actuels/passés
            if (isCurrentOrPastMonth) {
              shouldDisplayRecharge = true;
              isRechargeOverdue = true;
              rechargeDaysDifference = Math.ceil(
                (today.getTime() - nextRechargeDate.getTime()) / (1000 * 60 * 60 * 24)
              );
            }
          }

          // Si on doit afficher cet équipement pour la recharge, l'ajouter aux actions
          if (shouldDisplayRecharge) {
            actions.push({
              equipmentId: equipment.id,
              equipmentNumber: equipment.number,
              materialType: equipment.material.type,
              actionType: "recharge",
              actionLabel: rechargeStatus.hasNeverBeenRecharged ? "Première recharge" : "Recharge périodique",
              dueDate: nextRechargeDate,
              isOverdue: isRechargeOverdue,
              daysDifference: Math.abs(rechargeDaysDifference),
              priority: isRechargeOverdue ? 1 : 3, // Priorité 1 si en retard, 3 sinon (moins urgent que contrôle)
            });
          }
        }
      });

      // Si ce client a des actions, l'ajouter à la liste
      if (actions.length > 0) {
        // Trier les actions par urgence (en retard d'abord) puis par date d'échéance
        actions.sort((a, b) => {
          // Prioriser les actions en retard
          if (a.isOverdue && !b.isOverdue) return -1;
          if (!a.isOverdue && b.isOverdue) return 1;
          // Puis par priorité (validité avant contrôle)
          if (a.priority !== b.priority) return a.priority - b.priority;
          // Puis trier par date d'échéance
          return a.dueDate.getTime() - b.dueDate.getTime();
        });

        // Déterminer la priorité la plus élevée pour ce client
        const highestPriority = Math.min(...actions.map(action => action.priority)) as 1 | 2 | 3;

        clientActions.push({
          clientId: client.id,
          clientName: client.name,
          clientLocation: client.location,
          contactName: client.contactName,
          phone: client.phone,
          actions,
          totalActions: actions.length,
          highestPriority,
        });
      }
    });

    // Trier les clients par urgence (ceux avec actions en retard d'abord) puis par priorité
    return clientActions.sort((a, b) => {
      const aHasOverdue = a.actions.some(action => action.isOverdue);
      const bHasOverdue = b.actions.some(action => action.isOverdue);
      
      // Prioriser les clients avec des actions en retard
      if (aHasOverdue && !bHasOverdue) return -1;
      if (!aHasOverdue && bHasOverdue) return 1;
      
      // Puis par priorité la plus élevée
      if (a.highestPriority !== b.highestPriority) return a.highestPriority - b.highestPriority;
      
      // Puis trier par nombre d'actions
      return b.totalActions - a.totalActions;
    });
  }, [clients, selectedMonth, selectedYear]);

  // ============================================================================
  // GESTIONNAIRES D'ÉVÉNEMENTS
  // ============================================================================

  const handleMonthSelect = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
  };

  // ============================================================================
  // RENDU
  // ============================================================================

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
              <p className="ml-3 text-gray-600">Chargement du calendrier...</p>
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
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Erreur de chargement
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchClients}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Calendrier de Validité et Contrôles
          </h1>
          <p className="text-gray-600">
            Suivi des dates d'expiration, renouvellements de matériel et contrôles périodiques
          </p>
        </div>

        {/* Sélecteur de mois */}
        <MonthSelector
          months={months}
          selectedYear={selectedYear}
          availableYears={availableYears}
          onMonthSelect={handleMonthSelect}
          onYearSelect={handleYearSelect}
        />

        {/* Résultats */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Matériels à renouveler en{" "}
                {months.find((m) => m.month === selectedMonth)?.name}{" "}
                {selectedYear}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Équipements qui expirent ce mois-ci 
                {(() => {
                  const currentMonth = new Date().getMonth() + 1;
                  const currentYear = new Date().getFullYear();
                  const isCurrentOrPastMonth = 
                    selectedYear < currentYear || 
                    (selectedYear === currentYear && selectedMonth <= currentMonth);
                  
                  return isCurrentOrPastMonth 
                    ? " ou qui ont déjà expiré" 
                    : "";
                })()}
              </p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                Matériel expiré
              </span>
              <span className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                Action à venir
              </span>
            </div>
          </div>

          {clientsWithActions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun matériel à renouveler
              </h3>
              <p className="text-gray-600">
                Aucun matériel n'expire en{" "}
                {months.find((m) => m.month === selectedMonth)?.name}{" "}
                {selectedYear} et aucun matériel n'est actuellement expiré.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {clientsWithActions.map((clientAction) => (
                <ClientActionCard
                  key={clientAction.clientId}
                  clientAction={clientAction}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
