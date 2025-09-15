'use client';

import { useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface ClientEquipment {
  id: string;
  number: number;
  commissioningDate: string;
  lastVerificationDate?: string | null;
  lastRechargeDate?: string | null;
  rechargeType?: 'WATER_ADD' | 'POWDER' | null;
  volume?: number | null;
  notes?: string | null;
  material: {
    id: string;
    type: 'PA' | 'PP' | 'ALARM';
    validityTime: number;
    timeBeforeControl: number;
    timeBeforeReload?: number | null;
  };
}

export interface UpdateVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  equipments: ClientEquipment[];
  onVerificationUpdated: () => void;
}

interface PARechargeInfo {
  equipmentId: string;
  equipmentNumber: number;
  newRechargeDate: string;
}

type WorkflowStep = 'confirmation' | 'updating' | 'pa-check' | 'pa-recharge' | 'completed';

export default function UpdateVerificationModal({
  isOpen,
  onClose,
  clientId,
  clientName,
  equipments,
  onVerificationUpdated
}: UpdateVerificationModalProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('confirmation');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // État pour les PA
  const [paEquipments, setPaEquipments] = useState<ClientEquipment[]>([]);
  const [hasRecharges, setHasRecharges] = useState<boolean | null>(null);
  const [selectedEquipmentNumber, setSelectedEquipmentNumber] = useState<string>('');
  const [rechargeDate, setRechargeDate] = useState<string>('');
  const [paRecharges, setPaRecharges] = useState<PARechargeInfo[]>([]);

  // Réinitialiser l'état du modal
  const resetModal = () => {
    setCurrentStep('confirmation');
    setIsProcessing(false);
    setError(null);
    setPaEquipments([]);
    setHasRecharges(null);
    setSelectedEquipmentNumber('');
    setRechargeDate('');
    setPaRecharges([]);
  };

  // Fermer le modal
  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Obtenir la date d'aujourd'hui au format YYYY-MM-DD
  const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0];
  };

  // Étape 1: Mise à jour globale des vérifications
  const handleUpdateVerifications = async () => {
    setIsProcessing(true);
    setError(null);
    setCurrentStep('updating');

    try {
      const today = new Date().toISOString();
      
      // Mettre à jour tous les équipements avec la date d'aujourd'hui
      const updatePromises = equipments.map(equipment => 
        fetch(`/api/equipments/${equipment.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lastVerificationDate: today
          })
        })
      );

      const results = await Promise.all(updatePromises);
      
      // Vérifier si toutes les mises à jour ont réussi
      const failedUpdates = results.filter(result => !result.ok);
      if (failedUpdates.length > 0) {
        throw new Error(`Échec de la mise à jour de ${failedUpdates.length} équipement(s)`);
      }

      // Identifier les équipements PA
      const paEquips = equipments.filter(eq => eq.material.type === 'PA');
      setPaEquipments(paEquips);

      // Passer à l'étape suivante
      if (paEquips.length === 0) {
        setCurrentStep('completed');
      } else {
        setCurrentStep('pa-check');
      }

      // Notifier le parent de la mise à jour
      onVerificationUpdated();
    } catch (error) {
      console.error('Erreur lors de la mise à jour des vérifications:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
      setCurrentStep('confirmation');
    } finally {
      setIsProcessing(false);
    }
  };

  // Étape 2: Gestion des recharges PA
  const handlePARechargeResponse = (hasRechargesDone: boolean) => {
    setHasRecharges(hasRechargesDone);
    if (hasRechargesDone) {
      setCurrentStep('pa-recharge');
      setRechargeDate(getTodayDate()); // Date par défaut = aujourd'hui
    } else {
      setCurrentStep('completed');
    }
  };

  // Ajouter une recharge PA
  const handleAddPARecharge = () => {
    if (!selectedEquipmentNumber || !rechargeDate) {
      setError('Veuillez sélectionner un équipement et une date');
      return;
    }

    const equipmentNumber = parseInt(selectedEquipmentNumber);
    const equipment = paEquipments.find(eq => eq.number === equipmentNumber);
    
    if (!equipment) {
      setError('Équipement PA non trouvé');
      return;
    }

    // Vérifier si cet équipement n'est pas déjà dans la liste
    if (paRecharges.some(pr => pr.equipmentId === equipment.id)) {
      setError('Cet équipement est déjà dans la liste');
      return;
    }

    const newRecharge: PARechargeInfo = {
      equipmentId: equipment.id,
      equipmentNumber: equipment.number,
      newRechargeDate: rechargeDate
    };

    setPaRecharges(prev => [...prev, newRecharge]);
    setSelectedEquipmentNumber('');
    setError(null);
  };

  // Supprimer une recharge PA de la liste
  const handleRemovePARecharge = (equipmentId: string) => {
    setPaRecharges(prev => prev.filter(pr => pr.equipmentId !== equipmentId));
  };

  // Finaliser les recharges PA
  const handleFinalizePARecharges = async () => {
    if (paRecharges.length === 0) {
      setCurrentStep('completed');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Mettre à jour les dates de recharge pour chaque PA
      const updatePromises = paRecharges.map(paRecharge => 
        fetch(`/api/equipments/${paRecharge.equipmentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lastRechargeDate: new Date(paRecharge.newRechargeDate).toISOString()
          })
        })
      );

      const results = await Promise.all(updatePromises);
      
      // Vérifier si toutes les mises à jour ont réussi
      const failedUpdates = results.filter(result => !result.ok);
      if (failedUpdates.length > 0) {
        throw new Error(`Échec de la mise à jour de ${failedUpdates.length} recharge(s) PA`);
      }

      setCurrentStep('completed');
      onVerificationUpdated(); // Rafraîchir les données
    } catch (error) {
      console.error('Erreur lors de la mise à jour des recharges PA:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour des recharges');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Mise à jour des vérifications - {clientName}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isProcessing}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Corps du modal */}
          <div className="p-6">
            {/* Erreur générale */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Étape 1: Confirmation */}
            {currentStep === 'confirmation' && (
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <ExclamationTriangleIcon className="h-8 w-8 text-orange-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Attention
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Cette action va mettre à jour la <strong>date de dernière vérification</strong> de 
                      tous les équipements de ce client ({equipments.length} équipement{equipments.length > 1 ? 's' : ''}) 
                      avec la date d'aujourd'hui.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Équipements concernés :</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        {equipments.map(equipment => (
                          <li key={equipment.id}>
                            • Équipement #{equipment.number} ({equipment.material.type})
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
                  <button
                    onClick={handleClose}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleUpdateVerifications}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Confirmer la mise à jour
                  </button>
                </div>
              </div>
            )}

            {/* Étape 2: Mise à jour en cours */}
            {currentStep === 'updating' && (
              <div className="text-center py-8">
                <div className="flex items-center justify-center mb-4">
                  <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Mise à jour en cours...
                </h3>
                <p className="text-gray-600">
                  Mise à jour des dates de vérification de tous les équipements
                </p>
              </div>
            )}

            {/* Étape 3: Vérification des PA */}
            {currentStep === 'pa-check' && (
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircleIcon className="h-8 w-8 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Vérifications mises à jour !
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Toutes les dates de vérification ont été mises à jour avec succès.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Équipements PA détectés ({paEquipments.length})
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1 mb-4">
                    {paEquipments.map(equipment => (
                      <li key={equipment.id}>
                        • PA #{equipment.number}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-blue-800 font-medium">
                    Des recharges PA ont-elles été effectuées lors de cette vérification ?
                  </p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
                  <button
                    onClick={() => handlePARechargeResponse(false)}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Non, aucune recharge
                  </button>
                  <button
                    onClick={() => handlePARechargeResponse(true)}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Oui, des recharges ont été faites
                  </button>
                </div>
              </div>
            )}

            {/* Étape 4: Gestion des recharges PA */}
            {currentStep === 'pa-recharge' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Mise à jour des recharges PA
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Sélectionnez les équipements PA qui ont été rechargés et indiquez la date.
                  </p>
                </div>

                {/* Formulaire d'ajout de recharge */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                  <h4 className="font-medium text-gray-900">Ajouter une recharge</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="equipmentNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Numéro PA *
                      </label>
                      <select
                        id="equipmentNumber"
                        value={selectedEquipmentNumber}
                        onChange={(e) => setSelectedEquipmentNumber(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Sélectionner un PA</option>
                        {paEquipments
                          .filter(eq => !paRecharges.some(pr => pr.equipmentId === eq.id))
                          .map(equipment => (
                            <option key={equipment.id} value={equipment.number.toString()}>
                              PA #{equipment.number}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="rechargeDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Date de recharge *
                      </label>
                      <input
                        type="date"
                        id="rechargeDate"
                        value={rechargeDate}
                        onChange={(e) => setRechargeDate(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={handleAddPARecharge}
                        disabled={!selectedEquipmentNumber || !rechargeDate}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                </div>

                {/* Liste des recharges ajoutées */}
                {paRecharges.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Recharges à mettre à jour</h4>
                    <div className="space-y-2">
                      {paRecharges.map(paRecharge => (
                        <div key={paRecharge.equipmentId} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                          <span className="text-sm text-green-800">
                            PA #{paRecharge.equipmentNumber} - {new Date(paRecharge.newRechargeDate).toLocaleDateString('fr-FR')}
                          </span>
                          <button
                            onClick={() => handleRemovePARecharge(paRecharge.equipmentId)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Supprimer
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
                  <button
                    onClick={() => setCurrentStep('completed')}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Terminer sans recharge
                  </button>
                  <button
                    onClick={handleFinalizePARecharges}
                    disabled={isProcessing}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Mise à jour...
                      </>
                    ) : (
                      'Finaliser les recharges'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Étape 5: Terminé */}
            {currentStep === 'completed' && (
              <div className="text-center py-8">
                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Mise à jour terminée !
                </h3>
                <p className="text-gray-600 mb-6">
                  Toutes les vérifications ont été mises à jour avec succès.
                  {paRecharges.length > 0 && ` ${paRecharges.length} recharge(s) PA ont également été enregistrées.`}
                </p>
                <button
                  onClick={handleClose}
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}