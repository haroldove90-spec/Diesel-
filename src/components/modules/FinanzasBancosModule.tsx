import React, { useState } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import { FinancialMovement, BankAccount } from '../../types';
import { 
  Wallet, 
  Building2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Search, 
  CheckCircle2, 
  DollarSign, 
  CreditCard, 
  Calendar, 
  FileSpreadsheet, 
  PieChart as PieIcon, 
  Layers, 
  Lock, 
  AlertTriangle 
} from 'lucide-react';

export const FinanzasBancosModule: React.FC = () => {
  const { 
    bankAccounts, 
    financialMovements, 
    addBankAccount, 
    addFinancialMovement, 
    cashCut, 
    closeCashCut 
  } = useWorkshop();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'Todos' | 'Ingreso' | 'Egreso'>('Todos');
  const [accountFilter, setAccountFilter] = useState<string>('Todas');

  // Modals
  const [showAddMovementModal, setShowAddMovementModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showCashCutModal, setShowCashCutModal] = useState(false);

  // Form states - New Movement
  const [selectedAccountId, setSelectedAccountId] = useState(bankAccounts[0]?.id || '');
  const [movementType, setMovementType] = useState<'Ingreso' | 'Egreso'>('Ingreso');
  const [concept, setConcept] = useState('');
  const [category, setCategory] = useState<FinancialMovement['category']>('Cobro Taller');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');

  // Form states - Cash Cut
  const [actualCashAudit, setActualCashAudit] = useState('');
  const [auditNotes, setAuditNotes] = useState('');

  // Alert
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const showAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const handleCreateMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept || !amount || !selectedAccountId) return;

    addFinancialMovement({
      accountId: selectedAccountId,
      type: movementType,
      concept,
      category,
      amount: parseFloat(amount),
      reference: reference || `REF-${Math.floor(Math.random() * 90000 + 10000)}`
    });

    setShowAddMovementModal(false);
    showAlert(`Movimiento financiero por $${parseFloat(amount).toLocaleString()} MXN registrado.`);
    setConcept('');
    setAmount('');
    setReference('');
  };

  const handleCloseCashAudit = (e: React.FormEvent) => {
    e.preventDefault();
    const actual = parseFloat(actualCashAudit) || cashCut.calculatedCash;
    closeCashCut(actual, auditNotes || 'Arqueo de caja auditado y cerrado por Dirección.');
    setShowCashCutModal(false);
    showAlert(`Corte de caja finalizado exitosamente.`);
  };

  // Calculations
  const totalBalance = bankAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  const totalIncomes = financialMovements.filter(m => m.type === 'Ingreso').reduce((s, m) => s + m.amount, 0);
  const totalExpenses = financialMovements.filter(m => m.type === 'Egreso').reduce((s, m) => s + m.amount, 0);

  const filteredMovements = financialMovements.filter(m => {
    const matchesSearch = 
      m.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.reference && m.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'Todos' || m.type === typeFilter;
    const matchesAccount = accountFilter === 'Todas' || m.accountId === accountFilter;

    return matchesSearch && matchesType && matchesAccount;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 shrink-0 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Módulo 8
              </span>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Bancos, Cuentas y Tesorería
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Monitoreo de saldos bancarios en tiempo real, arqueos de caja chica y flujo de ingresos vs egresos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActualCashAudit(cashCut.calculatedCash.toString());
                setShowCashCutModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#002855] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-blue-700" />
              <span>Arqueo y Cierre de Caja</span>
            </button>

            <button
              onClick={() => {
                if (bankAccounts.length > 0) setSelectedAccountId(bankAccounts[0].id);
                setShowAddMovementModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#002855] hover:bg-blue-900 rounded-lg shadow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Movimiento</span>
            </button>
          </div>
        </div>

        {/* Global Balance Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-blue-950 text-white rounded-lg p-3 shadow-sm">
            <p className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider">Saldo Total Disponible</p>
            <p className="text-xl font-black text-white">${totalBalance.toLocaleString()} MXN</p>
          </div>
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3">
            <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Total Ingresos</p>
            <p className="text-xl font-black text-emerald-900">+${totalIncomes.toLocaleString()} MXN</p>
          </div>
          <div className="bg-rose-50/70 border border-rose-200 rounded-lg p-3">
            <p className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">Total Egresos</p>
            <p className="text-xl font-black text-rose-900">-${totalExpenses.toLocaleString()} MXN</p>
          </div>
          <div className="bg-purple-50/70 border border-purple-200 rounded-lg p-3">
            <p className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">Caja Chica Taller</p>
            <p className="text-xl font-black text-purple-900">${cashCut.calculatedCash.toLocaleString()} MXN</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {alertMsg && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-lg flex items-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold">{alertMsg}</span>
          </div>
        )}

        {/* Bank Accounts Cards */}
        <div>
          <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3">
            Cuentas Bancarias y Cajas ({bankAccounts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {bankAccounts.map((acc) => (
              <div 
                key={acc.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-blue-400 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-xs text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                      {acc.bankName}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {acc.type}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{acc.name}</h3>
                  <p className="font-mono text-xs text-slate-500">Cuenta: {acc.accountNumber}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Saldo:</span>
                  <span className="text-base font-black text-slate-900">
                    ${acc.currentBalance.toLocaleString()} {acc.currency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Movements History */}
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar movimiento, concepto o referencia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={accountFilter}
                onChange={(e) => setAccountFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 font-semibold text-slate-700"
              >
                <option value="Todas">Todas las cuentas</option>
                {bankAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>

              {(['Todos', 'Ingreso', 'Egreso'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    typeFilter === t 
                      ? 'bg-[#002855] text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Movements Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Libro Mayor de Movimientos Financieros ({filteredMovements.length})
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredMovements.map((mov) => {
                const isIncome = mov.type === 'Ingreso';

                return (
                  <div key={mov.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl shrink-0 ${
                        isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isIncome ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{mov.concept}</span>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {mov.category}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <span>Cuenta: <strong>{mov.accountName}</strong></span>
                          <span>•</span>
                          <span>{mov.date}</span>
                          {mov.reference && (
                            <>
                              <span>•</span>
                              <span className="font-mono">{mov.reference}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-sm font-black ${
                        isIncome ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {isIncome ? '+' : '-'}${mov.amount.toLocaleString()} MXN
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: REGISTRAR MOVIMIENTO */}
      {showAddMovementModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-[#002855] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-300" />
                <h3 className="font-bold text-base">Registrar Movimiento Financiero</h3>
              </div>
              <button 
                onClick={() => setShowAddMovementModal(false)}
                className="text-slate-300 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMovement} className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setMovementType('Ingreso'); setCategory('Cobro Taller'); }}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    movementType === 'Ingreso' 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  + Ingreso (Entrada)
                </button>
                <button
                  type="button"
                  onClick={() => { setMovementType('Egreso'); setCategory('Compra Refacciones'); }}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    movementType === 'Egreso' 
                      ? 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  - Egreso (Salida)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cuenta Bancaria / Caja Afectada *</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                >
                  {bankAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (Saldo: ${acc.currentBalance.toLocaleString()} MXN)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {movementType === 'Ingreso' ? (
                    <>
                      <option value="Cobro Taller">Cobro de Orden de Servicio</option>
                      <option value="Cobro Mostrador">Venta de Mostrador POS</option>
                      <option value="Aportación de Capital">Aportación / Inyección de Capital</option>
                    </>
                  ) : (
                    <>
                      <option value="Compra Refacciones">Compra de Refacciones</option>
                      <option value="Herramientas">Compra de Herramientas</option>
                      <option value="Nómina / Taller">Nómina y Sueldos</option>
                      <option value="Gasto Operativo">Gasto Operativo (Renta, Luz, Insumos)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Concepto / Descripción *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Pago de luz y servicios taller"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monto ($ MXN) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Folio / Referencia</label>
                  <input
                    type="text"
                    placeholder="TRANS-982"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddMovementModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#002855] hover:bg-blue-900 rounded-lg shadow transition-all cursor-pointer"
                >
                  Guardar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AUDITORÍA Y CORTE DE CAJA */}
      {showCashCutModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">Arqueo y Cierre Diario de Caja</h3>
              </div>
              <button 
                onClick={() => setShowCashCutModal(false)}
                className="text-slate-300 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCloseCashAudit} className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Fondo Inicial de Caja:</span>
                  <span className="font-bold">${cashCut.initialCash.toLocaleString()} MXN</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Ventas en Efectivo (+):</span>
                  <span className="font-bold text-emerald-700">+${cashCut.cashSales.toLocaleString()} MXN</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Ventas con Tarjeta / Transferencia:</span>
                  <span className="font-bold">${(cashCut.cardSales + cashCut.transferSales).toLocaleString()} MXN</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Gastos / Salidas en Efectivo (-):</span>
                  <span className="font-bold text-rose-700">-${cashCut.expensesTotal.toLocaleString()} MXN</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Efectivo Teórico Esperado:</span>
                  <span className="text-blue-900">${cashCut.calculatedCash.toLocaleString()} MXN</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Efectivo Real Contado en Caja ($ MXN) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={actualCashAudit}
                  onChange={(e) => setActualCashAudit(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-black border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {actualCashAudit && (
                  <p className={`text-xs font-bold mt-1.5 ${
                    (parseFloat(actualCashAudit) - cashCut.calculatedCash) === 0
                      ? 'text-emerald-600'
                      : (parseFloat(actualCashAudit) - cashCut.calculatedCash) > 0
                      ? 'text-blue-600'
                      : 'text-rose-600'
                  }`}>
                    Diferencia de Caja: ${(parseFloat(actualCashAudit) - cashCut.calculatedCash).toFixed(2)} MXN
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Observaciones del Cierre</label>
                <textarea
                  rows={2}
                  placeholder="Se verificaron los billetes y monedas en presencia del encargado..."
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCashCutModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow transition-all cursor-pointer"
                >
                  Finalizar y Cerrar Caja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
