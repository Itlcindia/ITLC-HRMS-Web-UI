import { getLiveSuperOwnerTaxConfig } from '../types/multiTenant';

function numberToIndianWords(num: number): string {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(Math.abs(num));
  if (n === 0) return 'Zero Rupees Only';

  function inWords(nStr: string): string {
    const num = parseInt(nStr, 10);
    if (num === 0) return '';
    if (num < 20) return a[num];
    const tens = b[Math.floor(num / 10)];
    const units = num % 10 !== 0 ? ' ' + a[num % 10] : '';
    return tens + units;
  }

  let str = ('000000000' + n).substr(-9);
  const crore = parseInt(str.substr(0, 2), 10);
  const lakh = parseInt(str.substr(2, 2), 10);
  const thousand = parseInt(str.substr(4, 2), 10);
  const hundred = parseInt(str.substr(6, 1), 10);
  const rest = parseInt(str.substr(7, 2), 10);

  let out = '';
  if (crore > 0) out += inWords(crore.toString()) + ' Crore ';
  if (lakh > 0) out += inWords(lakh.toString()) + ' Lakh ';
  if (thousand > 0) out += inWords(thousand.toString()) + ' Thousand ';
  if (hundred > 0) out += a[hundred] + ' Hundred ';
  if (rest > 0) out += inWords(rest.toString());

  return out.trim() + ' Indian Rupees Only';
}

