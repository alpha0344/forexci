'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  PlusIcon,
  TrashIcon,
  PhoneIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import EditClientModal from '@/components/EditClientModal';
import AddEquipmentModal from '@/components/AddEquipmentModal';
import EditEquipmentModal from '@/components/EditEquipmentModal';
import UpdateVerificationModal from '@/components/UpdateVerificationModal';

// Types basés sur votre schéma Prisma
interface Material {
  id: string;
  type: 'PA' | 'PP' | 'ALARM';
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
  rechargeType?: 'WATER_ADD' | 'POWDER' | null;
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
        <h2 className="text-xl font-semibold text-gray-900">Informations Client</h2>
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
        </div>

        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Contact principal</p>
              <p className="text-gray-900">{client.contactName}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Téléphone</p>
              <p className="text-gray-900">{client.phone || 'Non renseigné'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 text-sm text-gray-500">
          <CalendarIcon className="h-4 w-4" />
          <span>Client depuis le {new Date(client.createdAt).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Composant Card pour les statistiques des équipements
 */
interface EquipmentStatsProps {
  equipments: ClientEquipment[];
}

const EquipmentStats: React.FC<EquipmentStatsProps> = ({ equipments }) => {
  const stats = {
    total: equipments.length,
    pa: equipments.filter(eq => eq.material.type === 'PA').length,
    pp: equipments.filter(eq => eq.material.type === 'PP').length,
    alarm: equipments.filter(eq => eq.material.type === 'ALARM').length
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        <p className="text-sm text-gray-500">Total équipements</p>
      </div>
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 text-center">
        <p className="text-2xl font-bold text-blue-900">{stats.pa}</p>
        <p className="text-sm text-blue-600">Pression Auxiliaire</p>
      </div>
      <div className="bg-green-50 rounded-lg border border-green-200 p-4 text-center">
        <p className="text-2xl font-bold text-green-900">{stats.pp}</p>
        <p className="text-sm text-green-600">Pression Permanente</p>
      </div>
      <div className="bg-orange-50 rounded-lg border border-orange-200 p-4 text-center">
        <p className="text-2xl font-bold text-orange-900">{stats.alarm}</p>
        <p className="text-sm text-orange-600">Alarmes</p>
      </div>
    </div>
  );
};

/**
 * Page principale de détail client
 */
export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddEquipmentModalOpen, setIsAddEquipmentModalOpen] = useState(false);
  const [isEditEquipmentModalOpen, setIsEditEquipmentModalOpen] = useState(false);
  const [isUpdateVerificationModalOpen, setIsUpdateVerificationModalOpen] = useState(false);
  const [equipmentToEdit, setEquipmentToEdit] = useState<ClientEquipment | null>(null);

  // Charger les données du client
  const fetchClient = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/clients/${params.id}`);
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setError('Client non trouvé');
        } else {
          throw new Error(result.error || 'Erreur lors du chargement du client');
        }
        return;
      }

      setClient(result.data);
    } catch (error) {
      console.error('Erreur lors du chargement du client:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
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
    // Conserver les équipements existants si non inclus dans la réponse
    const clientWithEquipments = {
      ...updatedClient,
      equipments: updatedClient.equipments || client?.equipments || []
    };
    setClient(clientWithEquipments);
  };

  const handleAddEquipment = () => {
    setIsAddEquipmentModalOpen(true);
  };

  const handleEquipmentAdded = (newEquipment: ClientEquipment) => {
    // Ajouter le nouvel équipement à la liste
    if (client) {
      setClient({
        ...client,
        equipments: [...client.equipments, newEquipment]
      });
    }
  };

  const handleEditEquipment = (equipmentId: string) => {
    const equipment = client?.equipments.find(eq => eq.id === equipmentId);
    if (equipment) {
      setEquipmentToEdit(equipment);
      setIsEditEquipmentModalOpen(true);
    }
  };

  const handleEquipmentUpdated = (updatedEquipment: ClientEquipment) => {
    if (client) {
      setClient({
        ...client,
        equipments: client.equipments.map(eq => 
          eq.id === updatedEquipment.id ? updatedEquipment : eq
        )
      });
    }
  };

  const handleUpdateVerifications = () => {
    setIsUpdateVerificationModalOpen(true);
  };

  const handleVerificationUpdated = () => {
    // Ne pas recharger les données pendant que le modal est ouvert
    // Le modal gère son propre état et rechargera à la fin
    // Cette fonction peut être appelée pour d'autres actions si nécessaire
    console.log('Verification updated - modal en cours');
  };

  const handleVerificationCompleted = () => {
    // Recharger les données du client après fermeture complète du modal
    fetchClient();
    setIsUpdateVerificationModalOpen(false);
  };

  const handleDeleteEquipment = async (equipmentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/equipments/${equipmentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Recharger les données du client
        fetchClient();
      } else {
        const result = await response.json();
        alert(result.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'équipement:', error);
      alert('Erreur lors de la suppression de l\'équipement');
    }
  };

  const handleDeleteClient = async () => {
    if (!client) return;
    
    if (client.equipments.length > 0) {
      alert('Impossible de supprimer un client qui possède des équipements.');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.')) {
      return;
    }

    try {
      const response = await fetch(`/api/clients/${params.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        router.push('/clients');
      } else {
        const result = await response.json();
        alert(result.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du client');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center">
              <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête avec navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/clients"
                className="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
                <p className="text-gray-600">{client.location}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleEditClient}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Modifier
              </button>
              <button
                onClick={handleDeleteClient}
                disabled={client.equipments.length > 0}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={client.equipments.length > 0 ? 'Supprimez d\'abord tous les équipements' : 'Supprimer le client'}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Supprimer
              </button>
            </div>
          </div>
        </div>

        {/* Informations client */}
        <div className="mb-8">
          <ClientInfoCard client={client} onEdit={handleEditClient} />
        </div>

        {/* Bouton de mise à jour des vérifications */}
        {client.equipments.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Mise à jour des vérifications
                  </h3>
                  <p className="text-sm text-gray-600">
                    Mettre à jour la date de dernière vérification de tous les équipements en une seule fois
                  </p>
                </div>
                <button
                  onClick={handleUpdateVerifications}
                  className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Mettre à jour toutes les vérifications
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistiques des équipements */}
        <div className="mb-8">
          <EquipmentStats equipments={client.equipments} />
        </div>

        {/* Section équipements */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Équipements ({client.equipments.length})
            </h2>
            <button
              onClick={handleAddEquipment}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Ajouter un équipement
            </button>
          </div>

          {client.equipments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-lg mb-2">Aucun équipement</p>
              <p className="text-gray-400 mb-4">Ce client n'a pas encore d'équipement enregistré</p>
              <button
                onClick={handleAddEquipment}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Ajouter le premier équipement
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {client.equipments.map((equipment) => (
                <div key={equipment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Équipement #{equipment.number}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Type: {equipment.material.type}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      equipment.material.type === 'PA' ? 'bg-blue-100 text-blue-800' :
                      equipment.material.type === 'PP' ? 'bg-green-100 text-green-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {equipment.material.type}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Mise en service:</span>
                      <span className="ml-2 text-gray-900">
                        {new Date(equipment.commissioningDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    
                    {equipment.lastVerificationDate && (
                      <div>
                        <span className="text-gray-500">Dernière vérification:</span>
                        <span className="ml-2 text-gray-900">
                          {new Date(equipment.lastVerificationDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}

                    {equipment.volume && (
                      <div>
                        <span className="text-gray-500">Volume:</span>
                        <span className="ml-2 text-gray-900">{equipment.volume}L</span>
                      </div>
                    )}

                    {equipment.notes && (
                      <div>
                        <span className="text-gray-500">Notes:</span>
                        <p className="text-gray-900 text-xs mt-1">{equipment.notes}</p>
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
              ))}
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