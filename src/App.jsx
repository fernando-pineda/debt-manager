import "react-datepicker/dist/react-datepicker.css";

import {
  Calculator,
  Check,
  CreditCard,
  DollarSign,
  Minus,
  PiggyBank,
  Plus,
  Receipt,
  Trash2,
  X,
} from "lucide-react";
import React, { useState } from "react";

import DatePicker from "react-datepicker";

const DebtManagementPlatform = () => {
  const [activeTab, setActiveTab] = useState("expenses");
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth());
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());
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
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [incomes, setIncomes] = useState(() => {
    const savedIncomes = localStorage.getItem("incomes");
    return savedIncomes ? JSON.parse(savedIncomes) : [];
  });
  const [savingsCategories, setSavingsCategories] = useState(() => {
    const savedCategories = localStorage.getItem("savingsCategories");
    return savedCategories ? JSON.parse(savedCategories) : [];
  });
  const [savings, setSavings] = useState(() => {
    const savedSavings = localStorage.getItem("savings");
    return savedSavings ? JSON.parse(savedSavings) : [];
  });
  const [showSavingsCategoryModal, setShowSavingsCategoryModal] =
    useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showSubtractFundsModal, setShowSubtractFundsModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [newSavingsCategory, setNewSavingsCategory] = useState("");
  const [savingsForm, setSavingsForm] = useState({
    categoryId: "",
    amount: "",
    month: activeMonth,
    year: activeYear,
  });
  const [showAdvancePaymentModal, setShowAdvancePaymentModal] = useState(false);
  const [selectedDebtForAdvance, setSelectedDebtForAdvance] = useState(null);
  const [advancePaymentCount, setAdvancePaymentCount] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [showPaymentDateModal, setShowPaymentDateModal] = useState(false);
  const [selectedExpenseForPayment, setSelectedExpenseForPayment] =
    useState(null);
  const [paymentDate, setPaymentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });

  const [debtForm, setDebtForm] = useState({
    name: "",
    type: "interest",
    principal: "",
    currentBalance: "",
    interestRate: "",
    termMonths: "",
    monthlyPayment: "",
    advancePaymentAmount: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    name: "",
    amount: "",
    category: "Servicios",
    paid: false,
    isFixed: false,
    month: activeMonth,
    year: activeYear,
    isDebtPayment: false,
    linkedDebtId: null,
    paymentType: "regular",
  });

  const [incomeForm, setIncomeForm] = useState({
    name: "",
    amount: "",
    isFixed: false,
    month: activeMonth,
    year: activeYear,
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
      const remainingPayments = debt.termMonths - debt.advancePayments;
      const currentBalance = debt.monthlyPayment * remainingPayments;
      return {
        total: debt.monthlyPayment,
        interest: 0,
        principal: debt.monthlyPayment,
        newBalance: currentBalance - debt.monthlyPayment,
      };
    }
  };

  const getYearRange = () => {
    const currentYear = new Date().getFullYear();
    const maxTermMonths = Math.max(...debts.map((debt) => debt.termMonths), 0);
    const yearsToAdd = Math.ceil(maxTermMonths / 12);
    return Array.from({ length: yearsToAdd + 1 }, (_, i) => currentYear + i);
  };

  const addDebt = () => {
    const newDebt = {
      id: Date.now(),
      ...debtForm,
      principal: parseFloat(debtForm.principal),
      currentBalance:
        debtForm.type === "fixed"
          ? parseFloat(debtForm.monthlyPayment) * parseInt(debtForm.termMonths)
          : parseFloat(debtForm.currentBalance),
      interestRate: parseFloat(debtForm.interestRate) || 0,
      termMonths: parseInt(debtForm.termMonths),
      monthlyPayment: parseFloat(debtForm.monthlyPayment),
      advancePayments: 0,
      advancePaymentAmount: parseFloat(debtForm.advancePaymentAmount) || 0,
      payments: [],
      createdAt: new Date().toISOString(),
    };

    const updatedDebts = [...debts, newDebt];
    setDebts(updatedDebts);
    localStorage.setItem("debts", JSON.stringify(updatedDebts));

    const currentDate = new Date();
    const newExpenses = [];

    const totalPayments =
      newDebt.type === "fixed"
        ? newDebt.termMonths - newDebt.advancePayments
        : newDebt.termMonths;

    for (let i = 0; i < totalPayments; i++) {
      const paymentDate = new Date(currentDate);
      paymentDate.setMonth(currentDate.getMonth() + i);

      const newExpense = {
        id: Date.now() + i,
        name: `Pago mensual - ${newDebt.name}`,
        amount: newDebt.monthlyPayment,
        category: "Deuda",
        paid: false,
        isFixed: false,
        month: paymentDate.getMonth(),
        year: paymentDate.getFullYear(),
        isDebtPayment: true,
        linkedDebtId: newDebt.id,
        paymentType: "regular",
      };

      newExpenses.push(newExpense);
    }

    const updatedExpenses = [...expenses, ...newExpenses];
    setExpenses(updatedExpenses);
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses));

    setDebtForm({
      name: "",
      type: "interest",
      principal: "",
      currentBalance: "",
      interestRate: "",
      termMonths: "",
      monthlyPayment: "",
      advancePaymentAmount: "",
    });
    setShowDebtModal(false);
  };

  const payAdvancePayment = (debtId, count = 1) => {
    const debt = debts.find((d) => d.id === debtId);
    if (!debt || debt.type !== "fixed") return;

    const newPayments = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      amount: debt.advancePaymentAmount,
      date: new Date().toISOString().split("T")[0],
      type: "advance",
      expenseId: null,
    }));

    const updatedDebts = debts.map((d) => {
      if (d.id === debtId) {
        const newAdvancePayments = d.advancePayments + count;
        const remainingPayments = d.termMonths - newAdvancePayments;
        const newBalance = d.monthlyPayment * remainingPayments;

        return {
          ...d,
          advancePayments: newAdvancePayments,
          currentBalance: newBalance,
          payments: [...d.payments, ...newPayments],
        };
      }
      return d;
    });

    setDebts(updatedDebts);
    localStorage.setItem("debts", JSON.stringify(updatedDebts));

    const debtExpenses = expenses.filter((e) => e.linkedDebtId === debtId);

    const sortedExpenses = debtExpenses.sort((a, b) => {
      const dateA = new Date(a.year, a.month);
      const dateB = new Date(b.year, b.month);
      return dateB - dateA;
    });

    const expensesToRemove = sortedExpenses.slice(0, count);
    const remainingExpenses = expenses.filter(
      (e) => !expensesToRemove.some((removed) => removed.id === e.id)
    );

    setExpenses(remainingExpenses);
    localStorage.setItem("expenses", JSON.stringify(remainingExpenses));

    setShowAdvancePaymentModal(false);
    setSelectedDebtForAdvance(null);
    setAdvancePaymentCount(1);
  };

  const addExpense = () => {
    if (expenseForm.isFixed) {
      const newExpenses = months.map((_, monthIndex) => ({
        id: Date.now() + monthIndex,
        ...expenseForm,
        amount: parseFloat(expenseForm.amount),
        month: monthIndex,
        paid: false,
      }));

      const updatedExpenses = [...expenses, ...newExpenses];
      setExpenses(updatedExpenses);
      localStorage.setItem("expenses", JSON.stringify(updatedExpenses));
    } else {
      const newExpense = {
        id: Date.now(),
        ...expenseForm,
        amount: parseFloat(expenseForm.amount),
      };

      const updatedExpenses = [...expenses, newExpense];
      setExpenses(updatedExpenses);
      localStorage.setItem("expenses", JSON.stringify(updatedExpenses));
    }

    setExpenseForm({
      name: "",
      amount: "",
      category: "Servicios",
      paid: false,
      isFixed: false,
      month: activeMonth,
      year: activeYear,
      isDebtPayment: false,
      linkedDebtId: null,
      paymentType: "regular",
    });
    setShowExpenseModal(false);
  };

  const toggleExpensePaid = (id) => {
    const expense = expenses.find((e) => e.id === id);
    if (!expense) return;

    if (!expense.paid) {
      setSelectedExpenseForPayment(expense);
      setPaymentDate(new Date(activeYear, activeMonth, 1));
      setShowPaymentDateModal(true);
      return;
    }

    const updatedExpenses = expenses.map((expense) =>
      expense.id === id
        ? { ...expense, paid: false, paymentDate: null }
        : expense
    );
    setExpenses(updatedExpenses);
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses));

    if (expense?.isDebtPayment && expense?.linkedDebtId) {
      const updatedDebts = debts.map((debt) => {
        if (debt.id === expense.linkedDebtId) {
          const remainingPayments = debt.termMonths - debt.advancePayments + 1;
          const newBalance =
            debt.type === "fixed"
              ? debt.monthlyPayment * remainingPayments
              : debt.currentBalance + expense.amount;

          return {
            ...debt,
            currentBalance: Math.max(0, newBalance),
            payments: debt.payments.filter((p) => p.expenseId !== expense.id),
          };
        }
        return debt;
      });
      setDebts(updatedDebts);
      localStorage.setItem("debts", JSON.stringify(updatedDebts));
    }
  };

  const confirmPayment = () => {
    if (!selectedExpenseForPayment) return;

    const updatedExpenses = expenses.map((expense) =>
      expense.id === selectedExpenseForPayment.id
        ? { ...expense, paid: true, paymentDate: paymentDate.toISOString() }
        : expense
    );
    setExpenses(updatedExpenses);
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses));

    if (
      selectedExpenseForPayment?.isDebtPayment &&
      selectedExpenseForPayment?.linkedDebtId
    ) {
      const updatedDebts = debts.map((debt) => {
        if (debt.id === selectedExpenseForPayment.linkedDebtId) {
          const remainingPayments = debt.termMonths - debt.advancePayments - 1;
          const newBalance =
            debt.type === "fixed"
              ? debt.monthlyPayment * remainingPayments
              : debt.currentBalance - selectedExpenseForPayment.amount;

          return {
            ...debt,
            currentBalance: Math.max(0, newBalance),
            payments: [
              ...debt.payments,
              {
                id: Date.now(),
                amount: selectedExpenseForPayment.amount,
                date: paymentDate.toISOString().split("T")[0],
                type: selectedExpenseForPayment.paymentType,
                expenseId: selectedExpenseForPayment.id,
              },
            ],
          };
        }
        return debt;
      });
      setDebts(updatedDebts);
      localStorage.setItem("debts", JSON.stringify(updatedDebts));
    }

    setShowPaymentDateModal(false);
    setSelectedExpenseForPayment(null);
  };

  const deleteExpense = (id) => {
    const expense = expenses.find((e) => e.id === id);
    if (!expense) return;

    if (expense.isFixed && !expense.isDebtPayment) {
      const updatedExpenses = expenses.filter(
        (e) => !(e.name === expense.name && e.isFixed && !e.isDebtPayment)
      );
      setExpenses(updatedExpenses);
      localStorage.setItem("expenses", JSON.stringify(updatedExpenses));
      return;
    }

    if (expense.isDebtPayment) {
      return;
    }

    const updatedExpenses = expenses.filter((expense) => expense.id !== id);
    setExpenses(updatedExpenses);
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses));
  };

  const deleteDebt = (id) => {
    const updatedDebts = debts.filter((debt) => debt.id !== id);
    setDebts(updatedDebts);
    localStorage.setItem("debts", JSON.stringify(updatedDebts));

    const updatedExpenses = expenses.filter(
      (expense) => expense.linkedDebtId !== id
    );
    setExpenses(updatedExpenses);
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses));
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
      year: activeYear,
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
      .filter(
        (e) =>
          !e.paid &&
          ((e.isFixed && e.month === activeMonth) ||
            (!e.isFixed && e.month === activeMonth))
      )
      .reduce((sum, expense) => sum + expense.amount, 0);

    return {
      totalDebt,
      totalMonthlyDebt,
      totalMonthlyExpenses,
      unpaidExpenses,
      totalMonthlyCommitments: totalMonthlyDebt + totalMonthlyExpenses,
    };
  };

  const currentMonthSavings = React.useMemo(() => {
    return savings
      .filter((s) => s.month === activeMonth && s.year === activeYear)
      .reduce((sum, saving) => sum + saving.amount, 0);
  }, [savings, activeMonth, activeYear]);

  const getMonthlySummary = (month, year) => {
    const monthExpenses = expenses.filter(
      (expense) =>
        (expense.isFixed && expense.month === month && expense.year === year) ||
        (!expense.isFixed && expense.month === month && expense.year === year)
    );

    const monthIncomes = incomes.filter(
      (income) =>
        income.isFixed ||
        (!income.isFixed && income.month === month && income.year === year)
    );

    const monthSavings = savings.filter(
      (saving) => saving.month === month && saving.year === year
    );

    const totalExpenses = monthExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    const totalIncomes = monthIncomes.reduce(
      (sum, income) => sum + income.amount,
      0
    );

    const totalSavings = monthSavings.reduce(
      (sum, saving) => sum + saving.amount,
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
      totalSavings,
      balance: totalIncomes - totalExpenses,
    };
  };

  const deleteAdvancePayment = (debtId, paymentId) => {
    const debt = debts.find((d) => d.id === debtId);
    if (!debt || debt.type !== "fixed") return;

    const payment = debt.payments.find((p) => p.id === paymentId);
    if (!payment || payment.type !== "advance") return;

    const updatedDebts = debts.map((d) => {
      if (d.id === debtId) {
        const newAdvancePayments = d.advancePayments - 1;
        const remainingPayments = d.termMonths - newAdvancePayments;
        const newBalance = d.monthlyPayment * remainingPayments;

        return {
          ...d,
          advancePayments: newAdvancePayments,
          currentBalance: newBalance,
          payments: d.payments.filter((p) => p.id !== paymentId),
        };
      }
      return d;
    });

    setDebts(updatedDebts);
    localStorage.setItem("debts", JSON.stringify(updatedDebts));

    const debtExpenses = expenses.filter((e) => e.linkedDebtId === debtId);

    const sortedExpenses = debtExpenses.sort((a, b) => {
      const dateA = new Date(a.year, a.month);
      const dateB = new Date(b.year, b.month);
      return dateB - dateA;
    });

    const lastPaymentMonth = sortedExpenses[0]?.month;
    const lastPaymentYear = sortedExpenses[0]?.year;

    const nextMonth = lastPaymentMonth === 11 ? 0 : lastPaymentMonth + 1;
    const nextYear =
      lastPaymentMonth === 11 ? lastPaymentYear + 1 : lastPaymentYear;

    const newExpense = {
      id: Date.now(),
      name: `Pago mensual - ${debt.name}`,
      amount: debt.monthlyPayment,
      category: "Deuda",
      paid: false,
      isFixed: false,
      month: nextMonth,
      year: nextYear,
      isDebtPayment: true,
      linkedDebtId: debtId,
      paymentType: "regular",
    };

    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses));
  };

  const handleDelete = (type, id) => {
    setDeleteType(type);
    setItemToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete || !deleteType) return;

    switch (deleteType) {
      case "debt":
        deleteDebt(itemToDelete);
        break;
      case "expense":
        deleteExpense(itemToDelete);
        break;
      case "income":
        deleteIncome(itemToDelete);
        break;
      case "savingsCategory":
        deleteSavingsCategory(itemToDelete);
        break;
      default:
        break;
    }

    setShowConfirmModal(false);
    setItemToDelete(null);
    setDeleteType(null);
  };

  const addSavingsCategory = () => {
    if (!newSavingsCategory.trim()) return;

    const newCategory = {
      id: Date.now(),
      name: newSavingsCategory.trim(),
    };

    const updatedCategories = [...savingsCategories, newCategory];
    setSavingsCategories(updatedCategories);
    localStorage.setItem(
      "savingsCategories",
      JSON.stringify(updatedCategories)
    );
    setNewSavingsCategory("");
    setShowSavingsCategoryModal(false);
  };

  const deleteSavingsCategory = (categoryId) => {
    const updatedCategories = savingsCategories.filter(
      (category) => category.id !== categoryId
    );
    setSavingsCategories(updatedCategories);
    localStorage.setItem(
      "savingsCategories",
      JSON.stringify(updatedCategories)
    );

    const updatedSavings = savings.filter(
      (saving) => saving.categoryId !== categoryId
    );
    setSavings(updatedSavings);
    localStorage.setItem("savings", JSON.stringify(updatedSavings));
  };

  const addFundsToCategory = () => {
    if (!selectedCategoryId || !savingsForm.amount) return;

    const newSaving = {
      id: Date.now(),
      categoryId: parseInt(selectedCategoryId),
      amount: parseFloat(savingsForm.amount),
    };

    const updatedSavings = [...savings, newSaving];
    setSavings(updatedSavings);
    localStorage.setItem("savings", JSON.stringify(updatedSavings));

    setSavingsForm({
      categoryId: "",
      amount: "",
      month: activeMonth,
      year: activeYear,
    });
    setSelectedCategoryId(null);
    setShowAddFundsModal(false);
  };

  const deleteSaving = (id) => {
    const updatedSavings = savings.filter((saving) => saving.id !== id);
    setSavings(updatedSavings);
    localStorage.setItem("savings", JSON.stringify(updatedSavings));
  };

  const subtractFundsFromCategory = () => {
    if (!selectedCategoryId || !savingsForm.amount) return;

    const categoryTotal = savings
      .filter((s) => s.categoryId === parseInt(selectedCategoryId))
      .reduce((sum, s) => sum + s.amount, 0);

    if (parseFloat(savingsForm.amount) > categoryTotal) {
      alert("No puedes restar más del monto actual");
      return;
    }

    const newSaving = {
      id: Date.now(),
      categoryId: parseInt(selectedCategoryId),
      amount: -parseFloat(savingsForm.amount),
    };

    const updatedSavings = [...savings, newSaving];
    setSavings(updatedSavings);
    localStorage.setItem("savings", JSON.stringify(updatedSavings));

    setSavingsForm({
      categoryId: "",
      amount: "",
      month: activeMonth,
      year: activeYear,
    });
    setSelectedCategoryId(null);
    setShowSubtractFundsModal(false);
  };

  const summary = getFinancialSummary();

  const handleMonthChange = (month) => {
    setActiveMonth(month);
    setPaymentDate(new Date(activeYear, month, 1));
  };

  const handleYearChange = (year) => {
    setActiveYear(year);
    setPaymentDate(new Date(year, activeMonth, 1));
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#8E8E93]">
                  Deuda Total
                </p>
                <p className="text-2xl font-bold text-[#FF3B30]">
                  ${summary.totalDebt.toLocaleString()}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-[#FF3B30]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#8E8E93]">
                  Pagos Mensuales
                </p>
                <p className="text-2xl font-bold text-[#FF9500]">
                  ${summary.totalMonthlyDebt.toLocaleString()}
                </p>
              </div>
              <Calculator className="h-8 w-8 text-[#FF9500]" />
            </div>
          </div>
        </div>

        <div className="flex space-x-2 mb-6 bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
          <button
            onClick={() => setActiveTab("debts")}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === "debts"
                ? "bg-[#007AFF] text-white shadow-sm"
                : "text-[#007AFF] hover:bg-[#F2F2F7]"
            }`}
          >
            Deudas
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === "expenses"
                ? "bg-[#007AFF] text-white shadow-sm"
                : "text-[#007AFF] hover:bg-[#F2F2F7]"
            }`}
          >
            Gastos
          </button>
          <button
            onClick={() => setActiveTab("savings")}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === "savings"
                ? "bg-[#007AFF] text-white shadow-sm"
                : "text-[#007AFF] hover:bg-[#F2F2F7]"
            }`}
          >
            Ahorros
          </button>
        </div>

        {activeTab === "debts" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#000000]">Mis Deudas</h2>
              <button
                onClick={() => setShowDebtModal(true)}
                className="bg-[#007AFF] text-white px-4 py-2 rounded-xl hover:bg-[#0066CC] transition-colors flex items-center gap-2 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Agregar Deuda
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {debts.map((debt) => {
                const nextPayment = calculateNextPayment(debt);
                const progress =
                  debt.type === "fixed"
                    ? ((debt.advancePayments + debt.payments.length) /
                        debt.termMonths) *
                      100
                    : ((debt.principal - debt.currentBalance) /
                        debt.principal) *
                      100;

                return (
                  <div
                    key={debt.id}
                    className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-[#000000]">
                          {debt.name}
                        </h3>
                        <p className="text-xs text-[#8E8E93]">
                          {debt.type === "interest"
                            ? "Con Interés"
                            : "Pago Fijo"}
                          {debt.advancePayments > 0 &&
                            ` • ${debt.advancePayments} letras adelantadas`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete("debt", debt.id)}
                          className="bg-[#FF3B30] text-white px-2 py-1 rounded-lg text-sm hover:bg-[#FF2D55] transition-colors shadow-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-[#8E8E93]">Saldo Actual</p>
                        <p className="text-base font-bold text-[#FF3B30]">
                          ${debt.currentBalance.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#8E8E93]">Pago Mensual</p>
                        <p className="text-base font-bold text-[#007AFF]">
                          ${debt.monthlyPayment.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#8E8E93]">
                          {debt.type === "interest"
                            ? "Tasa de Interés"
                            : "Plazo"}
                        </p>
                        <p className="text-base font-bold text-[#000000]">
                          {debt.type === "interest"
                            ? `${debt.interestRate}%`
                            : `${debt.termMonths} meses`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#8E8E93]">Plazo Restante</p>
                        <p className="text-base font-bold text-[#000000]">
                          {debt.type === "fixed"
                            ? `${
                                debt.termMonths -
                                debt.advancePayments -
                                debt.payments.filter(
                                  (p) => p.type === "regular"
                                ).length
                              } meses`
                            : `${Math.ceil(
                                debt.currentBalance / debt.monthlyPayment
                              )} meses`}
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="w-full bg-[#E5E5EA] rounded-full h-1.5">
                        <div
                          className="bg-[#34C759] h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {debt.type === "interest" && debt.currentBalance > 0 && (
                      <div className="bg-[#F2F2F7] rounded-xl p-3 mb-3">
                        <h4 className="text-sm font-medium text-[#000000] mb-2">
                          Próximo Pago
                        </h4>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-[#8E8E93]">Interés</p>
                            <p className="font-medium text-[#000000]">
                              ${nextPayment.interest.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#8E8E93]">Capital</p>
                            <p className="font-medium text-[#000000]">
                              ${nextPayment.principal.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#8E8E93]">Nuevo Saldo</p>
                            <p className="font-medium text-[#000000]">
                              ${nextPayment.newBalance.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {debt.type === "fixed" && (
                      <div className="mt-3">
                        <button
                          onClick={() => {
                            setSelectedDebtForAdvance(debt);
                            setShowAdvancePaymentModal(true);
                          }}
                          className="w-full bg-[#34C759] text-white px-3 py-1.5 rounded-xl hover:bg-[#30B350] transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
                        >
                          <DollarSign className="h-4 w-4" />
                          Pagar Letra(s) Adelantada(s)
                        </button>
                      </div>
                    )}

                    {debt.payments.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-[#000000] mb-2">
                          Historial de Pagos
                        </h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {debt.payments.map((payment) => (
                            <div
                              key={payment.id}
                              className="flex justify-between items-center text-xs p-1.5 hover:bg-[#F2F2F7] rounded-lg group"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-[#8E8E93]">
                                  {payment.date}
                                </span>
                                <span className="font-medium text-[#000000]">
                                  ${payment.amount.toLocaleString()}
                                </span>
                                <span
                                  className={`text-[#8E8E93] capitalize ${
                                    payment.type === "advance"
                                      ? "text-[#34C759]"
                                      : ""
                                  }`}
                                >
                                  {payment.type === "advance"
                                    ? "Letra Adelantada"
                                    : payment.type}
                                </span>
                              </div>
                              {payment.type === "advance" && (
                                <button
                                  onClick={() =>
                                    deleteAdvancePayment(debt.id, payment.id)
                                  }
                                  className="text-[#FF3B30] hover:text-[#FF2D55] transition-colors opacity-0 group-hover:opacity-100"
                                  title="Eliminar pago adelantado"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
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
              <h2 className="text-2xl font-bold text-[#000000]">
                Gestión de Gastos e Ingresos
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowIncomeModal(true)}
                  className="bg-[#34C759] text-white px-4 py-2 rounded-xl hover:bg-[#30B350] transition-colors flex items-center gap-2 shadow-sm"
                >
                  <DollarSign className="h-4 w-4" />
                  Agregar Ingreso
                </button>
                <button
                  onClick={() => setShowSavingsModal(true)}
                  className="bg-[#34C759] text-white px-4 py-2 rounded-xl hover:bg-[#30B350] transition-colors flex items-center gap-2 shadow-sm"
                >
                  <PiggyBank className="h-4 w-4" />
                  Agregar Ahorro
                </button>
                <button
                  onClick={() => setShowExpenseModal(true)}
                  className="bg-[#007AFF] text-white px-4 py-2 rounded-xl hover:bg-[#0066CC] transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Gasto
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#8E8E93]">
                      Gastos Mensuales
                    </p>
                    <p className="text-2xl font-bold text-[#007AFF]">
                      $
                      {getMonthlySummary(
                        activeMonth,
                        activeYear
                      ).totalExpenses.toLocaleString()}
                    </p>
                  </div>
                  <Receipt className="h-8 w-8 text-[#007AFF]" />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#8E8E93]">
                      Gastos Pendientes
                    </p>
                    <p className="text-2xl font-bold text-[#FF9500]">
                      $
                      {expenses
                        .filter(
                          (e) =>
                            !e.paid &&
                            ((e.isFixed &&
                              e.month === activeMonth &&
                              e.year === activeYear) ||
                              (!e.isFixed &&
                                e.month === activeMonth &&
                                e.year === activeYear))
                        )
                        .reduce((sum, expense) => sum + expense.amount, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  <X className="h-8 w-8 text-[#FF9500]" />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#8E8E93]">
                      Ingresos del Mes
                    </p>
                    <p className="text-2xl font-bold text-[#34C759]">
                      $
                      {getMonthlySummary(
                        activeMonth,
                        activeYear
                      ).totalIncomes.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-[#34C759]" />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#8E8E93]">
                      Balance del Mes
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        getMonthlySummary(activeMonth, activeYear).balance >= 0
                          ? "text-[#34C759]"
                          : "text-[#FF3B30]"
                      }`}
                    >
                      $
                      {getMonthlySummary(
                        activeMonth,
                        activeYear
                      ).balance.toLocaleString()}
                    </p>
                  </div>
                  <Calculator className="h-8 w-8 text-[#8E8E93]" />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#8E8E93]">
                      Ahorros del Mes
                    </p>
                    <p className="text-2xl font-bold text-[#34C759]">
                      ${currentMonthSavings.toLocaleString()}
                    </p>
                  </div>
                  <PiggyBank className="h-8 w-8 text-[#34C759]" />
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex justify-end items-center gap-4">
                <div className="flex space-x-1">
                  {months.map((month, index) => (
                    <button
                      key={month}
                      onClick={() => handleMonthChange(index)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        activeMonth === index
                          ? "bg-[#007AFF] text-white shadow-sm"
                          : "bg-white text-[#007AFF] hover:bg-[#F2F2F7] border border-gray-200"
                      }`}
                    >
                      {month.slice(0, 3)}
                    </button>
                  ))}
                </div>
                <select
                  value={activeYear}
                  onChange={(e) => handleYearChange(parseInt(e.target.value))}
                  className="px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-white"
                >
                  {getYearRange().map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4 text-[#000000]">
                    Movimientos de {months[activeMonth]} {activeYear}
                  </h3>

                  <div className="space-y-4">
                    {/* Ingresos */}
                    {incomes
                      .filter(
                        (income) =>
                          income.isFixed ||
                          (income.month === activeMonth &&
                            income.year === activeYear)
                      )
                      .map((income) => (
                        <div
                          key={income.id}
                          className="flex justify-between items-center p-4 bg-[#F2F2F7] rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <div>
                              <h3 className="font-medium text-[#000000]">
                                {income.name}
                                {income.isFixed && (
                                  <span className="ml-2 text-xs bg-[#34C759]/10 text-[#34C759] px-2 py-1 rounded-lg">
                                    Ingreso Fijo
                                  </span>
                                )}
                              </h3>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-bold text-[#34C759]">
                              +${income.amount.toLocaleString()}
                            </p>
                            <button
                              onClick={() => handleDelete("income", income.id)}
                              className="text-[#FF3B30] hover:text-[#FF2D55] transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                    {/* Ahorros */}
                    {savings
                      .filter(
                        (saving) =>
                          saving.month === activeMonth &&
                          saving.year === activeYear
                      )
                      .map((saving) => {
                        const category = savingsCategories.find(
                          (c) => c.id === saving.categoryId
                        );
                        return (
                          <div
                            key={saving.id}
                            className="flex justify-between items-center p-4 bg-[#F2F2F7] rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              <div>
                                <h3 className="font-medium text-[#000000]">
                                  Ahorro - {category?.name || "Sin categoría"}
                                  <span className="ml-2 text-xs bg-[#34C759]/10 text-[#34C759] px-2 py-1 rounded-lg">
                                    Ahorro
                                  </span>
                                </h3>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="font-bold text-[#34C759]">
                                +${saving.amount.toLocaleString()}
                              </p>
                              <button
                                onClick={() => deleteSaving(saving.id)}
                                className="text-[#FF3B30] hover:text-[#FF2D55] transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                    {/* Gastos */}
                    {expenses
                      .filter(
                        (expense) =>
                          (expense.isFixed &&
                            expense.month === activeMonth &&
                            expense.year === activeYear) ||
                          (!expense.isFixed &&
                            expense.month === activeMonth &&
                            expense.year === activeYear)
                      )
                      .map((expense) => (
                        <div
                          key={expense.id}
                          className="flex justify-between items-center p-4 bg-[#F2F2F7] rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleExpensePaid(expense.id)}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                expense.paid
                                  ? "bg-[#34C759] border-[#34C759] text-white"
                                  : "border-[#8E8E93] hover:border-[#34C759]"
                              }`}
                            >
                              {expense.paid && <Check className="h-4 w-4" />}
                            </button>
                            <div>
                              <h3
                                className={`font-medium ${
                                  expense.paid
                                    ? "line-through text-[#8E8E93]"
                                    : "text-[#000000]"
                                }`}
                              >
                                {expense.name}
                                {expense.isFixed && (
                                  <span className="ml-2 text-xs bg-[#007AFF]/10 text-[#007AFF] px-2 py-1 rounded-lg">
                                    Fijo
                                  </span>
                                )}
                                {expense.isDebtPayment && (
                                  <span className="ml-2 text-xs bg-[#FF9500]/10 text-[#FF9500] px-2 py-1 rounded-lg">
                                    Pago de Deuda
                                  </span>
                                )}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-[#8E8E93]">
                                <span>{expense.category}</span>
                                {expense.paid && expense.paymentDate && (
                                  <span>
                                    • Pagado el{" "}
                                    {new Date(
                                      expense.paymentDate
                                    ).toLocaleDateString("es-ES", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <p
                              className={`font-bold ${
                                expense.paid
                                  ? "text-[#8E8E93]"
                                  : "text-[#007AFF]"
                              }`}
                            >
                              -${expense.amount.toLocaleString()}
                            </p>
                            {!expense.isDebtPayment && (
                              <button
                                onClick={() =>
                                  handleDelete("expense", expense.id)
                                }
                                className="text-[#FF3B30] hover:text-[#FF2D55] transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 text-[#000000]">
                  Resumen de {months[activeMonth]} {activeYear}
                </h3>
                {(() => {
                  const summary = getMonthlySummary(activeMonth, activeYear);
                  const savingsPercentage =
                    summary.totalIncomes > 0
                      ? (summary.totalSavings / summary.totalIncomes) * 100
                      : 0;
                  return (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-[#8E8E93]">Ingresos Fijos</p>
                        <p className="text-xl font-bold text-[#34C759]">
                          +${summary.fixedIncomeTotal.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[#8E8E93]">
                          Ingresos Variables
                        </p>
                        <p className="text-xl font-bold text-[#34C759]">
                          +${summary.variableIncomeTotal.toLocaleString()}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-[#E5E5EA]">
                        <p className="text-sm text-[#8E8E93]">Gastos Fijos</p>
                        <p className="text-xl font-bold text-[#007AFF]">
                          -${summary.fixedTotal.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[#8E8E93]">
                          Gastos Variables
                        </p>
                        <p className="text-xl font-bold text-[#007AFF]">
                          -${summary.variableTotal.toLocaleString()}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-[#E5E5EA]">
                        <p className="text-sm text-[#8E8E93]">Ahorros</p>
                        <p className="text-xl font-bold text-[#34C759]">
                          ${summary.totalSavings.toLocaleString()}
                        </p>
                        <p className="text-sm text-[#8E8E93]">
                          {savingsPercentage.toFixed(1)}% del ingreso total
                        </p>
                      </div>
                      <div className="pt-4 border-t border-[#E5E5EA]">
                        <p className="text-sm text-[#8E8E93]">Balance</p>
                        <p
                          className={`text-2xl font-bold ${
                            summary.balance >= 0
                              ? "text-[#34C759]"
                              : "text-[#FF3B30]"
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

        {activeTab === "savings" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#000000]">Mis Ahorros</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSavingsCategoryModal(true)}
                  className="bg-[#34C759] text-white px-4 py-2 rounded-xl hover:bg-[#30B350] transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Nueva Categoría
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8E8E93]">
                    Total Ahorrado
                  </p>
                  <p className="text-2xl font-bold text-[#34C759]">
                    $
                    {savings
                      .reduce((sum, saving) => sum + saving.amount, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <PiggyBank className="h-8 w-8 text-[#34C759]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savingsCategories.map((category) => {
                const categorySavings = savings.filter(
                  (s) => s.categoryId === category.id
                );
                const totalAmount = categorySavings.reduce(
                  (sum, saving) => sum + saving.amount,
                  0
                );

                return (
                  <div
                    key={category.id}
                    className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-[#000000]">
                          {category.name}
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedCategoryId(category.id);
                            setShowAddFundsModal(true);
                          }}
                          className="text-[#34C759] hover:text-[#30B350] transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCategoryId(category.id);
                            setShowSubtractFundsModal(true);
                          }}
                          className="text-[#FF9500] hover:text-[#FF8000] transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete("savingsCategory", category.id)
                          }
                          className="text-[#FF3B30] hover:text-[#FF2D55] transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-[#8E8E93]">Total Acumulado</p>
                      <p className="text-2xl font-bold text-[#34C759]">
                        ${totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showDebtModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-[#000000]">
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
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                />

                <select
                  value={debtForm.type}
                  onChange={(e) =>
                    setDebtForm({ ...debtForm, type: e.target.value })
                  }
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
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
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                />

                <input
                  type="number"
                  placeholder="Saldo actual"
                  value={debtForm.currentBalance}
                  onChange={(e) =>
                    setDebtForm({ ...debtForm, currentBalance: e.target.value })
                  }
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
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
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                  />
                )}

                <input
                  type="number"
                  placeholder="Plazo en meses"
                  value={debtForm.termMonths}
                  onChange={(e) =>
                    setDebtForm({ ...debtForm, termMonths: e.target.value })
                  }
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                />

                <input
                  type="number"
                  placeholder="Pago mensual"
                  value={debtForm.monthlyPayment}
                  onChange={(e) =>
                    setDebtForm({ ...debtForm, monthlyPayment: e.target.value })
                  }
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                />

                {debtForm.type === "fixed" && (
                  <input
                    type="number"
                    placeholder="Monto letra adelantada"
                    value={debtForm.advancePaymentAmount}
                    onChange={(e) =>
                      setDebtForm({
                        ...debtForm,
                        advancePaymentAmount: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                  />
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDebtModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-[#F2F2F7] transition-colors text-[#007AFF]"
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
                  className="flex-1 px-4 py-2 bg-[#007AFF] text-white rounded-xl hover:bg-[#0066CC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        )}

        {showExpenseModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-[#000000]">
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
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                />

                <input
                  type="number"
                  placeholder="Monto"
                  value={expenseForm.amount}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, amount: e.target.value })
                  }
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                />

                <select
                  value={expenseForm.category}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      category: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
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
                    className="w-4 h-4 text-[#007AFF] border-gray-300 rounded focus:ring-[#007AFF]"
                  />
                  <label htmlFor="isFixed" className="text-sm text-[#8E8E93]">
                    Gasto Fijo (se aplica a todos los meses)
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-[#F2F2F7] transition-colors text-[#007AFF]"
                >
                  Cancelar
                </button>
                <button
                  onClick={addExpense}
                  disabled={!expenseForm.name || !expenseForm.amount}
                  className="flex-1 px-4 py-2 bg-[#007AFF] text-white rounded-xl hover:bg-[#0066CC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        )}

        {showIncomeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-[#000000]">
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
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                />

                <input
                  type="number"
                  placeholder="Monto"
                  value={incomeForm.amount}
                  onChange={(e) =>
                    setIncomeForm({ ...incomeForm, amount: e.target.value })
                  }
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
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
                    className="w-4 h-4 text-[#007AFF] border-gray-300 rounded focus:ring-[#007AFF]"
                  />
                  <label
                    htmlFor="isFixedIncome"
                    className="text-sm text-[#8E8E93]"
                  >
                    Ingreso Fijo (se aplica a todos los meses)
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowIncomeModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-[#F2F2F7] transition-colors text-[#007AFF]"
                >
                  Cancelar
                </button>
                <button
                  onClick={addIncome}
                  disabled={!incomeForm.name || !incomeForm.amount}
                  className="flex-1 px-4 py-2 bg-[#34C759] text-white rounded-xl hover:bg-[#30B350] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        )}

        {showAdvancePaymentModal && selectedDebtForAdvance && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-[#000000]">
                Pagar Letras Adelantadas
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[#8E8E93] mb-1">
                    Deuda: {selectedDebtForAdvance.name}
                  </p>
                  <p className="text-sm text-[#8E8E93] mb-1">
                    Monto por letra: $
                    {selectedDebtForAdvance.advancePaymentAmount.toLocaleString()}
                  </p>
                  <p className="text-sm text-[#8E8E93]">
                    Letras pagadas: {selectedDebtForAdvance.advancePayments} de{" "}
                    {selectedDebtForAdvance.termMonths}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#000000] mb-1">
                    Número de letras a pagar
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={
                      selectedDebtForAdvance.termMonths -
                      selectedDebtForAdvance.advancePayments
                    }
                    value={advancePaymentCount}
                    onChange={(e) =>
                      setAdvancePaymentCount(
                        Math.min(
                          parseInt(e.target.value) || 1,
                          selectedDebtForAdvance.termMonths -
                            selectedDebtForAdvance.advancePayments
                        )
                      )
                    }
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                  />
                </div>

                <div className="pt-2">
                  <p className="text-sm font-medium text-[#000000]">
                    Total a pagar: $
                    {(
                      selectedDebtForAdvance.advancePaymentAmount *
                      advancePaymentCount
                    ).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAdvancePaymentModal(false);
                    setSelectedDebtForAdvance(null);
                    setAdvancePaymentCount(1);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-[#F2F2F7] transition-colors text-[#007AFF]"
                >
                  Cancelar
                </button>
                <button
                  onClick={() =>
                    payAdvancePayment(
                      selectedDebtForAdvance.id,
                      advancePaymentCount
                    )
                  }
                  className="flex-1 px-4 py-2 bg-[#34C759] text-white rounded-xl hover:bg-[#30B350] transition-colors"
                >
                  Pagar
                </button>
              </div>
            </div>
          </div>
        )}

        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-[#000000]">
                Confirmar Eliminación
              </h3>
              <p className="text-[#8E8E93] mb-6">
                ¿Estás seguro que deseas eliminar este{" "}
                {deleteType === "debt"
                  ? "deuda"
                  : deleteType === "expense"
                  ? "gasto"
                  : deleteType === "income"
                  ? "ingreso"
                  : deleteType === "savingsCategory"
                  ? "categoría de ahorro"
                  : ""}
                ? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setItemToDelete(null);
                    setDeleteType(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-[#F2F2F7] transition-colors text-[#007AFF]"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-[#FF3B30] text-white rounded-xl hover:bg-[#FF2D55] transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {showSavingsCategoryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-[#000000]">
                Nueva Categoría de Ahorro
              </h3>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre de la categoría"
                  value={newSavingsCategory}
                  onChange={(e) => setNewSavingsCategory(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowSavingsCategoryModal(false);
                    setNewSavingsCategory("");
                    if (activeTab !== "savings") {
                      setShowSavingsModal(true);
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-[#F2F2F7] transition-colors text-[#007AFF]"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    addSavingsCategory();
                    if (activeTab !== "savings") {
                      setShowSavingsModal(true);
                    }
                  }}
                  disabled={!newSavingsCategory.trim()}
                  className="flex-1 px-4 py-2 bg-[#34C759] text-white rounded-xl hover:bg-[#30B350] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        )}

        {showSavingsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-[#000000]">
                Agregar Ahorro
              </h3>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <select
                    value={savingsForm.categoryId}
                    onChange={(e) =>
                      setSavingsForm({
                        ...savingsForm,
                        categoryId: e.target.value,
                      })
                    }
                    className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                  >
                    <option value="">Seleccionar categoría</option>
                    {savingsCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setShowSavingsModal(false);
                      setShowSavingsCategoryModal(true);
                    }}
                    className="px-4 py-2 bg-[#34C759] text-white rounded-xl hover:bg-[#30B350] transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Nueva
                  </button>
                </div>

                <input
                  type="number"
                  placeholder="Monto"
                  value={savingsForm.amount}
                  onChange={(e) =>
                    setSavingsForm({ ...savingsForm, amount: e.target.value })
                  }
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowSavingsModal(false);
                    setSavingsForm({
                      categoryId: "",
                      amount: "",
                      month: activeMonth,
                      year: activeYear,
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-[#F2F2F7] transition-colors text-[#007AFF]"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (!savingsForm.categoryId || !savingsForm.amount) return;

                    const newSaving = {
                      id: Date.now(),
                      categoryId: parseInt(savingsForm.categoryId),
                      amount: parseFloat(savingsForm.amount),
                      month: activeMonth,
                      year: activeYear,
                    };

                    const updatedSavings = [...savings, newSaving];
                    setSavings(updatedSavings);
                    localStorage.setItem(
                      "savings",
                      JSON.stringify(updatedSavings)
                    );

                    setSavingsForm({
                      categoryId: "",
                      amount: "",
                      month: activeMonth,
                      year: activeYear,
                    });
                    setShowSavingsModal(false);
                  }}
                  disabled={!savingsForm.categoryId || !savingsForm.amount}
                  className="flex-1 px-4 py-2 bg-[#34C759] text-white rounded-xl hover:bg-[#30B350] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        )}

        {showPaymentDateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-[#000000]">
                Confirmar Pago
              </h3>

              <div className="space-y-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-[#000000] mb-1">
                    Fecha de Pago
                  </label>
                  <div className="w-full">
                    <DatePicker
                      selected={paymentDate}
                      onChange={(date) => setPaymentDate(date)}
                      dateFormat="dd/MM/yyyy"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      wrapperClassName="w-full"
                      openToDate={paymentDate}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPaymentDateModal(false);
                    setSelectedExpenseForPayment(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-[#F2F2F7] transition-colors text-[#007AFF]"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmPayment}
                  className="flex-1 px-4 py-2 bg-[#34C759] text-white rounded-xl hover:bg-[#30B350] transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {showAddFundsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-[#000000]">
                Añadir Fondos
              </h3>

              <div className="space-y-4">
                <input
                  type="number"
                  placeholder="Monto"
                  value={savingsForm.amount}
                  onChange={(e) =>
                    setSavingsForm({ ...savingsForm, amount: e.target.value })
                  }
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddFundsModal(false);
                    setSavingsForm({
                      categoryId: "",
                      amount: "",
                      month: activeMonth,
                      year: activeYear,
                    });
                    setSelectedCategoryId(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-[#F2F2F7] transition-colors text-[#007AFF]"
                >
                  Cancelar
                </button>
                <button
                  onClick={addFundsToCategory}
                  disabled={!savingsForm.amount}
                  className="flex-1 px-4 py-2 bg-[#34C759] text-white rounded-xl hover:bg-[#30B350] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Añadir
                </button>
              </div>
            </div>
          </div>
        )}

        {showSubtractFundsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-[#000000]">
                Restar Fondos
              </h3>

              <div className="space-y-4">
                <input
                  type="number"
                  placeholder="Monto"
                  value={savingsForm.amount}
                  onChange={(e) =>
                    setSavingsForm({ ...savingsForm, amount: e.target.value })
                  }
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowSubtractFundsModal(false);
                    setSavingsForm({
                      categoryId: "",
                      amount: "",
                      month: activeMonth,
                      year: activeYear,
                    });
                    setSelectedCategoryId(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-[#F2F2F7] transition-colors text-[#007AFF]"
                >
                  Cancelar
                </button>
                <button
                  onClick={subtractFundsFromCategory}
                  disabled={!savingsForm.amount}
                  className="flex-1 px-4 py-2 bg-[#FF9500] text-white rounded-xl hover:bg-[#FF8000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Restar
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
