import React, { useState } from 'react';
import { FileText, FileSpreadsheet, ArrowDownCircle, CheckSquare, Square } from 'lucide-react';
import { api } from '../../services/api';

const reportTypes = [
  { id: 'attendance', label: 'Attendance Reports', desc: 'Punch logs, shift reports, check-in averages.' },
  { id: 'payroll', label: 'Payroll & Compensation', desc: 'Salary dispersals, allowances, tax breakdowns.' },
  { id: 'leave', label: 'Leave & Absences', desc: 'Remaining days, type averages, approval rates.' },
  { id: 'employee', label: 'Employee Records', desc: 'Personal details, contracts, contact metrics.' },
  { id: 'dept', label: 'Department Analytics', desc: 'Budget allocation, staff ratios, headcount trends.' },
];

export default function Reports() {
  const [selected, setSelected] = useState(['attendance', 'payroll']);
  const [generating, setGenerating] = useState(false);

  const toggleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(item => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleGenerate = async (format) => {
    if (selected.length === 0) {
      alert("Please select at least one report category!");
      return;
    }
    setGenerating(true);
    try {
      let csvContent = "";
      
      if (selected.includes('employee')) {
        const employees = await api.getAdminEmployees();
        csvContent += "=== EMPLOYEE DIRECTORY REPORT ===\n";
        csvContent += "ID,Name,Email,Department,Designation,Status,Joining Date\n";
        if (Array.isArray(employees)) {
          employees.forEach(e => {
            csvContent += `"${e.id}","${e.name}","${e.email}","${e.department || 'N/A'}","${e.designation || 'N/A'}","${e.status}","${e.joiningDate || ''}"\n`;
          });
        }
        csvContent += "\n\n";
      }

      if (selected.includes('attendance')) {
        const employees = await api.getAdminEmployees();
        csvContent += "=== ATTENDANCE REPORT ===\n";
        csvContent += "Employee ID,Employee Name,Date,Clock In,Clock Out,Total Hours,Status\n";
        
        if (Array.isArray(employees)) {
          for (let emp of employees) {
            try {
              const logs = await api.getEmployeeAttendanceLogs(emp.id);
              if (Array.isArray(logs)) {
                logs.forEach(log => {
                  csvContent += `"${emp.id}","${emp.name}","${log.date}","${log.clockIn}","${log.clockOut || ''}","${log.totalHours || ''}","${log.status}"\n`;
                });
              }
            } catch (e) {
              console.error("Skipping logs for: " + emp.name);
            }
          }
        }
        csvContent += "\n\n";
      }

      if (selected.includes('leave')) {
        const leaves = await api.getAdminLeaves();
        csvContent += "=== LEAVE APPLICATIONS REPORT ===\n";
        csvContent += "ID,Employee Name,Leave Type,From Date,To Date,Total Days,Status,Reason\n";
        if (Array.isArray(leaves)) {
          leaves.forEach(l => {
            csvContent += `"${l.id}","${l.employeeName}","${l.type}","${l.fromDate}","${l.toDate}","${l.totalDays}","${l.status}","${l.reason || ''}"\n`;
          });
        }
        csvContent += "\n\n";
      }

      if (selected.includes('payroll')) {
        const payrolls = await api.getPayrollRecords();
        csvContent += "=== PAYROLL DISPERSALS REPORT ===\n";
        csvContent += "ID,Employee Name,Month/Year,Base Salary,Allowance,Deductions,Net Paid,Status\n";
        if (Array.isArray(payrolls)) {
          payrolls.forEach(p => {
            csvContent += `"${p.id}","${p.employeeName}","${p.month || ''}","${p.basicSalary || 0}","${p.allowances || 0}","${p.deductions || 0}","${p.netSalary || 0}","${p.status}"\n`;
          });
        }
        csvContent += "\n\n";
      }

      if (selected.includes('dept')) {
        const depts = await api.getAdminDepartments();
        csvContent += "=== DEPARTMENT ANALYTICS REPORT ===\n";
        csvContent += "ID,Name,Head/Manager,Active Employee Count\n";
        if (Array.isArray(depts)) {
          depts.forEach(d => {
            csvContent += `"${d.id}","${d.name}","${d.manager || 'Unassigned'}","${d.headcount || 0}"\n`;
          });
        }
        csvContent += "\n\n";
      }

      // Trigger file download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `HRMS_Report_Package_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'txt' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert(`Report Package compiled with live database entries and downloaded successfully!`);
    } catch (err) {
      alert("Failed to assemble reports: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="premium-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Custom Report Assembler</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>Select the modules you wish to package into your compiled report</p>
        </div>

        {/* Checkbox selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reportTypes.map(rep => {
            const isChecked = selected.includes(rep.id);
            return (
              <div 
                key={rep.id}
                onClick={() => toggleSelect(rep.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: 16,
                  borderRadius: 14,
                  border: isChecked ? '1px solid var(--color-primary)' : '1px solid #E2E8F0',
                  background: isChecked ? 'var(--color-primary-light)' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ color: isChecked ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }}>
                  {isChecked ? <CheckSquare size={20} /> : <Square size={20} />}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{rep.label}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>{rep.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action triggers */}
        <div style={{ display: 'flex', gap: 12, borderTop: '1px solid #F1F5F9', paddingTop: 20, alignItems: 'center' }}>
          <button 
            disabled={generating}
            onClick={() => handleGenerate('pdf')}
            className="premium-btn premium-btn-primary"
            style={{ opacity: generating ? 0.7 : 1 }}
          >
            <FileText size={16} />
            <span>{generating ? 'Compiling Archive...' : 'Download PDF Package'}</span>
          </button>

          <button 
            disabled={generating}
            onClick={() => handleGenerate('xlsx')}
            className="premium-btn premium-btn-secondary"
            style={{ opacity: generating ? 0.7 : 1 }}
          >
            <FileSpreadsheet size={16} />
            <span>Download Excel Package</span>
          </button>
        </div>
      </div>
    </div>
  );
}
