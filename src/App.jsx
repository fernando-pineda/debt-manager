import {
  Calculator,
  Check,
  CreditCard,
  DollarSign,
  Plus,
  Receipt,
  Trash2,
  X,
} from "lucide-react";
import React, { useState } from "react";

const DebtManagementPlatform = () => {
  const [activeTab, setActiveTab] = useState("expenses");
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth());
  const [debts, setDebts] = useState(() => {
    const savedDebts = localStorage.getItem("debts");
    return savedDebts ? JSON.parse(savedDebts) : [];
  });
  const [expenses, setExpenses] = useState(() => {
    const savedExpenses = localStorage.getItem("expenses");
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [incomes, setIncomes] = useState(() => {
    const savedIncomes = localStorage.getItem("incomes");
    return savedIncomes ? JSON.parse(savedIncomes) : [];
  });

  const [debtForm, setDebtForm] = useState({
    name: "",
    type: "interest",
    principal: "",
    currentBalance: "",
    interestRate: "",
    termMonths: "",
    monthlyPayment: "",
    advancePayments: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    name: "",
    amount: "",
    category: "Servicios",
    paid: false,
    isFixed: false,
    month: activeMonth,
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    type: "payment",
  });

  const [incomeForm, setIncomeForm] = useState({
    name: "",
    amount: "",
    isFixed: false,
    month: activeMonth,
  });

  const categories = [
    "Servicios",
    "Alimentación",
    "Transporte",
    "Entretenimiento",
    "Salud",
    "Educación",
    "Hogar",
    "Otros",
  ];

  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const calculateNextPayment = (debt) => {
    if (debt.type === "interest") {
      const monthlyInterest =
        (debt.currentBalance * debt.interestRate) / 100 / 12;
      const principal = debt.monthlyPayment - monthlyInterest;
      return {
        total: debt.monthlyPayment,
        interest: monthlyInterest,
        principal: principal,
        newBalance: debt.currentBalance - principal,
      };
    } else {
      return {
        total: debt.monthlyPayment,
        interest: 0,
        principal: debt.monthlyPayment,
        newBalance: debt.currentBalance - debt.monthlyPayment,
      };
    }
  };

  const addDebt = () => {
    const newDebt = {
      id: Date.now(),
      ...debtForm,
      principal: parseFloat(debtForm.principal),
      currentBalance: parseFloat(debtForm.currentBalance),
      interestRate: parseFloat(debtForm.interestRate) || 0,
      termMonths: parseInt(debtForm.termMonths),
      monthlyPayment: parseFloat(debtForm.monthlyPayment),
      advancePayments: parseInt(debtForm.advancePayments) || 0,
      payments: [],
      createdAt: new Date().toISOString(),
    };

    const updatedDebts = [...debts, newDebt];
    setDebts(updatedDebts);
    localStorage.setItem("debts", JSON.stringify(updatedDebts));

    setDebtForm({
      name: "",
      type: "interest",
      principal: "",
      currentBalance: "",
      interestRate: "",
      termMonths: "",
      monthlyPayment: "",
      advancePayments: "",
    });
    setShowDebtModal(false);
  };

  const addPayment = () => {
    const payment = {
      id: Date.now(),
      amount: parseFloat(paymentForm.amount),
      date: paymentForm.date,
      type: paymentForm.type,
    };

    const updatedDebts = debts.map((debt) => {
      if (debt.id === selectedDebt.id) {
        const newBalance = debt.currentBalance - payment.amount;
        return {
          ...debt,
          currentBalance: Math.max(0, newBalance),
          payments: [...debt.payments, payment],
        };
      }
      return debt;
    });

    setDebts(updatedDebts);
    localStorage.setItem("debts", JSON.stringify(updatedDebts));

    setPaymentForm({
      amount: "",
      date: new Date().toISOString().split("T")[0],
      type: "payment",
    });
    setShowPaymentModal(false);
    setSelectedDebt(null);
  };

  const addExpense = () => {
    const newExpense = {
      id: Date.now(),
      ...expenseForm,
      amount: parseFloat(expenseForm.amount),
    };

    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses));

    setExpenseForm({
      name: "",
      amount: "",
      category: "Servicios",
      paid: false,
      isFixed: false,
      month: activeMonth,
    });
    setShowExpenseModal(false);
  };

  const toggleExpensePaid = (id) => {
    const updatedExpenses = expenses.map((expense) =>
      expense.id === id ? { ...expense, paid: !expense.paid } : expense
    );
    setExpenses(updatedExpenses);
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses));
  };

  const deleteExpense = (id) => {
    const updatedExpenses = expenses.filter((expense) => expense.id !== id);
    setExpenses(updatedExpenses);
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses));
  };

  const deleteDebt = (id) => {
    const updatedDebts = debts.filter((debt) => debt.id !== id);
    setDebts(updatedDebts);
    localStorage.setItem("debts", JSON.stringify(updatedDebts));
  };

  const addIncome = () => {
    const newIncome = {
      id: Date.now(),
      ...incomeForm,
      amount: parseFloat(incomeForm.amount),
    };

    const updatedIncomes = [...incomes, newIncome];
    setIncomes(updatedIncomes);
    localStorage.setItem("incomes", JSON.stringify(updatedIncomes));

    setIncomeForm({
      name: "",
      amount: "",
      isFixed: false,
      month: activeMonth,
    });
    setShowIncomeModal(false);
  };

  const deleteIncome = (id) => {
    const updatedIncomes = incomes.filter((income) => income.id !== id);
    setIncomes(updatedIncomes);
    localStorage.setItem("incomes", JSON.stringify(updatedIncomes));
  };

  const getFinancialSummary = () => {
    const totalDebt = debts.reduce((sum, debt) => sum + debt.currentBalance, 0);
    const totalMonthlyDebt = debts.reduce(
      (sum, debt) => sum + debt.monthlyPayment,
      0
    );
    const totalMonthlyExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const unpaidExpenses = expenses
      .filter((e) => !e.paid)
      .reduce((sum, expense) => sum + expense.amount, 0);

    return {
      totalDebt,
      totalMonthlyDebt,
      totalMonthlyExpenses,
      unpaidExpenses,
      totalMonthlyCommitments: totalMonthlyDebt + totalMonthlyExpenses,
    };
  };

  const getMonthlySummary = (month) => {
    const monthExpenses = expenses.filter(
      (expense) => expense.isFixed || expense.month === month
    );

    const monthIncomes = incomes.filter(
      (income) => income.isFixed || income.month === month
    );

    const totalExpenses = monthExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    const totalIncomes = monthIncomes.reduce(
      (sum, income) => sum + income.amount,
      0
    );

    const fixedExpenses = monthExpenses.filter((e) => e.isFixed);
    const variableExpenses = monthExpenses.filter((e) => !e.isFixed);

    const fixedIncomes = monthIncomes.filter((i) => i.isFixed);
    const variableIncomes = monthIncomes.filter((i) => !i.isFixed);

    return {
      totalExpenses,
      fixedExpenses,
      variableExpenses,
      fixedTotal: fixedExpenses.reduce((sum, e) => sum + e.amount, 0),
      variableTotal: variableExpenses.reduce((sum, e) => sum + e.amount, 0),
      totalIncomes,
      fixedIncomes,
      variableIncomes,
      fixedIncomeTotal: fixedIncomes.reduce((sum, i) => sum + i.amount, 0),
      variableIncomeTotal: variableIncomes.reduce(
        (sum, i) => sum + i.amount,
        0
      ),
      balance: totalIncomes - totalExpenses,
    };
  };

  const summary = getFinancialSummary();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Gestión Financiera
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Deuda Total</p>
                <p className="text-2xl font-bold text-red-600">
                  ${summary.totalDebt.toLocaleString()}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pagos Mensuales
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  ${summary.totalMonthlyDebt.toLocaleString()}
                </p>
              </div>
              <Calculator className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Gastos Mensuales
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  ${summary.totalMonthlyExpenses.toLocaleString()}
                </p>
              </div>
              <Receipt className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Gastos Pendientes
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  ${summary.unpaidExpenses.toLocaleString()}
                </p>
              </div>
              <X className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab("debts")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "debts"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Deudas
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "expenses"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Gastos
          </button>
        </div>

        {activeTab === "debts" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Mis Deudas</h2>
              <button
                onClick={() => setShowDebtModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar Deuda
              </button>
            </div>

            <div className="grid gap-6">
              {debts.map((debt) => {
                const nextPayment = calculateNextPayment(debt);
                const progress =
                  ((debt.principal - debt.currentBalance) / debt.principal) *
                  100;

                return (
                  <div
                    key={debt.id}
                    className="bg-white rounded-lg shadow-md p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {debt.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {debt.type === "interest"
                            ? "Con Interés"
                            : "Pago Fijo"}
                          {debt.advancePayments > 0 &&
                            ` • ${debt.advancePayments} letras adelantadas`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedDebt(debt);
                            setShowPaymentModal(true);
                          }}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Pagar
                        </button>
                        <button
                          onClick={() => deleteDebt(debt.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Saldo Actual</p>
                        <p className="text-lg font-bold text-red-600">
                          ${debt.currentBalance.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Pago Mensual</p>
                        <p className="text-lg font-bold text-blue-600">
                          ${debt.monthlyPayment.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          {debt.type === "interest"
                            ? "Tasa de Interés"
                            : "Plazo"}
                        </p>
                        <p className="text-lg font-bold text-gray-700">
                          {debt.type === "interest"
                            ? `${debt.interestRate}%`
                            : `${debt.termMonths} meses`}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progreso</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {debt.type === "interest" && debt.currentBalance > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-800 mb-2">
                          Próximo Pago
                        </h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Interés</p>
                            <p className="font-medium">
                              ${nextPayment.interest.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Capital</p>
                            <p className="font-medium">
                              ${nextPayment.principal.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Nuevo Saldo</p>
                            <p className="font-medium">
                              ${nextPayment.newBalance.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {debt.payments.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-800 mb-2">
                          Últimos Pagos
                        </h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {debt.payments.slice(-3).map((payment) => (
                            <div
                              key={payment.id}
                              className="flex justify-between text-sm"
                            >
                              <span>{payment.date}</span>
                              <span className="font-medium">
                                ${payment.amount.toLocaleString()}
                              </span>
                              <span className="text-gray-600 capitalize">
                                {payment.type}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "expenses" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Gestión de Gastos e Ingresos
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowIncomeModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  Agregar Ingreso
                </button>
                <button
                  onClick={() => setShowExpenseModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Gasto
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="flex space-x-2 pb-2">
                {months.map((month, index) => (
                  <button
                    key={month}
                    onClick={() => setActiveMonth(index)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                      activeMonth === index
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Movimientos de {months[activeMonth]}
                  </h3>

                  <div className="space-y-4">
                    {/* Ingresos */}
                    {incomes
                      .filter(
                        (income) =>
                          income.isFixed || income.month === activeMonth
                      )
                      .map((income) => (
                        <div
                          key={income.id}
                          className="flex justify-between items-center p-4 bg-green-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div>
                              <h3 className="font-medium text-gray-800">
                                {income.name}
                                {income.isFixed && (
                                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    Fijo
                                  </span>
                                )}
                              </h3>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-bold text-green-600">
                              +${income.amount.toLocaleString()}
                            </p>
                            <button
                              onClick={() => deleteIncome(income.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                    {/* Gastos */}
                    {expenses
                      .filter(
                        (expense) =>
                          expense.isFixed || expense.month === activeMonth
                      )
                      .map((expense) => (
                        <div
                          key={expense.id}
                          className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleExpensePaid(expense.id)}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                expense.paid
                                  ? "bg-green-600 border-green-600 text-white"
                                  : "border-gray-300 hover:border-green-500"
                              }`}
                            >
                              {expense.paid && <Check className="h-4 w-4" />}
                            </button>
                            <div>
                              <h3
                                className={`font-medium ${
                                  expense.paid
                                    ? "line-through text-gray-500"
                                    : "text-gray-800"
                                }`}
                              >
                                {expense.name}
                                {expense.isFixed && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    Fijo
                                  </span>
                                )}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {expense.category}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <p
                              className={`font-bold ${
                                expense.paid ? "text-gray-500" : "text-blue-600"
                              }`}
                            >
                              -${expense.amount.toLocaleString()}
                            </p>
                            <button
                              onClick={() => deleteExpense(expense.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Resumen de {months[activeMonth]}
                </h3>
                {(() => {
                  const summary = getMonthlySummary(activeMonth);
                  return (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Ingresos Fijos</p>
                        <p className="text-xl font-bold text-green-600">
                          +${summary.fixedIncomeTotal.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Ingresos Variables
                        </p>
                        <p className="text-xl font-bold text-green-600">
                          +${summary.variableIncomeTotal.toLocaleString()}
                        </p>
                      </div>
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600">Gastos Fijos</p>
                        <p className="text-xl font-bold text-blue-600">
                          -${summary.fixedTotal.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Gastos Variables
                        </p>
                        <p className="text-xl font-bold text-blue-600">
                          -${summary.variableTotal.toLocaleString()}
                        </p>
                      </div>
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600">Balance</p>
                        <p
                          className={`text-2xl font-bold ${
                            summary.balance >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {summary.balance >= 0 ? "+" : ""}$
                          {summary.balance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {showDebtModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Agregar Nueva Deuda
              </h3>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre de la deuda"
                  value={debtForm.name}
                  onChange={(e) =>
                    setDebtForm({ ...debtForm, name: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <select
                  value={debtForm.type}
                  onChange={(e) =>
                    setDebtForm({ ...debtForm, type: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="interest">
                    Con Interés (ej. auto, hipoteca)
                  </option>
                  <option value="fixed">
                    Pago Fijo (ej. préstamo personal)
                  </option>
                </select>

                <input
                  type="number"
                  placeholder="Monto principal"
                  value={debtForm.principal}
                  onChange={(e) =>
                    setDebtForm({ ...debtForm, principal: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <input
                  type="number"
                  placeholder="Saldo actual"
                  value={debtForm.currentBalance}
                  onChange={(e) =>
                    setDebtForm({ ...debtForm, currentBalance: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                {debtForm.type === "interest" && (
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Tasa de interés anual (%)"
                    value={debtForm.interestRate}
                    onChange={(e) =>
                      setDebtForm({ ...debtForm, interestRate: e.target.value })
                    }
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}

                <input
                  type="number"
                  placeholder="Plazo en meses"
                  value={debtForm.termMonths}
                  onChange={(e) =>
                    setDebtForm({ ...debtForm, termMonths: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <input
                  type="number"
                  placeholder="Pago mensual"
                  value={debtForm.monthlyPayment}
                  onChange={(e) =>
                    setDebtForm({ ...debtForm, monthlyPayment: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                {debtForm.type === "fixed" && (
                  <input
                    type="number"
                    placeholder="Letras adelantadas (opcional)"
                    value={debtForm.advancePayments}
                    onChange={(e) =>
                      setDebtForm({
                        ...debtForm,
                        advancePayments: e.target.value,
                      })
                    }
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDebtModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addDebt}
                  disabled={
                    !debtForm.name ||
                    !debtForm.principal ||
                    !debtForm.currentBalance
                  }
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        )}

        {showExpenseModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Agregar Nuevo Gasto
              </h3>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre del gasto"
                  value={expenseForm.name}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, name: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <input
                  type="number"
                  placeholder="Monto"
                  value={expenseForm.amount}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, amount: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <select
                  value={expenseForm.category}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, category: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFixed"
                    checked={expenseForm.isFixed}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        isFixed: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isFixed" className="text-sm text-gray-600">
                    Gasto Fijo (se aplica a todos los meses)
                  </label>
                </div>

                {!expenseForm.isFixed && (
                  <select
                    value={expenseForm.month}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        month: parseInt(e.target.value),
                      })
                    }
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {months.map((month, index) => (
                      <option key={month} value={index}>
                        {month}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addExpense}
                  disabled={!expenseForm.name || !expenseForm.amount}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        )}

        {showPaymentModal && selectedDebt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Registrar Pago - {selectedDebt.name}
              </h3>

              <div className="space-y-4">
                <input
                  type="number"
                  placeholder="Monto del pago"
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, amount: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <input
                  type="date"
                  value={paymentForm.date}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, date: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <select
                  value={paymentForm.type}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, type: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="payment">Pago Regular</option>
                  <option value="contribution">Aportación Extra</option>
                </select>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Saldo actual:{" "}
                    <span className="font-medium">
                      ${selectedDebt.currentBalance.toLocaleString()}
                    </span>
                  </p>
                  {paymentForm.amount && (
                    <p className="text-sm text-gray-600">
                      Nuevo saldo:{" "}
                      <span className="font-medium">
                        $
                        {Math.max(
                          0,
                          selectedDebt.currentBalance -
                            parseFloat(paymentForm.amount)
                        ).toLocaleString()}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedDebt(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addPayment}
                  disabled={!paymentForm.amount}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Registrar Pago
                </button>
              </div>
            </div>
          </div>
        )}

        {showIncomeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Agregar Nuevo Ingreso
              </h3>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre del ingreso"
                  value={incomeForm.name}
                  onChange={(e) =>
                    setIncomeForm({ ...incomeForm, name: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <input
                  type="number"
                  placeholder="Monto"
                  value={incomeForm.amount}
                  onChange={(e) =>
                    setIncomeForm({ ...incomeForm, amount: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFixedIncome"
                    checked={incomeForm.isFixed}
                    onChange={(e) =>
                      setIncomeForm({
                        ...incomeForm,
                        isFixed: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="isFixedIncome"
                    className="text-sm text-gray-600"
                  >
                    Ingreso Fijo (se aplica a todos los meses)
                  </label>
                </div>

                {!incomeForm.isFixed && (
                  <select
                    value={incomeForm.month}
                    onChange={(e) =>
                      setIncomeForm({
                        ...incomeForm,
                        month: parseInt(e.target.value),
                      })
                    }
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {months.map((month, index) => (
                      <option key={month} value={index}>
                        {month}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowIncomeModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addIncome}
                  disabled={!incomeForm.name || !incomeForm.amount}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebtManagementPlatform;
