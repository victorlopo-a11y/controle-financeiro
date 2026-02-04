export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum PaymentMethod {
  CASH = 'Dinheiro',
  PIX = 'Pix',
  CARD = 'Cartão',
  TRANSFER = 'Transferência',
  OTHER = 'Outro'
}

export enum ServiceCategory {
  BATH = 'Banho',
  GROOMING = 'Tosa',
  BATH_GROOMING = 'Banho + Tosa',
  CONSULTATION = 'Consulta',
  VET = 'Veterinário',
  HOSTING = 'Hospedagem',
  DAYCARE = 'Creche',
  TRAINING = 'Adestramento',
  TRANSPORT = 'Transporte',
  OTHER_SERVICE = 'Outro Serviço',
  RENT = 'Aluguel',
  SALARY = 'Salário',
  SUPPLIES = 'Insumos',
  ENERGY = 'Energia',
  WATER = 'Água',
  INTERNET = 'Internet',
  TAXES = 'Impostos/Taxas',
  MAINTENANCE = 'Manutenção',
  MARKETING = 'Marketing',
  OTHER_EXPENSE = 'Outra Despesa'
}

export interface Transaction {
  id: string;
  userId?: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: ServiceCategory;
  paymentMethod: PaymentMethod;
  cardType?: 'Crédito' | 'Débito';
  clientName?: string;
  staffName?: string;
  petName?: string;
  recurrence: 'none' | 'monthly';
  recurrenceId?: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  userId?: string;
  name: string;
  quantity: number;
  minQuantity: number;
  price: number;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  userId?: string;
  date: string;
  type: 'in' | 'out' | 'adjust';
  quantity: number;
  note?: string;
}

export interface Client {
  id: string;
  userId?: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt?: string;
}

export interface DailySummary {
  date: string;
  income: number;
  expense: number;
  profit: number;
  servicesCount: number;
}
