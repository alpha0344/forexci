/**
 * Fonctions utilitaires pour la validation des équipements
 * 
 * Ces fonctions permettent de vérifier les statuts de validité, contrôle et recharge
 * des équipements en se basant sur les dates et les paramètres du matériel associé.
 * 
 * @author Développeur Senior
 * @version 1.0
 */

import { MaterialType } from '@/types/material';

/**
 * Interface pour représenter un équipement avec son matériel associé
 * Compatible avec les données provenant de Prisma
 */
export interface EquipmentWithMaterial {
  id: string;
  commissioningDate: string | Date;
  lastVerificationDate?: string | Date | null;
  lastRechargeDate?: string | Date | null;
  material: {
    id: string;
    type: MaterialType;
    validityTime: number;              // En jours
    timeBeforeControl: number;         // En jours
    timeBeforeReload?: number | null;  // En jours
  };
}

/**
 * Résultat de validation avec informations détaillées
 */
export interface ValidationResult {
  isValid: boolean;
  daysRemaining: number;
  expirationDate: Date;
  isExpired: boolean;
  daysSinceExpiry?: number;
}

/**
 * Convertit une date en objet Date
 * @param date - Date au format string ou Date
 * @returns Date object
 */
const parseDate = (date: string | Date): Date => {
  return typeof date === 'string' ? new Date(date) : date;
};

/**
 * Ajoute des jours à une date
 * @param date - Date de base
 * @param days - Nombre de jours à ajouter
 * @returns Nouvelle date
 */
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Calcule la différence en jours entre deux dates
 * @param date1 - Première date
 * @param date2 - Deuxième date
 * @returns Différence en jours (positif si date2 > date1)
 */
