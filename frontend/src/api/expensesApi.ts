import apiClient from './apiClient';

export enum ExpenseCategory {
  SALARY = 'SALARY',
  EQUIPMENT = 'EQUIPMENT',
  RENT = 'RENT',
  UTILITIES = 'UTILITIES',
  SUPPLIES = 'SUPPLIES',
  OTHER = 'OTHER',
}

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
}

export interface CreateExpenseRequest {
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
}

export interface ExpenseResponse {
  success: boolean;
  data: Expense | Expense[];
}

export const expensesApi = {
  create: async (data: CreateExpenseRequest): Promise<Expense> => {
    const response = await apiClient.post<ExpenseResponse>('/expenses', data);
    return response.data.data as Expense;
  },

  getAll: async (): Promise<Expense[]> => {
    const response = await apiClient.get<ExpenseResponse>('/expenses');
    return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
  },
};
