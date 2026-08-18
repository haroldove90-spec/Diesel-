import React, { useState } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import { Appointment } from '../../types';
import { 
  Calendar, 
  Clock, 
  Car, 
  User, 
  Phone, 
  Mail, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Clock3, 
  AlertCircle, 
  Search, 
  ExternalLink,
  Copy,
  Check,
  Filter,
  Wrench
} from 'lucide-react';

interface CitasModuleProps {
  embeddedRole?: 'asesor' | 'cliente' | 'direccion';
}

export const CitasModule: React.FC<CitasModuleProps> = ({ embeddedRole = 'asesor' }) => {
  const { appointments, addAppointment, updateAppointmentStatus, convertAppointmentToOS } = useWorkshop();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Pendiente' | 'Confirmada' | 'Convertida' | 'Cancelada'>('Todos');
  const [selectedDate, setSelectedDate] = useState('');

  // Modal for new appointment
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form states
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [vehicleBrandModel, setVehicleBrandModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('2021');
  const [vehiclePlates, setVehiclePlates] = useState('');
  const [preferredDate, setPreferredDate] = useState(new Date().toISOString().split('T')[0]);
  const [preferredTime, setPreferredTime] = useState('09:00 AM');
  const [serviceType, setServiceType] = useState<'Preventivo' | 'Correctivo' | 'Diagnóstico' | 'Garantía'>('Preventivo');
  const [serviceReason, setServiceReason] = useState('');
  const [bayAssigned, setBayAssigned] = useState('Bahía 1 (Mantenimiento Rápido)');
  const [source, setSource] = useState<'Asesor Interno' | 'Portal Web Cliente'>('Asesor Interno');

  // Conversion notification
  const [conversionSuccessId, setConversionSuccessId] = useState<string | null>(null);

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !vehicleBrandModel || !vehiclePlates) return;

    addAppointment({
      clientName,
      clientPhone,
      clientEmail,
      vehicleBrandModel,
      vehicleYear,
      vehiclePlates: vehiclePlates.toUpperCase(),
      preferredDate,
      preferredTime,
      serviceType,
      serviceReason: serviceReason || 'Servicio programado general',
      status: 'Confirmada',
      source,
      bayAssigned
    });

    // Reset
    setShowAddModal(false);
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setVehicleBrandModel('');
    setVehiclePlates('');
    setServiceReason('');
  };

  const handleConvert = (appointmentId: string) => {
    const osId = convertAppointmentToOS(appointmentId);
    if (osId) {
      setConversionSuccessId(osId);
      setTimeout(() => setConversionSuccessId(null), 5000);
    }
  };

  const copyPublicLink = () => {
    const publicUrl = `${window.location.origin}/?portal=citas-cliente`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Filtered appointments
  const filteredAppointments = appointments.filter(app => {
    const matchesSearch = 
      app.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.vehiclePlates.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.vehicleBrandModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'Todos' || app.status === statusFilter;
    const matchesDate = !selectedDate || app.preferredDate === selectedDate;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const countPending = appointments.filter(a => a.status === 'Pendiente').length;
  const countConfirmed = appointments.filter(a => a.status === 'Confirmada').length;
  const countConverted = appointments.filter(a => a.status === 'Convertida').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">
      {/* Module Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 shrink-0 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-[#002855] text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Módulo 1
              </span>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Gestión de Citas y Agendamiento Dual
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Agendamiento interno por asesor, enlace público de autoservicio para clientes y conversión directa a Orden de Servicio.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={copyPublicLink}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#002855] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
              title="Copiar enlace web público para compartir a clientes"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? '¡Link Copiado!' : 'Copiar Link Autoservicio'}</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#002855] hover:bg-blue-900 rounded-lg shadow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar Nueva Cita</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Citas</p>
            <p className="text-xl font-black text-slate-800">{appointments.length}</p>
          </div>
          <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3">
            <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Pendientes Web</p>
            <p className="text-xl font-black text-amber-900">{countPending}</p>
          </div>
          <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3">
            <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">Confirmadas Hoy</p>
            <p className="text-xl font-black text-blue-900">{countConfirmed}</p>
          </div>
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3">
            <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">En Taller (Convertidas)</p>
            <p className="text-xl font-black text-emerald-900">{countConverted}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 space-y-4">
        {/* Banner if OS converted */}
        {conversionSuccessId && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-lg flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-sm">¡Orden de Servicio Generada con Éxito!</span>
                <p className="text-xs text-emerald-700">Folio asignado: <strong>{conversionSuccessId}</strong>. El vehículo ha sido ingresado al flujo de taller.</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters and search bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente, placas, modelo o folio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
            {(['Todos', 'Pendiente', 'Confirmada', 'Convertida', 'Cancelada'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === st 
                    ? 'bg-[#002855] text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Date Picker Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Limpiar fecha
              </button>
            )}
          </div>
        </div>

        {/* Appointments List / Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Agenda de Citas ({filteredAppointments.length})
            </h2>
            <span className="text-[11px] text-slate-500">
              Mostrando citas programadas para ingreso a taller
            </span>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">No se encontraron citas</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No hay registros que coincidan con los filtros aplicados o no hay citas agendadas para esta fecha.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredAppointments.map((app) => {
                const isConverted = app.status === 'Convertida';
                const isConfirmed = app.status === 'Confirmada';
                const isPending = app.status === 'Pendiente';

                return (
                  <div key={app.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    {/* Left: Client & Vehicle Info */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                        isConverted ? 'bg-emerald-100 text-emerald-700' :
                        isConfirmed ? 'bg-blue-100 text-blue-800' :
                        isPending ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Car className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {app.id}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {app.clientName}
                          </h3>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                            app.source === 'Portal Web Cliente'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {app.source}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-semibold text-slate-800">
                            {app.vehicleBrandModel} ({app.vehicleYear})
                          </span>
                          <span className="bg-slate-200/80 font-mono font-bold text-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                            {app.vehiclePlates}
                          </span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <Phone className="w-3 h-3 text-slate-400" /> {app.clientPhone}
                          </span>
                          {app.clientEmail && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <Mail className="w-3 h-3 text-slate-400" /> {app.clientEmail}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 italic bg-slate-50 p-1.5 rounded border border-slate-100 max-w-xl">
                          <strong className="text-slate-700 font-semibold not-italic">Motivo:</strong> {app.serviceReason} ({app.serviceType})
                        </p>
                      </div>
                    </div>

                    {/* Middle: Date & Bahía */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 lg:gap-1 text-xs shrink-0 w-full lg:w-auto justify-between lg:justify-start border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>{app.preferredDate}</span>
                        <span className="text-slate-400">|</span>
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>{app.preferredTime}</span>
                      </div>
                      
                      {app.bayAssigned && (
                        <span className="text-[11px] text-slate-500">
                          {app.bayAssigned}
                        </span>
                      )}

                      {/* Status Badge */}
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        app.status === 'Confirmada' ? 'bg-blue-100 text-blue-800' :
                        app.status === 'Convertida' ? 'bg-emerald-100 text-emerald-800' :
                        app.status === 'Pendiente' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {app.status === 'Convertida' ? `En Taller (${app.convertedOrderId || 'OS'})` : app.status}
                      </span>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100">
                      {/* Confirm Button if pending */}
                      {isPending && (
                        <button
                          onClick={() => updateAppointmentStatus(app.id, 'Confirmada')}
                          className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Confirmar Cita
                        </button>
                      )}

                      {/* Convert to OS button */}
                      {!isConverted && (
                        <button
                          onClick={() => handleConvert(app.id)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all cursor-pointer"
                          title="Convertir cita física en Orden de Servicio (OS) de taller"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Convertir a OS</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isConverted && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>OS Activa: {app.convertedOrderId}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Agendar Nueva Cita Interna */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="bg-[#002855] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-300" />
                <h3 className="font-bold text-base">Agendar Nueva Cita de Taller</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-300 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Datos del Cliente</h4>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez / Transportes Monterrey"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono Móvil *</label>
                    <input
                      type="tel"
                      required
                      placeholder="81 1234 5678"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      placeholder="cliente@empresa.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Datos del Vehículo</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Marca y Modelo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Freightliner Cascadia DD15"
                      value={vehicleBrandModel}
                      onChange={(e) => setVehicleBrandModel(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Año</label>
                    <input
                      type="number"
                      placeholder="2022"
                      value={vehicleYear}
                      onChange={(e) => setVehicleYear(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Placas de Circulación *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 82-AA-9K"
                    value={vehiclePlates}
                    onChange={(e) => setVehiclePlates(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase font-mono"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Horario y Detalle de Servicio</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Fecha Programada *</label>
                    <input
                      type="date"
                      required
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Hora Estimada *</label>
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="08:30 AM">08:30 AM</option>
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="01:00 PM">01:00 PM</option>
                      <option value="02:30 PM">02:30 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Servicio</label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Preventivo">Mantenimiento Preventivo</option>
                      <option value="Correctivo">Mantenimiento Correctivo</option>
                      <option value="Diagnóstico">Diagnóstico / Escaneo</option>
                      <option value="Garantía">Revisión de Garantía</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Bahía de Taller Asignada</label>
                    <select
                      value={bayAssigned}
                      onChange={(e) => setBayAssigned(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Bahía 1 (Mantenimiento Rápido)">Bahía 1 (Mantenimiento Rápido)</option>
                      <option value="Bahía 2 (Diésel y Motores)">Bahía 2 (Diésel y Motores)</option>
                      <option value="Bahía 3 (Transmisiones)">Bahía 3 (Transmisiones)</option>
                      <option value="Bahía 4 (Frenos y Suspensión)">Bahía 4 (Frenos y Suspensión)</option>
                      <option value="Bahía 5 (Eléctrico y Diagnóstico)">Bahía 5 (Eléctrico y Diagnóstico)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Motivo o Falla Reportada</label>
                  <textarea
                    rows={2}
                    placeholder="Detalles sobre el síntoma o servicio solicitado..."
                    value={serviceReason}
                    onChange={(e) => setServiceReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-200">
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
                  Guardar y Confirmar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
