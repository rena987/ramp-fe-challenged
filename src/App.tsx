import { Fragment, useCallback, useEffect, useState, useMemo} from "react";
import { InputSelect } from "./components/InputSelect";
import { Instructions } from "./components/Instructions";
import { Transactions } from "./components/Transactions";
import { useEmployees } from "./hooks/useEmployees";
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions";
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee";
import { EMPTY_EMPLOYEE } from "./utils/constants";
import { Employee, Transaction } from "./utils/types";

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees();
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions();
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(EMPTY_EMPLOYEE);
  const [approvedTransactions, setApprovedTransactions] = useState<{ [key: string]: boolean }>({});

  const transactions: Transaction[] | null = paginatedTransactions?.data 
    ? paginatedTransactions.data 
    : (transactionsByEmployee as Transaction[] | null);

  const loadAllTransactions = useCallback(async () => {
    setIsLoading(true);
    transactionsByEmployeeUtils.invalidateData();
    await employeeUtils.fetchAll();
    await paginatedTransactionsUtils.fetchAll();
    setIsLoading(false);
  }, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils]);

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      paginatedTransactionsUtils.invalidateData();
      await transactionsByEmployeeUtils.fetchById(employeeId);
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  );

  const loadMoreTransactions = useCallback(async () => {
    if (selectedEmployee === null || selectedEmployee === EMPTY_EMPLOYEE) {
      await paginatedTransactionsUtils.fetchMore();
    } else {
      await transactionsByEmployeeUtils.fetchMore();
    }
  }, [paginatedTransactionsUtils, transactionsByEmployeeUtils, selectedEmployee]);

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions();
    }
  }, [employeeUtils.loading, employees, loadAllTransactions]);

  const handleApprovalChange = (transactionId: string, approved: boolean) => {
    setApprovedTransactions((prev) => ({
      ...prev,
      [transactionId]: approved,
    }));
  };

  const handleEmployeeChange = async (newValue: Employee | null) => {
    setSelectedEmployee(newValue);
    if (newValue === null || newValue === EMPTY_EMPLOYEE) {
      await loadAllTransactions();
    } else {
      await loadTransactionsByEmployee(newValue.id);
    }
  };

  const shouldShowViewMoreButton = useMemo(() => {
    if (selectedEmployee && selectedEmployee !== EMPTY_EMPLOYEE) {
      return false;
    }
    if (paginatedTransactions?.nextPage === null) {
      return false;
    }
    return true;
  }, [selectedEmployee, paginatedTransactions]);

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />
        <hr className="RampBreak--l" />
        <InputSelect<Employee>
          isLoading={employeeUtils.loading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={handleEmployeeChange}
        />
        <div className="RampBreak--l" />
        <div className="RampGrid">
          <Transactions
            transactions={transactions}
            approvedTransactions={approvedTransactions}
            onApprovalChange={handleApprovalChange}
          />
          {Array.isArray(transactions) && transactions.length > 0 && shouldShowViewMoreButton && (
            <button
              className="RampButton"
              disabled={paginatedTransactionsUtils.loading || transactionsByEmployeeUtils.loading}
              onClick={loadMoreTransactions}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  );
}