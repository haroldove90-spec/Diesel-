import React, { useState } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import { BillingOrder, InvoiceRecord } from '../../types';
import { 
  Receipt, 
  CreditCard, 
  Banknote, 
  ArrowRightLeft, 
  FileCheck2, 
  Send, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  FileText, 
  DollarSign, 
  ShieldCheck,
  Building,
  Printer,
  Boxes,
  FileSpreadsheet
} from 'lucide-react';

export const FacturacionCajaModule: React.FC = () => {
  const { 
    billingOrders, 
    invoices, 
    payBillingOrder, 
    dispatchWarehouseTicket, 
    createInvoiceFromBillingOrder, 
    sendInvoiceEmail 
  } = useWorkshop();

  // Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'caja' | 'facturacion' | 'vales'>('caja');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Pendiente de Pago' | 'Pagado' | 'Facturado'>('Todos');

  // Modals
  const [selectedBillingOrder, setSelectedBillingOrder] = useState<BillingOrder | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState<BillingOrder | null>(null);

  // Pay form
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Tarjeta' | 'Transferencia'>('Efectivo');
  const [paymentReceivedAmount, setPaymentReceivedAmount] = useState<string>('');

  // Invoice form
  const [rfc, setRfc] = useState('XAXX010101000');
  const [razonSocial, setRazonSocial] = useState('');
  const [regimenFiscal, setRegimenFiscal] = useState('601 - General de Ley Personas Morales');
  const [usoCfdi, setUsoCfdi] = useState('G03 - Gastos en general');
  const [clientEmail, setClientEmail] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('64000');
  const [formaPago, setFormaPago] = useState<'01 - Efectivo' | '03 - Transferencia electrónica' | '04 - Tarjeta de crédito' | '28 - Tarjeta de débito'>('01 - Efectivo');

  // Success alerts
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const showAlert = (msg: string) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(null), 4000);
  };

  // Filtered orders
  const filteredBillingOrders = billingOrders.filter(bo => {
    const matchesSearch = 
      bo.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bo.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bo.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'Todos' || bo.status === statusFilter;

    if (activeSubTab === 'vales') {
      return matchesSearch && bo.status !== 'Pendiente de Pago';
    }

    return matchesSearch && matchesStatus;
  });

  const pendingCount = billingOrders.filter(b => b.status === 'Pendiente de Pago').length;
  const paidCount = billingOrders.filter(b => b.status === 'Pagado' || b.status === 'Facturado').length;
  const invoicedCount = invoices.length;

  const handleOpenPay = (order: BillingOrder) => {
    setSelectedBillingOrder(order);
    setPaymentReceivedAmount(order.total.toString());
    setShowPayModal(true);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillingOrder) return;

    payBillingOrder(selectedBillingOrder.id, paymentMethod);
    setShowPayModal(false);
    showAlert(`Pago de $${selectedBillingOrder.total.toLocaleString()} MXN registrado con éxito para la orden ${selectedBillingOrder.id}.`);
    
    // Auto show ticket
    const updated = { ...selectedBillingOrder, status: 'Pagado' as const, paymentMethod, paidAt: new Date().toISOString() };
    setShowTicketModal(updated);
  };

  const handleOpenInvoice = (order: BillingOrder) => {
    setSelectedBillingOrder(order);
    setRazonSocial(order.clientName);
    setClientEmail(order.clientEmail || '');
    setRfc(order.clientRfc || 'XAXX010101000');
    setShowInvoiceModal(true);
  };

  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillingOrder) return;

    const newInvoice = createInvoiceFromBillingOrder(selectedBillingOrder.id, {
      rfc: rfc.toUpperCase(),
      regimenFiscal,
      usoCfdi,
      clientName: razonSocial || selectedBillingOrder.clientName,
      email: clientEmail || 'cliente@facturacion.com',
      paymentForm: formaPago
    });

    setShowInvoiceModal(false);
    showAlert(`Factura Fiscal CFDI 4.0 generada exitosamente. Folio: ${newInvoice.folio} (UUID: ${newInvoice.uuid.slice(0, 13)}...)`);
  };

  const handleDispatchVale = (orderId: string) => {
    dispatchWarehouseTicket(orderId);
    showAlert(`Vale de almacén despachado y validado en ventanilla.`);
  };

  const handleSendEmail = (invoiceId: string) => {
    sendInvoiceEmail(invoiceId);
    showAlert(`Comprobante fiscal CFDI 4.0 enviado por correo electrónico al cliente.`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 shrink-0 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Módulo 3
              </span>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Facturación Fiscal y Control de Caja
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Liquidación de órdenes de cobro, emisión de tickets térmicos, vales de salida de almacén y timbrado CFDI 4.0.
            </p>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveSubTab('caja')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeSubTab === 'caja'
                  ? 'bg-white text-[#002855] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Caja y Cobro ({pendingCount})
            </button>
            <button
              onClick={() => setActiveSubTab('facturacion')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeSubTab === 'facturacion'
                  ? 'bg-white text-[#002855] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Facturación CFDI ({invoicedCount})
            </button>
            <button
              onClick={() => setActiveSubTab('vales')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeSubTab === 'vales'
                  ? 'bg-white text-[#002855] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vales de Almacén
            </button>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3">
            <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Pendientes de Cobro</p>
            <p className="text-xl font-black text-amber-900">{pendingCount} órdenes</p>
          </div>
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3">
            <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Cobrados Hoy</p>
            <p className="text-xl font-black text-emerald-900">{paidCount} órdenes</p>
          </div>
          <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3">
            <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">Facturas CFDI 4.0</p>
            <p className="text-xl font-black text-blue-900">{invoicedCount} timbradas</p>
          </div>
          <div className="bg-purple-50/70 border border-purple-200 rounded-lg p-3">
            <p className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">Total Facturado</p>
            <p className="text-xl font-black text-purple-900">
              ${invoices.reduce((s, i) => s + i.total, 0).toLocaleString()} MXN
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 space-y-4">
        {/* Notification Toast */}
        {alertMessage && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-lg flex items-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold">{alertMessage}</span>
          </div>
        )}

        {/* Tab 1: Caja y Cobro */}
        {activeSubTab === 'caja' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por orden (COB), OS o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                />
              </div>

              <div className="flex items-center gap-2">
                {(['Todos', 'Pendiente de Pago', 'Pagado', 'Facturado'] as const).map(st => (
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

            {/* List of Billing Orders */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Órdenes de Caja ({filteredBillingOrders.length})
                </h2>
                <span className="text-[11px] text-slate-500">
                  Generadas automáticamente al finalizar reparaciones en taller o ventas de mostrador
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredBillingOrders.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                    No se encontraron órdenes de cobro con los filtros seleccionados.
                  </div>
                ) : (
                  filteredBillingOrders.map((bo) => {
                    const isPending = bo.status === 'Pendiente de Pago';
                    const isPaid = bo.status === 'Pagado';
                    const isFacturado = bo.status === 'Facturado';

                    return (
                      <div key={bo.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        {/* Order Info */}
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                              {bo.id}
                            </span>
                            <span className="font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              Ref: {bo.referenceId}
                            </span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                              bo.sourceType === 'Taller' ? 'bg-indigo-100 text-indigo-800' : 'bg-teal-100 text-teal-800'
                            }`}>
                              Origen: {bo.sourceType}
                            </span>
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                              isPending ? 'bg-amber-100 text-amber-800' :
                              isPaid ? 'bg-emerald-100 text-emerald-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {bo.status}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-slate-900">
                            {bo.clientName}
                          </h3>

                          <p className="text-xs text-slate-500">
                            {bo.itemsSummary}
                          </p>

                          {bo.paymentMethod && (
                            <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Pagado con {bo.paymentMethod} el {bo.paidAt}
                            </p>
                          )}
                        </div>

                        {/* Amounts */}
                        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4 lg:gap-0.5 text-right w-full lg:w-auto border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100 shrink-0">
                          <div className="text-xs text-slate-500">
                            Subtotal: ${bo.subtotal.toLocaleString()} + IVA: ${bo.taxIva.toLocaleString()}
                          </div>
                          <div className="text-base font-black text-slate-900">
                            Total: ${bo.total.toLocaleString()} MXN
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100">
                          {isPending && (
                            <button
                              onClick={() => handleOpenPay(bo)}
                              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all cursor-pointer"
                            >
                              <Banknote className="w-3.5 h-3.5" />
                              <span>Cobrar Orden</span>
                            </button>
                          )}

                          {(isPaid || isFacturado) && (
                            <>
                              <button
                                onClick={() => setShowTicketModal(bo)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                                title="Ver e imprimir ticket de caja"
                              >
                                <Printer className="w-3.5 h-3.5 text-slate-600" />
                                <span>Ticket</span>
                              </button>

                              {!isFacturado && (
                                <button
                                  onClick={() => handleOpenInvoice(bo)}
                                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#002855] hover:bg-blue-900 rounded-lg shadow-sm transition-all cursor-pointer"
                                  title="Generar Factura Fiscal Electrónica CFDI 4.0"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Emitir CFDI 4.0</span>
                                </button>
                              )}

                              {isFacturado && (
                                <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 flex items-center gap-1">
                                  <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                                  <span>{bo.invoiceId}</span>
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Facturación CFDI 4.0 */}
        {activeSubTab === 'facturacion' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Emisor Fiscal Configurado</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  TALLERES DIESEL MASTER DEL NORTE S.A. DE C.V. | RFC: TDM180420AA1 | Régimen: 601 General de Ley
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Conexión SAT / PAC: Activa (CFDI v4.0)
                </span>
              </div>
            </div>

            {/* List of Issued Invoices */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Historial de Facturas Emitidas ({invoices.length})
                </h2>
              </div>

              <div className="divide-y divide-slate-100">
                {invoices.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                    No se han emitido facturas aún. Puedes facturar cualquier orden cobrada desde la pestaña "Caja y Cobro".
                  </div>
                ) : (
                  invoices.map((inv) => (
                    <div key={inv.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-slate-900 bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200">
                            {inv.folio}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            UUID: {inv.uuid}
                          </span>
                          <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                            Timbrada SAT
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900">
                          {inv.clientName} <span className="text-xs font-mono font-normal text-slate-500">({inv.rfc})</span>
                        </h4>

                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3">
                          <span>Uso CFDI: {inv.usoCfdi}</span>
                          <span>•</span>
                          <span>Régimen: {inv.regimenFiscal}</span>
                          <span>•</span>
                          <span>Forma: {inv.paymentForm}</span>
                          <span>•</span>
                          <span>Fecha: {inv.date}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs text-slate-500">Subtotal: ${inv.subtotal.toLocaleString()} + IVA: ${inv.taxIva.toLocaleString()}</div>
                        <div className="text-base font-black text-slate-900">${inv.total.toLocaleString()} MXN</div>
                      </div>

                      {/* Download & Email buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleSendEmail(inv.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                            inv.sentByEmail
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-white text-[#002855] border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{inv.sentByEmail ? 'Reenviar Correo' : 'Enviar Correo'}</span>
                        </button>

                        <button
                          onClick={() => {
                            const blob = new Blob([inv.xmlData], { type: 'application/xml' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${inv.folio}_${inv.rfc}.xml`;
                            a.click();
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="Descargar XML CFDI 4.0 timbrado"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>XML</span>
                        </button>

                        <button
                          onClick={() => {
                            window.print();
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#002855] hover:bg-blue-900 rounded-lg shadow-sm transition-all cursor-pointer"
                          title="Descargar Representación Impresa en PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Vales de Almacén */}
        {activeSubTab === 'vales' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Vales de Entrega de Refacciones en Ventanilla
                </h2>
                <span className="text-[11px] text-slate-500">
                  Control de salida física de repuestos autorizados tras confirmación de pago
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {billingOrders.filter(b => b.status !== 'Pendiente de Pago').map((bo) => (
                  <div key={bo.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {bo.warehouseVoucherNumber || `VALE-${bo.id}`}
                        </span>
                        <span className="text-xs font-bold text-blue-700">
                          Orden Ref: {bo.id} ({bo.referenceId})
                        </span>
                        <span className="text-xs text-slate-600">
                          • Cliente: <strong>{bo.clientName}</strong>
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        <strong>Material / Refacciones amparadas:</strong> {bo.itemsSummary}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {bo.dispatchedInWarehouse ? (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Entregado en Almacén</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDispatchVale(bo.id)}
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer"
                        >
                          <Boxes className="w-3.5 h-3.5" />
                          <span>Despachar Vale en Ventanilla</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: COBRO Y LIQUIDACIÓN */}
      {showPayModal && selectedBillingOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">Cobro y Liquidación de Caja</h3>
              </div>
              <button 
                onClick={() => setShowPayModal(false)}
                className="text-slate-300 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Folio de Cobro:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedBillingOrder.id}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Referencia:</span>
                  <span className="font-bold text-slate-800">{selectedBillingOrder.referenceId}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Cliente:</span>
                  <span className="font-bold text-slate-800">{selectedBillingOrder.clientName}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total a Liquidar:</span>
                  <span className="text-emerald-700">${selectedBillingOrder.total.toLocaleString()} MXN</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Método de Pago *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Efectivo', 'Tarjeta', 'Transferencia'] as const).map(method => (
                    <button
                      type="button"
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-2 text-xs font-bold rounded-lg border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        paymentMethod === method 
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-black ring-2 ring-emerald-500' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {method === 'Efectivo' && <Banknote className="w-4 h-4 text-emerald-600" />}
                      {method === 'Tarjeta' && <CreditCard className="w-4 h-4 text-blue-600" />}
                      {method === 'Transferencia' && <ArrowRightLeft className="w-4 h-4 text-purple-600" />}
                      <span>{method}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Monto Recibido</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentReceivedAmount}
                    onChange={(e) => setPaymentReceivedAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition-all cursor-pointer"
                >
                  Confirmar Cobro e Imprimir Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EMITIR FACTURA CFDI 4.0 */}
      {showInvoiceModal && selectedBillingOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="bg-[#002855] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-blue-300" />
                <h3 className="font-bold text-base">Emisión de Factura Fiscal (CFDI 4.0)</h3>
              </div>
              <button 
                onClick={() => setShowInvoiceModal(false)}
                className="text-slate-300 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateInvoice} className="p-6 space-y-3 overflow-y-auto">
              <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-200 text-xs text-blue-950 flex justify-between">
                <div>
                  <span className="font-semibold">Monto a Facturar:</span>
                  <p className="text-base font-black text-[#002855]">${selectedBillingOrder.total.toLocaleString()} MXN</p>
                </div>
                <div className="text-right">
                  <span className="font-semibold">Orden Ref:</span>
                  <p className="font-mono font-bold text-slate-700">{selectedBillingOrder.id}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">RFC del Receptor *</label>
                <input
                  type="text"
                  required
                  placeholder="XAXX010101000"
                  value={rfc}
                  onChange={(e) => setRfc(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs font-mono font-bold uppercase border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre o Razón Social *</label>
                <input
                  type="text"
                  required
                  placeholder="Empresa o Persona Física"
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Código Postal Fiscal</label>
                  <input
                    type="text"
                    required
                    placeholder="64000"
                    value={codigoPostal}
                    onChange={(e) => setCodigoPostal(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Forma de Pago SAT</label>
                  <select
                    value={formaPago}
                    onChange={(e) => setFormaPago(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="01 - Efectivo">01 - Efectivo</option>
                    <option value="03 - Transferencia electrónica">03 - Transferencia</option>
                    <option value="04 - Tarjeta de crédito">04 - Tarjeta de crédito</option>
                    <option value="28 - Tarjeta de débito">28 - Tarjeta de débito</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Régimen Fiscal Receptor</label>
                <select
                  value={regimenFiscal}
                  onChange={(e) => setRegimenFiscal(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="601 - General de Ley Personas Morales">601 - General de Ley Personas Morales</option>
                  <option value="612 - Personas Físicas con Actividades Empresariales y Profesionales">612 - Personas Físicas Act. Empresariales</option>
                  <option value="626 - Régimen Simplificado de Confianza (RESICO)">626 - RESICO</option>
                  <option value="616 - Sin obligaciones fiscales">616 - Sin obligaciones fiscales</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Uso de CFDI</label>
                <select
                  value={usoCfdi}
                  onChange={(e) => setUsoCfdi(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="G03 - Gastos en general">G03 - Gastos en general</option>
                  <option value="G01 - Adquisición de mercancías">G01 - Adquisición de mercancías</option>
                  <option value="CP01 - Pagos">CP01 - Pagos</option>
                  <option value="S01 - Sin efectos fiscales">S01 - Sin efectos fiscales</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Correo para Envío de Factura (PDF y XML)</label>
                <input
                  type="email"
                  required
                  placeholder="facturas@cliente.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#002855] hover:bg-blue-900 rounded-lg shadow transition-all cursor-pointer"
                >
                  Timbrar y Generar Factura CFDI 4.0
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TICKET DE CAJA / COMPROBANTE TÉRMICO */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider">Ticket de Caja</h3>
              </div>
              <button 
                onClick={() => setShowTicketModal(null)}
                className="text-slate-400 hover:text-white text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 font-mono text-xs space-y-3 bg-slate-50 text-slate-800">
              <div className="text-center border-b border-dashed border-slate-300 pb-3">
                <p className="font-black text-sm text-slate-900">DIESEL MASTER DEL NORTE</p>
                <p className="text-[10px] text-slate-500">Taller y Refacciones Especializadas</p>
                <p className="text-[10px] text-slate-500">RFC: TDM180420AA1</p>
                <p className="text-[10px] text-slate-500">Monterrey, N.L. Tel: 81 8300 0000</p>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>FOLIO TICKET:</span>
                  <span className="font-bold">{showTicketModal.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>ORDEN / REF:</span>
                  <span>{showTicketModal.referenceId}</span>
                </div>
                <div className="flex justify-between">
                  <span>FECHA:</span>
                  <span>{showTicketModal.paidAt || new Date().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>CLIENTE:</span>
                  <span className="font-bold truncate max-w-[150px]">{showTicketModal.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span>PAGO:</span>
                  <span className="font-bold">{showTicketModal.paymentMethod || 'Efectivo'}</span>
                </div>
              </div>

              <div className="border-t border-b border-dashed border-slate-300 py-2 my-2 space-y-1">
                <div className="text-[10px] font-bold text-slate-600">CONCEPTO:</div>
                <div className="text-[11px] text-slate-700">{showTicketModal.itemsSummary}</div>
              </div>

              <div className="space-y-1 text-right text-[11px]">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>${showTicketModal.subtotal.toLocaleString()} MXN</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (16%):</span>
                  <span>${showTicketModal.taxIva.toLocaleString()} MXN</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-slate-300">
                  <span>TOTAL PAGADO:</span>
                  <span>${showTicketModal.total.toLocaleString()} MXN</span>
                </div>
              </div>

              <div className="text-center pt-3 text-[10px] text-slate-500 border-t border-dashed border-slate-300">
                <p>¡Gracias por su preferencia!</p>
                <p>Garantía de servicio: 90 días o 10,000 km</p>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
