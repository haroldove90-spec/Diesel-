import React, { useState } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import { WorkOrderModule } from './WorkOrderModule';
import { CitasModule } from '../modules/CitasModule';
import { FacturacionCajaModule } from '../modules/FacturacionCajaModule';
import { ContactosModule } from '../modules/ContactosModule';
import { PosModule } from '../modules/PosModule';
import { ServiceOrder } from '../../types';
import { 
  Truck, 
  Plus, 
  FileText, 
  Send, 
  Copy, 
  CheckCircle2, 
  DollarSign, 
  Printer, 
  Check, 
  Share2 
} from 'lucide-react';

interface AsesorViewProps {
  activeTab: string;
}

export const AsesorView: React.FC<AsesorViewProps> = ({ activeTab }) => {
  const { 
    orders, 
    addOrder, 
    inventory, 
    addOrderPart, 
    addOrderLabor, 
    liquidateOrderPayment, 
    users 
  } = useWorkshop();

  // Recepción Form State
  const [brand, setBrand] = useState('Kenworth');
  const [model, setModel] = useState('T680');
  const [plates, setPlates] = useState('');
  const [vin, setVin] = useState('');
  const [mileage, setMileage] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [faultReason, setFaultReason] = useState('');
  const [techId, setTechId] = useState('tech-1');

  // Checklist state
  const [chkOil, setChkOil] = useState<'ok' | 'fail' | 'na'>('ok');
  const [chkBrakes, setChkBrakes] = useState<'ok' | 'fail' | 'na'>('ok');
  const [chkTires, setChkTires] = useState<'ok' | 'fail' | 'na'>('ok');
  const [chkLights, setChkLights] = useState<'ok' | 'fail' | 'na'>('ok');
  const [chkTurbo, setChkTurbo] = useState<'ok' | 'fail' | 'na'>('fail');

  // Quote / Budget builder state
  const [selectedOSId, setSelectedOSId] = useState<string>(orders[0]?.id || '');
  const [selectedPartCode, setSelectedPartCode] = useState(inventory[0]?.code || '');
  const [partQty, setPartQty] = useState('1');
  const [laborDesc, setLaborDesc] = useState('');
  const [laborHours, setLaborHours] = useState('2');
  const [laborRate, setLaborRate] = useState('1100');

  // Link Copied Feedback state
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Settlement state
  const [settleMethod, setSettleMethod] = useState<'Efectivo' | 'Tarjeta' | 'Transferencia'>('Transferencia');
  const [showReceiptModal, setShowReceiptModal] = useState<ServiceOrder | null>(null);

  const technicians = users.filter(u => u.role === 'tecnico');
  const currentSelectedOS = orders.find(o => o.id === selectedOSId) || orders[0];

  const handleCreateOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plates || !clientName) return;

    const assignedTech = users.find(u => u.id === techId);

    const newOS = addOrder({
      vehicle: {
        plates,
        vin: vin || 'N/A',
        brand,
        model,
        mileageOrHours: mileage || '0 KM',
        clientName,
        clientPhone
      },
      faultReason,
      checklist: [
        { id: 'c1', name: 'Nivel / Condición de Aceite de Motor', status: chkOil },
        { id: 'c2', name: 'Sistema de Frenos Neumáticos', status: chkBrakes },
        { id: 'c3', name: 'Estado de Neumáticos y Rin', status: chkTires },
        { id: 'c4', name: 'Luces y Sistema Eléctrico', status: chkLights },
        { id: 'c5', name: 'Presión de Turbo / Mangueras Intercooler', status: chkTurbo }
      ],
      assignedTechnicianId: techId,
      assignedTechnicianName: assignedTech ? assignedTech.name : 'Ricardo M.',
      status: 'Diagnóstico',
      parts: [],
      labor: [],
      evidences: [],
      notes: 'Ingreso registrado en recepción.'
    });

    // Reset Form
    setPlates('');
    setVin('');
    setMileage('');
    setClientName('');
    setClientPhone('');
    setFaultReason('');
    setSelectedOSId(newOS.id);
  };

  const handleAddPartToQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOSId) return;
    const invItem = inventory.find(i => i.code === selectedPartCode);
    if (!invItem) return;

    addOrderPart(selectedOSId, {
      code: invItem.code,
      name: invItem.name,
      quantity: parseInt(partQty) || 1,
      unitPrice: invItem.salePrice,
      status: 'solicitado'
    });
  };

  const handleAddLaborToQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOSId || !laborDesc) return;

    addOrderLabor(selectedOSId, {
      description: laborDesc,
      hours: parseFloat(laborHours) || 1,
      hourlyRate: parseFloat(laborRate) || 1100,
      status: 'pendiente'
    });

    setLaborDesc('');
  };

  const copyTrackingLink = (token: string) => {
    const link = `https://taller.diesel/track/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  return (
    <div className="flex-1 p-4 md:p-6 bg-slate-50 overflow-y-auto min-h-0 space-y-6">
      {/* MODULE 1: RECEPCIÓN E INGRESO DE VEHÍCULOS */}
      {activeTab === 'recepcion' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* New Vehicle Order Form */}
          <div className="lg:col-span-7 bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#002855] flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>Registro de Ingreso de Unidad Diesel</span>
            </h2>

            <form onSubmit={handleCreateOS} className="space-y-4">
              {/* Vehicle Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Marca</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-900 rounded-md focus:border-blue-600 outline-none"
                  >
                    <option value="Kenworth">Kenworth</option>
                    <option value="Freightliner">Freightliner</option>
                    <option value="International">International</option>
                    <option value="Volvo">Volvo</option>
                    <option value="Peterbilt">Peterbilt</option>
                    <option value="Mack">Mack</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Modelo / Motor</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="T680 Cummins ISX"
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-900 rounded-md focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Placas</label>
                  <input
                    type="text"
                    required
                    value={plates}
                    onChange={(e) => setPlates(e.target.value.toUpperCase())}
                    placeholder="ABC-1234"
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-900 font-mono rounded-md focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Número de Serie (VIN)</label>
                  <input
                    type="text"
                    value={vin}
                    onChange={(e) => setVin(e.target.value.toUpperCase())}
                    placeholder="1XKDDB9X..."
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-900 font-mono rounded-md focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Kilometraje / Horas</label>
                  <input
                    type="text"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    placeholder="320,000 KM"
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-900 font-mono rounded-md focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Asignar Técnico</label>
                  <select
                    value={techId}
                    onChange={(e) => setTechId(e.target.value)}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-blue-700 font-bold rounded-md focus:border-blue-600 outline-none"
                  >
                    {technicians.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Cliente / Empresa</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Transportes Logísticos S.A."
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-900 rounded-md focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Teléfono WhatsApp / SMS</label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+52 81 1234 5678"
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-900 font-mono rounded-md focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              {/* Checklist Físico Express */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <label className="text-[10px] font-bold text-slate-700 uppercase block">Checklist Físico Inicial de Recepción</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-md">
                    <span className="text-[11px] text-slate-700 font-medium">Aceite Motor</span>
                    <select value={chkOil} onChange={(e) => setChkOil(e.target.value as any)} className="bg-white text-[10px] px-1 py-0.5 rounded border border-slate-300 text-blue-800 font-bold">
                      <option value="ok">OK</option>
                      <option value="fail">FALLA</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-md">
                    <span className="text-[11px] text-slate-700 font-medium">Frenos Aire</span>
                    <select value={chkBrakes} onChange={(e) => setChkBrakes(e.target.value as any)} className="bg-white text-[10px] px-1 py-0.5 rounded border border-slate-300 text-blue-800 font-bold">
                      <option value="ok">OK</option>
                      <option value="fail">FALLA</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-md">
                    <span className="text-[11px] text-slate-700 font-medium">Neumáticos</span>
                    <select value={chkTires} onChange={(e) => setChkTires(e.target.value as any)} className="bg-white text-[10px] px-1 py-0.5 rounded border border-slate-300 text-blue-800 font-bold">
                      <option value="ok">OK</option>
                      <option value="fail">FALLA</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-md">
                    <span className="text-[11px] text-slate-700 font-medium">Luces / Tablero</span>
                    <select value={chkLights} onChange={(e) => setChkLights(e.target.value as any)} className="bg-white text-[10px] px-1 py-0.5 rounded border border-slate-300 text-blue-800 font-bold">
                      <option value="ok">OK</option>
                      <option value="fail">FALLA</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-md">
                    <span className="text-[11px] text-slate-700 font-medium">Turbo / Intercooler</span>
                    <select value={chkTurbo} onChange={(e) => setChkTurbo(e.target.value as any)} className="bg-white text-[10px] px-1 py-0.5 rounded border border-slate-300 text-blue-800 font-bold">
                      <option value="ok">OK</option>
                      <option value="fail">FALLA</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Fault description */}
              <div>
                <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Motivo de Falla / Trabajo Solicitado</label>
                <textarea
                  required
                  rows={2}
                  value={faultReason}
                  onChange={(e) => setFaultReason(e.target.value)}
                  placeholder="Describa la falla reportada por el chofer o cliente..."
                  className="w-full bg-white border border-slate-300 p-2 text-xs text-slate-900 rounded-md focus:border-blue-600 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#002855] hover:bg-blue-900 text-white py-2.5 text-xs font-bold uppercase rounded-md shadow-sm transition-all cursor-pointer"
              >
                Generar Orden de Servicio (OS)
              </button>
            </form>
          </div>

          {/* Active Orders List */}
          <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-xl flex flex-col shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#002855] mb-4">
              Órdenes Registradas en Sistema
            </h2>

            <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1">
              {orders.map((o) => (
                <div key={o.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-700 text-xs">{o.id}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-600">{o.vehicle.plates}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">{o.vehicle.brand} {o.vehicle.model}</p>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{o.faultReason}</p>
                  <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-200">
                    <span className="text-slate-600 font-medium">Técnico: <strong className="text-slate-900">{o.assignedTechnicianName}</strong></span>
                    <span className="text-blue-700 font-mono font-bold">${o.estimatedCost.toLocaleString('es-MX')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2: PRESUPUESTOS Y COTIZACIONES */}
      {activeTab === 'cotizaciones' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Select OS & Add Items */}
            <div className="lg:col-span-8 bg-white border border-slate-200 p-5 rounded-xl space-y-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#002855]">
                    Cotizador de Mano de Obra y Repuestos
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-slate-600 font-bold uppercase">Seleccionar OS:</label>
                  <select
                    value={selectedOSId}
                    onChange={(e) => setSelectedOSId(e.target.value)}
                    className="bg-white border border-slate-300 text-blue-800 font-mono font-bold text-xs px-2 py-1 rounded-md"
                  >
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>{o.id} - {o.vehicle.brand} ({o.vehicle.plates})</option>
                    ))}
                  </select>
                </div>
              </div>

              {currentSelectedOS && (
                <>
                  {/* Current OS Summary Card */}
                  <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <p className="text-slate-900 font-bold">{currentSelectedOS.vehicle.brand} {currentSelectedOS.vehicle.model} ({currentSelectedOS.vehicle.plates})</p>
                      <p className="text-[10px] text-slate-600 font-medium">Cliente: {currentSelectedOS.vehicle.clientName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-600 uppercase font-bold">Estatus Presupuesto</p>
                      <p className={`font-bold ${currentSelectedOS.clientApproved ? 'text-emerald-700' : currentSelectedOS.clientApproved === false ? 'text-red-700' : 'text-blue-700'}`}>
                        {currentSelectedOS.clientApproved ? 'APROBADO' : currentSelectedOS.clientApproved === false ? 'RECHAZADO' : 'PENDIENTE DE VALIDACIÓN'}
                      </p>
                    </div>
                  </div>

                  {/* Add Parts / Labor forms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Add Part Form */}
                    <form onSubmit={handleAddPartToQuote} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <p className="text-[10px] font-bold text-blue-800 uppercase">Cargar Refacción de Inventario</p>
                      <select
                        value={selectedPartCode}
                        onChange={(e) => setSelectedPartCode(e.target.value)}
                        className="w-full bg-white border border-slate-300 p-1.5 text-xs text-slate-900 rounded-md"
                      >
                        {inventory.map(i => (
                          <option key={i.id} value={i.code}>{i.code} - {i.name} (${i.salePrice})</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          value={partQty}
                          onChange={(e) => setPartQty(e.target.value)}
                          placeholder="Cant."
                          className="w-20 bg-white border border-slate-300 p-1.5 text-xs font-mono text-slate-900 rounded-md"
                        />
                        <button type="submit" className="flex-1 bg-[#002855] hover:bg-blue-900 text-white text-xs font-bold uppercase rounded-md py-1.5 shadow-sm">
                          + Agregar Refacción
                        </button>
                      </div>
                    </form>

                    {/* Add Labor Form */}
                    <form onSubmit={handleAddLaborToQuote} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <p className="text-[10px] font-bold text-blue-600 uppercase">Cargar Mano de Obra</p>
                      <input
                        type="text"
                        required
                        value={laborDesc}
                        onChange={(e) => setLaborDesc(e.target.value)}
                        placeholder="Descripción de maniobra..."
                        className="w-full bg-white border border-slate-300 p-1.5 text-xs text-slate-900 rounded-md"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          step="0.5"
                          value={laborHours}
                          onChange={(e) => setLaborHours(e.target.value)}
                          placeholder="Hrs"
                          className="bg-white border border-slate-300 p-1.5 text-xs font-mono text-slate-900 rounded-md"
                        />
                        <input
                          type="number"
                          value={laborRate}
                          onChange={(e) => setLaborRate(e.target.value)}
                          placeholder="$ Tarifa/Hr"
                          className="bg-white border border-slate-300 p-1.5 text-xs font-mono text-slate-900 rounded-md"
                        />
                      </div>
                      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase rounded-md py-1.5 shadow-sm">
                        + Agregar Mano de Obra
                      </button>
                    </form>
                  </div>

                  {/* Budget Itemized Breakdown */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <p className="text-[10px] font-bold text-slate-600 uppercase">Desglose del Presupuesto Actual</p>
                    
                    <div className="space-y-1">
                      {currentSelectedOS.parts.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs p-2 bg-slate-50 border border-slate-100 rounded-md">
                          <span className="text-slate-700 font-mono">[REF] {p.name} (x{p.quantity})</span>
                          <span className="text-blue-800 font-mono font-bold">${(p.quantity * p.unitPrice).toLocaleString('es-MX')}</span>
                        </div>
                      ))}
                      {currentSelectedOS.labor.map((l, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs p-2 bg-slate-50 border border-slate-100 rounded-md">
                          <span className="text-slate-700">[MO] {l.description} ({l.hours} hrs @ ${l.hourlyRate}/hr)</span>
                          <span className="text-blue-600 font-mono font-bold">${(l.hours * l.hourlyRate).toLocaleString('es-MX')}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs mt-3">
                      <span className="font-bold text-[#002855] uppercase">Costo Total Cotizado:</span>
                      <span className="font-mono text-lg font-bold text-blue-900">${currentSelectedOS.estimatedCost.toLocaleString('es-MX')} MXN</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Tracking Link Generator Box */}
            <div className="lg:col-span-4 bg-[#002855] p-5 rounded-xl text-white flex flex-col justify-between shadow-md">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-300" />
                  Link de Seguimiento Cliente
                </h3>
                <p className="text-[11px] leading-snug mb-4 font-medium text-slate-200">
                  Comparta este enlace único por WhatsApp o SMS para que el cliente supervise fotos de evidencia y apruebe la cotización en vivo.
                </p>

                {currentSelectedOS && (
                  <div className="space-y-3">
                    <div className="p-3 bg-white/10 border border-white/10 rounded-lg font-mono text-xs">
                      <p className="text-[10px] font-bold uppercase text-slate-300">Enlace Externo Generado:</p>
                      <p className="text-white font-bold break-all mt-1">taller.diesel/track/{currentSelectedOS.trackingToken}</p>
                    </div>

                    <button
                      onClick={() => copyTrackingLink(currentSelectedOS.trackingToken)}
                      className="w-full bg-white hover:bg-slate-100 text-[#002855] py-2.5 px-3 rounded-md text-xs font-bold uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                    >
                      {copiedToken === currentSelectedOS.trackingToken ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>¡Enlace Copiado al Portapapeles!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar Link para WhatsApp</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 text-[10px] font-bold text-slate-300 uppercase">
                ✓ Sin necesidad de instalar app o registrar contraseña para el cliente.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 3: ENTREGA Y CIERRE DE ÓRDENES */}
      {activeTab === 'entrega' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#002855] mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Liquidación, Cierre de Órdenes y Garantías</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((o) => (
                <div key={o.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono text-blue-700 font-bold text-xs">{o.id}</span>
                      <span className={`status-pill ${o.paymentStatus === 'liquidado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {o.paymentStatus.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900">{o.vehicle.brand} {o.vehicle.model}</h3>
                    <p className="text-[10px] text-slate-500 font-mono">{o.vehicle.plates} • {o.vehicle.clientName}</p>

                    <div className="mt-2 p-2 bg-white border border-slate-200 rounded-md text-xs space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-600 font-medium">Total a Liquidar:</span>
                        <span className="font-mono text-blue-900 font-bold">${o.estimatedCost.toLocaleString('es-MX')}</span>
                      </div>
                    </div>
                  </div>

                  {o.paymentStatus === 'pendiente' ? (
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <label className="text-[10px] text-slate-600 font-bold uppercase block">Método de Cobro:</label>
                      <select
                        value={settleMethod}
                        onChange={(e) => setSettleMethod(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 text-xs text-slate-900 p-1.5 rounded-md"
                      >
                        <option value="Transferencia">Transferencia Bancaria</option>
                        <option value="Tarjeta">Tarjeta de Débito/Crédito</option>
                        <option value="Efectivo">Efectivo en Caja</option>
                      </select>

                      <button
                        onClick={() => liquidateOrderPayment(o.id, settleMethod)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 text-xs font-bold uppercase rounded-md shadow-sm"
                      >
                        Liquidar y Entregar Unidad
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <p className="text-[10px] text-emerald-700 font-bold uppercase">✓ Servicio Pagado y Garantía Emitida</p>
                      <button
                        onClick={() => setShowReceiptModal(o)}
                        className="w-full border border-slate-300 hover:border-blue-600 text-slate-800 py-1.5 text-xs font-bold uppercase rounded-md flex items-center justify-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5 text-blue-600" />
                        <span>Imprimir Comprobante & Póliza</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Receipt Preview Modal */}
          {showReceiptModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 p-6 rounded-xl max-w-md w-full space-y-4 shadow-2xl text-slate-900">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#002855]">Póliza de Garantía & Ticket OS</h3>
                  <button onClick={() => setShowReceiptModal(null)} className="text-slate-400 hover:text-slate-700">✕</button>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-200 rounded-md font-mono text-xs space-y-2">
                  <div className="text-center border-b border-slate-200 pb-2">
                    <p className="font-bold text-[#002855] text-sm">TSR SONORA - TALLER DIESEL</p>
                    <p className="text-[10px] text-slate-500">RFC: TSR-890123-HD1 • Hermosillo, Sonora</p>
                  </div>

                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Folio OS:</span>
                    <span className="text-slate-900 font-bold">{showReceiptModal.id}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Cliente:</span>
                    <span className="text-slate-900">{showReceiptModal.vehicle.clientName}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Unidad / Placa:</span>
                    <span className="text-slate-900">{showReceiptModal.vehicle.brand} ({showReceiptModal.vehicle.plates})</span>
                  </div>

                  <div className="border-t border-b border-slate-200 py-2 space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase">Mano de obra y refacciones:</p>
                    {showReceiptModal.parts.map((p, idx) => (
                      <div key={idx} className="flex justify-between text-[10px] text-slate-700">
                        <span>{p.name} x{p.quantity}</span>
                        <span>${(p.quantity * p.unitPrice).toLocaleString('es-MX')}</span>
                      </div>
                    ))}
                    {showReceiptModal.labor.map((l, idx) => (
                      <div key={idx} className="flex justify-between text-[10px] text-slate-700">
                        <span>{l.description}</span>
                        <span>${(l.hours * l.hourlyRate).toLocaleString('es-MX')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between font-bold text-sm text-blue-900 pt-1">
                    <span>TOTAL PAGADO:</span>
                    <span>${showReceiptModal.estimatedCost.toLocaleString('es-MX')} MXN</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-[9px] text-slate-500 text-center italic">
                    {showReceiptModal.warrantyDetails}
                  </div>
                </div>

                <button
                  onClick={() => setShowReceiptModal(null)}
                  className="w-full bg-[#002855] text-white py-2 text-xs font-bold uppercase rounded-md shadow-sm"
                >
                  Cerrar Impresión
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODULE: GESTIÓN DE CITAS */}
      {activeTab === 'citas' && (
        <CitasModule isExternalMode={false} />
      )}

      {/* MODULE: FACTURACIÓN Y CAJA */}
      {activeTab === 'facturacion' && (
        <FacturacionCajaModule />
      )}

      {/* MODULE: PUNTO DE VENTA */}
      {activeTab === 'pos' && (
        <PosModule />
      )}

      {/* MODULE: DIRECTORIO DE CLIENTES */}
      {activeTab === 'contactos' && (
        <ContactosModule initialTab="clientes" />
      )}

      {/* MODULE: ORDEN DE TRABAJO */}
      {activeTab === 'ordentrabajo' && (
        <WorkOrderModule />
      )}
    </div>
  );
};
