"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Client {
  id: string;
  name: string;
  location: string;
  contactName: string;
  email?: string | null;
  phone?: string | null;
}

export interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onClientUpdated: (client: Client) => void;
}

interface FormData {
  name: string;
  location: string;
  contactName: string;
  email?: string | null;
  phone: string;
}

interface FormErrors {
  name?: string;
  location?: string;
  contactName?: string;
  email?: string | null;
  phone?: string;
  general?: string;
}

export default function EditClientModal({
  isOpen,
  onClose,
  client,
  onClientUpdated,
}: EditClientModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    location: "",
    contactName: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialiser le formulaire avec les données du client
  useEffect(() => {
    if (client && isOpen) {
      setFormData({
        name: client.name,
        location: client.location,
        contactName: client.contactName,
        email: client.email || "",
        phone: client.phone || "",
      });
      setErrors({});
    }
  }, [client, isOpen]);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      name: "",
      location: "",
      contactName: "",
      email: "",
      phone: "",
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
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom de l'entreprise est requis";
    }

    if (!formData.location.trim()) {
      newErrors.location = "La localisation est requise";
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = "Le nom du contact est requis";
    }

    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Format d'email invalide (ex: user@example.com)";
    }

    if (
      formData.phone &&
      !formData.phone.match(/^(?:\+33|0)[1-9](?:[0-9]{8})$/)
    ) {
      newErrors.phone = "Format de téléphone invalide (ex: 01 23 45 67 89)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestionnaire de soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!client || !validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const updateData: any = {};

      // Seulement envoyer les champs modifiés
      if (formData.name.trim() !== client.name) {
        updateData.name = formData.name.trim();
      }
      if (formData.location.trim() !== client.location) {
        updateData.location = formData.location.trim();
      }
      if (formData.contactName.trim() !== client.contactName) {
        updateData.contactName = formData.contactName.trim();
      }
      if (formData.email.trim() !== (client.email || "")) {
        updateData.email = formData.email.trim() || undefined;
      }
      if (formData.phone.trim() !== (client.phone || "")) {
        updateData.phone = formData.phone.trim() || undefined;
      }

      // Si aucun changement, fermer le modal
      if (Object.keys(updateData).length === 0) {
        handleClose();
        return;
      }

      const response = await fetch(`/api/clients/${client.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setErrors({
            general: "Un client avec ce nom et cette localisation existe déjà",
          });
        } else {
          setErrors({ general: result.error || "Une erreur est survenue" });
        }
        return;
      }

      // Succès
      onClientUpdated(result.data);
      handleClose();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du client:", error);
      setErrors({ general: "Erreur de connexion. Veuillez réessayer." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestionnaire de changement des champs
  const handleInputChange =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      // Supprimer l'erreur du champ modifié
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  if (!isOpen || !client) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Modifier les informations client
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

            {/* Nom de l'entreprise */}
            <div>
              <label
                htmlFor="edit-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nom de l'entreprise *
              </label>
              <input
                type="text"
                id="edit-name"
                value={formData.name}
                onChange={handleInputChange("name")}
                className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.name ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="ex: Entreprise Alpha"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Localisation */}
            <div>
              <label
                htmlFor="edit-location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Localisation *
              </label>
              <input
                type="text"
                id="edit-location"
                value={formData.location}
                onChange={handleInputChange("location")}
                className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.location ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="ex: Paris 75001"
                disabled={isSubmitting}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>

            {/* Nom du contact */}
            <div>
              <label
                htmlFor="edit-contactName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nom du contact principal *
              </label>
              <input
                type="text"
                id="edit-contactName"
                value={formData.contactName}
                onChange={handleInputChange("contactName")}
                className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.contactName ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="ex: Jean Dupont"
                disabled={isSubmitting}
              />
              {errors.contactName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.contactName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="text"
                id="email"
                value={formData.email}
                onChange={handleInputChange("email")}
                className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.email ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="ex: jean.dupont@example.com"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label
                htmlFor="edit-phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Téléphone
              </label>
              <input
                type="tel"
                id="edit-phone"
                value={formData.phone}
                onChange={handleInputChange("phone")}
                className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.phone ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="ex: 01 23 45 67 89"
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Optionnel - Format accepté: 01 23 45 67 89 ou +33 1 23 45 67 89
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
                    Mise à jour...
                  </>
                ) : (
                  "Mettre à jour"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
