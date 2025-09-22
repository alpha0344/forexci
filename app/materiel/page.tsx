"use client";

import { useState, useEffect } from "react";
import { MaterialType, Material } from "@/types/material";
import { Edit, Shield, Zap, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Interface pour le formulaire de modification
interface MaterialFormData {
  type: MaterialType | "";
  validityTime: string;
  timeBeforeControl: string;
  timeBeforeReload: string;
}

export default function MaterielPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<MaterialFormData>({
    type: "",
    validityTime: "",
    timeBeforeControl: "",
    timeBeforeReload: "",
  });

  const formatControlPeriod = (days: number): string => {
    if (days % 365 === 0) {
      const years = days / 365;

      if (years === 1) {
        return "Annuel";
      } else if (years === 2) {
        return "Biannuel";
      } else {
        return `Tous les ${years} ans`;
      }
    }

    if (days % 90 === 0) {
      const quarters = days / 90;
      if (quarters === 1) {
        return "Trimestriel";
      } else if (quarters === 2) {
        return "Semestriel";
      } else if (quarters === 3) {
        return "Tous les 9 mois";
      } else {
        return `Tous les ${quarters} trimestres`;
      }
    }

    if (days % 30 === 0) {
      const months = days / 30;
      if (months === 1) {
        return "Mensuel";
      } else if (months === 6) {
        return "Semestriel";
      } else {
        return `Tous les ${months} mois`;
      }
    }
    return `${days} jours`;
  };

  // Fonction pour formater l'affichage du changement
  const formatChangePeriod = (days: number): string => {
    if (days % 365 === 0) {
      const years = days / 365;

      if (years === 1) {
        return "Chaque année";
      } else {
        return `Tous les ${years} ans`;
      }
    }

    // Vérifier si c'est un trimestre (90 jours = 1 trimestre)
    if (days % 90 === 0) {
      const quarters = days / 90;
      if (quarters === 1) {
        return "Chaque trimestre";
      } else if (quarters === 2) {
        return "Chaque semestre";
      } else {
        return `Tous les ${quarters} trimestres`;
      }
    }

    // Vérifier si c'est un nombre exact de mois
    if (days % 30 === 0) {
      const months = days / 30;
      if (months === 1) {
        return "Chaque mois";
      } else if (months === 6) {
        return "Chaque semestre";
      } else {
        return `Tous les ${months} mois`;
      }
    }
    return `${days} jours`;
  };

  const getMaterialIcon = (type: MaterialType) => {
    switch (type) {
      case "PA":
        return <div className="text-red-500">🧯</div>;
      case "PP":
        return <div className="text-red-500">🧯</div>;
      case "ALARM":
        return <Bell className="w-6 h-6" />;
      default:
        return <Shield className="w-6 h-6" />;
    }
  };

  const MaterialTypeLabels = {
    PA: "Pression Auxiliaire",
    PP: "Pression Permanente",
    ALARM: "Alarme",
  };

  // Charger les matériaux
  const fetchMaterials = async () => {
    try {
      const response = await fetch("/api/materials");

      if (response.ok) {
        const result = await response.json();
        // L'API retourne les données dans result.data
        setMaterials(result.data || []);
      } else {
        console.error("Erreur API:", response.status);
        setMaterials([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des matériaux:", error);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMaterials();
    }
  }, [isAuthenticated]);

  const resetForm = () => {
    setFormData({
      type: "",
      validityTime: "",
      timeBeforeControl: "",
      timeBeforeReload: "",
    });
    setEditingMaterial(null);
  };

  const openEditModal = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      type: material.type,
      validityTime: material.validityTime.toString(),
      timeBeforeControl: material.timeBeforeControl.toString(),
      timeBeforeReload: material.timeBeforeReload?.toString() || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.validityTime ||
      !formData.timeBeforeControl ||
      !editingMaterial
    ) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        type: formData.type,
        validityTime: parseInt(formData.validityTime),
        timeBeforeControl: parseInt(formData.timeBeforeControl),
        timeBeforeReload: formData.timeBeforeReload
          ? parseInt(formData.timeBeforeReload)
          : null,
      };

      const response = await fetch(`/api/materials/${editingMaterial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        fetchMaterials();
        closeModal();
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-gradient-subtle flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Types de <span className="text-brand-red-orange">Matériel</span>
          </h1>
          <p className="text-xl text-secondary max-w-2xl">
            Gérez vos modèles d'équipements de sécurité. Ces templates seront
            assignés à vos clients.
          </p>
        </div>

        {/* Barre d'actions */}
        <div className="mb-8">
          <p className="text-secondary">
            Consultez vos templates d'équipements de sécurité configurés.
          </p>
        </div>

        {/* Liste des matériaux */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-red mx-auto"></div>
            <p className="text-secondary mt-4">Chargement des matériaux...</p>
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">�</div>
            <h3 className="text-2xl font-bold text-primary mb-2">
              Aucun type de matériel trouvé
            </h3>
            <p className="text-secondary">
              Aucun template de matériel n'est actuellement configuré dans le
              système.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {materials.map((material) => (
              <div key={material.id} className="card group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                      {getMaterialIcon(material.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary text-lg">
                        {MaterialTypeLabels[material.type]}
                      </h3>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(material)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-secondary">Validité :</span>
                    <span className="font-semibold text-primary">
                      {formatChangePeriod(material.validityTime)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-secondary">Contrôle :</span>
                    <span className="font-semibold text-primary">
                      {formatControlPeriod(material.timeBeforeControl)}
                    </span>
                  </div>

                  {material.timeBeforeReload && (
                    <div className="flex justify-between">
                      <span className="text-secondary">Recharge :</span>
                      <span className="font-semibold text-primary">
                        {formatChangePeriod(material.timeBeforeReload)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de modification */}
        {isModalOpen && editingMaterial && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-primary mb-6">
                Modifier le template {MaterialTypeLabels[editingMaterial.type]}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Temps avant contrôle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temps avant contrôle (jours){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.timeBeforeControl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        timeBeforeControl: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    placeholder="Ex: 365"
                    min="1"
                    required
                  />
                </div>

                {/* Temps de validité */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temps de validité (jours){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.validityTime}
                    onChange={(e) =>
                      setFormData({ ...formData, validityTime: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    placeholder="Ex: 1825"
                    min="1"
                    required
                  />
                </div>

                {/* Temps avant recharge */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temps avant recharge (jours)
                  </label>
                  <input
                    type="number"
                    value={formData.timeBeforeReload}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        timeBeforeReload: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    placeholder="Ex: 90"
                    min="1"
                  />
                </div>

                {/* Boutons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    {submitting ? "Modification..." : "Modifier"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
