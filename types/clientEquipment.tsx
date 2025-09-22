import { Material } from './material'; // Adjust the path as needed

export enum RechargeType {
  WATER_ADD = "WATER_ADD",
  POWDER = "POWDER",
  CO2 = "CO2",
  FOAM = "FOAM",
}

export interface Client {
  id: string;
  name: string;
  location: string;
  contactName: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  equipments?: ClientEquipment[];
}

export interface ClientEquipment {
  id: string;
  clientId: string;
  materialId: string;
  commissioningDate: Date;
  lastVerificationDate?: Date;
  lastRechargeDate?: Date;
  rechargeType?: RechargeType;
  volume?: number;
  serialNumber?: string;
  location?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  client?: Client;
  material?: Material;
}

// Labels pour l'affichage
export const RechargeTypeLabels: Record<RechargeType, string> = {
  [RechargeType.WATER_ADD]: "Eau + Additif",
  [RechargeType.POWDER]: "Poudre",
  [RechargeType.CO2]: "CO2",
  [RechargeType.FOAM]: "Mousse",
};
