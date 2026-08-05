import React, { useState } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
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
    <div className="flex-1 p-4 md:p-6 bg-[#050505] overflow-y-auto min-h-0 space-y-6">
      {/* Top Bar: Switch Active Mechanic Profile */}
      <div className="bg-[#0c0c0c] border border-white/10 p-3 rounded-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Mecánico Activo:</span>
          <span className="text-xs font-mono text-amber-500 font-bold">{currentTech?.name} ({currentTech?.specialty})</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[10px] text-slate-400 uppercase">Cambiar Perfil:</label>
          <select
            value={selectedTechId}
            onChange={(e) => setSelectedTechId(e.target.value)}
            className="bg-black border border-white/10 text-xs text-white p-1 rounded"
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
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
            Órdenes de Trabajo Asignadas ({assignedOrders.length} Unidades)
          </h2>

          <div className="space-y-4">
            {assignedOrders.length === 0 ? (
              <div className="p-8 bg-[#0c0c0c] border border-white/10 rounded text-center text-slate-500 text-xs">
                No hay órdenes asignadas actualmente a este perfil de mecánico.
              </div>
            ) : (
              assignedOrders.map((o) => (
                <div key={o.id} className="bg-[#0c0c0c] border border-white/10 p-5 rounded-md space-y-4">
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-500 text-sm">{o.id}</span>
                        <span className="text-xs font-bold text-white">{o.vehicle.brand} {o.vehicle.model}</span>
                        <span className="text-[10px] font-mono bg-white/5 text-slate-300 px-2 py-0.5 rounded">{o.vehicle.plates}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1"><strong className="text-slate-300">Falla:</strong> {o.faultReason}</p>
                    </div>

                    <div className="text-right">
                      <span className="status-pill bg-amber-500/20 text-amber-400">
                        {o.status}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Timeline Step buttons */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Línea de Tiempo de Reparación (Avanzar Estado):
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {timelineSteps.map((step) => {
                        const isCurrent = o.status === step;
                        return (
                          <button
                            key={step}
                            onClick={() => updateOrderStatus(o.id, step)}
                            className={`p-2 rounded text-[10px] font-bold uppercase transition-all cursor-pointer border ${
                              isCurrent
                                ? 'bg-amber-500 text-black border-amber-500 shadow-md'
                                : 'bg-black/50 text-slate-400 border-white/10 hover:border-amber-500/50 hover:text-white'
                            }`}
                          >
                            {step}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tech notes section */}
                  <div className="p-3 bg-black/40 border border-white/5 rounded space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Bitácora / Notas del Mecánico</span>
                      <span className="text-[10px] font-mono text-amber-500">{o.updatedAt}</span>
                    </div>
                    <p className="text-slate-300 italic text-xs">{o.techNotes || 'Sin observaciones técnicas adicionales.'}</p>
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
          <div className="lg:col-span-5 bg-[#0c0c0c] border border-white/10 p-5 rounded-md space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-500" />
              <span>Carga de Evidencia Fotográfica / Video</span>
            </h2>

            <form onSubmit={handleUploadEvidence} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Orden de Servicio</label>
                <select
                  value={evOSId}
                  onChange={(e) => setEvOSId(e.target.value)}
                  className="w-full bg-black border border-white/10 p-2 text-xs text-amber-400 font-mono font-bold rounded"
                >
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>{o.id} - {o.vehicle.brand} ({o.vehicle.plates})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Tipo de Componente</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEvPartType('dañada')}
                    className={`flex-1 py-1.5 text-xs font-bold uppercase rounded border ${
                      evPartType === 'dañada' ? 'bg-red-500/20 text-red-400 border-red-500' : 'bg-black text-slate-400 border-white/10'
                    }`}
                  >
                    Pieza Dañada
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvPartType('nueva')}
                    className={`flex-1 py-1.5 text-xs font-bold uppercase rounded border ${
                      evPartType === 'nueva' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' : 'bg-black text-slate-400 border-white/10'
                    }`}
                  >
                    Refacción Nueva
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Cámara / URL de Imagen</label>
                <select
                  value={evPhotoUrl}
                  onChange={(e) => setEvPhotoUrl(e.target.value)}
                  className="w-full bg-black border border-white/10 p-2 text-xs text-white rounded"
                >
                  <option value="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80">Foto 1: Inyector con acumulacion de carbon</option>
                  <option value="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80">Foto 2: Empaque Intercooler roto</option>
                  <option value="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80">Foto 3: Alabes de Geometria de Turbo atascados</option>
                  <option value="https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80">Foto 4: Pastillas Bendix e instalacion nueva</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Hallazgo Técnico / Observación</label>
                <textarea
                  required
                  rows={3}
                  value={evDescription}
                  onChange={(e) => setEvDescription(e.target.value)}
                  placeholder="Describa el desgaste, fisura o instalación realizada..."
                  className="w-full bg-black border border-white/10 p-2 text-xs text-white rounded focus:border-amber-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-black py-2 text-xs font-bold uppercase rounded"
              >
                Cargar Evidencia a la Orden
              </button>
            </form>
          </div>

          {/* Evidence Gallery View */}
          <div className="lg:col-span-7 bg-[#0c0c0c] border border-white/10 p-5 rounded-md space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
              Galería de Evidencias Cargadas
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {orders.flatMap(o => o.evidences.map(ev => ({ ...ev, osId: o.id }))).map((ev) => (
                <div key={ev.id} className="bg-black border border-white/10 rounded overflow-hidden flex flex-col justify-between">
                  <div className="relative aspect-video bg-white/5">
                    <img src={ev.url} alt={ev.description} className="w-full h-full object-cover" />
                    <span className={`absolute top-2 left-2 px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                      ev.partType === 'dañada' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-black'
                    }`}>
                      {ev.partType}
                    </span>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 text-[9px] font-mono bg-black/80 text-amber-500 font-bold rounded">
                      {ev.osId}
                    </span>
                  </div>
                  <div className="p-3 text-xs space-y-1">
                    <p className="text-slate-300 font-medium line-clamp-2">{ev.description}</p>
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
          <div className="lg:col-span-6 bg-[#0c0c0c] border border-white/10 p-5 rounded-md space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <PackagePlus className="w-4 h-4 text-amber-500" />
              <span>Solicitud Directa de Piezas a Almacén</span>
            </h2>

            {reqSuccessMsg && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase rounded flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Solicitud enviada exitosamente al área de Almacén!</span>
              </div>
            )}

            <form onSubmit={handleSendPartRequest} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Orden de Servicio Destino</label>
                <select
                  value={reqOSId}
                  onChange={(e) => setReqOSId(e.target.value)}
                  className="w-full bg-black border border-white/10 p-2 text-xs text-amber-400 font-mono font-bold rounded"
                >
                  {assignedOrders.map(o => (
                    <option key={o.id} value={o.id}>{o.id} - {o.vehicle.brand} ({o.vehicle.plates})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Seleccionar Refacción Diesel</label>
                <select
                  value={reqPartCode}
                  onChange={(e) => setReqPartCode(e.target.value)}
                  className="w-full bg-black border border-white/10 p-2 text-xs text-white rounded"
                >
                  {inventory.map(i => (
                    <option key={i.id} value={i.code}>{i.code} - {i.name} (Stock: {i.stock})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Cantidad Requerida</label>
                <input
                  type="number"
                  min="1"
                  value={reqQty}
                  onChange={(e) => setReqQty(e.target.value)}
                  className="w-full bg-black border border-white/10 p-2 text-xs text-white font-mono rounded"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-black py-2.5 text-xs font-bold uppercase rounded cursor-pointer"
              >
                Enviar Pedido de Repuesto
              </button>
            </form>
          </div>

          {/* Pending Parts List */}
          <div className="lg:col-span-6 bg-[#0c0c0c] border border-white/10 p-5 rounded-md space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
              Estatus de Mis Solicitudes de Refacción
            </h2>

            <div className="space-y-3">
              {orders.flatMap(o => o.parts).map((p, idx) => (
                <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-white">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">Código: {p.code} • Cantidad: x{p.quantity}</p>
                  </div>
                  <span className={`status-pill ${
                    p.status === 'despachado' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {p.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
