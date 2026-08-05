import React, { useState } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
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
    <div className="flex-1 p-4 md:p-6 bg-[#050505] overflow-y-auto min-h-0 space-y-6">
      {/* MODULE 1: RECEPCIÓN E INGRESO DE VEHÍCULOS */}
      {activeTab === 'recepcion' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* New Vehicle Order Form */}
          <div className="lg:col-span-7 bg-[#0c0c0c] border border-white/10 p-5 rounded-md space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-500" />
              <span>Registro de Ingreso de Unidad Diesel</span>
            </h2>

            <form onSubmit={handleCreateOS} className="space-y-4">
              {/* Vehicle Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Marca</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-black border border-white/10 px-3 py-1.5 text-xs text-white rounded focus:border-amber-500 outline-none"
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
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Modelo / Motor</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="T680 Cummins ISX"
                    className="w-full bg-black border border-white/10 px-3 py-1.5 text-xs text-white rounded focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Placas</label>
                  <input
                    type="text"
                    required
                    value={plates}
                    onChange={(e) => setPlates(e.target.value.toUpperCase())}
                    placeholder="ABC-1234"
                    className="w-full bg-black border border-white/10 px-3 py-1.5 text-xs text-white font-mono rounded focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Número de Serie (VIN)</label>
                  <input
                    type="text"
                    value={vin}
                    onChange={(e) => setVin(e.target.value.toUpperCase())}
                    placeholder="1XKDDB9X..."
                    className="w-full bg-black border border-white/10 px-3 py-1.5 text-xs text-white font-mono rounded focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Kilometraje / Horas</label>
                  <input
                    type="text"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    placeholder="320,000 KM"
                    className="w-full bg-black border border-white/10 px-3 py-1.5 text-xs text-white font-mono rounded focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Asignar Técnico</label>
                  <select
                    value={techId}
                    onChange={(e) => setTechId(e.target.value)}
                    className="w-full bg-black border border-white/10 px-3 py-1.5 text-xs text-amber-400 font-bold rounded focus:border-amber-500 outline-none"
                  >
                    {technicians.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Cliente / Empresa</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Transportes Logísticos S.A."
                    className="w-full bg-black border border-white/10 px-3 py-1.5 text-xs text-white rounded focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Teléfono WhatsApp / SMS</label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+52 81 1234 5678"
                    className="w-full bg-black border border-white/10 px-3 py-1.5 text-xs text-white font-mono rounded focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Checklist Físico Express */}
              <div className="pt-2 border-t border-white/5 space-y-2">
                <label className="text-[10px] font-bold text-slate-300 uppercase block">Checklist Físico Inicial de Recepción</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <span className="text-[11px] text-slate-300">Aceite Motor</span>
                    <select value={chkOil} onChange={(e) => setChkOil(e.target.value as any)} className="bg-black text-[10px] px-1 py-0.5 rounded border border-white/10 text-amber-400">
                      <option value="ok">OK</option>
                      <option value="fail">FALLA</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <span className="text-[11px] text-slate-300">Frenos Aire</span>
                    <select value={chkBrakes} onChange={(e) => setChkBrakes(e.target.value as any)} className="bg-black text-[10px] px-1 py-0.5 rounded border border-white/10 text-amber-400">
                      <option value="ok">OK</option>
                      <option value="fail">FALLA</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <span className="text-[11px] text-slate-300">Neumáticos</span>
                    <select value={chkTires} onChange={(e) => setChkTires(e.target.value as any)} className="bg-black text-[10px] px-1 py-0.5 rounded border border-white/10 text-amber-400">
                      <option value="ok">OK</option>
                      <option value="fail">FALLA</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <span className="text-[11px] text-slate-300">Luces / Tablero</span>
                    <select value={chkLights} onChange={(e) => setChkLights(e.target.value as any)} className="bg-black text-[10px] px-1 py-0.5 rounded border border-white/10 text-amber-400">
                      <option value="ok">OK</option>
                      <option value="fail">FALLA</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <span className="text-[11px] text-slate-300">Turbo / Intercooler</span>
                    <select value={chkTurbo} onChange={(e) => setChkTurbo(e.target.value as any)} className="bg-black text-[10px] px-1 py-0.5 rounded border border-white/10 text-amber-400">
                      <option value="ok">OK</option>
                      <option value="fail">FALLA</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Fault description */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Motivo de Falla / Trabajo Solicitado</label>
                <textarea
                  required
                  rows={2}
                  value={faultReason}
                  onChange={(e) => setFaultReason(e.target.value)}
                  placeholder="Describa la falla reportada por el chofer o cliente..."
                  className="w-full bg-black border border-white/10 p-2 text-xs text-white rounded focus:border-amber-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-black py-2.5 text-xs font-bold uppercase rounded shadow transition-all cursor-pointer"
              >
                Generar Orden de Servicio (OS)
              </button>
            </form>
          </div>

          {/* Active Orders List */}
          <div className="lg:col-span-5 bg-[#0c0c0c] border border-white/10 p-5 rounded-md flex flex-col">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-4">
              Órdenes Registradas en Sistema
            </h2>

            <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1">
              {orders.map((o) => (
                <div key={o.id} className="p-3 bg-white/5 border border-white/5 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-amber-500 text-xs">{o.id}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">{o.vehicle.plates}</span>
                  </div>
                  <p className="text-xs font-bold text-white">{o.vehicle.brand} {o.vehicle.model}</p>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{o.faultReason}</p>
                  <div className="flex items-center justify-between text-[10px] pt-2 border-t border-white/5">
                    <span className="text-slate-400">Técnico: <strong className="text-slate-200">{o.assignedTechnicianName}</strong></span>
                    <span className="text-amber-400 font-mono font-bold">${o.estimatedCost.toLocaleString('es-MX')}</span>
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
            <div className="lg:col-span-8 bg-[#0c0c0c] border border-white/10 p-5 rounded-md space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                    Cotizador de Mano de Obra y Repuestos
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-slate-400 uppercase">Seleccionar OS:</label>
                  <select
                    value={selectedOSId}
                    onChange={(e) => setSelectedOSId(e.target.value)}
                    className="bg-black border border-white/10 text-amber-500 font-mono font-bold text-xs px-2 py-1 rounded"
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
                  <div className="p-3 bg-white/5 border border-white/5 rounded flex justify-between items-center text-xs">
                    <div>
                      <p className="text-white font-bold">{currentSelectedOS.vehicle.brand} {currentSelectedOS.vehicle.model} ({currentSelectedOS.vehicle.plates})</p>
                      <p className="text-[10px] text-slate-400">Cliente: {currentSelectedOS.vehicle.clientName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase">Estatus Presupuesto</p>
                      <p className={`font-bold ${currentSelectedOS.clientApproved ? 'text-emerald-400' : currentSelectedOS.clientApproved === false ? 'text-red-400' : 'text-amber-400'}`}>
                        {currentSelectedOS.clientApproved ? 'APROBADO' : currentSelectedOS.clientApproved === false ? 'RECHAZADO' : 'PENDIENTE DE VALIDACIÓN'}
                      </p>
                    </div>
                  </div>

                  {/* Add Parts / Labor forms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Add Part Form */}
                    <form onSubmit={handleAddPartToQuote} className="p-3 bg-black border border-white/10 rounded space-y-2">
                      <p className="text-[10px] font-bold text-amber-500 uppercase">Cargar Refacción de Inventario</p>
                      <select
                        value={selectedPartCode}
                        onChange={(e) => setSelectedPartCode(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 p-1.5 text-xs text-white rounded"
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
                          className="w-20 bg-white/5 border border-white/10 p-1.5 text-xs font-mono text-white rounded"
                        />
                        <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase rounded py-1.5">
                          + Agregar Refacción
                        </button>
                      </div>
                    </form>

                    {/* Add Labor Form */}
                    <form onSubmit={handleAddLaborToQuote} className="p-3 bg-black border border-white/10 rounded space-y-2">
                      <p className="text-[10px] font-bold text-blue-400 uppercase">Cargar Mano de Obra</p>
                      <input
                        type="text"
                        required
                        value={laborDesc}
                        onChange={(e) => setLaborDesc(e.target.value)}
                        placeholder="Descripción de maniobra..."
                        className="w-full bg-white/5 border border-white/10 p-1.5 text-xs text-white rounded"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          step="0.5"
                          value={laborHours}
                          onChange={(e) => setLaborHours(e.target.value)}
                          placeholder="Hrs"
                          className="bg-white/5 border border-white/10 p-1.5 text-xs font-mono text-white rounded"
                        />
                        <input
                          type="number"
                          value={laborRate}
                          onChange={(e) => setLaborRate(e.target.value)}
                          placeholder="$ Tarifa/Hr"
                          className="bg-white/5 border border-white/10 p-1.5 text-xs font-mono text-white rounded"
                        />
                      </div>
                      <button type="submit" className="w-full bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold uppercase rounded py-1.5">
                        + Agregar Mano de Obra
                      </button>
                    </form>
                  </div>

                  {/* Budget Itemized Breakdown */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Desglose del Presupuesto Actual</p>
                    
                    <div className="space-y-1">
                      {currentSelectedOS.parts.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs p-2 bg-white/5 rounded">
                          <span className="text-slate-300 font-mono">[REF] {p.name} (x{p.quantity})</span>
                          <span className="text-amber-400 font-mono font-bold">${(p.quantity * p.unitPrice).toLocaleString('es-MX')}</span>
                        </div>
                      ))}
                      {currentSelectedOS.labor.map((l, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs p-2 bg-white/5 rounded">
                          <span className="text-slate-300">[MO] {l.description} ({l.hours} hrs @ ${l.hourlyRate}/hr)</span>
                          <span className="text-blue-400 font-mono font-bold">${(l.hours * l.hourlyRate).toLocaleString('es-MX')}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center p-3 bg-amber-500/10 border border-amber-500/30 rounded text-xs mt-3">
                      <span className="font-bold text-white uppercase">Costo Total Cotizado:</span>
                      <span className="font-mono text-lg font-bold text-amber-500">${currentSelectedOS.estimatedCost.toLocaleString('es-MX')} MXN</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Tracking Link Generator Box */}
            <div className="lg:col-span-4 bg-amber-500 p-5 rounded-md text-black flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Link de Seguimiento Cliente
                </h3>
                <p className="text-[11px] leading-snug mb-4 font-medium opacity-90">
                  Comparta este enlace único por WhatsApp o SMS para que el cliente supervise fotos de evidencia y apruebe la cotización en vivo.
                </p>

                {currentSelectedOS && (
                  <div className="space-y-3">
                    <div className="p-3 bg-black/10 border border-black/10 rounded font-mono text-xs">
                      <p className="text-[10px] font-bold uppercase opacity-60">Enlace Externo Generado:</p>
                      <p className="text-black font-bold break-all mt-1">taller.diesel/track/{currentSelectedOS.trackingToken}</p>
                    </div>

                    <button
                      onClick={() => copyTrackingLink(currentSelectedOS.trackingToken)}
                      className="w-full bg-black hover:bg-slate-900 text-white py-2.5 px-3 rounded text-xs font-bold uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      {copiedToken === currentSelectedOS.trackingToken ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
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

              <div className="mt-6 pt-4 border-t border-black/10 text-[10px] font-bold opacity-75 uppercase">
                ✓ Sin necesidad de instalar app o registrar contraseña para el cliente.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 3: ENTREGA Y CIERRE DE ÓRDENES */}
      {activeTab === 'entrega' && (
        <div className="space-y-6">
          <div className="bg-[#0c0c0c] border border-white/10 p-5 rounded-md">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Liquidación, Cierre de Órdenes y Garantías</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((o) => (
                <div key={o.id} className="p-4 bg-white/5 border border-white/5 rounded-md flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono text-amber-500 font-bold text-xs">{o.id}</span>
                      <span className={`status-pill ${o.paymentStatus === 'liquidado' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {o.paymentStatus.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-white">{o.vehicle.brand} {o.vehicle.model}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">{o.vehicle.plates} • {o.vehicle.clientName}</p>

                    <div className="mt-2 p-2 bg-black/40 rounded text-xs space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Total a Liquidar:</span>
                        <span className="font-mono text-amber-500 font-bold">${o.estimatedCost.toLocaleString('es-MX')}</span>
                      </div>
                    </div>
                  </div>

                  {o.paymentStatus === 'pendiente' ? (
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <label className="text-[10px] text-slate-400 uppercase block">Método de Cobro:</label>
                      <select
                        value={settleMethod}
                        onChange={(e) => setSettleMethod(e.target.value as any)}
                        className="w-full bg-black border border-white/10 text-xs text-white p-1.5 rounded"
                      >
                        <option value="Transferencia">Transferencia Bancaria</option>
                        <option value="Tarjeta">Tarjeta de Débito/Crédito</option>
                        <option value="Efectivo">Efectivo en Caja</option>
                      </select>

                      <button
                        onClick={() => liquidateOrderPayment(o.id, settleMethod)}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-2 text-xs font-bold uppercase rounded"
                      >
                        Liquidar y Entregar Unidad
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <p className="text-[10px] text-emerald-400 font-bold uppercase">✓ Servicio Pagado y Garantía Emitida</p>
                      <button
                        onClick={() => setShowReceiptModal(o)}
                        className="w-full border border-white/10 hover:border-amber-500 text-white py-1.5 text-xs font-bold uppercase rounded flex items-center justify-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-500" />
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
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#0c0c0c] border border-white/20 p-6 rounded-lg max-w-md w-full space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500">Póliza de Garantía & Ticket OS</h3>
                  <button onClick={() => setShowReceiptModal(null)} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <div className="bg-black p-4 border border-white/10 font-mono text-xs space-y-2">
                  <div className="text-center border-b border-white/10 pb-2">
                    <p className="font-bold text-white text-sm">TALLER DIESEL HEAVY DUTY</p>
                    <p className="text-[10px] text-slate-400">RFC: TDI-890123-HD1 • Monterrey, N.L.</p>
                  </div>

                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Folio OS:</span>
                    <span className="text-white font-bold">{showReceiptModal.id}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Cliente:</span>
                    <span className="text-white">{showReceiptModal.vehicle.clientName}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Unidad / Placa:</span>
                    <span className="text-white">{showReceiptModal.vehicle.brand} ({showReceiptModal.vehicle.plates})</span>
                  </div>

                  <div className="border-t border-b border-white/10 py-2 space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase">Mano de obra y refacciones:</p>
                    {showReceiptModal.parts.map((p, idx) => (
                      <div key={idx} className="flex justify-between text-[10px] text-slate-300">
                        <span>{p.name} x{p.quantity}</span>
                        <span>${(p.quantity * p.unitPrice).toLocaleString('es-MX')}</span>
                      </div>
                    ))}
                    {showReceiptModal.labor.map((l, idx) => (
                      <div key={idx} className="flex justify-between text-[10px] text-slate-300">
                        <span>{l.description}</span>
                        <span>${(l.hours * l.hourlyRate).toLocaleString('es-MX')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between font-bold text-sm text-amber-500 pt-1">
                    <span>TOTAL PAGADO:</span>
                    <span>${showReceiptModal.estimatedCost.toLocaleString('es-MX')} MXN</span>
                  </div>

                  <div className="pt-2 border-t border-white/10 text-[9px] text-slate-400 text-center italic">
                    {showReceiptModal.warrantyDetails}
                  </div>
                </div>

                <button
                  onClick={() => setShowReceiptModal(null)}
                  className="w-full bg-amber-500 text-black py-2 text-xs font-bold uppercase rounded"
                >
                  Cerrar Impresión
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
