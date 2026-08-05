import React, { useState } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import { 
  TrendingUp, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  UserPlus, 
  Building, 
  Lock,
  Plus
} from 'lucide-react';

interface DireccionViewProps {
  activeTab: string;
}

export const DireccionView: React.FC<DireccionViewProps> = ({ activeTab }) => {
  const { 
    orders, 
    users, 
    cashCut, 
    expenses, 
    addExpense, 
    closeCashCut, 
    addUser, 
    toggleUserStatus,
    inventory 
  } = useWorkshop();

  // Financial Form States
  const [expenseConcept, setExpenseConcept] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<'Repuestos' | 'Herramientas' | 'Servicios' | 'Nómina' | 'Otros'>('Repuestos');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseSupplier, setExpenseSupplier] = useState('');
  const [expenseReceipt, setExpenseReceipt] = useState('');

  // Cash Cut Audit States
  const [actualCashInput, setActualCashInput] = useState('');
  const [closeNotesInput, setCloseNotesInput] = useState('');

  // New User Form States
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'direccion' | 'asesor' | 'tecnico' | 'almacen'>('tecnico');
  const [newUserSpecialty, setNewUserSpecialty] = useState('');

  // Financial calculations
  const totalServiceRevenue = orders
    .filter(o => o.paymentStatus === 'liquidado')
    .reduce((sum, o) => {
      const laborCost = o.labor.reduce((lSum, l) => lSum + (l.hours * l.hourlyRate), 0);
      return sum + laborCost;
    }, 0) + 124000; // Base historical

  const totalPartsRevenue = orders
    .filter(o => o.paymentStatus === 'liquidado')
    .reduce((sum, o) => {
      const partsCost = o.parts.reduce((pSum, p) => pSum + (p.quantity * p.unitPrice), 0);
      return sum + partsCost;
    }, 0) + 210000;

  const totalGlobalRevenue = totalServiceRevenue + totalPartsRevenue;

  // OS Status breakdown
  const openOrdersCount = orders.filter(o => o.status === 'Diagnóstico' || o.status === 'En Proceso').length;
  const waitingPartsCount = orders.filter(o => o.status === 'Esperando Refacción').length;
  const finishedOrdersCount = orders.filter(o => o.status === 'Finalizada' || o.status === 'Listo para Entrega').length;

  const criticalStockCount = inventory.filter(i => i.stock <= i.minStock).length;

  // Handlers
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseConcept || !expenseAmount) return;
    addExpense({
      concept: expenseConcept,
      category: expenseCategory,
      amount: parseFloat(expenseAmount),
      supplier: expenseSupplier || 'Proveedor General',
      receiptNumber: expenseReceipt || `FAC-${Math.floor(Math.random() * 9000 + 1000)}`
    });
    setExpenseConcept('');
    setExpenseAmount('');
    setExpenseSupplier('');
    setExpenseReceipt('');
  };

  const handleCloseCashCut = (e: React.FormEvent) => {
    e.preventDefault();
    const actual = parseFloat(actualCashInput) || cashCut.calculatedCash;
    closeCashCut(actual, closeNotesInput || 'Corte finalizado por Dirección.');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    addUser({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      specialty: newUserSpecialty || 'General Diesel'
    });
    setNewUserName('');
    setNewUserEmail('');
    setNewUserSpecialty('');
    setShowAddUserModal(false);
  };

  return (
    <div className="flex-1 p-4 md:p-6 bg-[#050505] overflow-y-auto min-h-0 space-y-6">
      {/* MODULE 1: DASHBOARD Y REPORTES GERENCIALES */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top KPI Metric Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-flat border-amber-500">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Ingresos Totales (Mes)
              </p>
              <p className="text-2xl font-light text-white font-mono mt-1">
                ${totalGlobalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[10px]">
                <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +14.2%
                </span>
                <span className="text-slate-500">vs Mes Anterior</span>
              </div>
            </div>

            <div className="card-flat border-slate-500">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Órdenes de Servicio
              </p>
              <p className="text-2xl font-light text-white font-mono mt-1">
                {orders.length}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                {openOrdersCount} En Proceso • {waitingPartsCount} Esp. Refacción
              </p>
            </div>

            <div className="card-flat border-emerald-500">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Efectividad del Taller
              </p>
              <p className="text-2xl font-light text-white font-mono mt-1">
                92.4%
              </p>
              <p className="text-[10px] text-emerald-400 font-bold mt-1">
                {finishedOrdersCount} Órdenes Entregadas
              </p>
            </div>

            <div className="card-flat border-blue-500">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Stock Crítico Almacén
              </p>
              <p className="text-2xl font-light text-white font-mono mt-1">
                {criticalStockCount} Items
              </p>
              <p className="text-[10px] text-blue-400 mt-1">
                Revisar Alertas Kardex
              </p>
            </div>
          </section>

          {/* Revenue Breakdown & Technician Productivity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Revenue breakdown by category */}
            <div className="lg:col-span-6 bg-[#0c0c0c] border border-white/10 p-5 rounded-md">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-4 flex items-center justify-between">
                <span>Desglose de Ingresos por Concepto</span>
                <span className="text-[10px] text-amber-500 font-mono">Consolidado</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Servicios de Taller (Mano de Obra)</span>
                    <span className="font-mono text-white font-bold">
                      ${totalServiceRevenue.toLocaleString('es-MX')}
                    </span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full" 
                      style={{ width: `${(totalServiceRevenue / totalGlobalRevenue) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Venta de Refacciones Diesel</span>
                    <span className="font-mono text-white font-bold">
                      ${totalPartsRevenue.toLocaleString('es-MX')}
                    </span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full rounded-full" 
                      style={{ width: `${(totalPartsRevenue / totalGlobalRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 bg-white/5 border border-white/5 rounded text-xs flex justify-between items-center">
                <span className="text-slate-400">Margen Operativo Bruto Estimado:</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">38.6%</span>
              </div>
            </div>

            {/* Productivity Ranking by Technician */}
            <div className="lg:col-span-6 bg-[#0c0c0c] border border-white/10 p-5 rounded-md">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-4">
                Rendimiento y Productividad por Técnico
              </h2>

              <div className="space-y-3">
                {[
                  { name: 'Ricardo M.', specialty: 'Cummins & Detroit', osCount: 8, hours: 42, efficiency: '96%' },
                  { name: 'Samuel V.', specialty: 'Turbos & Emisiones', osCount: 6, hours: 38, efficiency: '91%' },
                  { name: 'Daniel O.', specialty: 'Frenos & Tren Motriz', osCount: 7, hours: 35, efficiency: '94%' }
                ].map((tech, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{tech.name}</p>
                        <p className="text-[10px] text-slate-400">{tech.specialty}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-amber-500">{tech.osCount} OS</span>
                      <span className="text-[10px] text-slate-400 block">{tech.hours} hrs billable • <strong className="text-emerald-400">{tech.efficiency}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Work Orders Overview Table */}
          <div className="bg-[#0c0c0c] border border-white/10 rounded-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                Estado de Órdenes de Servicio del Taller
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-slate-400 border-b border-white/10">
                  <tr className="uppercase font-bold tracking-wider">
                    <th className="p-3">Folio</th>
                    <th className="p-3">Unidad Diesel / Placa</th>
                    <th className="p-3">Técnico</th>
                    <th className="p-3">Estatus</th>
                    <th className="p-3 text-right">Costo Est.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-mono font-bold text-amber-500">{o.id}</td>
                      <td className="p-3">
                        <p className="text-white font-medium">{o.vehicle.brand} {o.vehicle.model}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{o.vehicle.plates} • {o.vehicle.mileageOrHours}</p>
                      </td>
                      <td className="p-3 text-slate-300">{o.assignedTechnicianName}</td>
                      <td className="p-3">
                        <span className={`status-pill ${
                          o.status === 'Finalizada' ? 'bg-emerald-500/20 text-emerald-400' :
                          o.status === 'Esperando Refacción' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-white">
                        ${o.estimatedCost.toLocaleString('es-MX')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2: ADMINISTRACIÓN FINANCIERA Y CAJAS */}
      {activeTab === 'finanzas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Daily Cash Cut Box */}
            <div className="lg:col-span-7 bg-[#0c0c0c] border border-white/10 p-5 rounded-md space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                    Corte y Arqueo de Caja Diario
                  </h2>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Fecha: {cashCut.date} • Estado: <strong className={cashCut.status === 'abierto' ? 'text-emerald-400' : 'text-red-400'}>{cashCut.status.toUpperCase()}</strong>
                  </p>
                </div>
                <div className="w-8 h-8 rounded bg-amber-500/20 text-amber-500 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white/5 rounded">
                  <p className="text-[10px] text-slate-400 uppercase">Fondo Inicial</p>
                  <p className="text-base font-mono font-bold text-white mt-0.5">${cashCut.initialCash.toLocaleString('es-MX')}</p>
                </div>
                <div className="p-3 bg-white/5 rounded">
                  <p className="text-[10px] text-slate-400 uppercase">Ventas Efectivo</p>
                  <p className="text-base font-mono font-bold text-emerald-400 mt-0.5">${cashCut.cashSales.toLocaleString('es-MX')}</p>
                </div>
                <div className="p-3 bg-white/5 rounded">
                  <p className="text-[10px] text-slate-400 uppercase">Ventas Tarjeta</p>
                  <p className="text-base font-mono font-bold text-blue-400 mt-0.5">${cashCut.cardSales.toLocaleString('es-MX')}</p>
                </div>
                <div className="p-3 bg-white/5 rounded">
                  <p className="text-[10px] text-slate-400 uppercase">Transferencias</p>
                  <p className="text-base font-mono font-bold text-purple-400 mt-0.5">${cashCut.transferSales.toLocaleString('es-MX')}</p>
                </div>
                <div className="p-3 bg-white/5 rounded">
                  <p className="text-[10px] text-slate-400 uppercase">Gastos de Caja</p>
                  <p className="text-base font-mono font-bold text-red-400 mt-0.5">-${cashCut.expensesTotal.toLocaleString('es-MX')}</p>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded">
                  <p className="text-[10px] text-amber-400 uppercase font-bold">Efectivo Calculado</p>
                  <p className="text-base font-mono font-bold text-amber-500 mt-0.5">${cashCut.calculatedCash.toLocaleString('es-MX')}</p>
                </div>
              </div>

              {cashCut.status === 'abierto' ? (
                <form onSubmit={handleCloseCashCut} className="pt-3 border-t border-white/10 space-y-3">
                  <p className="text-xs font-bold text-white uppercase">Realizar Arqueo y Cierre de Caja</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase block mb-1">Efectivo Contado en Físico ($)</label>
                      <input 
                        type="number"
                        value={actualCashInput}
                        onChange={(e) => setActualCashInput(e.target.value)}
                        placeholder={cashCut.calculatedCash.toString()}
                        className="w-full bg-black border border-white/10 px-3 py-1.5 text-xs text-white font-mono rounded focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase block mb-1">Notas de Arqueo</label>
                      <input 
                        type="text"
                        value={closeNotesInput}
                        onChange={(e) => setCloseNotesInput(e.target.value)}
                        placeholder="Observaciones de caja..."
                        className="w-full bg-black border border-white/10 px-3 py-1.5 text-xs text-white rounded focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-amber-500 text-black py-2 text-xs font-bold uppercase rounded hover:bg-amber-400 transition-colors"
                  >
                    Finalizar y Cerrar Corte de Caja
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-xs space-y-1">
                  <p className="text-red-400 font-bold uppercase">Corte Cerrado Oficialmente</p>
                  <p className="text-slate-300">Diferencia Registrada: <strong className="font-mono text-white">${cashCut.difference.toLocaleString('es-MX')}</strong></p>
                  <p className="text-slate-400 italic text-[10px]">{cashCut.notes}</p>
                </div>
              )}
            </div>

            {/* Expense & Purchases Registration Form */}
            <div className="lg:col-span-5 bg-[#0c0c0c] border border-white/10 p-5 rounded-md space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                Registro de Compras y Gastos
              </h2>

              <form onSubmit={handleAddExpense} className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Concepto del Gasto</label>
                  <input
                    type="text"
                    required
                    value={expenseConcept}
                    onChange={(e) => setExpenseConcept(e.target.value)}
                    placeholder="Ej. Compra de anticongelante concentrado"
                    className="w-full bg-black border border-white/10 px-3 py-1.5 text-xs text-white rounded focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase block mb-1">Categoría</label>
                    <select
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value as any)}
                      className="w-full bg-black border border-white/10 px-3 py-1.5 text-xs text-white rounded focus:border-amber-500 outline-none"
                    >
                      <option value="Repuestos">Repuestos</option>
                      <option value="Herramientas">Herramientas</option>
                      <option value="Servicios">Servicios</option>
                      <option value="Nómina">Nómina</option>
                      <option value="Otros">Otros</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase block mb-1">Monto ($ MXN)</label>
                    <input
                      type="number"
                      required
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-black border border-white/10 px-3 py-1.5 text-xs text-white font-mono rounded focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase block mb-1">Proveedor</label>
                    <input
                      type="text"
                      value={expenseSupplier}
                      onChange={(e) => setExpenseSupplier(e.target.value)}
                      placeholder="Nombre del proveedor"
                      className="w-full bg-black border border-white/10 px-3 py-1.5 text-xs text-white rounded focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase block mb-1"># Factura / Ticket</label>
                    <input
                      type="text"
                      value={expenseReceipt}
                      onChange={(e) => setExpenseReceipt(e.target.value)}
                      placeholder="FAC-1234"
                      className="w-full bg-black border border-white/10 px-3 py-1.5 text-xs text-white font-mono rounded focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white py-2 text-xs font-bold uppercase rounded transition-all mt-2"
                >
                  Registrar Gasto Operativo
                </button>
              </form>
            </div>
          </div>

          {/* Expenses Log Table */}
          <div className="bg-[#0c0c0c] border border-white/10 rounded-md p-5">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-4">
              Histórico de Compras y Gastos del Taller
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-slate-400 border-b border-white/10 uppercase font-bold">
                  <tr>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Concepto</th>
                    <th className="p-3">Categoría</th>
                    <th className="p-3">Proveedor / Comprobante</th>
                    <th className="p-3 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-white/5">
                      <td className="p-3 font-mono text-slate-400">{exp.date}</td>
                      <td className="p-3 text-white font-medium">{exp.concept}</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-white/5 text-amber-400 text-[10px] uppercase">{exp.category}</span></td>
                      <td className="p-3 text-slate-400">{exp.supplier || 'N/A'} • {exp.receiptNumber}</td>
                      <td className="p-3 text-right font-mono font-bold text-red-400">-${exp.amount.toLocaleString('es-MX')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 3: GESTIÓN DE USUARIOS Y PERMISOS */}
      {activeTab === 'usuarios' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
                Gestión de Personal y Permisos (15-20 Empleados)
              </h2>
              <p className="text-xs text-slate-400">
                Control de altas/bajas de asesores, mecánicos, personal de almacén y niveles de acceso.
              </p>
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 text-xs font-bold uppercase rounded transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Alta de Empleado</span>
            </button>
          </div>

          {/* User Table */}
          <div className="bg-[#0c0c0c] border border-white/10 rounded-md overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-slate-400 border-b border-white/10 uppercase font-bold">
                <tr>
                  <th className="p-4">Empleado</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Rol Asignado</th>
                  <th className="p-4">Especialidad</th>
                  <th className="p-4">Estatus</th>
                  <th className="p-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5">
                    <td className="p-4 font-bold text-white">{u.name}</td>
                    <td className="p-4 text-slate-400 font-mono">{u.email}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 font-bold uppercase text-[10px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">{u.specialty || 'General'}</td>
                    <td className="p-4">
                      <span className={`status-pill ${u.status === 'activo' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className="text-[10px] font-bold uppercase px-2.5 py-1 border border-white/10 hover:border-red-500 hover:text-red-400 transition-colors rounded"
                      >
                        {u.status === 'activo' ? 'Dar de Baja' : 'Reactivar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add User Modal */}
          {showAddUserModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#0c0c0c] border border-white/20 p-6 rounded-lg max-w-md w-full space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white">Alta de Nuevo Empleado</h3>
                  <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase block mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="Ej. Ing. Juan Pérez"
                      className="w-full bg-black border border-white/10 px-3 py-1.5 text-xs text-white rounded focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase block mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="jperez@tallerdiesel.com"
                      className="w-full bg-black border border-white/10 px-3 py-1.5 text-xs text-white font-mono rounded focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase block mb-1">Rol en Sistema</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as any)}
                        className="w-full bg-black border border-white/10 px-3 py-1.5 text-xs text-white rounded focus:border-amber-500 outline-none"
                      >
                        <option value="tecnico">Técnico / Mecánico</option>
                        <option value="asesor">Asesor de Servicio</option>
                        <option value="almacen">Encargado Almacén</option>
                        <option value="direccion">Dirección</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase block mb-1">Especialidad</label>
                      <input
                        type="text"
                        value={newUserSpecialty}
                        onChange={(e) => setNewUserSpecialty(e.target.value)}
                        placeholder="Ej. Motores Detroit / VGT"
                        className="w-full bg-black border border-white/10 px-3 py-1.5 text-xs text-white rounded focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(false)}
                      className="flex-1 border border-white/10 py-2 text-xs font-bold uppercase text-slate-400 hover:text-white rounded"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-amber-500 hover:bg-amber-400 text-black py-2 text-xs font-bold uppercase rounded"
                    >
                      Guardar Empleado
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
