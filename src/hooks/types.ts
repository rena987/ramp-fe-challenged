import { Employee, PaginatedResponse, Transaction } from "../utils/types";

type UseTypeBaseResult<TValue> = {
  data: TValue;
  loading: boolean;
  invalidateData: () => void;
};

type UseTypeBaseAllResult<TValue> = UseTypeBaseResult<TValue> & {
  fetchAll: () => Promise<void>;
};

type UseTypeBaseByIdResult<TValue> = UseTypeBaseResult<TValue> & {
  fetchById: (id: string) => Promise<void>;
  fetchMore: () => Promise<void>;
};

export type EmployeeResult = UseTypeBaseAllResult<Employee[] | null> & {
  fetchMore: () => Promise<void>;
};

export type PaginatedTransactionsResult = UseTypeBaseAllResult<PaginatedResponse<Transaction[]> | null> & {
  fetchMore: () => Promise<void>;
};

export type TransactionsByEmployeeResult = UseTypeBaseByIdResult<PaginatedResponse<Transaction[]> | null>;

export interface RequestByEmployeeParams {
  employeeId: string;
  page?: number | null;
}