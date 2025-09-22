"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

// Types basés sur votre schéma Prisma
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

export interface AddEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  onEquipmentAdded: (equipment: ClientEquipment) => void;
}

interface FormData {
  materialId: string;
  number: string;
  commissioningDate: string;
  lastVerificationDate: string; // Pour PP
  lastRechargeDate: string; // Pour PA
  rechargeType: "WATER_ADD" | "POWDER" | ""; // Pour PA
  volume: string; // Pour PP
  notes: string;
}

interface FormErrors {
  materialId?: string;
  number?: string;
  commissioningDate?: string;
  lastVerificationDate?: string;
  lastRechargeDate?: string;
  rechargeType?: string;
  volume?: string;
  notes?: string;
  general?: string;
}

export default function AddEquipmentModal({
  isOpen,
  onClose,
  clientId,
  onEquipmentAdded,
}: AddEquipmentModalProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null,
  );
  const [formData, setFormData] = useState<FormData>({
    materialId: "",
    number: "",
    commissioningDate: "",
    lastVerificationDate: "",
    lastRechargeDate: "",
    rechargeType: "",
    volume: "",
    notes: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);

  // Charger les matériaux disponibles
  const fetchMaterials = async () => {
    try {
      setIsLoadingMaterials(true);
      const response = await fetch("/api/materials");
      const result = await response.json();

      if (response.ok) {
        setMaterials(result.data || []);
      } else {
        console.error("Erreur lors du chargement des matériaux:", result.error);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des matériaux:", error);
    } finally {
      setIsLoadingMaterials(false);
    }
  };

  // Charger les matériaux à l'ouverture du modal
  useEffect(() => {
    if (isOpen) {
      fetchMaterials();
    }
  }, [isOpen]);

  // Mettre à jour le matériel sélectionné quand l'ID change
  useEffect(() => {
    if (formData.materialId) {
      const material = materials.find((m) => m.id === formData.materialId);
      setSelectedMaterial(material || null);
    } else {
      setSelectedMaterial(null);
    }
  }, [formData.materialId, materials]);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      materialId: "",
      number: "",
      commissioningDate: "",
      lastVerificationDate: "",
      lastRechargeDate: "",
      rechargeType: "",
      volume: "",
      notes: "",
    });
    setSelectedMaterial(null);
    setErrors({});
    setIsSubmitting(false);
  };

  // Gestionnaire de fermeture
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Champs obligatoires pour tous les types
    if (!formData.materialId) {
      newErrors.materialId = "Le type de matériel est requis";
    }

    if (!formData.number) {
      newErrors.number = "Le numéro est requis";
    } else {
      const numberValue = parseInt(formData.number);
      if (isNaN(numberValue) || numberValue <= 0) {
        newErrors.number = "Le numéro doit être un entier positif";
      }
    }

    if (!formData.commissioningDate) {
      newErrors.commissioningDate = "La date de mise en service est requise";
    }

    // Date de dernier contrôle requise pour tous les types
    if (!formData.lastVerificationDate) {
      newErrors.lastVerificationDate =
        "La date de dernier contrôle est requise";
    }

    // Validations spécifiques selon le type de matériel
    if (selectedMaterial) {
      switch (selectedMaterial.type) {
        case "PP":
          // Pour PP : volume requis
          if (!formData.volume) {
            newErrors.volume = "Le volume est requis pour les PP";
          } else {
            const volumeValue = parseInt(formData.volume);
            if (isNaN(volumeValue) || volumeValue <= 0) {
              newErrors.volume = "Le volume doit être un entier positif";
            }
          }
          break;

        case "PA":
          // Pour PA : volume, lastRechargeDate et rechargeType requis
          if (!formData.volume) {
            newErrors.volume = "Le volume est requis pour les PA";
          } else {
            const volumeValue = parseInt(formData.volume);
            if (isNaN(volumeValue) || volumeValue <= 0) {
              newErrors.volume = "Le volume doit être un entier positif";
            }
          }
          if (!formData.lastRechargeDate) {
            newErrors.lastRechargeDate =
              "La date de dernière recharge est requise pour les PA";
          }
          if (!formData.rechargeType) {
            newErrors.rechargeType =
              "Le type de recharge est requis pour les PA";
          }
          break;

        case "ALARM":
          // Pour ALARM : pas de champs supplémentaires requis
          break;
      }
    }

    // Validation des notes (optionnel mais limité)
    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = "Les notes ne peuvent pas dépasser 500 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestionnaire de soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Préparer les données selon le type de matériel
      const submitData: any = {
        materialId: formData.materialId,
        number: parseInt(formData.number),
        commissioningDate: new Date(formData.commissioningDate).toISOString(),
        lastVerificationDate: new Date(
          formData.lastVerificationDate,
        ).toISOString(), // Requis pour tous
        notes: formData.notes.trim() || undefined,
      };

      // Ajouter les champs spécifiques selon le type
      if (selectedMaterial) {
        switch (selectedMaterial.type) {
          case "PP":
            submitData.volume = parseInt(formData.volume);
            break;

          case "PA":
            submitData.volume = parseInt(formData.volume);
            submitData.lastRechargeDate = new Date(
              formData.lastRechargeDate,
            ).toISOString();
            submitData.rechargeType = formData.rechargeType;
            break;

          case "ALARM":
            // Pas de champs supplémentaires
            break;
        }
      }

      const response = await fetch(`/api/clients/${clientId}/equipments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrors({ general: result.error || "Une erreur est survenue" });
        return;
      }

      // Succès
      onEquipmentAdded(result.data);
      handleClose();
    } catch (error) {
      console.error("Erreur lors de la création de l'équipement:", error);
      setErrors({ general: "Erreur de connexion. Veuillez réessayer." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestionnaire de changement des champs
  const handleInputChange =
    (field: keyof FormData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      // Supprimer l'erreur du champ modifié
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
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
              Ajouter un nouvel équipement
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Corps du modal */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Erreur générale */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Sélection du matériel */}
            <div>
              <label
                htmlFor="material"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Type de matériel *
              </label>
              {isLoadingMaterials ? (
                <div className="flex items-center justify-center py-8">
                  <svg
                    className="animate-spin h-5 w-5 text-blue-600"
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
                  <span className="ml-2 text-gray-600">
                    Chargement des matériaux...
                  </span>
                </div>
              ) : (
                <select
                  id="material"
                  value={formData.materialId}
                  onChange={handleInputChange("materialId")}
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.materialId ? "border-red-300" : "border-gray-300"
                  }`}
                  disabled={isSubmitting}
                >
                  <option value="">Sélectionner un type de matériel</option>
                  {materials.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.type} - Contrôle tous les{" "}
                      {material.timeBeforeControl} jours
                    </option>
                  ))}
                </select>
              )}
              {errors.materialId && (
                <p className="mt-1 text-sm text-red-600">{errors.materialId}</p>
              )}
              {selectedMaterial && (
                <p className="mt-1 text-xs text-gray-500">
                  Validité: {selectedMaterial.validityTime} jours
                  {selectedMaterial.timeBeforeReload &&
                    ` - Recharge tous les ${selectedMaterial.timeBeforeReload} jours`}
                </p>
              )}
            </div>

            {/* Informations de base (toujours affichées) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Numéro */}
              <div>
                <label
                  htmlFor="number"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Numéro d'identification *
                </label>
                <input
                  type="number"
                  id="number"
                  value={formData.number}
                  onChange={handleInputChange("number")}
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.number ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="ex: 1"
                  min="1"
                  disabled={isSubmitting}
                />
                {errors.number && (
                  <p className="mt-1 text-sm text-red-600">{errors.number}</p>
                )}
              </div>

              {/* Date de mise en service */}
              <div>
                <label
                  htmlFor="commissioningDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Date de mise en service *
                </label>
                <input
                  type="date"
                  id="commissioningDate"
                  value={formData.commissioningDate}
                  onChange={handleInputChange("commissioningDate")}
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.commissioningDate
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  disabled={isSubmitting}
                />
                {errors.commissioningDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.commissioningDate}
                  </p>
                )}
              </div>
            </div>

            {/* Date de dernier contrôle (requis pour tous) */}
            <div>
              <label
                htmlFor="lastVerificationDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date de dernier contrôle *
              </label>
              <input
                type="date"
                id="lastVerificationDate"
                value={formData.lastVerificationDate}
                onChange={handleInputChange("lastVerificationDate")}
                className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.lastVerificationDate
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
                disabled={isSubmitting}
              />
              {errors.lastVerificationDate && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.lastVerificationDate}
                </p>
              )}
            </div>

            {/* Champs spécifiques selon le type de matériel */}
            {selectedMaterial && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-t pt-4">
                  Informations spécifiques - {selectedMaterial.type}
                </h3>

                {selectedMaterial.type === "PP" && (
                  <div className="grid grid-cols-1 gap-4">
                    {/* Volume */}
                    <div>
                      <label
                        htmlFor="volume"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Volume (litres) *
                      </label>
                      <input
                        type="number"
                        id="volume"
                        value={formData.volume}
                        onChange={handleInputChange("volume")}
                        className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.volume ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="ex: 25"
                        min="1"
                        disabled={isSubmitting}
                      />
                      {errors.volume && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.volume}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedMaterial.type === "PA" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Volume */}
                    <div>
                      <label
                        htmlFor="volume"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Volume (litres) *
                      </label>
                      <input
                        type="number"
                        id="volume"
                        value={formData.volume}
                        onChange={handleInputChange("volume")}
                        className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.volume ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="ex: 25"
                        min="1"
                        disabled={isSubmitting}
                      />
                      {errors.volume && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.volume}
                        </p>
                      )}
                    </div>

                    {/* Date de dernière recharge */}
                    <div>
                      <label
                        htmlFor="lastRechargeDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Date de dernière recharge *
                      </label>
                      <input
                        type="date"
                        id="lastRechargeDate"
                        value={formData.lastRechargeDate}
                        onChange={handleInputChange("lastRechargeDate")}
                        className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.lastRechargeDate
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.lastRechargeDate && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.lastRechargeDate}
                        </p>
                      )}
                    </div>

                    {/* Type de recharge */}
                    <div className="md:col-span-2">
                      <label
                        htmlFor="rechargeType"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Type de recharge *
                      </label>
                      <select
                        id="rechargeType"
                        value={formData.rechargeType}
                        onChange={handleInputChange("rechargeType")}
                        className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.rechargeType
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        disabled={isSubmitting}
                      >
                        <option value="">Sélectionner le type</option>
                        <option value="WATER_ADD">Eau + additif</option>
                        <option value="POWDER">Poudre</option>
                      </select>
                      {errors.rechargeType && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.rechargeType}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedMaterial.type === "ALARM" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                      ✓ Pour les alarmes, seuls le numéro, la date de mise en
                      service, la date de dernier contrôle et les notes sont
                      nécessaires.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Notes (optionnel)
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={handleInputChange("notes")}
                rows={3}
                className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.notes ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Informations supplémentaires sur l'équipement..."
                disabled={isSubmitting}
                maxLength={500}
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.notes.length}/500 caractères
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.materialId}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Création...
                  </>
                ) : (
                  "Créer l'équipement"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
