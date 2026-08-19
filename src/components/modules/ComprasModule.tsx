import React, { useState } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import { PurchaseOrder, PurchaseOrderItem } from '../../types';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  CheckCircle2, 
  PackageCheck, 
  Clock, 
  FileText, 
  Truck, 
  Building2, 
  DollarSign, 
  Trash2, 
  Send, 
  Printer, 
  Download,
  AlertTriangle
} from 'lucide-react';

export const ComprasModule: React.FC = () => {
  const { 
    currentRole,
    purchaseOrders, 
    addPurchaseOrder, 
    authorizePurchaseOrder,
    receivePurchaseOrder, 
    addDirectExpensePurchase, 
    supplierContacts, 
    inventory, 
    bankAccounts 
  } = useWorkshop();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDirectExpenseModal, setShowDirectExpenseModal] = useState(false);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<PurchaseOrder | null>(null);

  // Form states - New Purchase Order
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<PurchaseOrder['expenseCategory']>('Refacciones Almacén');
  const [paymentMethod, setPaymentMethod] = useState<PurchaseOrder['paymentMethod']>('Transferencia');
  const [notes, setNotes] = useState('');
  const [orderItems, setOrderItems] = useState<Omit<PurchaseOrderItem, 'id' | 'total'>[]>([
    { partCode: 'FLT-FF-5488', description: 'Filtro de Combustible Fleetguard', quantity: 10, unitCost: 420 }
  ]);

  // Form states - Direct Expense
  const [directConcept, setDirectConcept] = useState('');
  const [directSupplier, setDirectSupplier] = useState('');
  const [directAmount, setDirectAmount] = useState('');
  const [directCategory, setDirectCategory] = useState<PurchaseOrder['expenseCategory']>('Consumibles Taller');
  const [directAccount, setDirectAccount] = useState(bankAccounts[0]?.id || '');

  // Alert
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const showAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const handleAddItemRow = () => {
    setOrderItems(prev => [
      ...prev,
      { partCode: '', description: '', quantity: 1, unitCost: 0 }
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof Omit<PurchaseOrderItem, 'id' | 'total'>, value: any) => {
    setOrderItems(prev => prev.map((item, i) => {
      if (i === index) {
        if (field === 'partCode') {
          const matching = inventory.find(inv => inv.code.toLowerCase() === String(value).toLowerCase());
          return {
            ...item,
            partCode: value,
            description: matching ? matching.name : item.description,
            unitCost: matching ? matching.costPrice : item.unitCost
          };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || orderItems.length === 0) return;

    const supplier = supplierContacts.find(s => s.id === selectedSupplierId);
    if (!supplier) return;

    const itemsWithTotals: PurchaseOrderItem[] = orderItems.map((item, idx) => ({
      id: `poi-${Date.now()}-${idx}`,
      partCode: item.partCode || 'REF-GEN',
      description: item.description || 'Refacción / Insumo',
      quantity: Number(item.quantity) || 1,
      unitCost: Number(item.unitCost) || 0,
      total: (Number(item.quantity) || 1) * (Number(item.unitCost) || 0)
    }));

    const subtotal = itemsWithTotals.reduce((s, i) => s + i.total, 0);
    const taxIva = subtotal * 0.16;
    const total = subtotal + taxIva;

    addPurchaseOrder({
      supplierId: supplier.id,
      supplierName: supplier.companyName,
      supplierEmail: supplier.email,
      isDirectExpense: false,
      expenseCategory,
      paymentMethod,
      items: itemsWithTotals,
      subtotal,
      taxIva,
      total,
      notes
    });

    setShowAddModal(false);
    if (currentRole === 'almacen') {
      showAlert(`Orden de Compra generada por Almacén y enviada a Dirección para su Autorización.`);
    } else {
      showAlert(`Orden de Compra generada con éxito por $${total.toLocaleString()} MXN.`);
    }
  };

  const handleAuthorizeOrder = (orderId: string) => {
    authorizePurchaseOrder(orderId, 'Dirección Administrativa');
    showAlert(`Orden de Compra ${orderId} autorizada exitosamente. Lista para surtido y recepción.`);
  };

  const handleReceiveOrder = (orderId: string) => {
    receivePurchaseOrder(orderId);
    showAlert(`Mercancía recibida en almacén. Las existencias han sido incrementadas automáticamente.`);
  };

  const handleCreateDirectExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directConcept || !directAmount) return;

    addDirectExpensePurchase({
      concept: directConcept,
      category: directCategory,
      amount: parseFloat(directAmount),
      supplierName: directSupplier || 'Proveedor Local',
      bankAccountId: directAccount
    });

    setShowDirectExpenseModal(false);
    showAlert(`Gasto directo registrado e impactado en finanzas por $${parseFloat(directAmount).toLocaleString()} MXN.`);
    setDirectConcept('');
    setDirectAmount('');
  };

  // Filter
  const filteredOrders = purchaseOrders.filter(po => {
    const matchesSearch = 
      po.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.expenseCategory.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'Todos' || po.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = purchaseOrders.filter(p => p.status === 'Borrador' || p.status === 'Enviada a Proveedor').length;
  const receivedCount = purchaseOrders.filter(p => p.status === 'Recibida en Almacén').length;
  const totalPurchasesAmount = purchaseOrders.reduce((s, p) => s + p.total, 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 shrink-0 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-orange-100 text-orange-900 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Módulo 6
              </span>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Compras, Reabastecimiento y Proveedores
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Órdenes de compra a proveedores con recepción automática a inventario y registro de compras directas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDirectExpenseModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Gasto Directo / Caja Chica</span>
            </button>

            <button
              onClick={() => {
                if (supplierContacts.length > 0) setSelectedSupplierId(supplierContacts[0].id);
                setShowAddModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#002855] hover:bg-blue-900 rounded-lg shadow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Orden de Compra</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Órdenes</p>
            <p className="text-xl font-black text-slate-800">{purchaseOrders.length}</p>
          </div>
          <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3">
            <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Por Recibir</p>
            <p className="text-xl font-black text-amber-900">{pendingCount} órdenes</p>
          </div>
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3">
            <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Recibidas / Stock</p>
            <p className="text-xl font-black text-emerald-900">{receivedCount} órdenes</p>
          </div>
          <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3">
            <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">Monto Acumulado</p>
            <p className="text-xl font-black text-blue-900">${totalPurchasesAmount.toLocaleString()} MXN</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-6 space-y-4">
        {alertMsg && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-lg flex items-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold">{alertMsg}</span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por folio, proveedor o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {(['Todos', 'Enviada a Proveedor', 'Recibida en Almacén', 'Borrador'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === st 
                    ? 'bg-[#002855] text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Purchase Orders List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Historial de Órdenes de Compra ({filteredOrders.length})
            </h2>
            <span className="text-[11px] text-slate-500">
              Control de entradas de material con aumento automático de stock
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredOrders.map((order) => {
              const isPendingAuth = order.status === 'Pendiente de Autorización';
              const isAuthorized = order.status === 'Autorizada' || order.status === 'Enviada a Proveedor';
              const isReceived = order.status === 'Recibida en Almacén';
              const canAuthorize = currentRole === 'direccion' || currentRole === 'contabilidad' || !currentRole;

              return (
                <div key={order.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {order.id}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {order.supplierName}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {order.expenseCategory}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                        isReceived ? 'bg-emerald-100 text-emerald-800' :
                        isPendingAuth ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {isPendingAuth && <Clock className="w-3 h-3 text-amber-700" />}
                        {isReceived && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {order.status}
                      </span>
                      {order.createdByRole === 'almacen' && (
                        <span className="text-[9px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                          Creada por Almacén
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600">
                      <strong>Artículos:</strong> {order.items.map(i => `${i.quantity}x ${i.description}`).join(', ')}
                    </div>

                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                      <span>Fecha: {order.date}</span>
                      <span>•</span>
                      <span>Pago: {order.paymentMethod}</span>
                      {order.authorizedBy && (
                        <>
                          <span>•</span>
                          <span className="text-blue-700 font-bold">Autorizada por: {order.authorizedBy}</span>
                        </>
                      )}
                      {order.receivedAt && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold">Ingresado a almacén el: {order.receivedAt}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs text-slate-500">Subtotal: ${order.subtotal.toLocaleString()} + IVA: ${order.taxIva.toLocaleString()}</div>
                    <div className="text-base font-black text-slate-900">${order.total.toLocaleString()} MXN</div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Direction Authorization Button */}
                    {isPendingAuth && canAuthorize && (
                      <button
                        onClick={() => handleAuthorizeOrder(order.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-all cursor-pointer animate-pulse"
                        title="Autorizar Orden de Compra para enviar al proveedor"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Autorizar OC</span>
                      </button>
                    )}

                    {/* Pending state for warehouse */}
                    {isPendingAuth && currentRole === 'almacen' && (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                        Esperando Autorización de Dirección
                      </span>
                    )}

                    {/* Receive Goods Button (once authorized or sent) */}
                    {(isAuthorized) && (
                      <button
                        onClick={() => handleReceiveOrder(order.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all cursor-pointer"
                        title="Confirmar recepción física de mercancía y subir existencias en inventario"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>Recibir y Subir Stock</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        window.print();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                      title="Imprimir Orden de Compra"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL: NUEVA ORDEN DE COMPRA */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="bg-[#002855] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-300" />
                <h3 className="font-bold text-base">Generar Orden de Compra a Proveedor</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-300 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Proveedor *</label>
                  <select
                    required
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                  >
                    {supplierContacts.map(sup => (
                      <option key={sup.id} value={sup.id}>
                        {sup.companyName} ({sup.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoría del Gasto / Compra</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Refacciones Almacén">Refacciones Almacén</option>
                    <option value="Herramientas">Herramientas Especiales</option>
                    <option value="Consumibles Taller">Consumibles y Lubricantes</option>
                    <option value="Gasto Operativo / Administrativo">Gasto Operativo / Administrativo</option>
                  </select>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Partidas de la Orden</h4>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Partida</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {orderItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div className="col-span-3">
                        <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Código</label>
                        <input
                          type="text"
                          placeholder="FLT-FF-5488"
                          value={item.partCode}
                          onChange={(e) => handleItemChange(index, 'partCode', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Descripción</label>
                        <input
                          type="text"
                          placeholder="Nombre refacción..."
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Cantidad</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                          className="w-full px-2 py-1.5 text-xs font-bold border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Costo Unit.</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitCost}
                          onChange={(e) => handleItemChange(index, 'unitCost', Number(e.target.value))}
                          className="w-full px-2 py-1.5 text-xs font-bold border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center pt-3">
                        {orderItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Condición de Pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Crédito Proveedor">Crédito a 30 Días</option>
                    <option value="Efectivo">Efectivo / Caja Chica</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notas / Observaciones</label>
                  <input
                    type="text"
                    placeholder="Entrega en bahía de recepción..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Total Calculation */}
              <div className="bg-slate-100 p-3 rounded-lg flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">Total Estimado con IVA:</span>
                <span className="text-base font-black text-[#002855]">
                  ${(orderItems.reduce((s, i) => s + (i.quantity * i.unitCost), 0) * 1.16).toLocaleString(undefined, { minimumFractionDigits: 2 })} MXN
                </span>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#002855] hover:bg-blue-900 rounded-lg shadow transition-all cursor-pointer"
                >
                  Emitir Orden de Compra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GASTO DIRECTO / CAJA CHICA */}
      {showDirectExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Registro de Gasto Directo</h3>
              </div>
              <button 
                onClick={() => setShowDirectExpenseModal(false)}
                className="text-slate-300 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDirectExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Concepto del Gasto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Tornillería grado 8 y solvente dieléctrico"
                  value={directConcept}
                  onChange={(e) => setDirectConcept(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monto ($ MXN) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="1250.00"
                    value={directAmount}
                    onChange={(e) => setDirectAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Proveedor / Negocio</label>
                  <input
                    type="text"
                    placeholder="Ferretería Industrial"
                    value={directSupplier}
                    onChange={(e) => setDirectSupplier(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cuenta de Salida de Dinero</label>
                <select
                  value={directAccount}
                  onChange={(e) => setDirectAccount(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {bankAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (Saldo: ${acc.currentBalance.toLocaleString()} MXN)
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowDirectExpenseModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition-all cursor-pointer"
                >
                  Registrar Egreso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
