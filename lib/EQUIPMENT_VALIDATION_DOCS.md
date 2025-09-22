# Documentation - Fonctions de Validation des Équipements

## 📖 Vue d'ensemble

Ce module fournit des fonctions utilitaires pour valider les statuts des équipements en fonction de leurs dates de mise en service, contrôles et recharges.

## 🚀 Import et utilisation

```typescript
import {
  isEquipmentValid,
  isControlValid,
  isRechargeValid,
  getEquipmentStatusSummary,
  getEquipmentPriority,
} from "@/lib/equipmentValidation";
```

## 📋 Fonctions principales

### 1. `isEquipmentValid(equipment): boolean`

Vérifie si l'équipement est encore dans sa période de validité.

**Paramètres :**

- `equipment`: Équipement avec son matériel associé

**Retourne :**

- `true` : L'équipement est encore valide
- `false` : L'équipement a dépassé sa durée de vie

**Exemple :**

```typescript
const equipment = {
  id: "eq-123",
  commissioningDate: "2023-01-01",
  material: {
    id: "mat-456",
    type: "PA",
    validityTime: 365, // 1 an
    timeBeforeControl: 90,
    timeBeforeReload: 180,
  },
};

const isValid = isEquipmentValid(equipment);
console.log(`Équipement valide: ${isValid}`);
```

### 2. `isControlValid(equipment): boolean`

Vérifie si le contrôle de l'équipement est encore valide.

**Paramètres :**

- `equipment`: Équipement avec son matériel associé

**Retourne :**

- `true` : Le contrôle est encore valide
- `false` : Un contrôle est nécessaire

**Exemple :**

```typescript
const equipment = {
  id: "eq-123",
  commissioningDate: "2023-01-01",
  lastVerificationDate: "2024-06-01",
  material: {
    timeBeforeControl: 90, // 3 mois
  },
};

const controlOk = isControlValid(equipment);
console.log(`Contrôle valide: ${controlOk}`);
```

### 3. `isRechargeValid(equipment): boolean | null`

Vérifie si la recharge de l'équipement est encore valide (uniquement pour les PA).

**Paramètres :**

- `equipment`: Équipement avec son matériel associé

**Retourne :**

- `true` : La recharge est encore valide
- `false` : Une recharge est nécessaire
- `null` : Non applicable (pas un PA ou pas de délai de recharge)

**Exemple :**

```typescript
const equipmentPA = {
  id: "eq-123",
  commissioningDate: "2023-01-01",
  lastRechargeDate: "2024-03-01",
  material: {
    type: "PA",
    timeBeforeReload: 180, // 6 mois
  },
};

const rechargeOk = isRechargeValid(equipmentPA);
if (rechargeOk === null) {
  console.log("Recharge non applicable");
} else {
  console.log(`Recharge valide: ${rechargeOk}`);
}
```

## 🔍 Fonctions détaillées

### `getEquipmentStatusSummary(equipment): EquipmentStatusSummary`

Obtient un résumé complet du statut d'un équipement.

**Exemple :**

```typescript
const summary = getEquipmentStatusSummary(equipment);

console.log("=== RÉSUMÉ DE L'ÉQUIPEMENT ===");
console.log(`Validité: ${summary.validity.isValid ? "✅" : "❌"}`);
console.log(`Contrôle: ${summary.control.isValid ? "✅" : "❌"}`);
console.log(`Recharge: ${summary.recharge?.isValid ? "✅" : "❌"}`);
console.log(`Problèmes détectés: ${summary.issueCount}`);

if (summary.validity.isExpired) {
  console.log(
    `⚠️ Validité expirée depuis ${summary.validity.daysSinceExpiry} jours`,
  );
}

if (summary.control.isExpired) {
  console.log(
    `⚠️ Contrôle en retard de ${summary.control.daysSinceExpiry} jours`,
  );
}
```

### `getEquipmentPriority(equipment): 1 | 2 | 3`

Détermine la priorité d'un équipement.

**Exemple :**