export const downloadPaymentSlip = (paymentDetails: any, companyDetails: any) => {
  const rawAmount = Number(paymentDetails.amount) || 0;
  const currency = (paymentDetails.currency || 'INR').toUpperCase();
  const currencySymbol = currency === 'USD' ? '$' : '₹';
  const formattedAmount = `${currencySymbol}${rawAmount.toLocaleString('en-IN')}.00`;
  const amountWords = currency === 'INR' ? numberToIndianWords(rawAmount) : `${rawAmount} ${currency} Only`;

  const rawDate = paymentDetails.date || paymentDetails.timestamp || new Date().toISOString();
  const formattedDate = new Date(rawDate).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
  });

  const companyName = companyDetails?.name || paymentDetails.companyName || 'Registered Enterprise Client';
  const companyId = companyDetails?.id || paymentDetails.companyId || 'comp_876291';
  const adminName = companyDetails?.adminName || 'Company Administrator';
  const adminEmail = companyDetails?.email || companyDetails?.adminEmail || paymentDetails.adminEmail || 'admin@workspace.com';
  const adminPhone = companyDetails?.phone || companyDetails?.adminPhone || '+91 98765 43210';
  const companyGstin = companyDetails?.gstin || '07AABCT1234F1Z8';

  let rawPlanName = paymentDetails.planName || paymentDetails.planId || 'Demo Trial';
  if (rawPlanName.includes('demo') && !rawPlanName.toLowerCase().includes('plan')) rawPlanName += ' Plan';
  const planTitle = rawPlanName.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());

  const gatewayName = (paymentDetails.gateway || 'Razorpay').replace(/_/g, ' ').toUpperCase();
  const paymentId = paymentDetails.id || paymentDetails.paymentId || ('pay_' + Math.random().toString(36).substring(2, 11));
  const orderId = paymentDetails.orderId || ('order_' + Math.random().toString(36).substring(2, 11));

  const taxConfig = getLiveSuperOwnerTaxConfig();

  const platformBrand = taxConfig.platformBrand || 'ITLC ENTERPRISE HRMS';
  const platformLegalName = taxConfig.registeredLegalName || 'ITLC Software Technologies Pvt Ltd';
  const platformGstin = taxConfig.gstin || '07AABCI8899K1Z4';
  const platformPan = taxConfig.panNumber || 'AABCI8899K';
  const platformSac = taxConfig.hsnSacCode || '998313 (Cloud IT & SaaS Hosting Services)';
  const platformAddress = taxConfig.registeredAddress || 'Cyber City Phase 2, DLF Tech Park, Gurugram, India';
  const signatoryName = taxConfig.signatoryName || 'Priya Sharma';
  const signatoryTitle = taxConfig.signatoryTitle || 'Authorized Signatory';
  const placeOfSupply = taxConfig.placeOfSupply || '07 - Delhi / NCR (Intra-State)';
  const invoiceTerms = taxConfig.invoiceTerms || 'This invoice is issued electronically under Rule 48 of the CGST Rules, 2017. Digital verification requires no physical stamp. Valid for Input Tax Credit (ITC).';
  const invoicePrefix = taxConfig.taxInvoicePrefix || 'INV-2026';
  const signatureImageUrl = taxConfig.signatureImageUrl || '';

  const invoiceNumber = paymentDetails.invoiceNumber || (`${invoicePrefix}-${Math.floor(1000 + Math.random() * 9000)}`);

  // Tax calculations
  const taxRate = taxConfig.enabled ? (Number(taxConfig.ratePercent) || 0) : 0;
  let baseAmount = rawAmount;
  let gstTotal = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (taxRate > 0) {
    baseAmount = Math.round((rawAmount / (1 + taxRate / 100)) * 100) / 100;
    gstTotal = Math.round((rawAmount - baseAmount) * 100) / 100;
    if (taxConfig.enableStateSplit) {
      cgstAmount = Math.round((gstTotal / 2) * 100) / 100;
      sgstAmount = Math.round((gstTotal - cgstAmount) * 100) / 100;
    } else {
      igstAmount = gstTotal;
    }
  }

  const formattedBaseAmount = `${currencySymbol}${baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formattedCgst = `${currencySymbol}${cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formattedSgst = `${currencySymbol}${sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formattedIgst = `${currencySymbol}${igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Visibility toggles
  const showGstin = taxConfig.showGstin !== false;
  const showPan = taxConfig.showPan !== false;
  const showSac = taxConfig.showSac !== false;
  const showAddress = taxConfig.showAddress !== false;
  const showQrCode = taxConfig.showQrCode !== false;
  const showSignatory = taxConfig.showSignatory !== false;
  const showAmountInWords = taxConfig.showAmountInWords !== false;
  const showTerms = taxConfig.showTerms !== false;
  const showFeatures = taxConfig.showFeatures !== false;

  const invoiceHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Tax Invoice - ${invoiceNumber}</title>
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 30px;
          background: #f8fafc;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .invoice-card {
          max-width: 850px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
          border: 1px solid #e2e8f0;
          padding: 40px;
        }
        @media print {
          body { background: #fff !important; padding: 0 !important; }
          .invoice-card { box-shadow: none !important; border: 1px solid #cbd5e1 !important; border-radius: 0 !important; max-width: 100% !important; padding: 30px !important; }
        }
        .top-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 20px;
          margin-bottom: 24px;
        }
        .brand-box { display: flex; align-items: center; gap: 12px; }
        .logo-icon {
          width: 44px;
          height: 44px;
          background: #4f46e5;
          color: #fff;
          font-weight: 900;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
        }
        .brand-name { font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -0.5px; }
        .brand-sub { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin: 2px 0 0 0; letter-spacing: 0.5px; }
        .seller-meta { font-size: 12px; color: #475569; margin-top: 12px; line-height: 1.5; }
        .seller-meta strong { color: #1e293b; }
        .inv-title-box { text-align: right; }
        .paid-badge {
          display: inline-block;
          background: #dcfce7;
          color: #166534;
          border: 1px solid #86efac;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          padding: 4px 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .inv-title { font-size: 20px; font-weight: 900; color: #0f172a; margin: 0; }
        .inv-meta-text { font-size: 12px; color: #64748b; margin: 4px 0 0 0; }
        .inv-meta-text strong { color: #0f172a; }
        
        .grid-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 18px;
          margin-bottom: 24px;
          font-size: 12px;
        }
        .section-label { font-size: 10px; text-transform: uppercase; font-weight: 800; color: #94a3b8; letter-spacing: 0.5px; margin: 0 0 6px 0; }
        .client-name { font-size: 15px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; }
        .client-p { margin: 2px 0; color: #475569; }
        .client-p strong { color: #1e293b; }
        .audit-col { text-align: right; }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
          font-size: 12px;
        }
        .items-table th {
          background: #0f172a;
          color: #ffffff;
          text-align: left;
          padding: 12px 14px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }
        .items-table th:first-child { border-radius: 8px 0 0 0; }
        .items-table th:last-child { border-radius: 0 8px 0 0; }
        .items-table td {
          padding: 14px;
          border-bottom: 1px solid #e2e8f0;
          color: #1e293b;
          vertical-align: top;
        }
        .plan-heading { font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 2px 0; }
        .plan-subtext { font-size: 11px; color: #64748b; margin: 0; }
        .feature-tags { display: flex; gap: 6px; margin-top: 6px; }
        .feature-tag { font-size: 10px; font-weight: 700; background: #eef2ff; color: #4338ca; padding: 2px 8px; border-radius: 4px; }

        .calc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 28px;
          align-items: flex-start;
          font-size: 12px;
        }
        .words-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px;
          margin-bottom: 8px;
        }
        .words-card .amount-words { font-size: 13px; font-weight: 800; font-style: italic; color: #0f172a; margin-top: 4px; }
        .terms-note { font-size: 11px; color: #64748b; line-height: 1.5; margin: 0; }

        .totals-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
        }
        .total-line { display: flex; justify-content: space-between; padding: 4px 0; color: #475569; }
        .total-line strong { color: #0f172a; font-family: monospace, sans-serif; }
        .grand-line {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          border-top: 2px solid #0f172a;
          padding-top: 10px;
          margin-top: 8px;
        }
        .grand-total-amount { font-size: 24px; font-weight: 900; color: #4338ca; font-family: monospace, sans-serif; }

        .footer-sign-row {
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-size: 12px;
          color: #475569;
        }
        .qr-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .qr-square {
          width: 54px;
          height: 54px;
          background: #0f172a;
          color: #fff;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }
        .qr-square svg { width: 100%; height: 100%; fill: currentColor; }
        .sign-box { text-align: right; }
        .sign-signature {
          font-family: Georgia, serif;
          font-style: italic;
          font-weight: 800;
          font-size: 16px;
          color: #1e1b4b;
          border-bottom: 1px solid #cbd5e1;
          display: inline-block;
          padding: 0 10px 4px 10px;
          margin-bottom: 4px;
        }
      </style>
    </head>
    <body>
      <div class="invoice-card">
        
        <!-- Header -->
        <div class="top-row">
          <div>
            <div class="brand-box">
              <div class="logo-icon">IT</div>
              <div>
                <h1 class="brand-name">${platformBrand}</h1>
                <p class="brand-sub">Cloud SaaS & Workforce Operating Platform</p>
              </div>
            </div>
            <div class="seller-meta">
              <div><strong>Platform Super Owner:</strong> ${platformLegalName}</div>
              ${showGstin ? `<div><strong>GSTIN:</strong> ${platformGstin} ${showPan ? `• <strong>PAN:</strong> ${platformPan}` : ''}</div>` : (showPan ? `<div><strong>PAN:</strong> ${platformPan}</div>` : '')}
              ${showSac ? `<div><strong>HSN / SAC Code:</strong> ${platformSac}</div>` : ''}
              ${showAddress ? `<div>Regd Office: ${platformAddress}</div>` : ''}
            </div>
          </div>

          <div class="inv-title-box">
            <div class="paid-badge">✓ 100% PAID & SETTLED</div>
            <h2 class="inv-title">TAX INVOICE</h2>
            <p class="inv-meta-text">Invoice No: <strong>${invoiceNumber}</strong></p>
            <p class="inv-meta-text">Date: <strong>${formattedDate}</strong></p>
            <p class="inv-meta-text">Place of Supply: <strong>${placeOfSupply}</strong></p>
          </div>
        </div>

        <!-- Parties & Audit Grid -->
        <div class="grid-split">
          <div>
            <p class="section-label">BILLED TO (CUSTOMER / TENANT)</p>
            <p class="client-name">${companyName}</p>
            <p class="client-p"><strong>Company ID:</strong> ${companyId}</p>
            <p class="client-p"><strong>Admin:</strong> ${adminName} (${adminEmail})</p>
            <p class="client-p"><strong>Phone:</strong> ${adminPhone}</p>
            ${showGstin ? `<p class="client-p"><strong>GSTIN:</strong> ${companyGstin}</p>` : ''}
          </div>

          <div class="audit-col">
            <p class="section-label">PAYMENT & GATEWAY AUDIT</p>
            <p class="client-p"><strong>Gateway:</strong> <span style="font-weight: 700; color: #4338ca;">${gatewayName}</span></p>
            <p class="client-p"><strong>Payment ID:</strong> <span style="font-family: monospace;">${paymentId}</span></p>
            <p class="client-p"><strong>Order / UTR:</strong> <span style="font-family: monospace;">${orderId}</span></p>
            <p class="client-p"><strong>Billing Cycle:</strong> <span style="font-weight: 700; color: #15803d;">Monthly Recurring (Active 30 Days)</span></p>
          </div>
        </div>

        <!-- Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th>Service & Description</th>
              <th style="width: 80px;">SAC</th>
              <th style="width: 90px; text-align: center;">Qty / Period</th>
              <th style="width: 130px; text-align: right;">Taxable Value</th>
              <th style="width: 130px; text-align: right;">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-weight: 800; color: #94a3b8; font-family: monospace;">01</td>
              <td>
                <p class="plan-heading">${planTitle} Subscription</p>
                <p class="plan-subtext">Enterprise Cloud HRMS, Multi-tenant CRM & Employee Self-Service Workspace</p>
                ${showFeatures ? `
                <div class="feature-tags">
                  <span class="feature-tag">100 Seats Active</span>
                  <span class="feature-tag">25 GB Cloud Storage</span>
                  <span class="feature-tag">Priority Support</span>
                </div>
                ` : ''}
              </td>
              <td style="font-family: monospace; color: #475569;">${platformSac ? platformSac.split(' ')[0] : '998313'}</td>
              <td style="text-align: center; font-weight: 600;">1 Month</td>
              <td style="text-align: right; font-family: monospace; font-weight: 700;">${formattedBaseAmount}</td>
              <td style="text-align: right; font-family: monospace; font-weight: 900; color: #0f172a;">${formattedAmount}</td>
            </tr>
          </tbody>
        </table>

        <!-- Calculations & Signatures -->
        <div class="calc-grid">
          <div>
            ${showAmountInWords ? `
            <div class="words-card">
              <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">Amount in Words:</div>
              <div class="amount-words">${amountWords}</div>
            </div>
            ` : ''}
            ${showTerms ? `
            <p class="terms-note">
              <strong>Terms:</strong> ${invoiceTerms}
            </p>
            ` : ''}
          </div>

          <div class="totals-card">
            <div class="total-line">
              <span>Subtotal (Taxable Base Value):</span>
              <strong>${formattedBaseAmount}</strong>
            </div>
            ${taxRate > 0 && taxConfig.enableStateSplit ? `
            <div class="total-line">
              <span>CGST (${(taxRate / 2).toFixed(1)}% Intra-State):</span>
              <strong>${formattedCgst}</strong>
            </div>
            <div class="total-line">
              <span>SGST (${(taxRate / 2).toFixed(1)}% Intra-State):</span>
              <strong>${formattedSgst}</strong>
            </div>
            ` : ''}
            ${taxRate > 0 && !taxConfig.enableStateSplit ? `
            <div class="total-line">
              <span>IGST (${taxRate.toFixed(1)}% Inter-State):</span>
              <strong>${formattedIgst}</strong>
            </div>
            ` : ''}
            ${taxRate === 0 ? `
            <div class="total-line">
              <span>GST (0% Exempt / Zero-rated):</span>
              <strong>₹0.00</strong>
            </div>
            ` : ''}
            <div class="total-line">
              <span>Discount / Promo:</span>
              <strong style="color: #16a34a;">-₹0.00</strong>
            </div>
            <div class="grand-line">
              <div>
                <strong style="font-size: 13px; text-transform: uppercase;">Total Paid</strong>
                <div style="font-size: 10px; color: #64748b;">(Inclusive of all taxes)</div>
              </div>
              <div class="grand-total-amount">${formattedAmount}</div>
            </div>
          </div>
        </div>

        <!-- Footer & Signatures -->
        <div class="footer-sign-row">
          ${showQrCode ? `
          <div class="qr-box">
            <div class="qr-square">
              <svg viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-5 0h3v3h-3v-3zm2 3h3v2h-3v-2zm3 3h3v3h-3v-3zm-5 0h3v3h-3v-3z"/></svg>
            </div>
            <div>
              <div style="font-weight: 800; color: #0f172a;">Scan to Verify Tax Invoice</div>
              <div style="font-size: 11px; color: #64748b;">Government Portal & System Authenticated</div>
              <div style="font-size: 10px; font-family: monospace; color: #4f46e5; margin-top: 2px;">AUTH-HASH: 981a2e-7492cf-b41982</div>
            </div>
          </div>
          ` : '<div></div>'}

          ${showSignatory ? `
          <div class="sign-box">
            ${signatureImageUrl ? `
              <div style="margin-bottom: 4px; display: flex; justify-content: flex-end;">
                <img src="${signatureImageUrl}" alt="Official Signature / Stamp" style="max-height: 56px; max-width: 160px; object-fit: contain;" />
              </div>
              <div style="font-weight: 800; color: #0f172a;">${signatoryName}</div>
              <div style="font-size: 11px; font-weight: 600; color: #475569;">${signatoryTitle}</div>
              <div style="font-size: 10px; color: #64748b;">${platformLegalName}</div>
            ` : `
              <div class="sign-signature">${signatoryName}</div>
              <div style="font-weight: 800; color: #0f172a;">${signatoryTitle}</div>
              <div style="font-size: 11px; color: #64748b;">${platformLegalName}</div>
            `}
          </div>
          ` : ''}
        </div>

      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=950,height=850');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  } else {
    alert("Please allow popups in your browser to download and print your tax invoice.");
  }
};

export const downloadEmployeePayslip = (employee: any, company: any, payroll: any) => {
  const symbols: { [key: string]: string } = { USD: '$', INR: '₹', EUR: '€', GBP: '£' };
  const currencySymbol = symbols[payroll.currency || 'USD'] || '$';

  const payslipHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Payslip - ${employee.name} - ${payroll.month} ${payroll.year}</title>
      <style>
        body { font-family: 'Inter', system-ui, sans-serif; color: #333; margin: 0; padding: 40px; background: #f8fafc; }
        .payslip-container { max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
        .brand { font-size: 24px; font-weight: 800; color: #4f46e5; }
        .title { font-size: 24px; font-weight: 700; color: #0f172a; margin: 0; text-align: right; }
        
        .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; font-size: 14px; }
        .meta-col p { margin: 6px 0; color: #475569; }
        .meta-col p strong { color: #0f172a; }

        .breakdown-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; }
        .breakdown-col h3 { font-size: 14px; text-transform: uppercase; color: #4f46e5; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 0; }
        .breakdown-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #475569; }
        .breakdown-row strong { color: #0f172a; }

        .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-top: 30px; display: flex; justify-content: space-between; align-items: center; }
        .net-salary { font-size: 22px; font-weight: 700; color: #10b981; }

        .footer { margin-top: 60px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="payslip-container">
        <div class="header">
          <div>
            <div class="brand">${company.name || 'HRMS PLATFORM'}</div>
            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">Salary & Payout Payslip</p>
          </div>
          <div>
            <h1 class="title">PAYSLIP</h1>
            <p style="margin: 4px 0 0 0; text-align: right; color: #64748b; font-size: 14px;">For ${payroll.month} ${payroll.year}</p>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-col">
            <p>Employee ID: <strong>${employee.id || employee.employeeId || 'N/A'}</strong></p>
            <p>Employee Name: <strong>${employee.name}</strong></p>
            <p>Designation: <strong>${employee.designation || employee.role || 'Staff'}</strong></p>
          </div>
          <div class="meta-col" style="text-align: right;">
            <p>Email: <strong>${employee.email || 'N/A'}</strong></p>
            <p>Payout Method: <strong>Direct Bank Transfer</strong></p>
            <p>Status: <strong style="color: #10b981;">Processed</strong></p>
          </div>
        </div>

         <div class="breakdown-grid">
          <div class="breakdown-col">
            <h3>Earnings</h3>
            <div class="breakdown-row">
              <span>Basic Salary</span>
              <strong>${currencySymbol}${Math.round(payroll.basic).toLocaleString()}</strong>
            </div>
            <div class="breakdown-row">
              <span>HRA (House Rent Allow.)</span>
              <strong>${currencySymbol}${Math.round(payroll.hra).toLocaleString()}</strong>
            </div>
            <div class="breakdown-row">
              <span>Allowances & Bonus</span>
              <strong>${currencySymbol}${Math.round(payroll.allowances).toLocaleString()}</strong>
            </div>
            ${payroll.overtime ? `
            <div class="breakdown-row">
              <span>Overtime Pay</span>
              <strong>${currencySymbol}${Math.round(payroll.overtime).toLocaleString()}</strong>
            </div>
            ` : ''}
            ${payroll.reimbursement ? `
            <div class="breakdown-row">
              <span>Reimbursements</span>
              <strong>${currencySymbol}${Math.round(payroll.reimbursement).toLocaleString()}</strong>
            </div>
            ` : ''}
            ${(payroll.customEarningsList || []).map((e: any) => `
            <div class="breakdown-row">
              <span>${e.name}</span>
              <strong>${currencySymbol}${Math.round(e.amount).toLocaleString()}</strong>
            </div>
            `).join('')}
          </div>

          <div class="breakdown-col">
            <h3>Deductions</h3>
            <div class="breakdown-row">
              <span>Provident Fund (PF)</span>
              <strong>${currencySymbol}${Math.round(payroll.pf).toLocaleString()}</strong>
            </div>
            <div class="breakdown-row">
              <span>State Insurance (ESI)</span>
              <strong>${currencySymbol}${Math.round(payroll.esi).toLocaleString()}</strong>
            </div>
            <div class="breakdown-row">
              <span>Tax (TDS)</span>
              <strong>${currencySymbol}${Math.round(payroll.tax).toLocaleString()}</strong>
            </div>
            ${payroll.profTax ? `
            <div class="breakdown-row">
              <span>Professional Tax</span>
              <strong>${currencySymbol}${Math.round(payroll.profTax).toLocaleString()}</strong>
            </div>
            ` : ''}
            ${(payroll.customDeductionsList || []).map((d: any) => `
            <div class="breakdown-row">
              <span>${d.name}</span>
              <strong>${currencySymbol}${Math.round(d.amount).toLocaleString()}</strong>
            </div>
            `).join('')}
          </div>
        </div>

        <div class="summary-box">
          <div>
            <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 600;">Net Payout</div>
            <div style="font-size: 14px; color: #94a3b8; margin-top: 4px;">Total Earnings after Deductions</div>
          </div>
          <div class="net-salary">${currencySymbol}${Math.round(payroll.netSalary).toLocaleString()}</div>
        </div>

        <div class="footer">
          <p>This is a computer-generated payslip and does not require a physical signature.</p>
          <p>For any queries, please contact the HR / Accounts department.</p>
        </div>
      </div>
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(payslipHtml);
    printWindow.document.close();
  } else {
    alert("Please allow popups to download the payslip.");
  }
};
