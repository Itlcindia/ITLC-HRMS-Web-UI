import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, DollarSign, Calculator, Download, Percent, FileText, CheckCircle, ShieldCheck, User, Briefcase, Plus, X, Calendar, Landmark, Users, AlertCircle, TrendingUp } from 'lucide-react';
import { api } from '../../services/api';
import { downloadEmployeePayslip } from '../../utils/PaymentSlip';

export default function Payroll({ employees, subTab = 'dashboard', setActiveTab, currency = 'USD' }) {
  const currencySymbols = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£'
  };
  const cSymbol = currencySymbols[currency] || '$';

  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || 1);
  const [bonus, setBonus] = useState(500);
  const [deductions, setDeductions] = useState(200);
  const [attendance, setAttendance] = useState([]);
  const [loadingAtt, setLoadingAtt] = useState(false);
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Overtime States
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [overtimeRate, setOvertimeRate] = useState(25);

  // Professional Tax & Statutory settings
  const [profTax, setProfTax] = useState(200);

  // F&F Settlement Form States
  const [ffEmpId, setFfEmpId] = useState(employees[0]?.id || '');
  const [resignationDate, setResignationDate] = useState('');
  const [unpaidDays, setUnpaidDays] = useState(0);
  const [leaveEncashmentDays, setLeaveEncashmentDays] = useState(0);
  const [gratuityAmount, setGratuityAmount] = useState(0);
  const [noticePeriodAllowance, setNoticePeriodAllowance] = useState(0);
  const [ffOtherDeductions, setFfOtherDeductions] = useState(0);

  // Editable Payroll Configurations
  const [basicSalaryPercent, setBasicSalaryPercent] = useState(50.0);
  const [hraPercent, setHraPercent] = useState(40.0);
  const [pfPercent, setPfPercent] = useState(12.0);
  const [esiPercent, setEsiPercent] = useState(1.75);
  const [tdsPercent, setTdsPercent] = useState(15.0);
  const [totalWorkingDays, setTotalWorkingDays] = useState(22);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [isRecharging, setIsRecharging] = useState(false);
  const [selectedEmpBreakdown, setSelectedEmpBreakdown] = useState(null);
  
  // Edit & Delete States
  const [editingSlip, setEditingSlip] = useState(null);
  const [editBasic, setEditBasic] = useState(0);
  const [editHra, setEditHra] = useState(0);
  const [editAllowances, setEditAllowances] = useState(0);
  const [editDeductions, setEditDeductions] = useState(0);
  const [editNetSalary, setEditNetSalary] = useState(0);

  // Dynamic custom salary components states
  const [customComponents, setCustomComponents] = useState([]);
  const [showAddCompModal, setShowAddCompModal] = useState(false);
  const [newCompName, setNewCompName] = useState('');
  const [newCompType, setNewCompType] = useState('Earning');
  const [newCompCalcType, setNewCompCalcType] = useState('Percentage');
  const [newCompValue, setNewCompValue] = useState(0);

  // Dynamic reimbursement expense claims states
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [newExpEmpId, setNewExpEmpId] = useState(employees[0]?.id || '');
  const [newExpCategory, setNewExpCategory] = useState('Travel');
  const [newExpDate, setNewExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [newExpAmount, setNewExpAmount] = useState(0);
  const [newExpReason, setNewExpReason] = useState('');

  // Dynamic manual payslip states
  const [showAddPayslipModal, setShowAddPayslipModal] = useState(false);
  const [newSlipEmpId, setNewSlipEmpId] = useState(employees[0]?.id || '');
  const [newSlipMonth, setNewSlipMonth] = useState('July');
  const [newSlipYear, setNewSlipYear] = useState(2026);
  const [newSlipBasic, setNewSlipBasic] = useState(3000);
  const [newSlipHra, setNewSlipHra] = useState(1200);
  const [newSlipAllowances, setNewSlipAllowances] = useState(500);
  const [newSlipDeductions, setNewSlipDeductions] = useState(400);
  const [newSlipNet, setNewSlipNet] = useState(4300);
  const [newSlipType, setNewSlipType] = useState('Regular');

  // Active Payroll Month & Year selector states
  const [payrollMonth, setPayrollMonth] = useState('July');
  const [payrollYear, setPayrollYear] = useState(2026);

  const loadCompanyPayrollSettings = async () => {
    setLoadingCompany(true);
    try {
      const comp = await api.getAdminCompany();
      if (comp) {
        if (comp.basicSalaryPercent !== undefined) setBasicSalaryPercent(comp.basicSalaryPercent);
        if (comp.hraPercent !== undefined) setHraPercent(comp.hraPercent);
        if (comp.pfPercent !== undefined) setPfPercent(comp.pfPercent);
        if (comp.esiPercent !== undefined) setEsiPercent(comp.esiPercent);
        if (comp.tdsPercent !== undefined) setTdsPercent(comp.tdsPercent);
        if (comp.totalWorkingDays !== undefined) setTotalWorkingDays(comp.totalWorkingDays);
        if (comp.walletBalance !== undefined) setWalletBalance(comp.walletBalance);
      }
    } catch (err) {
      console.error("Failed to load company payroll settings:", err);
    } finally {
      setLoadingCompany(false);
    }
  };

  const fetchExpensesAndPayroll = async () => {
    try {
      const history = await api.getAdminPayroll();
      setPayrollHistory(history || []);
      const exps = await api.getAdminExpenses();
      setExpenses(exps || []);
      const comps = await api.getAdminSalaryComponents();
      setCustomComponents(comps || []);
    } catch (err) {
      console.error("Failed to load payroll, expense, or components data:", err);
    }
  };

  useEffect(() => {
    loadCompanyPayrollSettings();
    fetchExpensesAndPayroll();
  }, []);

  const handleSavePayrollSettings = async () => {
    try {
      await api.updateAdminCompany({
        basicSalaryPercent,
        hraPercent,
        pfPercent,
        esiPercent,
        tdsPercent,
        totalWorkingDays
      });
      alert("Payroll configurations saved successfully!");
    } catch (err) {
      alert("Failed to save payroll configurations.");
      console.error(err);
    }
  };

  const handleOpenEditSlip = (slip) => {
    setEditingSlip(slip);
    setEditBasic(slip.basic || 0);
    setEditHra(slip.hra || 0);
    setEditAllowances(slip.allowances || 0);
    setEditDeductions(slip.deductions || 0);
    setEditNetSalary(slip.netSalary || 0);
  };

  const handleSaveEditSlip = async (e) => {
    e.preventDefault();
    if (!editingSlip) return;
    try {
      await api.updateAdminPayroll(editingSlip.id, {
        basic: editBasic,
        hra: editHra,
        allowances: editAllowances,
        deductions: editDeductions,
        netSalary: editNetSalary
      });
      alert("Payroll record updated successfully!");
      setEditingSlip(null);
      fetchExpensesAndPayroll();
    } catch (err) {
      alert("Failed to update payroll record: " + err.message);
    }
  };

  const handleDeleteSlip = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payroll record?")) return;
    try {
      await api.deleteAdminPayroll(id);
      alert("Payroll record deleted successfully!");
      fetchExpensesAndPayroll();
    } catch (err) {
      alert("Failed to delete payroll record: " + err.message);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to decline/reject this reimbursement claim?")) return;
    try {
      await api.updateAdminExpense(id, 'Rejected');
      alert("Reimbursement claim declined.");
      fetchExpensesAndPayroll();
    } catch (err) {
      alert("Failed to update claim status: " + err.message);
    }
  };

  const handleAddSalaryComponent = async (e) => {
    e.preventDefault();
    if (!newCompName.trim()) return alert("Please enter a valid component name.");
    try {
      await api.createAdminSalaryComponent({
        name: newCompName,
        type: newCompType,
        calculationType: newCompCalcType,
        value: Number(newCompValue) || 0
      });
      alert(`Component "${newCompName}" added successfully!`);
      setNewCompName('');
      setNewCompValue(0);
      setShowAddCompModal(false);
      fetchExpensesAndPayroll();
    } catch (err) {
      alert("Failed to add component.");
    }
  };

  const handleDeleteSalaryComponent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this component?")) return;
    try {
      await api.deleteAdminSalaryComponent(id);
      alert("Component deleted successfully!");
      fetchExpensesAndPayroll();
    } catch (err) {
      alert("Failed to delete component.");
    }
  };

  const handleAddReimbursement = async (e) => {
    e.preventDefault();
    const targetEmp = employees.find(emp => emp.id.toString() === newExpEmpId.toString());
    if (!targetEmp) return alert("Please select a valid employee.");
    try {
      await api.createAdminExpense({
        employeeId: targetEmp.id,
        employeeName: targetEmp.name,
        date: newExpDate,
        category: newExpCategory,
        amount: Number(newExpAmount) || 0,
        reason: newExpReason,
        status: 'Approved'
      });
      alert("Reimbursement claim added and auto-approved!");
      setShowAddExpenseModal(false);
      setNewExpAmount(0);
      setNewExpReason('');
      fetchExpensesAndPayroll();
    } catch (err) {
      alert("Failed to add reimbursement claim.");
    }
  };

  const handleAddManualPayslip = async (e) => {
    e.preventDefault();
    const targetEmp = employees.find(emp => emp.id.toString() === newSlipEmpId.toString());
    if (!targetEmp) return alert("Please select a valid employee.");
    try {
      await api.createAdminPayroll({
        employeeId: targetEmp.id,
        employeeName: targetEmp.name,
        month: newSlipMonth,
        year: Number(newSlipYear) || 2026,
        basic: Number(newSlipBasic) || 0,
        hra: Number(newSlipHra) || 0,
        allowances: Number(newSlipAllowances) || 0,
        deductions: Number(newSlipDeductions) || 0,
        netSalary: Number(newSlipNet) || 0,
        type: newSlipType,
        status: 'Processed'
      });
      alert("Payslip record manually logged in database history!");
      setShowAddPayslipModal(false);
      fetchExpensesAndPayroll();
    } catch (err) {
      alert("Failed to manually add payslip record.");
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'structures', label: 'Salary Structures' },
    { id: 'run', label: 'Run Payroll' },
    { id: 'payslips', label: 'Payslips Console' },
    { id: 'compliance', label: 'Statutory Compliance' },
    { id: 'reimbursements', label: 'Reimbursements' },
    { id: 'ff', label: 'F&F Settlement' },
    { id: 'reports', label: 'Reports & Export' },
  ];

  const activeEmployees = employees.filter(emp => emp.status !== 'Suspended');
  const selectedEmp = activeEmployees.find(emp => emp.id && selectedEmpId && emp.id.toString() === selectedEmpId.toString()) || activeEmployees[0] || employees[0];

  useEffect(() => {
    if (!selectedEmp) return;
    const fetchAttendance = async () => {
      setLoadingAtt(true);
      try {
        const data = await api.getAdminAttendance(selectedEmp.id);
        setAttendance(data || []);
      } catch (err) {
        console.error("Failed to load employee attendance for payroll:", err);
      } finally {
        setLoadingAtt(false);
      }
    };
    fetchAttendance();
  }, [selectedEmpId, selectedEmp]);

  // Calculate approved expense reimbursements for this employee
  const empApprovedExpenses = expenses.filter(exp => exp.employeeId === selectedEmp?.id && exp.status === 'Approved');
  const reimbursementAmount = empApprovedExpenses.reduce((acc, exp) => acc + Number(exp.amount), 0);

  // Real-time payroll summary calculations
  const processedRecords = payrollHistory.filter(r => r.month === payrollMonth && r.year === Number(payrollYear) && r.type !== 'F&F');
  const processedEmpIds = new Set(processedRecords.filter(r => r.employeeId).map(r => r.employeeId.toString()));
  const salaryMilaCount = processedEmpIds.size;
  const salaryBakiCount = Math.max(0, activeEmployees.length - salaryMilaCount);
  const totalDisbursed = processedRecords.reduce((acc, r) => acc + Number(r.netSalary || 0), 0);
  const paidRatio = activeEmployees.length > 0 ? (salaryMilaCount / activeEmployees.length) * 100 : 0;

  // Calculate attendance & salary details based on selected month/year
  const monthNameToNumber = {
    January: '01', February: '02', March: '03', April: '04',
    May: '05', June: '06', July: '07', August: '08',
    September: '09', October: '10', November: '11', December: '12'
  };
  const monthNumber = monthNameToNumber[payrollMonth] || '07';
  const targetPrefix = `${payrollYear}-${monthNumber}`;
  const monthAttendance = attendance.filter(a => a.date && a.date.startsWith(targetPrefix));

  const presentCount = monthAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
  const halfDayCount = monthAttendance.filter(a => a.status === 'Half-day').length;
  const activeDays = presentCount + (halfDayCount * 0.5);
  const payoutRatio = monthAttendance.length === 0 ? 1.0 : Math.min(1.0, activeDays / totalWorkingDays);

  const baseSalary = (selectedEmp && typeof selectedEmp.salary === 'string') 
    ? parseFloat(selectedEmp.salary.replace('$', '').replace('₹', '').replace(/,/g, '')) / 12 
    : (selectedEmp && typeof selectedEmp.salary === 'number')
    ? selectedEmp.salary / 12
    : 5000;
  const adjustedBaseSalary = baseSalary * payoutRatio;

  const basicPay = adjustedBaseSalary * (basicSalaryPercent / 100);
  const hra = basicPay * (hraPercent / 100);
  const pf = Math.round(basicPay * (pfPercent / 100));
  const esi = Math.round(basicPay * (esiPercent / 100));
  
  // Dynamic custom earnings / deductions calculations
  let customEarnings = 0;
  let customDeductions = 0;
  customComponents.forEach(comp => {
    const value = Number(comp.value) || 0;
    let amount = 0;
    if (comp.calculationType === 'Percentage') {
      amount = basicPay * (value / 100);
    } else {
      amount = value;
    }
    if (comp.type === 'Earning') {
      customEarnings += amount;
    } else {
      customDeductions += amount;
    }
  });

  // Overtime Pay
  const overtimePay = Number(overtimeHours) * Number(overtimeRate);
  
  // Total Earnings & Net Pay calculations
  const tax = Math.round((adjustedBaseSalary + Number(bonus) + overtimePay + customEarnings) * (tdsPercent / 100));
  const netPay = Math.round(adjustedBaseSalary + Number(bonus) + overtimePay + reimbursementAmount + customEarnings - Number(deductions) - pf - esi - tax - Number(profTax) - customDeductions);

  const handleDownloadPayslip = async () => {
    if (!selectedEmp) return;
    try {
      const company = await api.getAdminCompany();
      downloadEmployeePayslip(
        selectedEmp,
        company || { name: 'ITLC Workspace' },
        {
          month: payrollMonth,
          year: Number(payrollYear),
          basic: basicPay,
          hra: hra,
          allowances: Number(bonus),
          overtime: overtimePay,
          reimbursement: reimbursementAmount,
          pf: pf,
          esi: esi,
          tax: tax,
          profTax: Number(profTax),
          deductions: pf + esi + tax + Number(profTax) + Number(deductions) + customDeductions,
          netSalary: netPay,
          currency: currency,
          customEarningsList: customComponents.filter(c => c.type === 'Earning').map(c => ({
            name: c.name,
            amount: c.calculationType === 'Percentage' ? basicPay * (Number(c.value) / 100) : Number(c.value)
          })),
          customDeductionsList: customComponents.filter(c => c.type === 'Deduction').map(c => ({
            name: c.name,
            amount: c.calculationType === 'Percentage' ? basicPay * (Number(c.value) / 100) : Number(c.value)
          }))
        }
      );
    } catch (e) {
      alert("Failed to generate payslip download");
    }
  };

  const handleProcessSinglePayslip = async () => {
    try {
      await api.createAdminPayroll({
        employeeId: selectedEmp.id,
        employeeName: selectedEmp.name,
        month: payrollMonth,
        year: Number(payrollYear),
        basic: basicPay,
        hra: hra,
        allowances: Number(bonus) + overtimePay + customEarnings,
        deductions: pf + esi + tax + Number(profTax) + Number(deductions) + customDeductions,
        netSalary: netPay,
        overtime: overtimePay,
        reimbursements: reimbursementAmount,
        profTax: Number(profTax),
        type: 'Regular',
        status: 'Processed'
      });
      alert(`Payslip for ${selectedEmp.name} (${payrollMonth} ${payrollYear}) has been successfully processed and disbursed!`);
      fetchExpensesAndPayroll();
    } catch (err) {
      alert("Failed to process individual payslip.");
    }
  };

  const handleRunBulkPayroll = async () => {
    try {
      let totalAmount = 0;
      for (const emp of employees) {
        const details = getEmpPayrollDetails(emp);
        totalAmount += details.netSalary;
        
        await api.createAdminPayroll({
          employeeId: emp.id,
          employeeName: emp.name,
          month: 'July',
          year: 2026,
          basic: details.basic,
          hra: details.hra,
          allowances: details.customEarnings,
          deductions: details.deductions,
          netSalary: details.netSalary,
          overtime: 0,
          reimbursements: details.reimbursements,
          profTax: Number(profTax),
          type: 'Regular',
          status: 'Processed'
        });
      }
      alert(`Bulk payroll processing successful! ${cSymbol}${totalAmount.toLocaleString()} net salary disbursed across ${employees.length} employee accounts.`);
      fetchExpensesAndPayroll();
    } catch (err) {
      alert("Failed to run bulk payroll.");
      console.error(err);
    }
  };

  const getEmpPayrollDetails = (emp) => {
    const empBase = (typeof emp.salary === 'string') 
      ? parseFloat(emp.salary.replace('$', '').replace('₹', '').replace(/,/g, '')) / 12 
      : (typeof emp.salary === 'number' ? emp.salary / 12 : 5000);
    const empBasicPay = empBase * (basicSalaryPercent / 100);
    const empPf = Math.round(empBasicPay * (pfPercent / 100));
    const empEsi = Math.round(empBasicPay * (esiPercent / 100));
    const empTax = Math.round(empBase * (tdsPercent / 100));
    
    const empExps = expenses.filter(exp => exp.employeeId === emp.id && exp.status === 'Approved');
    const empReimb = empExps.reduce((acc, exp) => acc + Number(exp.amount), 0);

    let empCustomEarnings = 0;
    let empCustomDeductions = 0;
    customComponents.forEach(comp => {
      const value = Number(comp.value) || 0;
      let amount = 0;
      if (comp.calculationType === 'Percentage') {
        amount = empBasicPay * (value / 100);
      } else {
        amount = value;
      }
      if (comp.type === 'Earning') {
        empCustomEarnings += amount;
      } else {
        empCustomDeductions += amount;
      }
    });

    const empNet = Math.round(empBase + empReimb + empCustomEarnings - empPf - empEsi - empTax - Number(profTax) - empCustomDeductions);
    return {
      basic: empBasicPay,
      hra: empBasicPay * (hraPercent / 100),
      deductions: empPf + empEsi + empTax + Number(profTax) + empCustomDeductions,
      netSalary: empNet,
      reimbursements: empReimb,
      customEarnings: empCustomEarnings,
      customDeductions: empCustomDeductions
    };
  };

  const handleRechargeWallet = async (e) => {
    e.preventDefault();
    const amt = Number(rechargeAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid recharge amount.");
      return;
    }
    setIsRecharging(true);
    try {
      const res = await api.rechargeAdminWallet(amt);
      if (res.success) {
        setWalletBalance(res.walletBalance);
        setRechargeAmount('');
        alert(`Successfully added ${cSymbol}${amt.toLocaleString()} to your HRMS Wallet!`);
      }
    } catch (err) {
      alert("Failed to recharge wallet.");
    } finally {
      setIsRecharging(false);
    }
  };

  const handleDisburseSingleSalary = async (emp) => {
    const details = getEmpPayrollDetails(emp);
    try {
      const res = await api.disbursePayroll({
        employeeId: emp.id,
        employeeName: emp.name,
        month: 'July',
        year: 2026,
        basic: details.basic,
        hra: details.hra,
        allowances: 0,
        deductions: details.deductions,
        netSalary: details.netSalary,
        reimbursements: details.reimbursements,
        profTax: Number(profTax)
      });
      if (res.success) {
        setWalletBalance(res.walletBalance);
        alert(`Salary of ${cSymbol}${details.netSalary.toLocaleString()} successfully disbursed to ${emp.name}!`);
        fetchExpensesAndPayroll();
      }
    } catch (err) {
      alert(err.message || "Failed to disburse salary.");
    }
  };

  const handleHoldSingleSalary = async (emp) => {
    const details = getEmpPayrollDetails(emp);
    try {
      const res = await api.holdPayroll({
        employeeId: emp.id,
        employeeName: emp.name,
        month: 'July',
        year: 2026,
        basic: details.basic,
        hra: details.hra,
        allowances: 0,
        deductions: details.deductions,
        netSalary: details.netSalary,
        profTax: Number(profTax)
      });
      if (res.success) {
        alert(`Salary for ${emp.name} has been placed ON HOLD.`);
        fetchExpensesAndPayroll();
      }
    } catch (err) {
      alert("Failed to hold salary.");
    }
  };

  const getEmployeePayrollStatus = (empId) => {
    const record = payrollHistory.find(r => r.employeeId === empId && r.month === 'July' && r.year === 2026);
    return record ? record.status : 'Pending';
  };

  // Full & Final calculations
  const ffEmp = employees.find(e => e.id.toString() === ffEmpId.toString()) || employees[0];
  const ffBase = ffEmp ? (typeof ffEmp.salary === 'string' ? parseFloat(ffEmp.salary.replace('$', '').replace('₹', '').replace(/,/g, '')) / 12 : ffEmp.salary / 12) : 5000;
  const unpaidSalaryAmount = Math.round((ffBase / 30) * unpaidDays);
  const leaveEncashmentAmount = Math.round((ffBase / 30) * leaveEncashmentDays);
  const ffNetPayable = unpaidSalaryAmount + leaveEncashmentAmount + Number(gratuityAmount) + Number(noticePeriodAllowance) - Number(ffOtherDeductions);

  const handleProcessFF = async (e) => {
    e.preventDefault();
    if (!ffEmp) return;
    try {
      await api.createAdminPayroll({
        employeeId: ffEmp.id,
        employeeName: ffEmp.name,
        month: 'Settlement',
        year: 2026,
        basic: unpaidSalaryAmount,
        hra: 0,
        allowances: Number(gratuityAmount) + Number(noticePeriodAllowance),
        deductions: Number(ffOtherDeductions),
        netSalary: ffNetPayable,
        gratuity: Number(gratuityAmount),
        leaveEncashment: leaveEncashmentAmount,
        type: 'F&F',
        status: 'Processed'
      });
      await api.updateEmployee(ffEmp.id, { status: 'Suspended' });
      ffEmp.status = 'Suspended'; // Real-time local state update
      alert(`Full & Final (F&F) settlement of ${cSymbol}${ffNetPayable.toLocaleString()} processed for ${ffEmp.name}!`);
      fetchExpensesAndPayroll();
    } catch (err) {
      alert("Failed to process F&F settlement: " + err.message);
    }
  };

  // Generate compliance Form 16 or audit report
  const handleDownloadAnnualReports = () => {
    if (!selectedEmp) return;
    
    // Generate statutory compliance text payload representing Form 16
    const form16Text = `
========================================================================
             FORM NO. 16 - ANNUAL TAX DEDUCTION STATEMENT
========================================================================
Employer Name: ITLC Workspace
Employee Name: ${selectedEmp.name} (ID: ${selectedEmp.id})
Assessment Year: 2026 - 2027
TDS Period: July 2025 to June 2026
------------------------------------------------------------------------
I. Gross Salary received u/s 17(1):         ${cSymbol}${Math.round(baseSalary * 12).toLocaleString()}
II. HRA Exemption u/s 10(13A):               ${cSymbol}${Math.round(hra * 12).toLocaleString()}
III. Deductions u/s 16:
     (a) Standard Deduction:                ${cSymbol}50,000
     (b) Professional Tax u/s 16(iii):       ${cSymbol}${Math.round(profTax * 12).toLocaleString()}
IV. Total Deductions:                       ${cSymbol}${Math.round(50000 + (profTax * 12)).toLocaleString()}
V. Taxable Income u/s 115BAC:               ${cSymbol}${Math.round((baseSalary * 12) - 50000 - (profTax * 12)).toLocaleString()}
VI. Total Tax Deposited (TDS):             ${cSymbol}${Math.round(tax * 12).toLocaleString()}
------------------------------------------------------------------------
Verification: This statement certifies that tax has been deducted at source
and paid to the credit of the Government.
========================================================================
    `;

    const blob = new Blob([form16Text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Form_16_${selectedEmp.name.replace(/\s+/g, '_')}_2026.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`Form 16 Tax Certificate compiled and downloaded for ${selectedEmp.name}!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Sub tabs navigation */}
      <div style={{
        display: 'flex',
        gap: 8,
        borderBottom: '1px solid var(--color-border)',
        paddingBottom: 8,
        overflowX: 'auto',
        scrollbarWidth: 'none'
      }} className="no-scrollbar">
        {tabs.map(tab => {
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (setActiveTab) {
                  setActiveTab(`payroll-${tab.id}`);
                }
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: isActive ? 'var(--color-primary-light)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                outline: 'none'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        
        {/* SUB-VIEW 1: Dashboard Calculator */}
        {subTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {/* Real-time Payroll Dashboard KPI Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              <div className="premium-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ padding: 12, borderRadius: 12, background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                  <Users size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Total Employees</span>
                  <h4 className="number-font" style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 0 0' }}>
                    {activeEmployees.length}
                  </h4>
                </div>
              </div>

              <div className="premium-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ padding: 12, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  <CheckCircle size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Salaries Processed</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <h4 className="number-font" style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 0 0' }}>
                      {salaryMilaCount}
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>({paidRatio.toFixed(0)}%)</span>
                  </div>
                  <div style={{ width: '100%', height: 4, background: 'var(--color-bg-secondary)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${paidRatio}%`, height: '100%', background: '#10b981' }} />
                  </div>
                </div>
              </div>

              <div className="premium-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ padding: 12, borderRadius: 12, background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                  <AlertCircle size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Salaries Remaining</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <h4 className="number-font" style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 0 0' }}>
                      {salaryBakiCount}
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>({(100 - paidRatio).toFixed(0)}%)</span>
                  </div>
                  <div style={{ width: '100%', height: 4, background: 'var(--color-bg-secondary)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${100 - paidRatio}%`, height: '100%', background: '#f59e0b' }} />
                  </div>
                </div>
              </div>

              <div className="premium-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ padding: 12, borderRadius: 12, background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                  <TrendingUp size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Total Disbursed ({payrollMonth})</span>
                  <h4 className="number-font" style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 0 0' }}>
                    {cSymbol}{totalDisbursed.toLocaleString()}
                  </h4>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
              {/* Payroll Config Panel */}
              <div className="premium-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calculator size={18} style={{ color: 'var(--color-primary)' }} />
                  <span>Generate & Process Payslip</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="premium-form-group">
                    <label className="premium-label">Select Employee</label>
                    <select 
                      value={selectedEmpId} 
                      onChange={(e) => setSelectedEmpId(e.target.value)}
                      className="premium-input"
                    >
                      {activeEmployees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="premium-form-group">
                      <label className="premium-label">Payroll Month</label>
                      <select 
                        value={payrollMonth} 
                        onChange={(e) => setPayrollMonth(e.target.value)}
                        className="premium-input"
                      >
                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="premium-form-group">
                      <label className="premium-label">Payroll Year</label>
                      <input 
                        type="number" 
                        value={payrollYear} 
                        onChange={(e) => setPayrollYear(Number(e.target.value) || 2026)} 
                        className="premium-input" 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="premium-form-group">
                      <label className="premium-label">Bonus ({currency})</label>
                      <input 
                        type="number" 
                        value={bonus} 
                        onChange={(e) => setBonus(e.target.value)} 
                        className="premium-input" 
                      />
                    </div>
                    <div className="premium-form-group">
                      <label className="premium-label">Deductions ({currency})</label>
                      <input 
                        type="number" 
                        value={deductions} 
                        onChange={(e) => setDeductions(e.target.value)} 
                        className="premium-input" 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="premium-form-group">
                      <label className="premium-label">Overtime Hours</label>
                      <input 
                        type="number" 
                        value={overtimeHours} 
                        onChange={(e) => setOvertimeHours(Number(e.target.value) || 0)} 
                        className="premium-input" 
                      />
                    </div>
                    <div className="premium-form-group">
                      <label className="premium-label">Hourly Overtime Rate ({currency})</label>
                      <input 
                        type="number" 
                        value={overtimeRate} 
                        onChange={(e) => setOvertimeRate(Number(e.target.value) || 0)} 
                        className="premium-input" 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                    <button 
                      onClick={handleProcessSinglePayslip}
                      className="premium-btn premium-btn-success" 
                      style={{ width: '100%', justifyContent: 'center', padding: 12, border: 'none', borderRadius: 8, background: 'var(--color-success)', color: '#fff', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <span>Process & Disburse Salary</span>
                    </button>

                    <button 
                      onClick={handleDownloadPayslip}
                      className="premium-btn premium-btn-primary" 
                      style={{ width: '100%', justifyContent: 'center', padding: 12 }}
                    >
                      <Download size={16} />
                      <span>Download PDF Payslip</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Payslip preview */}
              <div className="premium-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>Breakdown Summary</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderBottom: '1px solid var(--color-border)', paddingBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Basic Base Salary (Monthly):</span>
                    <span className="number-font" style={{ fontWeight: 600 }}>{cSymbol}{Math.round(baseSalary).toLocaleString()}</span>
                  </div>
                  {attendance.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: 'var(--color-bg-secondary)', padding: 8, borderRadius: 8, fontSize: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                        <span>Attendance Present Days:</span>
                        <span className="number-font">{presentCount} Days</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                        <span>Attendance Half-Days:</span>
                        <span className="number-font">{halfDayCount} Days</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', borderTop: '1px dashed var(--color-border)', paddingTop: 4, marginTop: 4 }}>
                        <span>Prorated Payout Ratio:</span>
                        <span className="number-font" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{(payoutRatio * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderTop: '1px solid var(--color-border)', paddingTop: 8 }}>
                    <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Adjusted Base Salary:</span>
                    <span className="number-font" style={{ fontWeight: 600 }}>{cSymbol}{Math.round(adjustedBaseSalary).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Performance Bonus:</span>
                    <span className="number-font" style={{ fontWeight: 600, color: 'var(--color-success)' }}>+{cSymbol}{bonus}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Overtime Earnings:</span>
                    <span className="number-font" style={{ fontWeight: 600, color: 'var(--color-success)' }}>+{cSymbol}{overtimePay}</span>
                  </div>
                  {reimbursementAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Approved Reimbursements:</span>
                      <span className="number-font" style={{ fontWeight: 600, color: 'var(--color-success)' }}>+{cSymbol}{reimbursementAmount}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Provident Fund (PF {pfPercent}%):</span>
                    <span className="number-font" style={{ fontWeight: 600, color: 'var(--color-danger)' }}>-{cSymbol}{pf}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>State Insurance (ESI {esiPercent}%):</span>
                    <span className="number-font" style={{ fontWeight: 600, color: 'var(--color-danger)' }}>-{cSymbol}{esi}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Tax Deductions (TDS {tdsPercent}%):</span>
                    <span className="number-font" style={{ fontWeight: 600, color: 'var(--color-danger)' }}>-{cSymbol}{tax}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Professional Tax (PT):</span>
                    <span className="number-font" style={{ fontWeight: 600, color: 'var(--color-danger)' }}>-{cSymbol}{profTax}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16 }}>
                  <div>
                    <span className="premium-label" style={{ fontSize: '0.65rem' }}>Estimated Net Pay</span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Direct bank wire payment</p>
                  </div>
                  <h4 className="number-font" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                    {cSymbol}{netPay.toLocaleString()}
                  </h4>
                </div>
              </div>

              {/* Real-time Employee Payment Status Feed */}
              <div className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Workforce Payroll Status</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Click employee to load & process salary</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 400, overflowY: 'auto', paddingRight: 4 }} className="custom-scrollbar">
                  {activeEmployees.map(emp => {
                    const isPaid = !!(emp.id && processedEmpIds.has(emp.id.toString()));
                    const payrollRec = payrollHistory.find(r => r.employeeId && emp.id && r.employeeId.toString() === emp.id.toString() && r.month === 'July' && r.year === 2026);
                    const isSelected = !!(selectedEmpId && emp.id && selectedEmpId.toString() === emp.id.toString());

                    return (
                      <div 
                        key={emp.id}
                        onClick={() => setSelectedEmpId(emp.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: 10,
                          borderRadius: 12,
                          border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                          background: isSelected ? 'var(--color-primary-light)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        className="hover-card"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'var(--color-bg-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem'
                          }}>
                            {emp.name.charAt(0)}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{emp.name}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>{emp.designation}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                          {isPaid ? (
                            <>
                              <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>Paid</span>
                              <span className="number-font" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                                {cSymbol}{payrollRec?.netSalary?.toLocaleString()}
                              </span>
                            </>
                          ) : (
                            <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '2px 6px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 2: Salary Structures */}
        {subTab === 'structures' && (
          <motion.div
            key="structures"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Salary Components</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Define structure mappings and deductions formulas</span>
              </div>
              <button 
                onClick={() => setShowAddCompModal(true)} 
                className="premium-btn premium-btn-primary"
              >
                <Plus size={16} />
                <span>Add Component</span>
              </button>
            </div>

            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Component Name</th>
                    <th>Type</th>
                    <th>Formula / Base Percentage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 700 }}>Basic Pay</td>
                    <td>Earning</td>
                    <td className="number-font">
                      <input 
                        type="number" 
                        value={basicSalaryPercent} 
                        onChange={(e) => setBasicSalaryPercent(parseFloat(e.target.value) || 0)} 
                        style={{ width: 80, padding: '4px 8px', borderRadius: 8, border: '1px solid var(--color-border)', backgroundColor: 'transparent', color: 'inherit', marginRight: 6 }} 
                      />
                      % of CTC
                    </td>
                    <td><span className="badge badge-success">Active</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700 }}>House Rent Allowance (HRA)</td>
                    <td>Earning</td>
                    <td className="number-font">
                      <input 
                        type="number" 
                        value={hraPercent} 
                        onChange={(e) => setHraPercent(parseFloat(e.target.value) || 0)} 
                        style={{ width: 80, padding: '4px 8px', borderRadius: 8, border: '1px solid var(--color-border)', backgroundColor: 'transparent', color: 'inherit', marginRight: 6 }} 
                      />
                      % of Basic Pay
                    </td>
                    <td><span className="badge badge-success">Active</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700 }}>Provident Fund (PF)</td>
                    <td>Deduction</td>
                    <td className="number-font">
                      <input 
                        type="number" 
                        value={pfPercent} 
                        onChange={(e) => setPfPercent(parseFloat(e.target.value) || 0)} 
                        style={{ width: 80, padding: '4px 8px', borderRadius: 8, border: '1px solid var(--color-border)', backgroundColor: 'transparent', color: 'inherit', marginRight: 6 }} 
                      />
                      % of Basic Pay
                    </td>
                    <td><span className="badge badge-success">Active</span></td>
                  </tr>
                  {customComponents.map(comp => (
                    <tr key={comp.id}>
                      <td style={{ fontWeight: 700 }}>{comp.name}</td>
                      <td>{comp.type}</td>
                      <td className="number-font" style={{ fontWeight: 600 }}>
                        {comp.calculationType === 'Percentage' ? `${comp.value}% of Basic` : `${cSymbol}${comp.value} (Flat)`}
                      </td>
                      <td>
                        <div style={{ display: 'inline-flex', gap: 10, alignItems: 'center' }}>
                          <span className="badge badge-success">Active</span>
                          <button 
                            onClick={() => handleDeleteSalaryComponent(comp.id)}
                            className="premium-btn premium-btn-secondary"
                            style={{ padding: '0 8px', height: '24px', fontSize: '0.7rem', color: '#ef4444', borderColor: '#ef4444', justifyContent: 'center' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button onClick={handleSavePayrollSettings} className="premium-btn premium-btn-success">
                Save Component Mappings
              </button>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 3: Run Payroll */}
        {subTab === 'run' && (() => {
          const totalRequiredPayroll = employees.reduce((acc, emp) => {
            const details = getEmpPayrollDetails(emp);
            return acc + details.netSalary;
          }, 0);

          return (
            <motion.div
              key="run"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
            >
              {/* Wallet and Payroll Summary Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                
                {/* HRMS Wallet */}
                <div className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <DollarSign size={18} style={{ color: 'var(--color-primary)' }} />
                      <span>HRMS Admin Wallet</span>
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>Add money to disburse salaries to employees.</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(79, 70, 229, 0.05)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(79, 70, 229, 0.15)' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Wallet Balance</span>
                    <strong style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      {cSymbol}{walletBalance.toLocaleString()}
                    </strong>
                  </div>
                  <form onSubmit={handleRechargeWallet} style={{ display: 'flex', gap: 10 }}>
                    <input 
                      type="number" 
                      required 
                      min="1"
                      placeholder="Amount (e.g. 50000)"
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                      className="premium-input"
                      style={{ flex: 1, height: 40 }}
                    />
                    <button 
                      type="submit" 
                      disabled={isRecharging} 
                      className="premium-btn premium-btn-primary" 
                      style={{ padding: '0 20px', height: 40, whiteSpace: 'nowrap' }}
                    >
                      {isRecharging ? 'Processing...' : 'Add Money'}
                    </button>
                  </form>
                </div>

                {/* Payroll Summary */}
                <div className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Calculator size={18} style={{ color: 'var(--color-success)' }} />
                      <span>Monthly Payroll Summary (July 2026)</span>
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>Auto calculated net payable salary volume.</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Total Employees & Managers:</span>
                      <strong style={{ color: 'var(--color-text-primary)' }}>{employees.length}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Total Net Payable:</span>
                      <strong style={{ color: 'var(--color-text-primary)' }}>{cSymbol}{totalRequiredPayroll.toLocaleString()}</strong>
                    </div>
                  </div>

                  {walletBalance < totalRequiredPayroll && (
                    <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>⚠️</span>
                      <span>Warning: Wallet balance is insufficient to complete bulk salary runs.</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button 
                      onClick={handleRunBulkPayroll} 
                      disabled={walletBalance < totalRequiredPayroll || employees.length === 0} 
                      className="premium-btn premium-btn-primary" 
                      style={{ flex: 1, height: 42, justifyContent: 'center' }}
                    >
                      <CreditCard size={14} />
                      <span>Disburse All Salaries</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Premium Disbursal Table matching user upload design */}
              <div className="premium-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Salary Disbursal Console</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: 4 }}>
                    Verify and disburse individual employee or manager salary details. Click row to see complete details.
                  </p>
                </div>

                <div style={{ maxHeight: '450px', overflowY: 'auto', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px solid var(--color-border)' }} className="premium-scrollbar">
                  <div className="premium-table-container" style={{ margin: 0 }}>
                    <table className="premium-table">
                      <thead>
                        <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
                          <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}># ID</th>
                          <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><User size={13} /> Name</span>
                          </th>
                          <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Briefcase size={13} /> Role</span>
                          </th>
                          <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Basic Salary</th>
                          <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Reimbursements</th>
                          <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Net Payable</th>
                          <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Status</th>
                          <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.map((emp) => {
                          const status = getEmployeePayrollStatus(emp.id);
                          const details = getEmpPayrollDetails(emp);
                          return (
                            <tr 
                              key={emp.id} 
                              onClick={() => setSelectedEmpBreakdown(emp)}
                              style={{ cursor: 'pointer' }}
                            >
                              {/* ID */}
                              <td style={{ fontWeight: 700 }} className="number-font">
                                #{emp.id}
                              </td>

                              {/* Name */}
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div style={{ width: 32, height: 32, borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.03)' }}>
                                    <img 
                                      src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60'} 
                                      alt={emp.name} 
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                  </div>
                                  <span style={{ fontWeight: 700 }}>{emp.name}</span>
                                </div>
                              </td>

                              {/* Role */}
                              <td style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                                {emp.role}
                              </td>

                              {/* Basic */}
                              <td className="number-font" style={{ color: 'var(--color-text-secondary)' }}>
                                {cSymbol}{Math.round(details.basic).toLocaleString()}
                              </td>

                              {/* Reimbursements */}
                              <td className="number-font" style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                                +{cSymbol}{details.reimbursements.toLocaleString()}
                              </td>

                              {/* Net Payable */}
                              <td className="number-font" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                                {cSymbol}{details.netSalary.toLocaleString()}
                              </td>

                              {/* Status Badge */}
                              <td>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  padding: '4px 10px',
                                  borderRadius: '999px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  background: status === 'Processed' ? 'rgba(34, 197, 94, 0.12)' : status === 'On Hold' ? 'rgba(234, 179, 8, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                                  color: status === 'Processed' ? '#22c55e' : status === 'On Hold' ? '#eab308' : '#64748b'
                                }}>
                                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: status === 'Processed' ? '#22c55e' : status === 'On Hold' ? '#eab308' : '#64748b' }} />
                                  <span>{status === 'Processed' ? 'Paid' : status === 'On Hold' ? 'On Hold' : 'Pending'}</span>
                                </span>
                              </td>

                              {/* Actions */}
                              <td style={{ textAlign: 'right' }}>
                                <div 
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ display: 'inline-flex', gap: 6, justifyContent: 'flex-end', width: '100%' }}
                                >
                                  {status === 'Processed' ? (
                                    <span className="badge badge-success" style={{ padding: '4px 8px', fontSize: '0.7rem', fontWeight: 700, borderRadius: '6px' }}>
                                      ✔️ Paid
                                    </span>
                                  ) : status === 'On Hold' ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <button 
                                        onClick={() => handleDisburseSingleSalary(emp)}
                                        className="premium-btn premium-btn-primary"
                                        style={{ padding: '0 10px', fontSize: '0.7rem', height: '26px', justifyContent: 'center' }}
                                      >
                                        Pay
                                      </button>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', gap: 6 }}>
                                      <button 
                                        onClick={() => handleHoldSingleSalary(emp)}
                                        className="premium-btn premium-btn-secondary" 
                                        style={{ padding: '0 8px', fontSize: '0.7rem', height: '26px', borderColor: '#ef4444', color: '#ef4444', justifyContent: 'center' }}
                                        title="Hold"
                                      >
                                        ✖
                                      </button>
                                      <button 
                                        onClick={() => handleDisburseSingleSalary(emp)}
                                        className="premium-btn premium-btn-primary" 
                                        style={{ padding: '0 8px', fontSize: '0.7rem', height: '26px', justifyContent: 'center', background: '#10b981', borderColor: '#10b981' }}
                                        title="Pay"
                                      >
                                        ✔
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>

                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Salary Breakdown Modal */}
              {selectedEmpBreakdown && (() => {
                const details = getEmpPayrollDetails(selectedEmpBreakdown);
                return (
                  <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: 20
                  }} onClick={() => setSelectedEmpBreakdown(null)}>
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={{
                        background: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        padding: 24,
                        borderRadius: 20,
                        width: '100%',
                        maxWidth: 420,
                        position: 'relative',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 20
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img 
                          src={selectedEmpBreakdown.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60'} 
                          alt={selectedEmpBreakdown.name} 
                          style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }}
                        />
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>{selectedEmpBreakdown.name}</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>{selectedEmpBreakdown.role}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--color-text-secondary)' }}>Salary Breakdown (July 2026)</h3>
                      </div>

                      {/* Details Table */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--color-text-secondary)' }}>Basic Salary ({basicSalaryPercent}%):</span>
                          <strong className="number-font">{cSymbol}{Math.round(details.basic).toLocaleString()}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--color-text-secondary)' }}>House Rent Allowance (HRA - {hraPercent}%):</span>
                          <strong className="number-font">{cSymbol}{Math.round(details.hra).toLocaleString()}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                          <span>Reimbursements Claims:</span>
                          <strong className="number-font">+{cSymbol}{details.reimbursements.toLocaleString()}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                          <span>Total Deductions (PF/ESI/Tax/PT):</span>
                          <strong className="number-font">-{cSymbol}{Math.round(details.deductions).toLocaleString()}</strong>
                        </div>
                        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem' }}>
                          <span style={{ fontWeight: 700 }}>Net Payable Salary:</span>
                          <strong style={{ color: 'var(--color-primary)', fontWeight: 800 }} className="number-font">
                            {cSymbol}{details.netSalary.toLocaleString()}
                          </strong>
                        </div>
                      </div>

                      {/* Footer Buttons */}
                      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                        <button 
                          onClick={() => setSelectedEmpBreakdown(null)}
                          className="premium-btn premium-btn-secondary"
                          style={{ flex: 1, justifyContent: 'center', height: 38 }}
                        >
                          Close
                        </button>
                      </div>
                    </motion.div>
                  </div>
                );
              })()}

            </motion.div>
          );
        })()}

        {/* SUB-VIEW 4: Payslips Console */}
        {subTab === 'payslips' && (
          <motion.div
            key="payslips"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Disbursed Payslips Archives</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Historically logged wire payouts</span>
              </div>
              <button 
                onClick={() => setShowAddPayslipModal(true)} 
                className="premium-btn premium-btn-primary"
              >
                <Plus size={16} />
                <span>Add Payslip Record</span>
              </button>
            </div>

            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Slip ID</th>
                    <th>Payment Period / Name</th>
                    <th>Type</th>
                    <th>Net Amount</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollHistory.map(slip => (
                    <tr key={slip.id}>
                      <td style={{ fontWeight: 700 }}>{slip.id}</td>
                      <td style={{ fontSize: '0.8rem' }}>{slip.month} {slip.year} - {slip.employeeName}</td>
                      <td style={{ fontSize: '0.8rem', fontWeight: 600 }}>{slip.type || 'Regular'}</td>
                      <td className="number-font" style={{ fontSize: '0.85rem' }}>{cSymbol}{slip.netSalary?.toLocaleString()}</td>
                      <td><span className="badge badge-success">{slip.status}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button 
                            onClick={async () => {
                              try {
                                const emp = employees.find(e => e.id === slip.employeeId) || { name: slip.employeeName };
                                const companyInfo = await api.getAdminCompany();
                                const basicVal = Number(slip.basic || 0);
                                const hraVal = Number(slip.hra || 0);
                                const allowancesVal = Number(slip.allowances || 0);
                                const deductionsVal = Number(slip.deductions || 0);
                                const netVal = Number(slip.netSalary || 0);
                                
                                const pfVal = Math.round(basicVal * 0.12);
                                const esiVal = Math.round(basicVal * 0.0175);
                                const taxVal = Math.round((basicVal + hraVal + allowancesVal) * 0.15);
                                
                                downloadEmployeePayslip(
                                  emp,
                                  companyInfo || { name: 'ITLC Workspace' },
                                  {
                                    month: slip.month,
                                    year: slip.year,
                                    basic: basicVal,
                                    hra: hraVal,
                                    allowances: allowancesVal,
                                    overtime: slip.overtime || 0,
                                    reimbursement: slip.reimbursements || 0,
                                    pf: pfVal,
                                    esi: esiVal,
                                    tax: taxVal,
                                    profTax: slip.profTax || 0,
                                    deductions: deductionsVal,
                                    netSalary: netVal,
                                    currency: currency
                                  }
                                );
                              } catch (e) {
                                alert("Failed to download payslip PDF.");
                              }
                            }}
                            className="premium-btn premium-btn-secondary"
                            style={{ padding: '0 8px', height: '26px', minWidth: '32px', justifyContent: 'center' }}
                            title="Download PDF"
                          >
                            <Download size={13} />
                          </button>
                          
                          <button 
                            onClick={() => handleOpenEditSlip(slip)}
                            className="premium-btn premium-btn-primary"
                            style={{ padding: '0 8px', height: '26px', fontSize: '0.75rem', justifyContent: 'center' }}
                            title="Edit Record"
                          >
                            Edit
                          </button>

                          <button 
                            onClick={() => handleDeleteSlip(slip.id)}
                            className="premium-btn premium-btn-secondary"
                            style={{ padding: '0 8px', height: '26px', fontSize: '0.75rem', borderColor: '#ef4444', color: '#ef4444', justifyContent: 'center' }}
                            title="Delete Record"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 5: Statutory Compliance */}
        {subTab === 'compliance' && (
          <motion.div
            key="compliance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Statutory Regulatory Compliance</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Verify tax rates, PF declarations, and insurance audits</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
              <div style={{ padding: 18, border: '1px solid var(--color-border)', borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>TDS Flat Rate (%)</span>
                <input 
                  type="number" 
                  step="0.01" 
                  value={tdsPercent} 
                  onChange={(e) => setTdsPercent(parseFloat(e.target.value) || 0)} 
                  className="premium-input" 
                />
              </div>
              <div style={{ padding: 18, border: '1px solid var(--color-border)', borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>PF Contribution (%)</span>
                <input 
                  type="number" 
                  step="0.01" 
                  value={pfPercent} 
                  onChange={(e) => setPfPercent(parseFloat(e.target.value) || 0)} 
                  className="premium-input" 
                />
              </div>
              <div style={{ padding: 18, border: '1px solid var(--color-border)', borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>ESI Medical (%)</span>
                <input 
                  type="number" 
                  step="0.01" 
                  value={esiPercent} 
                  onChange={(e) => setEsiPercent(parseFloat(e.target.value) || 0)} 
                  className="premium-input" 
                />
              </div>
              <div style={{ padding: 18, border: '1px solid var(--color-border)', borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="premium-label" style={{ fontSize: '0.65rem' }}>Professional Tax (Flat PT)</span>
                <input 
                  type="number" 
                  value={profTax} 
                  onChange={(e) => setProfTax(Number(e.target.value) || 0)} 
                  className="premium-input" 
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button onClick={handleSavePayrollSettings} className="premium-btn premium-btn-success">
                Update Statutory Compliance
              </button>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 6: Reimbursements */}
        {subTab === 'reimbursements' && (
          <motion.div
            key="reimbursements"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Reimbursements Gateway</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: 4 }}>
                  Approved employee expense claims automatically queue directly into the current payroll run as tax-free reimbursements.
                </p>
              </div>
              <button 
                onClick={() => {
                  setNewExpEmpId(employees[0]?.id || '');
                  setShowAddExpenseModal(true);
                }} 
                className="premium-btn premium-btn-primary"
              >
                <Plus size={16} />
                <span>Add Claim</span>
              </button>
            </div>

            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Claim ID</th>
                    <th>Employee Name</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.filter(e => e.status === 'Approved').map(exp => (
                    <tr key={exp.id}>
                      <td style={{ fontWeight: 700 }}>#{exp.id}</td>
                      <td>{exp.employeeName}</td>
                      <td>{exp.category}</td>
                      <td>{exp.description}</td>
                      <td className="number-font" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{cSymbol}{exp.amount}</td>
                      <td>
                        <span className="badge badge-success">Approved</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="premium-btn premium-btn-secondary"
                          style={{ padding: '0 8px', height: '26px', fontSize: '0.75rem', borderColor: '#ef4444', color: '#ef4444', justifyContent: 'center' }}
                        >
                          Decline
                        </button>
                      </td>
                    </tr>
                  ))}
                  {expenses.filter(e => e.status === 'Approved').length === 0 && (
                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>No approved reimbursement claims queued.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 7: F&F Settlement */}
        {subTab === 'ff' && (
          <motion.div
            key="ff"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {/* Real-time F&F Settlement Dashboard Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              <div className="premium-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ padding: 12, borderRadius: 12, background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                  <Users size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Offboarded Employees</span>
                  <h4 className="number-font" style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 0 0' }}>
                    {payrollHistory.filter(s => s.type === 'F&F').length}
                  </h4>
                </div>
              </div>

              <div className="premium-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ padding: 12, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  <CheckCircle size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Settled F&F Records</span>
                  <h4 className="number-font" style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 0 0' }}>
                    {payrollHistory.filter(s => s.type === 'F&F' && s.status === 'Processed').length} Active
                  </h4>
                </div>
              </div>

              <div className="premium-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ padding: 12, borderRadius: 12, background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                  <AlertCircle size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Pending Clearances</span>
                  <h4 className="number-font" style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 0 0' }}>
                    0 Pending
                  </h4>
                </div>
              </div>

              <div className="premium-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ padding: 12, borderRadius: 12, background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                  <Landmark size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Total Settlement Volume</span>
                  <h4 className="number-font" style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 0 0' }}>
                    {cSymbol}{payrollHistory.filter(s => s.type === 'F&F').reduce((acc, s) => acc + Number(s.netSalary || 0), 0).toLocaleString()}
                  </h4>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
              <div className="premium-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Landmark size={18} style={{ color: 'var(--color-primary)' }} />
                  <span>Full & Final (F&F) Settlement</span>
                </h3>

                <form onSubmit={handleProcessFF} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="premium-form-group">
                    <label className="premium-label">Resigning Employee</label>
                    <select 
                      value={ffEmpId} 
                      onChange={(e) => setFfEmpId(e.target.value)}
                      className="premium-input"
                    >
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                      ))}
                    </select>
                  </div>

                  <div className="premium-form-group">
                    <label className="premium-label">Resignation/Relieving Date</label>
                    <input 
                      type="date" 
                      required 
                      value={resignationDate} 
                      onChange={(e) => setResignationDate(e.target.value)}
                      className="premium-input" 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="premium-form-group">
                      <label className="premium-label">Unpaid Salary Days</label>
                      <input 
                        type="number" 
                        value={unpaidDays} 
                        onChange={(e) => setUnpaidDays(Number(e.target.value) || 0)}
                        className="premium-input" 
                      />
                    </div>
                    <div className="premium-form-group">
                      <label className="premium-label">Encashable Leave Days</label>
                      <input 
                        type="number" 
                        value={leaveEncashmentDays} 
                        onChange={(e) => setLeaveEncashmentDays(Number(e.target.value) || 0)}
                        className="premium-input" 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="premium-form-group">
                      <label className="premium-label">Gratuity Amount ({currency})</label>
                      <input 
                        type="number" 
                        value={gratuityAmount} 
                        onChange={(e) => setGratuityAmount(Number(e.target.value) || 0)}
                        className="premium-input" 
                      />
                    </div>
                    <div className="premium-form-group">
                      <label className="premium-label">Notice Period Buyout ({currency})</label>
                      <input 
                        type="number" 
                        value={noticePeriodAllowance} 
                        onChange={(e) => setNoticePeriodAllowance(Number(e.target.value) || 0)}
                        className="premium-input" 
                      />
                    </div>
                  </div>

                  <div className="premium-form-group">
                    <label className="premium-label">Other Deductions / Dues ({currency})</label>
                    <input 
                      type="number" 
                      value={ffOtherDeductions} 
                      onChange={(e) => setFfOtherDeductions(Number(e.target.value) || 0)}
                      className="premium-input" 
                    />
                  </div>

                  <button type="submit" className="premium-btn premium-btn-success" style={{ width: '100%', height: 42, justifyContent: 'center' }}>
                    Disburse F&F Settlement
                  </button>
                </form>
              </div>

              {/* F&F Summary Preview */}
              <div className="premium-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>F&F Settlement Statement</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderBottom: '1px solid var(--color-border)', paddingBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Unpaid Working Salary ({unpaidDays} Days):</span>
                    <span className="number-font" style={{ fontWeight: 600 }}>{cSymbol}{unpaidSalaryAmount.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Leave Encashment ({leaveEncashmentDays} Days):</span>
                    <span className="number-font" style={{ fontWeight: 600 }}>{cSymbol}{leaveEncashmentAmount.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Gratuity Benefit:</span>
                    <span className="number-font" style={{ fontWeight: 600 }}>{cSymbol}{Number(gratuityAmount).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Notice Period Buyout:</span>
                    <span className="number-font" style={{ fontWeight: 600 }}>{cSymbol}{Number(noticePeriodAllowance).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#ef4444' }}>
                    <span>Dues & Deductions:</span>
                    <strong className="number-font">-{cSymbol}{Number(ffOtherDeductions).toLocaleString()}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16 }}>
                  <div>
                    <span style={{ fontSize: '0.65rem' }} className="premium-label">Net Settlement Amount</span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Includes taxes and standard benefits</p>
                  </div>
                  <h4 className="number-font" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                    {cSymbol}{ffNetPayable.toLocaleString()}
                  </h4>
                </div>
              </div>
            </div>

            {/* Past F&F Settlements Table */}
            <div className="premium-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16 }}>Processed F&F Settlement Records</h3>
              <div className="premium-table-container">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Settlement ID</th>
                      <th>Resigning Employee</th>
                      <th>Unpaid Dues</th>
                      <th>Leave Encashment</th>
                      <th>Gratuity</th>
                      <th>Net Paid</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollHistory.filter(s => s.type === 'F&F').map(slip => (
                      <tr key={slip.id}>
                        <td style={{ fontWeight: 700 }}>#{slip.id}</td>
                        <td>{slip.employeeName}</td>
                        <td className="number-font">{cSymbol}{slip.basic?.toLocaleString()}</td>
                        <td className="number-font">{cSymbol}{slip.leaveEncashment?.toLocaleString()}</td>
                        <td className="number-font">{cSymbol}{slip.allowances?.toLocaleString()}</td>
                        <td className="number-font" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{cSymbol}{slip.netSalary?.toLocaleString()}</td>
                        <td><span className="badge badge-success">Settled</span></td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => handleOpenEditSlip(slip)}
                              className="premium-btn premium-btn-primary"
                              style={{ padding: '0 8px', height: '26px', fontSize: '0.75rem', justifyContent: 'center' }}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteSlip(slip.id)}
                              className="premium-btn premium-btn-secondary"
                              style={{ padding: '0 8px', height: '26px', fontSize: '0.75rem', borderColor: '#ef4444', color: '#ef4444', justifyContent: 'center' }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {payrollHistory.filter(s => s.type === 'F&F').length === 0 && (
                      <tr><td colSpan="8" style={{ textAlign: 'center' }}>No historical F&F settlements processed.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* SUB-VIEW 8: Reports */}
        {subTab === 'reports' && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card"
            style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20 }}
          >
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={28} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8 }}>Export Payroll Sheets & Statutory Forms</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-tertiary)', maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
                Download Form 16 Tax Statement certificate or compile compliance excel return reports for the selected employee.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleDownloadAnnualReports} className="premium-btn premium-btn-primary" style={{ padding: '12px 24px' }}>
                <FileText size={16} />
                <span>Download Form 16</span>
              </button>
              
              <button 
                onClick={() => {
                  let csv = "ID,Employee Name,Month/Year,Base Pay,HRA,Allowances,Deductions,Overtime Pay,Reimbursements,Professional Tax,Net Paid,Type,Status\n";
                  payrollHistory.forEach(slip => {
                    csv += `"${slip.id}","${slip.employeeName}","${slip.month} ${slip.year}","${slip.basic}","${slip.hra}","${slip.allowances}","${slip.deductions}","${slip.overtime || 0}","${slip.reimbursements || 0}","${slip.profTax || 0}","${slip.netSalary}","${slip.type || 'Regular'}","${slip.status}"\n`;
                  });
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.setAttribute("href", url);
                  link.setAttribute("download", `HRMS_Payroll_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  alert("Payroll ledger export downloaded successfully!");
                }} 
                className="premium-btn premium-btn-secondary" 
                style={{ padding: '12px 24px' }}
              >
                <span>Export Compliance Excel</span>
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Edit Payroll Modal */}
      {editingSlip && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }} onClick={() => setEditingSlip(null)}>
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              padding: 24,
              borderRadius: 20,
              width: '100%',
              maxWidth: 420,
              position: 'relative',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Edit Processed Payroll</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: 4 }}>
                Modify earnings and deductions for #{editingSlip.id} ({editingSlip.employeeName})
              </p>
            </div>

            <form onSubmit={handleSaveEditSlip} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="premium-form-group">
                <label className="premium-label">Basic Salary</label>
                <input 
                  type="number" 
                  value={editBasic} 
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    setEditBasic(val);
                    setEditNetSalary(val + editHra + editAllowances - editDeductions);
                  }} 
                  className="premium-input" 
                />
              </div>

              <div className="premium-form-group">
                <label className="premium-label">HRA Allowance</label>
                <input 
                  type="number" 
                  value={editHra} 
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    setEditHra(val);
                    setEditNetSalary(editBasic + val + editAllowances - editDeductions);
                  }} 
                  className="premium-input" 
                />
              </div>

              <div className="premium-form-group">
                <label className="premium-label">Other Allowances & Bonus</label>
                <input 
                  type="number" 
                  value={editAllowances} 
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    setEditAllowances(val);
                    setEditNetSalary(editBasic + editHra + val - editDeductions);
                  }} 
                  className="premium-input" 
                />
              </div>

              <div className="premium-form-group">
                <label className="premium-label">Total Deductions (PF/ESI/Tax/PT)</label>
                <input 
                  type="number" 
                  value={editDeductions} 
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    setEditDeductions(val);
                    setEditNetSalary(editBasic + editHra + editAllowances - val);
                  }} 
                  className="premium-input" 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-secondary)', padding: '10px 14px', borderRadius: 10 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Adjusted Net Salary:</span>
                <strong className="number-font" style={{ color: 'var(--color-primary)' }}>{cSymbol}{editNetSalary.toLocaleString()}</strong>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button 
                  type="button" 
                  onClick={() => setEditingSlip(null)} 
                  className="premium-btn premium-btn-secondary" 
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="premium-btn premium-btn-success" 
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Custom Component Modal */}
      {showAddCompModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }} onClick={() => setShowAddCompModal(false)}>
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              padding: 24,
              borderRadius: 20,
              width: '100%',
              maxWidth: 420,
              position: 'relative',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Add Custom Salary Component</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: 4 }}>
                Create custom earning allowance or deduction component mapping.
              </p>
            </div>

            <form onSubmit={handleAddSalaryComponent} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="premium-form-group">
                <label className="premium-label">Component Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Conveyance Allowance"
                  value={newCompName} 
                  onChange={(e) => setNewCompName(e.target.value)} 
                  className="premium-input" 
                />
              </div>

              <div className="premium-form-group">
                <label className="premium-label">Type</label>
                <select 
                  value={newCompType} 
                  onChange={(e) => setNewCompType(e.target.value)} 
                  className="premium-input"
                >
                  <option value="Earning">Earning (Allowance)</option>
                  <option value="Deduction">Deduction (Withholding)</option>
                </select>
              </div>

              <div className="premium-form-group">
                <label className="premium-label">Calculation Type</label>
                <select 
                  value={newCompCalcType} 
                  onChange={(e) => setNewCompCalcType(e.target.value)} 
                  className="premium-input"
                >
                  <option value="Percentage">Percentage of Basic Pay</option>
                  <option value="Flat">Flat Amount</option>
                </select>
              </div>

              <div className="premium-form-group">
                <label className="premium-label">Value ({newCompCalcType === 'Percentage' ? '%' : currency})</label>
                <input 
                  type="number" 
                  required
                  min="0.01"
                  step="any"
                  value={newCompValue} 
                  onChange={(e) => setNewCompValue(parseFloat(e.target.value) || 0)} 
                  className="premium-input" 
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddCompModal(false)} 
                  className="premium-btn premium-btn-secondary" 
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="premium-btn premium-btn-primary" 
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Create Component
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Custom Expense (Reimbursement Claim) Modal */}
      {showAddExpenseModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }} onClick={() => setShowAddExpenseModal(false)}>
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              padding: 24,
              borderRadius: 20,
              width: '100%',
              maxWidth: 420,
              position: 'relative',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Add Reimbursement Claim</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: 4 }}>
                Log an approved expense claim to be refunded in the next payroll cycle.
              </p>
            </div>

            <form onSubmit={handleAddReimbursement} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="premium-form-group">
                <label className="premium-label">Select Employee</label>
                <select 
                  value={newExpEmpId} 
                  onChange={(e) => setNewExpEmpId(e.target.value)} 
                  className="premium-input"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div className="premium-form-group">
                <label className="premium-label">Category</label>
                <select 
                  value={newExpCategory} 
                  onChange={(e) => setNewExpCategory(e.target.value)} 
                  className="premium-input"
                >
                  <option value="Travel">Travel & Lodging</option>
                  <option value="Meals">Meals & Entertainment</option>
                  <option value="Software">Software & Subscriptions</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Other">Other Expenses</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="premium-form-group">
                  <label className="premium-label">Date</label>
                  <input 
                    type="date" 
                    required
                    value={newExpDate} 
                    onChange={(e) => setNewExpDate(e.target.value)} 
                    className="premium-input" 
                  />
                </div>
                <div className="premium-form-group">
                  <label className="premium-label">Amount ({currency})</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={newExpAmount} 
                    onChange={(e) => setNewExpAmount(parseFloat(e.target.value) || 0)} 
                    className="premium-input" 
                  />
                </div>
              </div>

              <div className="premium-form-group">
                <label className="premium-label">Reason / Notes</label>
                <textarea 
                  required
                  placeholder="e.g. Client lunch meeting"
                  value={newExpReason} 
                  onChange={(e) => setNewExpReason(e.target.value)} 
                  className="premium-input" 
                  style={{ height: 60, resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddExpenseModal(false)} 
                  className="premium-btn premium-btn-secondary" 
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="premium-btn premium-btn-primary" 
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Add Claim
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Manual Payslip Modal */}
      {showAddPayslipModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }} onClick={() => setShowAddPayslipModal(false)}>
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              padding: 24,
              borderRadius: 20,
              width: '100%',
              maxWidth: 440,
              position: 'relative',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Add Historical Payslip Record</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: 4 }}>
                Manually record a processed payout in the company's ledger database.
              </p>
            </div>

            <form onSubmit={handleAddManualPayslip} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="premium-form-group">
                <label className="premium-label">Select Employee</label>
                <select 
                  value={newSlipEmpId} 
                  onChange={(e) => setNewSlipEmpId(e.target.value)} 
                  className="premium-input"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="premium-form-group">
                  <label className="premium-label">Month</label>
                  <select 
                    value={newSlipMonth} 
                    onChange={(e) => setNewSlipMonth(e.target.value)} 
                    className="premium-input"
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'Settlement'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="premium-form-group">
                  <label className="premium-label">Year</label>
                  <input 
                    type="number" 
                    value={newSlipYear} 
                    onChange={(e) => setNewSlipYear(Number(e.target.value) || 2026)} 
                    className="premium-input" 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="premium-form-group">
                  <label className="premium-label">Basic Salary ({currency})</label>
                  <input 
                    type="number" 
                    value={newSlipBasic} 
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setNewSlipBasic(val);
                      setNewSlipNet(val + newSlipHra + newSlipAllowances - newSlipDeductions);
                    }} 
                    className="premium-input" 
                  />
                </div>
                <div className="premium-form-group">
                  <label className="premium-label">HRA Allowance ({currency})</label>
                  <input 
                    type="number" 
                    value={newSlipHra} 
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setNewSlipHra(val);
                      setNewSlipNet(newSlipBasic + val + newSlipAllowances - newSlipDeductions);
                    }} 
                    className="premium-input" 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="premium-form-group">
                  <label className="premium-label">Bonus & Allowances ({currency})</label>
                  <input 
                    type="number" 
                    value={newSlipAllowances} 
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setNewSlipAllowances(val);
                      setNewSlipNet(newSlipBasic + newSlipHra + val - newSlipDeductions);
                    }} 
                    className="premium-input" 
                  />
                </div>
                <div className="premium-form-group">
                  <label className="premium-label">Total Deductions ({currency})</label>
                  <input 
                    type="number" 
                    value={newSlipDeductions} 
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setNewSlipDeductions(val);
                      setNewSlipNet(newSlipBasic + newSlipHra + newSlipAllowances - val);
                    }} 
                    className="premium-input" 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="premium-form-group">
                  <label className="premium-label">Record Type</label>
                  <select 
                    value={newSlipType} 
                    onChange={(e) => setNewSlipType(e.target.value)} 
                    className="premium-input"
                  >
                    <option value="Regular">Regular Payroll</option>
                    <option value="F&F">F&F Settlement</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--color-bg-secondary)', padding: '6px 12px', borderRadius: 10 }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>Net Salary Dues:</span>
                  <strong className="number-font" style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>{cSymbol}{newSlipNet.toLocaleString()}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddPayslipModal(false)} 
                  className="premium-btn premium-btn-secondary" 
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="premium-btn premium-btn-primary" 
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Add Record
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
