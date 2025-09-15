'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { EyeIcon, UserGroupIcon, ClockIcon, ExclamationTriangleIcon, PlusIcon } from '@heroicons/react/24/outline';
import AddClientModal from '@/components/AddClientModal';

// Types basés sur votre schéma Prisma
interface Client {
  id: string;
  name: string;
  location: string;
  contactName: string;
  phone?: string | null;
  equipments: {
    id: string;
    material?: {
      id: string;
      type: string;
    };
  }[];
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
  variant?: 'default' | 'warning' | 'danger';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, variant = 'default' }) => {
  const baseClasses = "rounded-lg p-6 shadow-sm border transition-all duration-200 hover:shadow-md";
  const variantClasses = {
    default: "bg-white border-gray-200",
    warning: "bg-orange-50 border-orange-200",
    danger: "bg-red-50 border-red-200"
  };

  const iconClasses = {
    default: "text-blue-600",
    warning: "text-orange-600",
    danger: "text-red-600"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${iconClasses[variant]}`} />
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
          <div key={client.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-6 hover:bg-gray-50 transition-colors">
            {/* Nom et localisation */}
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-900">{client.name}</h3>
              <p className="text-sm text-gray-500">{client.location}</p>
            </div>

            {/* Contact - responsive */}
            <div className="space-y-1">
              <span className="md:hidden text-sm font-medium text-gray-500">Contact:</span>
              <p className="text-gray-900">{client.contactName}</p>
            </div>

            {/* Téléphone - responsive */}
            <div className="space-y-1">
              <span className="md:hidden text-sm font-medium text-gray-500">Téléphone:</span>
              <p className="text-gray-900">{client.phone || 'Non renseigné'}</p>
            </div>

            {/* Nombre de matériels - responsive */}
            <div className="space-y-1">
              <span className="md:hidden text-sm font-medium text-gray-500">Matériels:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {client.equipments.length} équipement{client.equipments.length > 1 ? 's' : ''}
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
                <span className="ml-2 md:hidden group-hover:text-blue-600">Voir détails</span>
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
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Charger les clients depuis l'API
  const fetchClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/clients');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors du chargement des clients');
      }

      setClients(result.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
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
    setClients(prev => [newClient, ...prev]);
  };

  // Calcul des statistiques
  const totalClients = clients.length;
  const actionsTocome = Math.min(1, totalClients); // Premier client comme exemple
  const actionsToDo = Math.min(1, Math.max(0, totalClients - 1)); // Deuxième client comme exemple

  // Filtrage des clients basé sur la recherche
  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;

    return clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Container principal avec padding responsive */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* En-tête de page */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion des Clients
          </h1>
          <p className="text-gray-600">
            Suivi et gestion de votre portefeuille client
          </p>
        </div>

        {/* Cartes de statistiques - responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
          />
          <StatCard
            title="Actions à effectuer"
            value={actionsToDo}
            icon={ExclamationTriangleIcon}
            variant="danger"
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
                  ({filteredClients.length} résultat{filteredClients.length > 1 ? 's' : ''})
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
                <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="ml-3 text-gray-600">Chargement des clients...</p>
              </div>
            </div>
          ) : error ? (
            /* État d'erreur */
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-12 text-center">
              <p className="text-red-600 text-lg mb-2">Erreur lors du chargement</p>
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
                  ? 'Essayez de modifier votre recherche' 
                  : 'Aucun client enregistré pour le moment'
                }
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
