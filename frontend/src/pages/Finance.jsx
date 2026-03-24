import { useState, useEffect, useMemo } from 'react';
import api from '../api';

function fmtCurrency(n) {
  if (n == null) return '--';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function fmtCurrencyDetailed(n) {
  if (n == null) return '--';
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function calculateEMI(principal, annualRate, years) {
  const r = annualRate / 12 / 100;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function calculateMaxLoan(monthlyEMI, annualRate, years) {
  const r = annualRate / 12 / 100;
  const n = years * 12;
  if (r === 0) return monthlyEMI * n;
  return (monthlyEMI * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
}

const defaultBanks = [
  { code: 'SBI', name: 'State Bank of India', color: '#1a5276', floating_rate: 8.50, max_tenure: 30, processing_fee: '0.35%' },
  { code: 'HDFC', name: 'HDFC Bank', color: '#c0392b', floating_rate: 8.75, max_tenure: 30, processing_fee: '0.50%' },
  { code: 'ICICI', name: 'ICICI Bank', color: '#e67e22', floating_rate: 8.65, max_tenure: 25, processing_fee: '0.50%' },
  { code: 'AXIS', name: 'Axis Bank', color: '#8e44ad', floating_rate: 8.90, max_tenure: 25, processing_fee: '1.00%' },
  { code: 'BOB', name: 'Bank of Baroda', color: '#d35400', floating_rate: 8.40, max_tenure: 30, processing_fee: '0.25%' },
  { code: 'PNB', name: 'Punjab National Bank', color: '#2980b9', floating_rate: 8.55, max_tenure: 30, processing_fee: '0.35%' },
];

export default function Finance() {
  const [principal, setPrincipal] = useState(10000000);
  const [rate, setRate] = useState(6.75);
  const [tenure, setTenure] = useState(20);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [bankRates, setBankRates] = useState(defaultBanks);
  const [lastUpdated] = useState(new Date().toLocaleString());

  useEffect(() => {
    api.getBankRates().then((data) => {
      if (data?.banks?.length) setBankRates(data.banks);
    }).catch(() => {});
  }, []);

  const emi = useMemo(() => calculateEMI(principal, rate, tenure), [principal, rate, tenure]);
  const totalPayment = useMemo(() => emi * tenure * 12, [emi, tenure]);
  const totalInterest = useMemo(() => totalPayment - principal, [totalPayment, principal]);

  const maxLoan = useMemo(() => {
    const income = parseFloat(monthlyIncome) || 0;
    if (income <= 0) return 0;
    const maxEMI = income * 0.4;
    return calculateMaxLoan(maxEMI, rate, tenure);
  }, [monthlyIncome, rate, tenure]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)] mb-2">
          Concierge Desk
        </p>
        <h2 className="font-headline text-5xl lg:text-7xl text-[var(--color-navy-900)]">
          Financial <span className="italic text-[var(--color-gold)]">Instruments</span>
        </h2>
        <p className="mt-3 text-[var(--color-on-surface-variant)] text-lg max-w-2xl">
          Precision calculators and live market rates for informed real estate financing decisions.
        </p>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* EMI Calculator — 7 cols */}
        <div className="lg:col-span-7 bg-white rounded-xl editorial-shadow p-8">
          <div className="flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined text-[var(--color-gold)] text-2xl">calculate</span>
            <h3 className="font-headline text-2xl text-[var(--color-navy-900)]">EMI Calculator</h3>
          </div>

          <div className="space-y-8">
            {/* Principal slider */}
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <label className="text-sm font-semibold text-[var(--color-navy-900)]">Loan Principal</label>
                <span className="font-headline text-xl text-[var(--color-gold)]">{fmtCurrency(principal)}</span>
              </div>
              <input
                type="range"
                min={1000000}
                max={100000000}
                step={10000}
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#e3c285]"
              />
              <div className="flex justify-between text-xs text-[var(--color-on-surface-variant)] mt-1">
                <span>₹10L</span>
                <span>₹10Cr</span>
              </div>
            </div>

            {/* Interest Rate slider */}
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <label className="text-sm font-semibold text-[var(--color-navy-900)]">Interest Rate</label>
                <span className="font-headline text-xl text-[var(--color-gold)]">{rate.toFixed(2)}%</span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                step={0.25}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#e3c285]"
              />
              <div className="flex justify-between text-xs text-[var(--color-on-surface-variant)] mt-1">
                <span>1%</span>
                <span>15%</span>
              </div>
            </div>

            {/* Tenure slider */}
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <label className="text-sm font-semibold text-[var(--color-navy-900)]">Loan Tenure</label>
                <span className="font-headline text-xl text-[var(--color-gold)]">{tenure} Years</span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#e3c285]"
              />
              <div className="flex justify-between text-xs text-[var(--color-on-surface-variant)] mt-1">
                <span>1 Year</span>
                <span>30 Years</span>
              </div>
            </div>
          </div>

          {/* Result section */}
          <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-sm text-[var(--color-on-surface-variant)] mb-2">Estimated Monthly EMI</p>
            <p className="font-headline text-5xl text-[var(--color-navy-900)]">{fmtCurrencyDetailed(emi)}</p>
            <div className="flex gap-6 mt-4">
              <div>
                <p className="text-xs text-[var(--color-on-surface-variant)]">Total Payment</p>
                <p className="text-sm font-semibold text-[var(--color-navy-900)]">{fmtCurrency(totalPayment)}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-on-surface-variant)]">Total Interest</p>
                <p className="text-sm font-semibold text-red-500">{fmtCurrency(totalInterest)}</p>
              </div>
            </div>
            <button
              className="mt-6 px-6 py-3 rounded-full text-sm font-semibold uppercase tracking-wider flex items-center gap-2"
              style={{ background: 'var(--color-gold)', color: '#000828' }}
            >
              <span className="material-symbols-outlined text-lg">download</span>
              Download Report
            </button>
          </div>
        </div>

        {/* Right side — 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          {/* Affordability Checker — dark card */}
          <div className="rounded-xl p-8" style={{ background: '#152040' }}>
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-[var(--color-gold)]">account_balance_wallet</span>
              <h3 className="font-headline text-xl text-white">Affordability Checker</h3>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Monthly Gross Income</label>
              <div className="flex items-center bg-white/10 rounded-lg px-4 py-3 border border-white/20 focus-within:border-[var(--color-gold)] transition-colors">
                <span className="text-[var(--color-gold)] font-semibold mr-2">₹</span>
                <input
                  type="number"
                  placeholder="2,50,000"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  className="flex-1 bg-transparent text-white text-lg outline-none placeholder:text-gray-500"
                />
              </div>
            </div>
            <div className="mt-8">
              <p className="text-sm text-gray-400 mb-2">Max Loan Potential</p>
              <p className="font-headline text-4xl" style={{ color: '#e3c285' }}>
                {monthlyIncome ? fmtCurrency(maxLoan) : '--'}
              </p>
              {monthlyIncome && (
                <p className="text-xs text-gray-400 mt-2">
                  Based on 40% DTI ratio at {rate}% over {tenure} years
                </p>
              )}
            </div>
          </div>

          {/* Market Context card */}
          <div className="bg-white rounded-xl editorial-shadow p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-[var(--color-navy-900)]">monitoring</span>
              <h4 className="font-headline text-lg text-[var(--color-navy-900)]">Market Context</h4>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[var(--color-on-surface-variant)]">Federal Prime Rate</p>
                  <p className="text-2xl font-headline text-[var(--color-navy-900)]">6.25%</p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#f7f9fc' }}>
                  <span className="material-symbols-outlined text-[var(--color-gold)]">percent</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-[var(--color-on-surface-variant)]">Inflation Hedge</p>
                  <p className="text-2xl font-headline text-emerald-600">+0.4%</p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#f7f9fc' }}>
                  <span className="material-symbols-outlined text-emerald-600">trending_up</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Rate Comparison Table */}
      <div className="bg-white rounded-xl editorial-shadow p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[var(--color-gold)] text-2xl">account_balance</span>
            <h3 className="font-headline text-2xl text-[var(--color-navy-900)]">Bank Rate Comparison</h3>
          </div>
          <span className="text-xs text-[var(--color-on-surface-variant)]">Last Updated: {lastUpdated}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Institution</th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Floating Rate</th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Max Tenure</th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Processing Fee</th>
                <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]"></th>
              </tr>
            </thead>
            <tbody>
              {bankRates.map((bank) => (
                <tr key={bank.code} className="border-b border-gray-50 hover:bg-[#f7f9fc] transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: bank.color }}
                      >
                        {bank.code}
                      </div>
                      <span className="text-sm font-medium text-[var(--color-navy-900)]">{bank.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-semibold text-[var(--color-navy-900)]">{bank.floating_rate}%</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-[var(--color-on-surface-variant)]">{bank.max_tenure} Years</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-[var(--color-on-surface-variant)]">{bank.processing_fee}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full border border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[#000828] transition-colors">
                      Apply
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
