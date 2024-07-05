import { useCallback, useState } from "react";
import { RequestByEmployeeParams, Transaction, PaginatedResponse } from "../utils/types";
import { TransactionsByEmployeeResult } from "./types";
import { useCustomFetch } from "./useCustomFetch";

export function useTransactionsByEmployee(): TransactionsByEmployeeResult {
  const { fetchWithCache, loading } = useCustomFetch();
  const [transactionsByEmployee, setTransactionsByEmployee] = useState<PaginatedResponse<Transaction[]> | null>(null);

  const fetchById = useCallback(
    async (employeeId: string) => {
      const data = await fetchWithCache<PaginatedResponse<Transaction[]>, RequestByEmployeeParams>(
        "transactionsByEmployee",
        {
          employeeId,
        }
      );
      setTransactionsByEmployee(data);
    },
    [fetchWithCache]
  );

  const fetchMore = useCallback(async () => {
    if (!transactionsByEmployee || !transactionsByEmployee.data || !transactionsByEmployee.data.length) {
      return;
    }

    const response = await fetchWithCache<PaginatedResponse<Transaction[]>, RequestByEmployeeParams>(
      "transactionsByEmployee",
      {
        employeeId: transactionsByEmployee.data[0].employee.id,
      }
    );


    setTransactionsByEmployee((previousResponse) => {
      if (!previousResponse) {
        return response;
      }

      if (!response) {
        return previousResponse;
      }

      return {
        data: [...previousResponse.data, ...response.data],
        nextPage: response.nextPage,
      };
    });
  }, [fetchWithCache, transactionsByEmployee]);

  const invalidateData = useCallback(() => {
    setTransactionsByEmployee(null);
  }, []);

  return { data: transactionsByEmployee, loading, fetchById, fetchMore, invalidateData };
}