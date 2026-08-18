import React, { useState } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import { WorkOrderModule } from './WorkOrderModule';
import { HerramientasModule } from '../modules/HerramientasModule';
import { OSStatus } from '../../types';
import { 
  Wrench, 
  Camera, 
  PackagePlus, 
  CheckCircle2, 
  Clock, 
  Upload, 
  Send,
  AlertCircle
} from 'lucide-react';

interface TecnicoViewProps {
  activeTab: string;
}

export const TecnicoView: React.FC<TecnicoViewProps> = ({ activeTab }) => {
  const { 
    orders, 
    updateOrderStatus, 
    updateOrderTechNotes, 
    addOrderEvidence, 
    inventory, 
    addWarehouseRequest, 
    users 
  } = useWorkshop();

  // Selected active technician profile
  const [selectedTechId, setSelectedTechId] = useState<string>('tech-1');

  // Evidence Form State
  const [evOSId, setEvOSId] = useState<string>(orders[0]?.id || '');
  const [evDescription, setEvDescription] = useState('');
  const [evPartType, setEvPartType] = useState<'dañada' | 'nueva'>('dañada');
  const [evPhotoUrl, setEvPhotoUrl] = useState('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80');

  // Tech notes state
  const [techNoteText, setTechNoteText] = useState('');

  // Warehouse Part Request State
  const [reqOSId, setReqOSId] = useState<string>(orders[0]?.id || '');
  const [reqPartCode, setReqPartCode] = useState(inventory[0]?.code || '');
  const [reqQty, setReqQty] = useState('1');
  const [reqSuccessMsg, setReqSuccessMsg] = useState(false);

  const technicians = users.filter(u => u.role === 'tecnico');
  const currentTech = technicians.find(t => t.id === selectedTechId) || technicians[0];

  // Filter orders assigned to this tech
  const assignedOrders = orders.filter(o => o.assignedTechnicianId === selectedTechId || o.assignedTechnicianName === currentTech?.name);

  const timelineSteps: OSStatus[] = [
    'Diagnóstico',
    'En Proceso',
    'Esperando Refacción',
    'Prueba de Manejo',
    'Listo para Entrega',
    'Finalizada'
  ];

  const handleUploadEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evOSId || !evDescription) return;

    addOrderEvidence(evOSId, {
      type: 'photo',
      url: evPhotoUrl,
      description: evDescription,
      partType: evPartType
    });

    setEvDescription('');
  };

  const handleSaveNotes = (e: React.FormEvent, osId: string) => {
    e.preventDefault();
    updateOrderTechNotes(osId, techNoteText);
    setTechNoteText('');
  };

  const handleSendPartRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqOSId || !reqPartCode) return;

    const matchingInv = inventory.find(i => i.code === reqPartCode);
    const itemName = matchingInv ? matchingInv.name : reqPartCode;

    addWarehouseRequest(
      reqOSId,
      reqPartCode,
      itemName,
      parseInt(reqQty) || 1,
      currentTech ? currentTech.name : 'Técnico Diesel'
    );

    setReqSuccessMsg(true);
    setTimeout(() => setReqSuccessMsg(false), 3000);
  };

  return (
    <div className="flex-1 p-4 md:p-6 bg-slate-50 overflow-y-auto min-h-0 space-y-6">
      {/* Top Bar: Switch Active Mechanic Profile */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Mecánico Activo:</span>
          <span className="text-xs font-mono text-blue-800 font-bold">{currentTech?.name} ({currentTech?.specialty})</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[10px] text-slate-600 font-bold uppercase">Cambiar Perfil:</label>
          <select
            value={selectedTechId}
            onChange={(e) => setSelectedTechId(e.target.value)}
            className="bg-white border border-slate-300 text-xs text-slate-900 p-1.5 rounded-md focus:border-blue-600 outline-none"
          >
            {technicians.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* MODULE 1: GESTIÓN DE TRABAJOS ASIGNADOS (PANEL DE TALLER) */}
      {activeTab === 'panel' && (
        <div className="space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#002855]">
            Órdenes de Trabajo Asignadas ({assignedOrders.length} Unidades)
          </h2>

          <div className="space-y-4">
            {assignedOrders.length === 0 ? (
              <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-slate-500 text-xs shadow-sm">
                No hay órdenes asignadas actualmente a este perfil de mecánico.
              </div>
            ) : (
              assignedOrders.map((o) => (
                <div key={o.id} className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-700 text-sm">{o.id}</span>
                        <span className="text-xs font-bold text-slate-900">{o.vehicle.brand} {o.vehicle.model}</span>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 font-bold">{o.vehicle.plates}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1"><strong className="text-slate-800">Falla:</strong> {o.faultReason}</p>
                    </div>

                    <div className="text-right">
                      <span className="status-pill bg-blue-100 text-blue-800">
                        {o.status}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Timeline Step buttons */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      Línea de Tiempo de Reparación (Avanzar Estado):
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {timelineSteps.map((step) => {
                        const isCurrent = o.status === step;
                        return (
                          <button
                            key={step}
                            onClick={() => updateOrderStatus(o.id, step)}
                            className={`p-2 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer border ${
                              isCurrent
                                ? 'bg-[#002855] text-white border-[#002855] shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-500 hover:text-blue-900'
                            }`}
                          >
                            {step}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tech notes section */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-600 uppercase">Bitácora / Notas del Mecánico</span>
                      <span className="text-[10px] font-mono text-blue-800 font-bold">{o.updatedAt}</span>
                    </div>
                    <p className="text-slate-700 italic text-xs">{o.techNotes || 'Sin observaciones técnicas adicionales.'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODULE 2: EVIDENCIA DIGITAL (CAPTURA Y CARGA) */}
      {activeTab === 'evidencia' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Upload Form */}
          <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#002855] flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Carga de Evidencia Fotográfica / Video</span>
            </h2>

            <form onSubmit={handleUploadEvidence} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Orden de Servicio</label>
                <select
                  value={evOSId}
                  onChange={(e) => setEvOSId(e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 text-xs text-blue-800 font-mono font-bold rounded-md"
                >
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>{o.id} - {o.vehicle.brand} ({o.vehicle.plates})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Tipo de Componente</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEvPartType('dañada')}
                    className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md border ${
                      evPartType === 'dañada' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Pieza Dañada
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvPartType('nueva')}
                    className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md border ${
                      evPartType === 'nueva' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Refacción Nueva
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Cámara / URL de Imagen</label>
                <select
                  value={evPhotoUrl}
                  onChange={(e) => setEvPhotoUrl(e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 text-xs text-slate-900 rounded-md"
                >
                  <option value="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80">Foto 1: Inyector con acumulacion de carbon</option>
                  <option value="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80">Foto 2: Empaque Intercooler roto</option>
                  <option value="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80">Foto 3: Alabes de Geometria de Turbo atascados</option>
                  <option value="https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80">Foto 4: Pastillas Bendix e instalacion nueva</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Hallazgo Técnico / Observación</label>
                <textarea
                  required
                  rows={3}
                  value={evDescription}
                  onChange={(e) => setEvDescription(e.target.value)}
                  placeholder="Describa el desgaste, fisura o instalación realizada..."
                  className="w-full bg-white border border-slate-300 p-2 text-xs text-slate-900 rounded-md focus:border-blue-600 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#002855] hover:bg-blue-900 text-white py-2 text-xs font-bold uppercase rounded-md shadow-sm cursor-pointer"
              >
                Cargar Evidencia a la Orden
              </button>
            </form>
          </div>

          {/* Evidence Gallery View */}
          <div className="lg:col-span-7 bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#002855]">
              Galería de Evidencias Cargadas
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {orders.flatMap(o => o.evidences.map(ev => ({ ...ev, osId: o.id }))).map((ev) => (
                <div key={ev.id} className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden flex flex-col justify-between">
                  <div className="relative aspect-video bg-slate-200">
                    <img src={ev.url} alt={ev.description} className="w-full h-full object-cover" />
                    <span className={`absolute top-2 left-2 px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                      ev.partType === 'dañada' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                    }`}>
                      {ev.partType}
                    </span>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 text-[9px] font-mono bg-slate-900/80 text-white font-bold rounded">
                      {ev.osId}
                    </span>
                  </div>
                  <div className="p-3 text-xs space-y-1">
                    <p className="text-slate-800 font-medium line-clamp-2">{ev.description}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{ev.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODULE 3: SOLICITUD DE REFACCIONES */}
      {activeTab === 'solicitud' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Request Form */}
          <div className="lg:col-span-6 bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#002855] flex items-center gap-2">
              <PackagePlus className="w-4 h-4 text-blue-600" />
              <span>Solicitud Directa de Piezas a Almacén</span>
            </h2>

            {reqSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase rounded-md flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>¡Solicitud enviada exitosamente al área de Almacén!</span>
              </div>
            )}

            <form onSubmit={handleSendPartRequest} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Orden de Servicio Destino</label>
                <select
                  value={reqOSId}
                  onChange={(e) => setReqOSId(e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 text-xs text-blue-800 font-mono font-bold rounded-md"
                >
                  {assignedOrders.map(o => (
                    <option key={o.id} value={o.id}>{o.id} - {o.vehicle.brand} ({o.vehicle.plates})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Seleccionar Refacción Diesel</label>
                <select
                  value={reqPartCode}
                  onChange={(e) => setReqPartCode(e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 text-xs text-slate-900 rounded-md"
                >
                  {inventory.map(i => (
                    <option key={i.id} value={i.code}>{i.code} - {i.name} (Stock: {i.stock})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Cantidad Requerida</label>
                <input
                  type="number"
                  min="1"
                  value={reqQty}
                  onChange={(e) => setReqQty(e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 text-xs text-slate-900 font-mono rounded-md"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#002855] hover:bg-blue-900 text-white py-2.5 text-xs font-bold uppercase rounded-md shadow-sm cursor-pointer"
              >
                Enviar Pedido de Repuesto
              </button>
            </form>
          </div>

          {/* Pending Parts List */}
          <div className="lg:col-span-6 bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#002855]">
              Estatus de Mis Solicitudes de Refacción
            </h2>

            <div className="space-y-3">
              {orders.flatMap(o => o.parts).map((p, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{p.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">Código: {p.code} • Cantidad: x{p.quantity}</p>
                  </div>
                  <span className={`status-pill ${
                    p.status === 'despachado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {p.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODULE: CONTROL Y PRÉSTAMO DE HERRAMIENTAS */}
      {activeTab === 'herramientas' && (
        <HerramientasModule />
      )}

      {/* MODULE: ORDEN DE TRABAJO */}
      {activeTab === 'ordentrabajo' && (
        <WorkOrderModule />
      )}
    </div>
  );
};
