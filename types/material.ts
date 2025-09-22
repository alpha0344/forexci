/**
 * Types pour la gestion des matériaux
 * Correspond au schéma de la base de données Prisma
 */

export enum MaterialType {
  PA = "PA", // Pression Auxiliaire
  PP = "PP", // Pression permanente
  ALARM = "ALARM", // Alarme
}

export interface Material {
  id: string;
  type: MaterialType;
  validityTime: number; // Temps avant changement/maintenance de la pièce
  timeBeforeControl: number; // Temps en jours avant contrôle obligatoire
  timeBeforeReload?: number | null; // Temps avant le changement de produit (optionnel)
}

/**
 * Utilitaires pour les labels d'affichage
 */
export const MaterialTypeLabels: Record<MaterialType, string> = {
  [MaterialType.PA]: "Pression Auxiliaire",
  [MaterialType.PP]: "Pression permanente",
  [MaterialType.ALARM]: "Alarme",
};

/**
 * Fonctions utilitaires
 */
export const getMaterialTypeLabel = (type: MaterialType): string => {
  return MaterialTypeLabels[type];
};

/**
 * Validation des données
 */
export const isValidMaterialType = (type: string): type is MaterialType => {
  return Object.values(MaterialType).includes(type as MaterialType);
};
