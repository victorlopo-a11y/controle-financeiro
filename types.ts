
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum ServiceCategory {
  BATH = 'Banho',
  GROOMING = 'Tosa',
  VET = 'Veterinário',
  PRODUCTS = 'Produtos/Venda',
  MEDICATION = 'Medicação',
  RENT = 'Aluguel',
  SALARY = 'Salário',
  SUPPLIES = 'Insumos',
  MARKETING = 'Marketing',
  OTHER = 'Outros'
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: ServiceCategory;
  userName: string;
  petName?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  price: number;
}

export interface DailySummary {
  date: string;
  income: number;
  expense: number;
  profit: number;
  servicesCount: number;
}
