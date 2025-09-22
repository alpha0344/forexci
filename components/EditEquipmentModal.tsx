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

export interface EditEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: ClientEquipment | null;
  onEquipmentUpdated: (equipment: ClientEquipment) => void;
}

interface FormData {
  number: string;
  commissioningDate: string;
  lastVerificationDate: string;
  lastRechargeDate: string;
  rechargeType: "WATER_ADD" | "POWDER" | "";
  volume: string;
  notes: string;
}

interface FormErrors {
  number?: string;
  commissioningDate?: string;
  lastVerificationDate?: string;
  lastRechargeDate?: string;
  rechargeType?: string;
  volume?: string;
  notes?: string;
  general?: string;
}

export default function EditEquipmentModal({
  isOpen,
  onClose,
  equipment,
  onEquipmentUpdated,
}: EditEquipmentModalProps) {
  const [formData, setFormData] = useState<FormData>({
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

  // Fonction pour formater la date pour les inputs de type date
  const formatDateForInput = (dateString?: string | null): string => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  // Initialiser le formulaire avec les données de l'équipement
  useEffect(() => {
    if (equipment && isOpen) {
      setFormData({
        number: equipment.number.toString(),
        commissioningDate: formatDateForInput(equipment.commissioningDate),
        lastVerificationDate: formatDateForInput(
          equipment.lastVerificationDate,
        ),
        lastRechargeDate: formatDateForInput(equipment.lastRechargeDate),
        rechargeType: equipment.rechargeType || "",
        volume: equipment.volume?.toString() || "",
        notes: equipment.notes || "",
      });
      setErrors({});
    }
  }, [equipment, isOpen]);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      number: "",
      commissioningDate: "",
      lastVerificationDate: "",
      lastRechargeDate: "",
      rechargeType: "",
      volume: "",
      notes: "",
    });
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
    if (!equipment) return false;

    const newErrors: FormErrors = {};

    // Champs obligatoires pour tous les types
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
    switch (equipment.material.type) {
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
          newErrors.rechargeType = "Le type de recharge est requis pour les PA";
        }
        break;

      case "ALARM":
        // Pour ALARM : pas de champs supplémentaires requis
        break;
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

    if (!equipment || !validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Préparer les données selon le type de matériel
      const submitData: any = {
        number: parseInt(formData.number),
        commissioningDate: new Date(formData.commissioningDate).toISOString(),
        lastVerificationDate: formData.lastVerificationDate
          ? new Date(formData.lastVerificationDate).toISOString()
          : null,
      };

      // Ajouter notes seulement si non vide
      if (formData.notes.trim()) {
        submitData.notes = formData.notes.trim();
      } else {
        submitData.notes = null;
      }

      // Ajouter les champs spécifiques selon le type
      switch (equipment.material.type) {
        case "PP":
          submitData.volume = parseInt(formData.volume);
          // Pas de recharge pour PP
          submitData.lastRechargeDate = null;
          submitData.rechargeType = null;
          break;

        case "PA":
          submitData.volume = parseInt(formData.volume);
          submitData.lastRechargeDate = formData.lastRechargeDate
            ? new Date(formData.lastRechargeDate).toISOString()
            : null;
          submitData.rechargeType = formData.rechargeType || null;
          break;

        case "ALARM":
          // Pas de champs supplémentaires pour ALARM
          submitData.volume = null;
          submitData.lastRechargeDate = null;
          submitData.rechargeType = null;
          break;
      }

      const response = await fetch(`/api/equipments/${equipment.id}`, {
        method: "PUT",
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
      onEquipmentUpdated(result.data);
      handleClose();
    } catch (error) {
      console.error("Erreur lors de la modification de l'équipement:", error);
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

  if (!isOpen || !equipment) return null;

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
              Modifier l'équipement #{equipment.number}
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

            {/* Information sur le type de matériel */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                Type de matériel : {equipment.material.type}
              </h3>
              <p className="text-xs text-blue-700">
                Validité: {equipment.material.validityTime} jours - Contrôle
                tous les {equipment.material.timeBeforeControl} jours
                {equipment.material.timeBeforeReload &&
                  ` - Recharge tous les ${equipment.material.timeBeforeReload} jours`}
              </p>
            </div>

            {/* Informations de base */}
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
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-t pt-4">
                Informations spécifiques - {equipment.material.type}
              </h3>

              {equipment.material.type === "PP" && (
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

              {equipment.material.type === "PA" && (
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

              {equipment.material.type === "ALARM" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    ✓ Pour les alarmes, seuls le numéro, la date de mise en
                    service, la date de dernier contrôle et les notes sont
                    nécessaires.
                  </p>
                </div>
              )}
            </div>

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
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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
                    Modification...
                  </>
                ) : (
                  "Sauvegarder"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
