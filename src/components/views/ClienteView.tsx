import React, { useState } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import { OSStatus } from '../../types';
import { 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Check, 
  X, 
  ExternalLink,
  ShieldCheck,
  FileCheck2
} from 'lucide-react';

interface ClienteViewProps {
  activeTab: string;
}

export const ClienteView: React.FC<ClienteViewProps> = () => {
  const { orders, updateOrderBudgetApproval } = useWorkshop();

  // Selected Order by Token
  const [activeToken, setActiveToken] = useState<string>(orders[0]?.trackingToken || 'OS-9283-TRK');

  const currentOrder = orders.find(o => o.trackingToken === activeToken) || orders[0];

  if (!currentOrder) {
    return (
      <div className="flex-1 p-8 text-center text-slate-500 bg-[#050505]">
        No se encontró la orden de servicio correspondiente al enlace.
      </div>
    );
  }

  const stepsList: { status: OSStatus; label: string }[] = [
    { status: 'Diagnóstico', label: '1. Diagnóstico' },
    { status: 'En Proceso', label: '2. En Reparación' },
    { status: 'Esperando Refacción', label: '3. Repuestos' },
    { status: 'Prueba de Manejo', label: '4. Prueba Calidad' },
    { status: 'Listo para Entrega', label: '5. Listo Entrega' }
  ];

  const currentStepIndex = stepsList.findIndex(s => s.status === currentOrder.status);

  return (
    <div className="flex-1 bg-[#050505] p-4 md:p-8 overflow-y-auto min-h-0 space-y-6 max-w-5xl mx-auto w-full">
      {/* Top Banner: Token Selector Simulator for Web Portal */}
      <div className="p-3 bg-[#0c0c0c] border border-amber-500/30 rounded-md flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <ExternalLink className="w-4 h-4 text-amber-500" />
          <span>Acceso por Enlace Único (Sin inicio de sesión):</span>
          <span className="font-mono text-amber-500 font-bold">taller.diesel/track/{activeToken}</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[10px] text-slate-400 uppercase">Cambiar Folio de Prueba:</label>
          <select
            value={activeToken}
            onChange={(e) => setActiveToken(e.target.value)}
            className="bg-black border border-white/10 text-xs text-white p-1 rounded font-mono"
          >
            {orders.map(o => (
              <option key={o.id} value={o.trackingToken}>{o.id} - {o.vehicle.brand} ({o.vehicle.plates})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Vehicle Summary Header Card */}
      <div className="bg-[#0c0c0c] border border-white/10 p-6 rounded-md space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-1">
              Portal de Tracking de Unidad Diesel
            </span>
            <h1 className="text-xl font-bold text-white">
              {currentOrder.vehicle.brand} {currentOrder.vehicle.model} ({currentOrder.vehicle.year || '2021'})
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Placas: <strong className="text-white">{currentOrder.vehicle.plates}</strong> • VIN: {currentOrder.vehicle.vin}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 uppercase block">Propietario / Empresa</span>
            <span className="text-xs font-bold text-white">{currentOrder.vehicle.clientName}</span>
          </div>
        </div>

        {/* Live Status Progress Bar */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase">Estado Actual del Servicio:</span>
            <span className="font-bold text-amber-500 font-mono uppercase bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30">
              {currentOrder.status}
            </span>
          </div>

          {/* Progress bar visualizer */}
          <div className="grid grid-cols-5 gap-1.5 pt-2">
            {stepsList.map((stepObj, idx) => {
              const isPassed = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={idx} className="space-y-1">
                  <div className={`h-2 rounded-full transition-all ${
                    isCurrent ? 'bg-amber-500 animate-pulse' :
                    isPassed ? 'bg-emerald-500' : 'bg-white/10'
                  }`} />
                  <p className={`text-[9px] uppercase font-bold truncate text-center ${
                    isPassed ? 'text-white' : 'text-slate-600'
                  }`}>
                    {stepObj.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODULE: VISOR DE EVIDENCIA FOTOGRÁFICA Y TÉCNICA */}
      <div className="bg-[#0c0c0c] border border-white/10 p-6 rounded-md space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          <span>Evidencia Técnica en Vivo (Transparencia Total)</span>
        </h2>

        {currentOrder.evidences.length === 0 ? (
          <p className="text-slate-500 text-xs italic py-4 text-center">
            Aún no hay fotografías cargadas por el mecánico asignado.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentOrder.evidences.map((ev) => (
              <div key={ev.id} className="bg-black border border-white/10 rounded overflow-hidden">
                <div className="relative aspect-video">
                  <img src={ev.url} alt={ev.description} className="w-full h-full object-cover" />
                  <span className={`absolute top-2 left-2 px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                    ev.partType === 'dañada' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-black'
                  }`}>
                    Componente {ev.partType}
                  </span>
                </div>
                <div className="p-3 text-xs space-y-1">
                  <p className="text-slate-200 font-medium">{ev.description}</p>
                  <p className="text-[10px] text-slate-500 font-mono">Capturado el {ev.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODULE: APROBACIÓN INTERACTIVA DE PRESUPUESTOS */}
      <div className="bg-[#0c0c0c] border border-white/10 p-6 rounded-md space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-3 gap-2">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-amber-500" />
              <span>Validación y Aprobación de Cotización</span>
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Revise el desglose detallado de mano de obra y refacciones requeridas.
            </p>
          </div>

          <div className="text-right">
            <span className={`status-pill ${
              currentOrder.clientApproved ? 'bg-emerald-500/20 text-emerald-400' :
              currentOrder.clientApproved === false ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {currentOrder.clientApproved ? 'COTIZACIÓN APROBADA' :
               currentOrder.clientApproved === false ? 'RECHAZADA / EN REVISIÓN' : 'PENDIENTE DE TU RESPUESTA'}
            </span>
          </div>
        </div>

        {/* Itemized Parts & Labor */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Refacciones Requeridas:</p>
          <div className="space-y-1.5">
            {currentOrder.parts.map((p, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-black border border-white/5 rounded text-xs">
                <div>
                  <p className="text-white font-bold">{p.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono">Clave: {p.code} • Cantidad: x{p.quantity}</p>
                </div>
                <span className="font-mono text-amber-400 font-bold">${(p.quantity * p.unitPrice).toLocaleString('es-MX')}</span>
              </div>
            ))}
          </div>

          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-2">Mano de Obra y Diagnóstico:</p>
          <div className="space-y-1.5">
            {currentOrder.labor.map((l, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-black border border-white/5 rounded text-xs">
                <div>
                  <p className="text-white font-bold">{l.description}</p>
                  <p className="text-[10px] text-slate-500 font-mono">Tiempo estimado: {l.hours} hrs</p>
                </div>
                <span className="font-mono text-blue-400 font-bold">${(l.hours * l.hourlyRate).toLocaleString('es-MX')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total & Action Buttons */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Total General Cotizado:</p>
            <p className="text-2xl font-mono text-amber-500 font-bold mt-0.5">
              ${currentOrder.estimatedCost.toLocaleString('es-MX')} MXN
            </p>
            <p className="text-[10px] text-slate-500">Incluye mano de obra calificada y garantía de repuestos.</p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => updateOrderBudgetApproval(currentOrder.id, false)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 px-5 py-2.5 rounded text-xs font-bold uppercase transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Rechazar / Solicitar Ajuste</span>
            </button>

            <button
              onClick={() => updateOrderBudgetApproval(currentOrder.id, true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 rounded text-xs font-bold uppercase shadow transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Aprobar Presupuesto Digital</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