const daysDifference = (date1: Date, date2: Date): number => {
  const diffTime = date2.getTime() - date1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * ============================================================================
 * VALIDATION DE LA VALIDITÉ DE L'ÉQUIPEMENT
 * ============================================================================
 * 
 * Vérifie si l'équipement est encore dans sa période de validité
 * basée sur la date de mise en service et la validité du matériel
 */

/**
 * Vérifie la validité de l'équipement (simple boolean)
 * @param equipment - Équipement avec son matériel
 * @returns true si l'équipement est encore valide, false sinon
 */
export const isEquipmentValid = (equipment: EquipmentWithMaterial): boolean => {
  const commissioningDate = parseDate(equipment.commissioningDate);
  const validityPeriodDays = equipment.material.validityTime;
  const expirationDate = addDays(commissioningDate, validityPeriodDays);
  const today = new Date();

  return today <= expirationDate;
};

/**
 * Vérifie la validité de l'équipement (avec détails)
 * @param equipment - Équipement avec son matériel
 * @returns Résultat détaillé de la validation
 */
export const getEquipmentValidityStatus = (equipment: EquipmentWithMaterial): ValidationResult => {
  const commissioningDate = parseDate(equipment.commissioningDate);
  const validityPeriodDays = equipment.material.validityTime;
  const expirationDate = addDays(commissioningDate, validityPeriodDays);
  const today = new Date();
  
  const daysRemaining = daysDifference(today, expirationDate);
  const isExpired = today > expirationDate;
  
  return {
    isValid: !isExpired,
    daysRemaining: isExpired ? 0 : daysRemaining,
    expirationDate,
    isExpired,
    daysSinceExpiry: isExpired ? Math.abs(daysRemaining) : undefined
  };
};

/**
 * ============================================================================
 * VALIDATION DU CONTRÔLE
 * ============================================================================
 * 
 * Vérifie si l'équipement nécessite un contrôle
 * basé sur la date de dernière vérification et le délai avant contrôle
 */

/**
 * Vérifie si le contrôle de l'équipement est encore valide (simple boolean)
 * @param equipment - Équipement avec son matériel
 * @returns true si le contrôle est encore valide, false sinon
 */
export const isControlValid = (equipment: EquipmentWithMaterial): boolean => {
  // Si aucune vérification n'a été effectuée, le contrôle n'est pas valide
  if (!equipment.lastVerificationDate) {
    return false;
  }

  const lastVerificationDate = parseDate(equipment.lastVerificationDate);
  const controlPeriodDays = equipment.material.timeBeforeControl;
  const nextControlDate = addDays(lastVerificationDate, controlPeriodDays);
  const today = new Date();

  return today <= nextControlDate;
};

/**
 * Vérifie le statut du contrôle de l'équipement (avec détails)
 * @param equipment - Équipement avec son matériel
 * @returns Résultat détaillé de la validation du contrôle
 */
export const getControlStatus = (equipment: EquipmentWithMaterial): ValidationResult & { hasNeverBeenControlled: boolean } => {
  // Si aucune vérification n'a été effectuée
  if (!equipment.lastVerificationDate) {
    const commissioningDate = parseDate(equipment.commissioningDate);
    const controlPeriodDays = equipment.material.timeBeforeControl;
    const firstControlDate = addDays(commissioningDate, controlPeriodDays);
    const today = new Date();
    
    const daysRemaining = daysDifference(today, firstControlDate);
    const isExpired = today > firstControlDate;
    
    return {
      isValid: !isExpired,
      daysRemaining: isExpired ? 0 : daysRemaining,
      expirationDate: firstControlDate,
      isExpired,
      daysSinceExpiry: isExpired ? Math.abs(daysRemaining) : undefined,
      hasNeverBeenControlled: true
    };
  }

  const lastVerificationDate = parseDate(equipment.lastVerificationDate);
  const controlPeriodDays = equipment.material.timeBeforeControl;
  const nextControlDate = addDays(lastVerificationDate, controlPeriodDays);
  const today = new Date();
  
  const daysRemaining = daysDifference(today, nextControlDate);
  const isExpired = today > nextControlDate;
  
  return {
    isValid: !isExpired,
    daysRemaining: isExpired ? 0 : daysRemaining,
    expirationDate: nextControlDate,
    isExpired,
    daysSinceExpiry: isExpired ? Math.abs(daysRemaining) : undefined,
    hasNeverBeenControlled: false
  };
};

/**
 * ============================================================================
 * VALIDATION DE LA RECHARGE
 * ============================================================================
 * 
 * Vérifie si l'équipement nécessite une recharge (uniquement pour les PA)
 * basé sur la date de dernière recharge et le délai avant recharge
 */

/**
 * Vérifie si la recharge de l'équipement est encore valide (simple boolean)
 * @param equipment - Équipement avec son matériel
 * @returns true si la recharge est encore valide, false si recharge nécessaire, null si non applicable
 */
export const isRechargeValid = (equipment: EquipmentWithMaterial): boolean | null => {
  // La recharge ne s'applique qu'aux équipements PA
  if (equipment.material.type !== MaterialType.PA) {
    return null; // Non applicable
  }

  // Si pas de délai de recharge défini, considérer comme valide
  if (!equipment.material.timeBeforeReload) {
    return true;
  }

  // Si aucune recharge n'a été effectuée, utiliser la date de mise en service
  const baseDate = equipment.lastRechargeDate 
    ? parseDate(equipment.lastRechargeDate)
    : parseDate(equipment.commissioningDate);
  
  const rechargePeriodDays = equipment.material.timeBeforeReload;
  const nextRechargeDate = addDays(baseDate, rechargePeriodDays);
  const today = new Date();

  return today <= nextRechargeDate;
};

/**
 * Vérifie le statut de recharge de l'équipement (avec détails)
 * @param equipment - Équipement avec son matériel
 * @returns Résultat détaillé de la validation de recharge ou null si non applicable
 */
export const getRechargeStatus = (equipment: EquipmentWithMaterial): (ValidationResult & { hasNeverBeenRecharged: boolean }) | null => {
  // La recharge ne s'applique qu'aux équipements PA
  if (equipment.material.type !== MaterialType.PA) {
    return null; // Non applicable
  }

  // Si pas de délai de recharge défini
  if (!equipment.material.timeBeforeReload) {
    return null; // Non applicable
  }

  const hasNeverBeenRecharged = !equipment.lastRechargeDate;
  
  // Utiliser la date de dernière recharge ou la date de mise en service
  const baseDate = equipment.lastRechargeDate 
    ? parseDate(equipment.lastRechargeDate)
    : parseDate(equipment.commissioningDate);
  
  const rechargePeriodDays = equipment.material.timeBeforeReload;
  const nextRechargeDate = addDays(baseDate, rechargePeriodDays);
  const today = new Date();
  
  const daysRemaining = daysDifference(today, nextRechargeDate);
  const isExpired = today > nextRechargeDate;
  
  return {
    isValid: !isExpired,
    daysRemaining: isExpired ? 0 : daysRemaining,
    expirationDate: nextRechargeDate,
    isExpired,
    daysSinceExpiry: isExpired ? Math.abs(daysRemaining) : undefined,
    hasNeverBeenRecharged
  };
};

/**
 * ============================================================================
 * FONCTIONS UTILITAIRES SUPPLÉMENTAIRES
 * ============================================================================
 */

/**
 * Obtient un résumé complet du statut d'un équipement
 * @param equipment - Équipement avec son matériel
 * @returns Résumé complet des statuts
 */
export interface EquipmentStatusSummary {
  validity: ValidationResult;
  control: ValidationResult & { hasNeverBeenControlled: boolean };
  recharge: (ValidationResult & { hasNeverBeenRecharged: boolean }) | null;
  hasAnyIssue: boolean;
  issueCount: number;
}

export const getEquipmentStatusSummary = (equipment: EquipmentWithMaterial): EquipmentStatusSummary => {
  const validity = getEquipmentValidityStatus(equipment);
  const control = getControlStatus(equipment);
  const recharge = getRechargeStatus(equipment);
  
  const issues = [
    !validity.isValid,
    !control.isValid,
    recharge && !recharge.isValid
  ].filter(Boolean);
  
  return {
    validity,
    control,
    recharge,
    hasAnyIssue: issues.length > 0,
    issueCount: issues.length
  };
};

/**
 * Détermine la priorité d'un équipement basée sur ses statuts
 * @param equipment - Équipement avec son matériel
 * @returns Niveau de priorité (1 = critique, 2 = importante, 3 = normale)
 */
export const getEquipmentPriority = (equipment: EquipmentWithMaterial): 1 | 2 | 3 => {
  const summary = getEquipmentStatusSummary(equipment);
  
  // Priorité critique : validité expirée ou contrôle en retard > 30 jours
  if (!summary.validity.isValid || 
      (summary.control.isExpired && summary.control.daysSinceExpiry! > 30)) {
    return 1;
  }
  
  // Priorité importante : contrôle expiré ou recharge expirée
  if (!summary.control.isValid || 
      (summary.recharge && !summary.recharge.isValid)) {
    return 2;
  }
  
  // Priorité normale : tout est ok
  return 3;
};

/**
 * Filtre les équipements nécessitant une attention
 * @param equipments - Liste des équipements
 * @returns Équipements nécessitant une attention
 */
export const getEquipmentsNeedingAttention = (equipments: EquipmentWithMaterial[]): EquipmentWithMaterial[] => {
  return equipments.filter(equipment => {
    const summary = getEquipmentStatusSummary(equipment);
    return summary.hasAnyIssue;
  });
};