import React, { useState } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import { ToolItem } from '../../types';
import { 
  Wrench, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  RotateCcw, 
  ShieldAlert, 
  History, 
  Cpu, 
  Gauge, 
  Layers,
  FileSignature
} from 'lucide-react';

interface HerramientasModuleProps {
  technicianModeOnly?: boolean;
  technicianName?: string;
}

export const HerramientasModule: React.FC<HerramientasModuleProps> = ({ 
  technicianModeOnly = false,
  technicianName
}) => {
  const { tools, toolLogs, addTool, assignToolToTechnician, returnToolFromTechnician, users } = useWorkshop();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todos');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');

  // Modals
  const [showAddToolModal, setShowAddToolModal] = useState(false);
  const [selectedToolForAssign, setSelectedToolForAssign] = useState<ToolItem | null>(null);
  const [selectedToolForReturn, setSelectedToolForReturn] = useState<ToolItem | null>(null);

  // Form states - Add Tool
  const [toolCode, setToolCode] = useState('');
  const [toolName, setToolName] = useState('');
  const [toolBrand, setToolBrand] = useState('');
  const [toolSerial, setToolSerial] = useState('');
  const [toolCategory, setToolCategory] = useState<ToolItem['category']>('Diagnóstico Electrónico');
  const [toolCondition, setToolCondition] = useState<ToolItem['condition']>('Excelente');
  const [toolNotes, setToolNotes] = useState('');

  // Form states - Assign Tool
  const [selectedTechId, setSelectedTechId] = useState('');
  const [assignObservations, setAssignObservations] = useState('');

  // Form states - Return Tool
  const [returnCondition, setReturnCondition] = useState<'Excelente' | 'Bueno' | 'Regular' | 'Dañada'>('Bueno');
  const [returnObservations, setReturnObservations] = useState('');

  // Sub-tabs
  const [activeTab, setActiveTab] = useState<'catalogo' | 'bitacora'>('catalogo');
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const showAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const technicians = users.filter(u => u.role === 'tecnico' && u.status === 'activo');

  // Filter tools
  const filteredTools = tools.filter(t => {
    if (technicianModeOnly && technicianName) {
      if (t.currentTechnicianName !== technicianName) return false;
    }
    const matchesSearch = 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.currentTechnicianName && t.currentTechnicianName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'Todos' || t.category === categoryFilter;
    const matchesStatus = statusFilter === 'Todos' || t.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const availableCount = tools.filter(t => t.status === 'Disponible').length;
  const assignedCount = tools.filter(t => t.status === 'Asignada').length;
  const maintenanceCount = tools.filter(t => t.status === 'Mantenimiento').length;

  const handleAddTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolCode || !toolName) return;

    addTool({
      code: toolCode.toUpperCase(),
      name: toolName,
      brand: toolBrand || 'Genérico',
      serialNumber: toolSerial || 'S/N',
      category: toolCategory,
      status: 'Disponible',
      condition: toolCondition,
      notes: toolNotes
    });

    setShowAddToolModal(false);
    showAlert(`Herramienta ${toolName} agregada al catálogo.`);
    setToolCode('');
    setToolName('');
    setToolBrand('');
    setToolSerial('');
  };

  const handleConfirmAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToolForAssign || !selectedTechId) return;

    const tech = technicians.find(t => t.id === selectedTechId);
    if (!tech) return;

    assignToolToTechnician(selectedToolForAssign.id, tech.id, tech.name, assignObservations);
    setSelectedToolForAssign(null);
    showAlert(`Herramienta ${selectedToolForAssign.name} asignada a ${tech.name}.`);
  };

  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToolForReturn) return;

    returnToolFromTechnician(selectedToolForReturn.id, returnCondition, returnObservations);
    setSelectedToolForReturn(null);
    showAlert(`Herramienta ${selectedToolForReturn.name} devuelta al almacén con estatus: ${returnCondition}.`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 shrink-0 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Módulo 5 (Herramientas)
              </span>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Control y Préstamo de Herramienta Especializada
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Registro de equipos de diagnóstico, torquímetros y herramientas especiales con responsiva firmada y bitácora de entrega.
            </p>
          </div>

          {!technicianModeOnly && (
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setActiveTab('catalogo')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'catalogo' ? 'bg-white text-[#002855] shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Inventario Herramientas
                </button>
                <button
                  onClick={() => setActiveTab('bitacora')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'bitacora' ? 'bg-white text-[#002855] shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bitácora de Préstamos ({toolLogs.length})
                </button>
              </div>

              <button
                onClick={() => setShowAddToolModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#002855] hover:bg-blue-900 rounded-lg shadow transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Herramienta</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Equipos</p>
            <p className="text-xl font-black text-slate-800">{tools.length}</p>
          </div>
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3">
            <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Disponibles Almacén</p>
            <p className="text-xl font-black text-emerald-900">{availableCount}</p>
          </div>
          <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3">
            <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">En Uso por Técnicos</p>
            <p className="text-xl font-black text-amber-900">{assignedCount}</p>
          </div>
          <div className="bg-purple-50/70 border border-purple-200 rounded-lg p-3">
            <p className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">En Mantenimiento</p>
            <p className="text-xl font-black text-purple-900">{maintenanceCount}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-4">
        {alertMsg && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-lg flex items-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold">{alertMsg}</span>
          </div>
        )}

        {activeTab === 'catalogo' ? (
          <>
            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, código, marca o técnico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                {(['Todos', 'Disponible', 'Asignada', 'Mantenimiento'] as const).map(st => (
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

            {/* Grid of Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTools.map((tool) => {
                const isAvailable = tool.status === 'Disponible';
                const isAssigned = tool.status === 'Asignada';
                const isMaint = tool.status === 'Mantenimiento';

                return (
                  <div 
                    key={tool.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-[11px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {tool.code}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 mt-1">
                            {tool.name}
                          </h3>
                        </div>
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                          isAvailable ? 'bg-emerald-100 text-emerald-800' :
                          isAssigned ? 'bg-amber-100 text-amber-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {tool.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Marca / Serie:</span>
                          <span className="font-semibold">{tool.brand} ({tool.serialNumber})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Categoría:</span>
                          <span className="font-semibold">{tool.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Estado Físico:</span>
                          <span className="font-bold text-emerald-700">{tool.condition}</span>
                        </div>
                      </div>

                      {/* Current technician assignment if active */}
                      {isAssigned && (
                        <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900">
                          <div className="flex items-center gap-1.5 font-bold">
                            <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                            <span>Técnico Responsable:</span>
                          </div>
                          <p className="font-extrabold mt-0.5 text-slate-900">{tool.currentTechnicianName}</p>
                          <p className="text-[10px] text-amber-700 mt-0.5">Asignada el: {tool.assignedDate}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                      {isAvailable && (
                        <button
                          onClick={() => {
                            setSelectedToolForAssign(tool);
                            if (technicians.length > 0) setSelectedTechId(technicians[0].id);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-all cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Prestar a Técnico</span>
                        </button>
                      )}

                      {isAssigned && (
                        <button
                          onClick={() => {
                            setSelectedToolForReturn(tool);
                            setReturnCondition('Bueno');
                          }}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Registrar Devolución</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* TAB: BITÁCORA HISTÓRICA */
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Bitácora de Movimientos y Préstamos ({toolLogs.length})
              </h2>
              <span className="text-[11px] text-slate-500">
                Auditoría histórica de entregas y devoluciones de herramientas
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {toolLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {log.toolCode}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{log.toolName}</h4>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                        log.status === 'Devuelta' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {log.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3">
                      <span>Técnico: <strong>{log.technicianName}</strong></span>
                      <span>•</span>
                      <span>Préstamo: {log.assignedDate}</span>
                      {log.returnDate && (
                        <>
                          <span>•</span>
                          <span>Devolución: {log.returnDate}</span>
                          <span>•</span>
                          <span>Condición entrega: <strong className="text-emerald-700">{log.returnCondition}</strong></span>
                        </>
                      )}
                    </div>

                    {log.observations && (
                      <p className="text-xs text-slate-500 italic">
                        Observaciones: {log.observations}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 flex items-center gap-1">
                      <FileSignature className="w-3.5 h-3.5 text-blue-600" />
                      Responsiva Digital Firmada
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: REGISTRAR HERRAMIENTA */}
      {showAddToolModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-[#002855] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-300" />
                <h3 className="font-bold text-base">Registrar Nueva Herramienta Especial</h3>
              </div>
              <button 
                onClick={() => setShowAddToolModal(false)}
                className="text-slate-300 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTool} className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Código Interno *</label>
                  <input
                    type="text"
                    required
                    placeholder="HRR-ESC-03"
                    value={toolCode}
                    onChange={(e) => setToolCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs font-mono font-bold uppercase border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Marca</label>
                  <input
                    type="text"
                    placeholder="Nexiq / Snap-on / Bosch"
                    value={toolBrand}
                    onChange={(e) => setToolBrand(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre o Descripción del Equipo *</label>
                <input
                  type="text"
                  required
                  placeholder="Escáner Nexiq USB-Link 3 Bluetooth"
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoría</label>
                  <select
                    value={toolCategory}
                    onChange={(e) => setToolCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Diagnóstico Electrónico">Diagnóstico Electrónico</option>
                    <option value="Extractor / Prensa">Extractor / Prensa</option>
                    <option value="Torque / Medición">Torque / Medición</option>
                    <option value="Neumática / Taller">Neumática / Taller</option>
                    <option value="Especial Diésel">Especial Diésel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Número de Serie</label>
                  <input
                    type="text"
                    placeholder="SN-9823-MX"
                    value={toolSerial}
                    onChange={(e) => setToolSerial(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notas o Especificaciones</label>
                <textarea
                  rows={2}
                  placeholder="Incluye cables OBD2, J1939 y estuche rígido..."
                  value={toolNotes}
                  onChange={(e) => setToolNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddToolModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#002855] hover:bg-blue-900 rounded-lg shadow transition-all cursor-pointer"
                >
                  Guardar en Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRESTAR A TÉCNICO */}
      {selectedToolForAssign && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-300" />
                <h3 className="font-bold text-base">Asignación y Préstamo de Herramienta</h3>
              </div>
              <button 
                onClick={() => setSelectedToolForAssign(null)}
                className="text-slate-300 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmAssign} className="p-6 space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 space-y-1">
                <span className="font-mono text-xs font-bold text-blue-950">{selectedToolForAssign.code}</span>
                <p className="font-bold text-sm text-slate-900">{selectedToolForAssign.name}</p>
                <p className="text-xs text-slate-600">{selectedToolForAssign.brand} | {selectedToolForAssign.category}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Técnico Receptor *</label>
                <select
                  required
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option value="">Seleccione un técnico...</option>
                  {technicians.map(tech => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name} ({tech.specialty || 'Mecánico Diésel'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Observaciones / Orden de Servicio Asociada</label>
                <textarea
                  rows={2}
                  placeholder="Se entrega para diagnóstico en bahía 2..."
                  value={assignObservations}
                  onChange={(e) => setAssignObservations(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <FileSignature className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>Al confirmar, se genera la responsiva digital del técnico por el resguardo y buen uso del equipo.</span>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedToolForAssign(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow transition-all cursor-pointer"
                >
                  Confirmar Préstamo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR DEVOLUCIÓN */}
      {selectedToolForReturn && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">Recepción y Devolución al Almacén</h3>
              </div>
              <button 
                onClick={() => setSelectedToolForReturn(null)}
                className="text-slate-300 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReturn} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <p className="font-bold text-sm text-slate-900">{selectedToolForReturn.name}</p>
                <p className="text-xs text-slate-600">Devuelta por: <strong>{selectedToolForReturn.currentTechnicianName}</strong></p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Estado de la Herramienta al Retornar *</label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold"
                >
                  <option value="Excelente">Excelente (Limpia y calibrada)</option>
                  <option value="Bueno">Bueno (Sin daños aparentes)</option>
                  <option value="Regular">Regular (Requiere limpieza/ajuste)</option>
                  <option value="Dañada">Dañada (Reportar para mantenimiento o reposición)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Observaciones de Inspección</label>
                <textarea
                  rows={2}
                  placeholder="Herramienta entregada completa con estuche..."
                  value={returnObservations}
                  onChange={(e) => setReturnObservations(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedToolForReturn(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow transition-all cursor-pointer"
                >
                  Ingresar a Almacén
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
