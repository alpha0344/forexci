"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserGroupIcon,
  CogIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

// ============================================================================
// TYPES ET INTERFACES
// ============================================================================

interface DashboardStats {
  clients: {
    total: number;
  };
  equipments: {
    total: number;
    expired: number;
    expiringSoon: number;
    valid: number;
    controlsOverdue: number;
    rechargesOverdue: number;
  };
  materials: {
    total: number;
    paTypes: number;
    ppTypes: number;
    alarmTypes: number;
  };
}

interface RecentActivity {
  type:
    | "client_added"
    | "equipment_expired"
    | "control_overdue"
    | "recharge_due";
  message: string;
  date: string;
  severity: "low" | "medium" | "high";
}

// ============================================================================
// COMPOSANTS
// ============================================================================

/**
 * Composant de carte statistique
 */
interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "primary" | "success" | "warning" | "danger" | "info";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant,
  trend,
}) => {
  const variantStyles = {
    primary: "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
    success: "bg-gradient-to-br from-green-500 to-green-600 text-white",
    warning: "bg-gradient-to-br from-orange-500 to-orange-600 text-white",
    danger: "bg-gradient-to-br from-red-500 to-red-600 text-white",
    info: "bg-gradient-to-br from-purple-500 to-purple-600 text-white",
  };

  return (
    <div
      className={`rounded-xl p-4 sm:p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${variantStyles[variant]}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium opacity-90 mb-2">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs sm:text-sm opacity-80">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? "text-green-200" : "text-red-200"
                }`}
              >
                {trend.isPositive ? "↗" : "↘"} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs opacity-70 ml-1">ce mois</span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 ml-4">
          <Icon className="h-8 w-8 sm:h-10 sm:w-10 opacity-80" />
        </div>
      </div>
    </div>
  );
};

/**
 * Composant de carte d'action rapide
 */
