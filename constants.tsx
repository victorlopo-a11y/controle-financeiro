
import React from 'react';
import { Transaction, TransactionType, ServiceCategory } from './types';

export const INITIAL_DATA: Transaction[] = [
  {
    id: '1',
    date: new Date().toISOString().split('T')[0],
    description: 'Banho e Tosa - Totó',
    amount: 85.00,
    type: TransactionType.INCOME,
    category: ServiceCategory.BATH,
    userName: 'João Silva',
    petName: 'Totó'
  },
  {
    id: '2',
    date: new Date().toISOString().split('T')[0],
    description: 'Ração Premier 15kg',
    amount: 180.00,
    type: TransactionType.INCOME,
    category: ServiceCategory.PRODUCTS,
    userName: 'Maria Souza',
    petName: 'Rex'
  },
  {
    id: '3',
    date: new Date().toISOString().split('T')[0],
    description: 'Compra de Shampoos',
    amount: 250.00,
    type: TransactionType.EXPENSE,
    category: ServiceCategory.SUPPLIES,
    userName: 'João Silva'
  }
];

export const USERS = ['João Silva', 'Maria Souza', 'Admin'];
