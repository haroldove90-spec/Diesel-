import React, { useState } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import { WorkOrderModule } from './WorkOrderModule';
import { ReportesVentasModule } from '../modules/ReportesVentasModule';
import { FinanzasBancosModule } from '../modules/FinanzasBancosModule';
import { ComprasModule } from '../modules/ComprasModule';
import { ContactosModule } from '../modules/ContactosModule';
import { FacturacionCajaModule } from '../modules/FacturacionCajaModule';
import { PosModule } from '../modules/PosModule';
import { PerfilModule } from '../modules/PerfilModule';
import { RoleType } from '../../types';
import { supabase } from '../../lib/supabase';
import { 
  TrendingUp, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  UserPlus, 
  Building, 
  Lock,
  Plus,
  Database,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Copy
} from 'lucide-react';

interface DireccionViewProps {
  activeTab: string;
}

export const DireccionView: React.FC<DireccionViewProps> = ({ activeTab }) => {
  const { 
    orders, 
    users, 
    currentUser,
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
  const [newUserRole, setNewUserRole] = useState<RoleType>('tecnico');
  const [newUserSpecialty, setNewUserSpecialty] = useState('');
  const [userModalStatus, setUserModalStatus] = useState<{ loading: boolean; error?: string; success?: string }>({ loading: false });
  const [dbTestStatus, setDbTestStatus] = useState<{ testing: boolean; result?: string; isOk?: boolean }>({ testing: false });

  // Financial calculations from REAL data
  const totalServiceRevenue = orders
    .filter(o => o.paymentStatus === 'liquidado')
    .reduce((sum, o) => {
      const laborCost = (o.labor || []).reduce((lSum, l) => lSum + (l.hours * l.hourlyRate), 0);
      return sum + laborCost;
    }, 0);

  const totalPartsRevenue = orders
    .filter(o => o.paymentStatus === 'liquidado')
    .reduce((sum, o) => {
      const partsCost = (o.parts || []).reduce((pSum, p) => pSum + (p.quantity * p.unitPrice), 0);
      return sum + partsCost;
    }, 0);

  const totalGlobalRevenue = totalServiceRevenue + totalPartsRevenue;

  // OS Status breakdown
  const openOrdersCount = orders.filter(o => o.status === 'Diagnóstico' || o.status === 'En Proceso').length;
  const waitingPartsCount = orders.filter(o => o.status === 'Esperando Refacción').length;
  const finishedOrdersCount = orders.filter(o => o.status === 'Finalizada' || o.status === 'Listo para Entrega' || o.status === 'Entregada').length;
  const workshopEfficiency = orders.length > 0 ? ((finishedOrdersCount / orders.length) * 100).toFixed(1) : '0.0';

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

  const handleTestSupabase = async () => {
    setDbTestStatus({ testing: true });
    try {
      // 1. Try querying app_users
      const { data, error } = await supabase.from('app_users').select('id, name, email').limit(5);
      if (!error) {
        setDbTestStatus({
          testing: false,
          isOk: true,
          result: `¡Conexión Exitosa con Supabase! Tabla 'app_users' sincronizada (${data?.length || 0} registros encontrados).`
        });
        return;
      }

      // If app_users failed with PGRST125, check if public schema is exposed
      const testFetch = await fetch('https://oejrrmtnluefhttqnutn.supabase.co/rest/v1/', {
        headers: {
          apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lanJybXRubHVlZmh0dHFudXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NTQyOTMsImV4cCI6MjEwMjEzMDI5M30.Tsyw3Oop55LzVocGRG-fqCcXJ-LAxjQtxZ2atFD-IEE',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lanJybXRubHVlZmh0dHFudXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NTQyOTMsImV4cCI6MjEwMjEzMDI5M30.Tsyw3Oop55LzVocGRG-fqCcXJ-LAxjQtxZ2atFD-IEE'
        }
      });

      if (testFetch.ok) {
        const spec = await testFetch.json();
        const availableTables = Object.keys(spec?.definitions || {}).join(', ') || 'Ninguna tabla expuesta aún';
        setDbTestStatus({
          testing: false,
          isOk: false,
          result: `API activa pero esquema 'public' no expuesto en Data API. Tablas detectadas en API: [${availableTables}].`
        });
      } else {
        setDbTestStatus({
          testing: false,
          isOk: false,
          result: `Error (${error.code || 'PGRST125'}): El esquema 'public' requiere activación en Supabase > Project Settings > Data API > Exposed schemas.`
        });
      }
    } catch (err: any) {
      setDbTestStatus({
        testing: false,
        isOk: false,
        result: `Error de conexión: ${err?.message || 'No se pudo contactar con Supabase'}`
      });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    setUserModalStatus({ loading: true });
    try {
      const result = await addUser({
        name: newUserName.trim(),
        email: newUserEmail.trim().toLowerCase(),
        role: newUserRole,
        specialty: newUserSpecialty.trim() || 'General Diesel'
      });

      if (result.success) {
        setUserModalStatus({
          loading: false,
          success: '¡Empleado guardado exitosamente en Supabase!'
        });
        setTimeout(() => {
          setNewUserName('');
          setNewUserEmail('');
          setNewUserSpecialty('');
          setUserModalStatus({ loading: false });
          setShowAddUserModal(false);
        }, 1200);
      } else {
        setUserModalStatus({
          loading: false,
          error: result.error || 'No se pudo guardar en Supabase. Revisa el estado de la API.'
        });
      }
    } catch (err: any) {
      setUserModalStatus({
        loading: false,
        error: err?.message || 'Error inesperado al registrar empleado.'
      });
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 bg-slate-50 overflow-y-auto min-h-0 space-y-6">
      {/* MODULE 1: DASHBOARD Y REPORTES GERENCIALES */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Executive Welcome Banner with Active User Name */}
          <div className="bg-gradient-to-r from-[#002855] via-blue-900 to-[#001f3f] text-white p-5 rounded-xl border border-blue-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-blue-950 font-black text-xl flex items-center justify-center shadow-md shrink-0">
                {(currentUser?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-base md:text-lg font-black text-white tracking-wide">
                    {currentUser?.name ? `Bienvenido, ${currentUser.name}` : 'Panel de Dirección General'}
                  </h1>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    ● En Línea
                  </span>
                </div>
                <p className="text-xs text-blue-200 font-medium mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>{currentUser?.email || 'direccion@tsrsonora.com'}</span>
                  <span className="text-blue-400">•</span>
                  <span className="text-amber-300 font-bold uppercase tracking-wider text-[11px]">
                    {currentUser?.role === 'direccion' ? 'Dirección General & Administración' : currentUser?.specialty || 'Administrador'}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-blue-950/70 border border-blue-700/50 px-3.5 py-2 rounded-lg text-xs self-stretch md:self-auto justify-between md:justify-start">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-bold text-slate-100 uppercase tracking-wider text-[11px]">TSR SONORA SA DE CV</span>
              </div>
            </div>
          </div>

          {/* Top KPI Metric Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-flat border-blue-600">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                Ingresos Totales (Mes)
              </p>
              <p className="text-2xl font-bold text-slate-900 font-mono mt-1">
                ${totalGlobalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[10px]">
                <span className="text-slate-500 font-medium">
                  {orders.filter(o => o.paymentStatus === 'liquidado').length} órdenes liquidadas
                </span>
              </div>
            </div>

            <div className="card-flat border-slate-400">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                Órdenes de Servicio
              </p>
              <p className="text-2xl font-bold text-slate-900 font-mono mt-1">
                {orders.length}
              </p>
              <p className="text-[10px] text-slate-600 mt-1 font-medium">
                {openOrdersCount} En Proceso • {waitingPartsCount} Esp. Refacción
              </p>
            </div>

            <div className="card-flat border-emerald-500">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                Efectividad del Taller
              </p>
              <p className="text-2xl font-bold text-slate-900 font-mono mt-1">
                {workshopEfficiency}%
              </p>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">
                {finishedOrdersCount} Órdenes Entregadas
              </p>
            </div>

            <div className="card-flat border-[#002855]">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                Stock Crítico Almacén
              </p>
              <p className="text-2xl font-bold text-slate-900 font-mono mt-1">
                {criticalStockCount} Items
              </p>
              <p className="text-[10px] text-blue-700 font-bold mt-1">
                {criticalStockCount > 0 ? 'Revisar Alertas Kardex' : 'Inventario en Óptimas Condiciones'}
              </p>
            </div>
          </section>

          {/* Revenue Breakdown & Technician Productivity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Revenue breakdown by category */}
            <div className="lg:col-span-6 bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#002855] mb-4 flex items-center justify-between">
                <span>Desglose de Ingresos por Concepto</span>
                <span className="text-[10px] text-blue-600 font-mono font-bold">Consolidado</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium">Servicios de Taller (Mano de Obra)</span>
                    <span className="font-mono text-slate-900 font-bold">
                      ${totalServiceRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#002855] h-full rounded-full" 
                      style={{ width: `${totalGlobalRevenue > 0 ? (totalServiceRevenue / totalGlobalRevenue) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium">Venta de Refacciones Diesel</span>
                    <span className="font-mono text-slate-900 font-bold">
                      ${totalPartsRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full" 
                      style={{ width: `${totalGlobalRevenue > 0 ? (totalPartsRevenue / totalGlobalRevenue) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 bg-blue-50/60 border border-blue-100 rounded-lg text-xs flex justify-between items-center">
                <span className="text-slate-600 font-medium">Margen Operativo Bruto Estimado:</span>
                <span className="font-mono text-emerald-700 font-bold text-sm">
                  {totalGlobalRevenue > 0 ? `${((totalGlobalRevenue - expenses.reduce((s, e) => s + e.amount, 0)) / totalGlobalRevenue * 100).toFixed(1)}%` : '0.0%'}
                </span>
              </div>
            </div>

            {/* Productivity Ranking by Technician */}
            <div className="lg:col-span-6 bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#002855] mb-4">
                Rendimiento y Productividad por Técnico
              </h2>

              {users.filter(u => u.role === 'tecnico').length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">No hay técnicos registrados aún.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Registra técnicos desde la pestaña "Personal & Roles".</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.filter(u => u.role === 'tecnico').map((tech, idx) => {
                    const techOrders = orders.filter(o => o.assignedTechnicianId === tech.id || o.assignedTechnicianName === tech.name);
                    const techHours = techOrders.reduce((sum, o) => sum + (o.labor || []).reduce((lSum, l) => lSum + l.hours, 0), 0);
                    return (
                      <div key={tech.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-[#002855] flex items-center justify-center font-bold text-xs">
                            #{idx + 1}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{tech.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{tech.specialty || 'Técnico Diésel'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-blue-700">{techOrders.length} OS</span>
                          <span className="text-[10px] text-slate-500 block">{techHours} hrs registradas</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Active Work Orders Overview Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#002855]">
                Estado de Órdenes de Servicio del Taller
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <tr className="uppercase font-bold tracking-wider">
                    <th className="p-3">Folio</th>
                    <th className="p-3">Unidad Diesel / Placa</th>
                    <th className="p-3">Técnico</th>
                    <th className="p-3">Estatus</th>
                    <th className="p-3 text-right">Costo Est.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-blue-700">{o.id}</td>
                      <td className="p-3">
                        <p className="text-slate-900 font-bold">{o.vehicle.brand} {o.vehicle.model}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{o.vehicle.plates} • {o.vehicle.mileageOrHours}</p>
                      </td>
                      <td className="p-3 text-slate-700 font-medium">{o.assignedTechnicianName}</td>
                      <td className="p-3">
                        <span className={`status-pill ${
                          o.status === 'Finalizada' ? 'bg-emerald-100 text-emerald-800' :
                          o.status === 'Esperando Refacción' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
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

      {/* MODULE 2: ADMINISTRACIÓN FINANCIERA Y BANCOS */}
      {activeTab === 'finanzas' && (
        <FinanzasBancosModule />
      )}

      {/* MODULE: VENTAS Y REPORTES */}
      {activeTab === 'reportes' && (
        <ReportesVentasModule />
      )}

      {/* MODULE: COMPRAS Y PROVEEDORES */}
      {activeTab === 'compras' && (
        <ComprasModule />
      )}

      {/* MODULE: CONTACTOS Y CLIENTES */}
      {activeTab === 'contactos' && (
        <ContactosModule initialTab="clientes" />
      )}

      {/* MODULE 3: GESTIÓN DE USUARIOS Y PERMISOS */}
      {activeTab === 'usuarios' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#002855]">
                Gestión de Personal y Permisos (15-20 Empleados)
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Control de altas/bajas de asesores, mecánicos, personal de almacén y niveles de acceso.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTestSupabase}
                disabled={dbTestStatus.testing}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 text-xs font-bold uppercase rounded-md transition-colors cursor-pointer border border-slate-300"
                title="Comprobar si Supabase responde"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${dbTestStatus.testing ? 'animate-spin text-blue-600' : ''}`} />
                <span>{dbTestStatus.testing ? 'Probando...' : 'Probar Supabase'}</span>
              </button>

              <button
                onClick={() => {
                  setUserModalStatus({ loading: false });
                  setShowAddUserModal(true);
                }}
                className="flex items-center gap-2 bg-[#002855] hover:bg-blue-900 text-white px-4 py-2 text-xs font-bold uppercase rounded-md transition-colors cursor-pointer shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Alta de Empleado</span>
              </button>
            </div>
          </div>

          {dbTestStatus.result && (
            <div className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 ${
              dbTestStatus.isOk 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}>
              <div className="flex items-center gap-2">
                {dbTestStatus.isOk ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span className="font-medium">{dbTestStatus.result}</span>
              </div>
              <button
                onClick={() => setDbTestStatus({ testing: false })}
                className="text-[10px] text-slate-400 hover:text-slate-700 font-bold uppercase cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* User Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase font-bold">
                <tr>
                  <th className="p-4">Empleado</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Rol Asignado</th>
                  <th className="p-4">Especialidad</th>
                  <th className="p-4">Estatus</th>
                  <th className="p-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">{u.name}</td>
                    <td className="p-4 text-slate-600 font-mono">{u.email}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-900 font-bold uppercase text-[10px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700 font-medium">{u.specialty || 'General'}</td>
                    <td className="p-4">
                      <span className={`status-pill ${u.status === 'activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className="text-[10px] font-bold uppercase px-2.5 py-1 border border-slate-300 hover:border-red-600 hover:text-red-600 transition-colors rounded-md"
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
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 p-6 rounded-xl max-w-md w-full space-y-4 shadow-2xl text-slate-900">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#002855]">Alta de Nuevo Empleado</h3>
                  <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
                </div>

                {userModalStatus.error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{userModalStatus.error}</span>
                  </div>
                )}

                {userModalStatus.success && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{userModalStatus.success}</span>
                  </div>
                )}

                <form onSubmit={handleCreateUser} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="Ej. Ing. Juan Pérez"
                      className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-900 rounded-md focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="jperez@tsrsonora.com"
                      className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-900 font-mono rounded-md focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Rol en Sistema</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-900 rounded-md focus:border-blue-600 outline-none"
                      >
                        <option value="tecnico">Técnico / Mecánico</option>
                        <option value="asesor">Asesor de Servicio</option>
                        <option value="almacen">Encargado Almacén</option>
                        <option value="contabilidad">Contador / Fiscal</option>
                        <option value="direccion">Dirección</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Especialidad</label>
                      <input
                        type="text"
                        value={newUserSpecialty}
                        onChange={(e) => setNewUserSpecialty(e.target.value)}
                        placeholder="Ej. Motores Detroit / VGT"
                        className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-900 rounded-md focus:border-blue-600 outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(false)}
                      disabled={userModalStatus.loading}
                      className="flex-1 border border-slate-300 py-2 text-xs font-bold uppercase text-slate-600 hover:text-slate-900 rounded-md"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={userModalStatus.loading}
                      className="flex-1 bg-[#002855] hover:bg-blue-900 text-white py-2 text-xs font-bold uppercase rounded-md shadow-sm flex items-center justify-center gap-1.5"
                    >
                      {userModalStatus.loading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Guardando en Supabase...</span>
                        </>
                      ) : (
                        <span>Guardar Empleado</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODULE: FACTURACIÓN Y TIMBRADO CFDI 4.0 */}
      {(activeTab === 'facturacion' || activeTab === 'contabilidad') && (
        <FacturacionCajaModule />
      )}

      {/* MODULE: PUNTO DE VENTA */}
      {activeTab === 'pos' && (
        <PosModule />
      )}

      {/* MODULE: MI PERFIL Y DATOS FISCALES */}
      {activeTab === 'perfil' && (
        <PerfilModule />
      )}

      {/* MODULE 4: ORDEN DE TRABAJO */}
      {activeTab === 'ordentrabajo' && (
        <WorkOrderModule />
      )}
    </div>
  );
};