```typescript
const priority = getEquipmentPriority(equipment);

const priorityLabels = {
  1: "🔴 CRITIQUE",
  2: "🟠 IMPORTANTE",
  3: "🟢 NORMALE",
};

console.log(`Priorité: ${priorityLabels[priority]}`);
```

## 🎯 Cas d'usage pratiques

### 1. Dashboard de surveillance

```typescript
import {
  getEquipmentsNeedingAttention,
  getEquipmentPriority,
} from "@/lib/equipmentValidation";

const equipments = await fetchClientEquipments(clientId);
const needsAttention = getEquipmentsNeedingAttention(equipments);

// Trier par priorité
const sortedByPriority = needsAttention.sort(
  (a, b) => getEquipmentPriority(a) - getEquipmentPriority(b),
);

console.log(`${needsAttention.length} équipements nécessitent une attention`);
```

### 2. Alertes dans l'interface

```typescript
import { getEquipmentStatusSummary } from '@/lib/equipmentValidation';

const EquipmentCard = ({ equipment }) => {
  const summary = getEquipmentStatusSummary(equipment);

  return (
    <div className={`card ${summary.hasAnyIssue ? 'border-red-500' : 'border-green-500'}`}>
      <h3>Équipement #{equipment.number}</h3>

      {!summary.validity.isValid && (
        <div className="alert alert-error">
          ❌ Validité expirée
        </div>
      )}

      {!summary.control.isValid && (
        <div className="alert alert-warning">
          ⚠️ Contrôle nécessaire
        </div>
      )}

      {summary.recharge && !summary.recharge.isValid && (
        <div className="alert alert-info">
          🔄 Recharge nécessaire
        </div>
      )}
    </div>
  );
};
```

### 3. Calcul des échéances

```typescript
import {
  getEquipmentValidityStatus,
  getControlStatus,
} from "@/lib/equipmentValidation";

const equipment = await fetchEquipment(equipmentId);

const validityStatus = getEquipmentValidityStatus(equipment);
const controlStatus = getControlStatus(equipment);

console.log(`Validité expire dans ${validityStatus.daysRemaining} jours`);
console.log(`Prochain contrôle dans ${controlStatus.daysRemaining} jours`);

// Planifier des rappels
if (validityStatus.daysRemaining <= 30) {
  scheduleValidityReminder(equipment);
}

if (controlStatus.daysRemaining <= 7) {
  scheduleControlReminder(equipment);
}
```

## 📊 Types de retour

### `ValidationResult`

```typescript
interface ValidationResult {
  isValid: boolean; // Statut de validité
  daysRemaining: number; // Jours restants avant expiration
  expirationDate: Date; // Date d'expiration
  isExpired: boolean; // Si déjà expiré
  daysSinceExpiry?: number; // Jours depuis l'expiration (si applicable)
}
```

### `EquipmentStatusSummary`

```typescript
interface EquipmentStatusSummary {
  validity: ValidationResult;
  control: ValidationResult & { hasNeverBeenControlled: boolean };
  recharge: (ValidationResult & { hasNeverBeenRecharged: boolean }) | null;
  hasAnyIssue: boolean; // True si au moins un problème
  issueCount: number; // Nombre total de problèmes
}
```

## ⚠️ Notes importantes

1. **Dates** : Les fonctions acceptent les dates au format `string` ou `Date`
2. **Recharge** : Uniquement applicable aux équipements de type `PA`
3. **Contrôle initial** : Si aucun contrôle n'a été effectué, la date de mise en service est utilisée comme référence
4. **Recharge initiale** : Si aucune recharge n'a été effectuée, la date de mise en service est utilisée comme référence

## 🔧 Migration depuis l'ancien code

Si vous avez du code existant, voici comment migrer :

```typescript
// ❌ Ancien code
const isValidEquipment = (equipment) => {
  const today = new Date();
  const commissioningDate = new Date(equipment.commissioningDate);
  const expiryDate = new Date(
    commissioningDate.getTime() +
      equipment.material.validityTime * 24 * 60 * 60 * 1000,
  );
  return today <= expiryDate;
};

// ✅ Nouveau code
import { isEquipmentValid } from "@/lib/equipmentValidation";
const isValidEquipment = isEquipmentValid(equipment);
```