interface QuickActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "default" | "warning" | "danger";
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  href,
  icon: Icon,
  badge,
  badgeVariant = "default",
}) => {
  const badgeStyles = {
    default: "bg-blue-100 text-blue-800",
    warning: "bg-orange-100 text-orange-800",
    danger: "bg-red-100 text-red-800",
  };

  return (
    <Link href={href} className="group">
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-gray-300 group-hover:scale-105">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
            </div>
            {badge && (
              <span
                className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${badgeStyles[badgeVariant]}`}
              >
                {badge}
              </span>
            )}
          </div>
          <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-900 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
    </Link>
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupération des statistiques
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Récupération des clients
        const clientsResponse = await fetch("/api/clients");
        const clientsData = await clientsResponse.json();

        if (!clientsResponse.ok) {
          throw new Error("Erreur lors du chargement des clients");
        }

        const clients = clientsData.data || [];

        // Récupération des matériaux
        const materialsResponse = await fetch("/api/materials");
        const materialsData = await materialsResponse.json();
        const materials = materialsData.data || [];

        // Calcul des statistiques
        const now = new Date();
        const thirtyDaysFromNow = new Date(
          now.getTime() + 30 * 24 * 60 * 60 * 1000,
        );
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let totalEquipments = 0;
        let expiredEquipments = 0;
        let expiringSoonEquipments = 0;
        let validEquipments = 0;
        let controlsOverdue = 0;
        let rechargesOverdue = 0;
        let newClientsThisMonth = 0;

        // Analyse des clients et équipements
        clients.forEach((client: any) => {
          // Nouveaux clients ce mois
          const clientCreatedAt = new Date(client.createdAt);
          if (clientCreatedAt >= startOfMonth) {
            newClientsThisMonth++;
          }

          // Analyse des équipements
          client.equipments?.forEach((equipment: any) => {
            totalEquipments++;

            const commissioningDate = new Date(equipment.commissioningDate);
            const validityTime = equipment.material.validityTime;
            const expirationDate = new Date(
              commissioningDate.getTime() + validityTime * 24 * 60 * 60 * 1000,
            );

            if (expirationDate < now) {
              expiredEquipments++;
            } else if (expirationDate <= thirtyDaysFromNow) {
              expiringSoonEquipments++;
            } else {
              validEquipments++;
            }

            // Contrôles en retard
            const timeBeforeControl = equipment.material.timeBeforeControl;
            if (equipment.lastVerificationDate) {
              const lastVerification = new Date(equipment.lastVerificationDate);
              const nextControlDate = new Date(
                lastVerification.getTime() +
                  timeBeforeControl * 24 * 60 * 60 * 1000,
              );
              if (nextControlDate < now) {
                controlsOverdue++;
              }
            } else {
              const firstControlDate = new Date(
                commissioningDate.getTime() +
                  timeBeforeControl * 24 * 60 * 60 * 1000,
              );
              if (firstControlDate < now) {
                controlsOverdue++;
              }
            }

            // Recharges en retard (pour équipements PA uniquement)
            if (
              equipment.material.type === "PA" &&
              equipment.material.timeBeforeReload
            ) {
              const timeBeforeReload = equipment.material.timeBeforeReload;
              let nextRechargeDate: Date;

              if (equipment.lastRechargeDate) {
                const lastRecharge = new Date(equipment.lastRechargeDate);
                nextRechargeDate = new Date(
                  lastRecharge.getTime() +
                    timeBeforeReload * 24 * 60 * 60 * 1000,
                );
              } else {
                nextRechargeDate = new Date(
                  commissioningDate.getTime() +
                    timeBeforeReload * 24 * 60 * 60 * 1000,
                );
              }

              if (nextRechargeDate < now) {
                rechargesOverdue++;
              }
            }
          });
        });

        // Calcul des statistiques des matériaux
        const paTypes = materials.filter((m: any) => m.type === "PA").length;
        const ppTypes = materials.filter((m: any) => m.type === "PP").length;
        const alarmTypes = materials.filter(
          (m: any) => m.type === "ALARM",
        ).length;

        setStats({
          clients: {
            total: clients.length,
          },
          equipments: {
            total: totalEquipments,
            expired: expiredEquipments,
            expiringSoon: expiringSoonEquipments,
            valid: validEquipments,
            controlsOverdue,
            rechargesOverdue,
          },
          materials: {
            total: materials.length,
            paTypes,
            ppTypes,
            alarmTypes,
          },
        });
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
        setError(error instanceof Error ? error.message : "Erreur inconnue");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg mb-2">Erreur de chargement</p>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* En-tête du tableau de bord */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Tableau de bord
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Vue d'ensemble de votre activité ForexCI
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Système opérationnel
              </span>
            </div>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Total Clients"
            value={stats?.clients.total || 0}
            icon={UserGroupIcon}
            variant="primary"
            trend={
              0
                ? {
                    value: Math.round(
                      (0 / Math.max(stats.clients.total, 1)) * 100,
                    ),
                    isPositive: 0 > 0,
                  }
                : undefined
            }
          />

          <StatCard
            title="Total Équipements"
            value={stats?.equipments.total || 0}
            subtitle={`${stats?.equipments.valid || 0} valides`}
            icon={CogIcon}
            variant="info"
          />

          <StatCard
            title="Contrôles en retard"
            value={stats?.equipments.controlsOverdue || 0}
            subtitle="Nécessitent une action"
            icon={ClockIcon}
            variant="warning"
          />

          <StatCard
            title="Équipements expirés"
            value={stats?.equipments.expired || 0}
            subtitle="À renouveler"
            icon={ExclamationTriangleIcon}
            variant="danger"
          />
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* État des équipements */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                État des équipements
              </h2>
              <ShieldCheckIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm sm:text-base font-medium text-gray-900">
                    Valides
                  </span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-green-600">
                  {stats?.equipments.valid || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-sm sm:text-base font-medium text-gray-900">
                    Expirent bientôt
                  </span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-yellow-600">
                  {stats?.equipments.expiringSoon || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-sm sm:text-base font-medium text-gray-900">
                    Expirés
                  </span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-red-600">
                  {stats?.equipments.expired || 0}
                </span>
              </div>

              {stats?.equipments.rechargesOverdue ? (
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-sm sm:text-base font-medium text-gray-900">
                      Recharges en retard
                    </span>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-purple-600">
                    {stats.equipments.rechargesOverdue}
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Types de matériel */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Types de matériel
              </h2>
              <ChartBarIcon className="h-6 w-6 text-purple-500" />
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-xs font-bold">PA</span>
                  </div>
                  <span className="text-sm sm:text-base font-medium text-gray-900">
                    Portables Autonomes
                  </span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-blue-600">
                  {stats?.materials.paTypes || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-xs font-bold">PP</span>
                  </div>
                  <span className="text-sm sm:text-base font-medium text-gray-900">
                    Portables Portés
                  </span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-orange-600">
                  {stats?.materials.ppTypes || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-xs font-bold">AL</span>
                  </div>
                  <span className="text-sm sm:text-base font-medium text-gray-900">
                    Alarmes
                  </span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-red-600">
                  {stats?.materials.alarmTypes || 0}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base font-semibold text-gray-900">
                    Total types
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-gray-700">
                    {stats?.materials.total || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <QuickActionCard
              title="Gérer les clients"
              description="Consulter la liste de vos clients et ajouter de nouveaux comptes"
              href="/clients"
              icon={UserGroupIcon}
              badge={
                stats?.clients.total
                  ? `${stats.clients.total} clients`
                  : undefined
              }
            />

            <QuickActionCard
              title="Calendrier des actions"
              description="Voir les équipements qui expirent et les contrôles à effectuer"
              href="/calendrier"
              icon={CalendarDaysIcon}
              badge={
                stats?.equipments.controlsOverdue || stats?.equipments.expired
                  ? `${
                      (stats?.equipments.controlsOverdue || 0) +
                      (stats?.equipments.expired || 0)
                    } actions`
                  : undefined
              }
              badgeVariant={
                stats?.equipments.controlsOverdue || stats?.equipments.expired
                  ? "warning"
                  : "default"
              }
            />

            <QuickActionCard
              title="Types de matériel"
              description="Configurer les modèles d'équipements et leurs paramètres"
              href="/materiel"
              icon={CogIcon}
              badge={
                stats?.materials.total
                  ? `${stats.materials.total} types`
                  : undefined
              }
            />
          </div>
        </div>

        {/* Alertes importantes */}
        {(stats?.equipments.expired || 0) > 0 ||
        (stats?.equipments.controlsOverdue || 0) > 0 ? (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4 sm:p-6">
            <div className="flex items-start">
              <BellIcon className="h-6 w-6 text-red-500 mt-1 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-red-900 mb-2">
                  Actions requises
                </h3>
                <div className="space-y-2 text-sm text-red-800">
                  {(stats?.equipments.expired || 0) > 0 && (
                    <p>
                      • {stats!.equipments.expired} équipement
                      {stats!.equipments.expired > 1 ? "s" : ""} expiré
                      {stats!.equipments.expired > 1 ? "s" : ""} nécessite
                      {stats!.equipments.expired > 1 ? "nt" : ""} un
                      renouvellement
                    </p>
                  )}
                  {(stats?.equipments.controlsOverdue || 0) > 0 && (
                    <p>
                      • {stats!.equipments.controlsOverdue} contrôle
                      {stats!.equipments.controlsOverdue > 1 ? "s" : ""} en
                      retard
                    </p>
                  )}
                  {(stats?.equipments.rechargesOverdue || 0) > 0 && (
                    <p>
                      • {stats!.equipments.rechargesOverdue} recharge
                      {stats!.equipments.rechargesOverdue > 1 ? "s" : ""} en
                      retard
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  <Link
                    href="/calendrier"
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Voir le calendrier
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 sm:p-6">
            <div className="flex items-start">
              <CheckCircleIcon className="h-6 w-6 text-green-500 mt-1 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-green-900 mb-2">
                  Tout va bien !
                </h3>
                <p className="text-sm text-green-800">
                  Aucune action urgente requise. Tous vos équipements sont à
                  jour.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
