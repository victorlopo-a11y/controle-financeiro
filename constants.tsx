import { PaymentMethod, ServiceCategory, Transaction, TransactionType } from './types';

export const INCOME_CATEGORIES: ServiceCategory[] = [
  ServiceCategory.BATH,
  ServiceCategory.GROOMING,
  ServiceCategory.BATH_GROOMING,
  ServiceCategory.CONSULTATION,
  ServiceCategory.VET,
  ServiceCategory.HOSTING,
  ServiceCategory.DAYCARE,
  ServiceCategory.TRAINING,
  ServiceCategory.TRANSPORT,
  ServiceCategory.OTHER_SERVICE
];

export const EXPENSE_CATEGORIES: ServiceCategory[] = [
  ServiceCategory.RENT,
  ServiceCategory.SALARY,
  ServiceCategory.SUPPLIES,
  ServiceCategory.ENERGY,
  ServiceCategory.WATER,
  ServiceCategory.INTERNET,
  ServiceCategory.TAXES,
  ServiceCategory.MAINTENANCE,
  ServiceCategory.MARKETING,
  ServiceCategory.OTHER_EXPENSE
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  PaymentMethod.CASH,
  PaymentMethod.PIX,
  PaymentMethod.CARD,
  PaymentMethod.TRANSFER,
  PaymentMethod.OTHER
];

export const INITIAL_DATA: Transaction[] = [
  {
    id: '1',
    date: new Date().toISOString().split('T')[0],
    description: 'Banho e Tosa - Totó',
    amount: 85.0,
    type: TransactionType.INCOME,
    category: ServiceCategory.BATH_GROOMING,
    paymentMethod: PaymentMethod.PIX,
    clientName: 'Ana Souza',
    staffName: 'João',
    petName: 'Totó',
    recurrence: 'none'
  },
  {
    id: '2',
    date: new Date().toISOString().split('T')[0],
    description: 'Consulta veterinária',
    amount: 120.0,
    type: TransactionType.INCOME,
    category: ServiceCategory.VET,
    paymentMethod: PaymentMethod.CARD,
    clientName: 'Carlos Lima',
    staffName: 'Marina',
    petName: 'Rex',
    recurrence: 'none'
  },
  {
    id: '3',
    date: new Date().toISOString().split('T')[0],
    description: 'Compra de shampoos e toalhas',
    amount: 250.0,
    type: TransactionType.EXPENSE,
    category: ServiceCategory.SUPPLIES,
    paymentMethod: PaymentMethod.TRANSFER,
    staffName: 'Admin',
    recurrence: 'none'
  },
  {
    id: '4',
    date: new Date().toISOString().split('T')[0],
    description: 'Aluguel mensal',
    amount: 1800.0,
    type: TransactionType.EXPENSE,
    category: ServiceCategory.RENT,
    paymentMethod: PaymentMethod.TRANSFER,
    staffName: 'Admin',
    recurrence: 'monthly',
    recurrenceId: 'rec-rent'
  }
];
