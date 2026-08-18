import React, { useState } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import { ClientContact, SupplierContact } from '../../types';
import { 
  Users, 
  UserCheck, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Car, 
  Plus, 
  Search, 
  FileText, 
  CreditCard, 
  Truck, 
  Edit3, 
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

interface ContactosModuleProps {
  initialTab?: 'clientes' | 'proveedores';
}

export const ContactosModule: React.FC<ContactosModuleProps> = ({ initialTab = 'clientes' }) => {
  const { 
    clientContacts, 
    supplierContacts, 
    addClientContact, 
    updateClientContact, 
    addSupplierContact, 
    updateSupplierContact,
    orders 
  } = useWorkshop();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'clientes' | 'proveedores'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showClientModal, setShowClientModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [selectedClientDetail, setSelectedClientDetail] = useState<ClientContact | null>(null);

  // Form states - Client
  const [cName, setCName] = useState('');
  const [cCommercialName, setCCommercialName] = useState('');
  const [cRfc, setCRfc] = useState('XAXX010101000');
  const [cEmail, setCEmail] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cAddress, setCAddress] = useState('');
  const [cRegimen, setCRegimen] = useState('601 - General de Ley Personas Morales');
  const [cUsoCfdi, setCUsoCfdi] = useState('G03 - Gastos en general');
  const [cCreditDays, setCCreditDays] = useState('0');
  const [cVPlates, setCVPlates] = useState('');
  const [cVBrandModel, setCVBrandModel] = useState('');
  const [cVYear, setCVYear] = useState('2022');
  const [cVEngine, setCVEngine] = useState('');

  // Form states - Supplier
  const [sCompanyName, setSCompanyName] = useState('');
  const [sContactPerson, setSContactPerson] = useState('');
  const [sRfc, setSRfc] = useState('');
  const [sEmail, setSEmail] = useState('');
  const [sPhone, setSPhone] = useState('');
  const [sAddress, setSAddress] = useState('');
  const [sCategory, setSCategory] = useState<SupplierContact['category']>('Refacciones Diésel');
  const [sCreditDays, setSCreditDays] = useState('30');
  const [sBankName, setSBankName] = useState('BBVA Bancomer');
  const [sClabe, setSClabe] = useState('');
  const [sSupplies, setSSupplies] = useState('Filtros, Aceites, Balatas, Sensores');

  // Alert
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const showAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName || !cPhone) return;

    addClientContact({
      name: cName,
      commercialName: cCommercialName || cName,
      rfc: cRfc.toUpperCase(),
      regimenFiscal: cRegimen,
      usoCfdi: cUsoCfdi,
      email: cEmail || 'contacto@empresa.com',
      phone: cPhone,
      address: cAddress || 'Monterrey, N.L.',
      creditDays: parseInt(cCreditDays) || 0,
      vehicles: cVPlates ? [
        {
          plates: cVPlates.toUpperCase(),
          brand: cVBrandModel.split(' ')[0] || 'Kenworth',
          model: cVBrandModel.split(' ').slice(1).join(' ') || 'T680',
          year: cVYear || '2022',
          vin: `3AKJH4D${Math.floor(Math.random() * 90000 + 10000)}`,
          engine: cVEngine || 'Cummins ISX15'
        }
      ] : []
    });

    setShowClientModal(false);
    showAlert(`Cliente ${cName} agregado exitosamente al directorio.`);
    setCName('');
    setCPhone('');
    setCEmail('');
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sCompanyName || !sPhone) return;

    addSupplierContact({
      companyName: sCompanyName,
      contactPerson: sContactPerson || 'Agente de Ventas',
      rfc: sRfc.toUpperCase() || 'PROV890101AA1',
      email: sEmail || 'ventas@proveedor.com',
      phone: sPhone,
      address: sAddress || 'Zona Industrial Monterrey',
      category: sCategory,
      creditDays: parseInt(sCreditDays) || 30,
      bankName: sBankName,
      bankAccountClabe: sClabe || '012580001234567890',
      suppliesList: sSupplies.split(',').map(s => s.trim()).filter(Boolean)
    });

    setShowSupplierModal(false);
    showAlert(`Proveedor ${sCompanyName} guardado en el directorio.`);
    setSCompanyName('');
    setSPhone('');
  };

  // Filters
  const filteredClients = clientContacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.rfc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.commercialName && c.commercialName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    c.phone.includes(searchTerm) ||
    c.vehicles.some(v => v.plates.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredSuppliers = supplierContacts.filter(s =>
    s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm)
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 shrink-0 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-cyan-100 text-cyan-900 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Módulo 7
              </span>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Directorio Central de Contactos
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Padrón maestro de clientes, vehículos de flota, datos de facturación CFDI y catálogo de proveedores.
            </p>
          </div>

          {/* Action Tabs and Buttons */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveTab('clientes')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'clientes'
                    ? 'bg-white text-[#002855] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Clientes y Flotas ({clientContacts.length})
              </button>
              <button
                onClick={() => setActiveTab('proveedores')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'proveedores'
                    ? 'bg-white text-[#002855] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Proveedores ({supplierContacts.length})
              </button>
            </div>

            {activeTab === 'clientes' ? (
              <button
                onClick={() => setShowClientModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#002855] hover:bg-blue-900 rounded-lg shadow transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Cliente</span>
              </button>
            ) : (
              <button
                onClick={() => setShowSupplierModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#002855] hover:bg-blue-900 rounded-lg shadow transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Proveedor</span>
              </button>
            )}
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

        {/* Search */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeTab === 'clientes' ? "Buscar por cliente, placas, RFC o teléfono..." : "Buscar proveedor, categoría o contacto..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />
          </div>
        </div>

        {/* Tab 1: Clientes */}
        {activeTab === 'clientes' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredClients.map((client) => {
              const clientOrders = orders.filter(o => o.client.name.toLowerCase().includes(client.name.toLowerCase()));

              return (
                <div 
                  key={client.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {client.id}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1">
                          {client.name}
                        </h3>
                        {client.commercialName && client.commercialName !== client.name && (
                          <p className="text-xs text-blue-700 font-semibold">{client.commercialName}</p>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                        {client.totalOrdersCount} servicios recibidos
                      </span>
                    </div>

                    {/* Contact details */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold">{client.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{client.email}</span>
                      </div>
                      <div className="col-span-2 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>RFC: <strong className="font-mono">{client.rfc}</strong> ({client.regimenFiscal})</span>
                      </div>
                      <div className="col-span-2 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{client.address}</span>
                      </div>
                    </div>

                    {/* Vehicles Fleet */}
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Car className="w-3.5 h-3.5 text-blue-600" />
                        <span>Flota Registrada ({client.vehicles.length} unidades)</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {client.vehicles.map((v, i) => (
                          <div key={i} className="text-xs bg-blue-50/70 border border-blue-200 px-2.5 py-1 rounded-lg text-blue-950 flex items-center gap-2">
                            <span className="font-bold">{v.brand} {v.model} ({v.year})</span>
                            <span className="font-mono bg-white px-1.5 py-0.5 rounded text-[10px] font-black text-slate-800 border border-blue-200">
                              {v.plates}
                            </span>
                            <span className="text-[10px] text-blue-700">{v.engine}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Condición: {client.creditDays ? `Crédito ${client.creditDays} días` : 'Contado'}
                    </span>
                    <button
                      onClick={() => setSelectedClientDetail(client)}
                      className="text-blue-700 font-bold hover:underline"
                    >
                      Ver Expediente Completo →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Proveedores */}
        {activeTab === 'proveedores' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredSuppliers.map((sup) => (
              <div 
                key={sup.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {sup.id}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {sup.companyName}
                      </h3>
                      <p className="text-xs text-slate-500">Contacto: <strong>{sup.contactPerson}</strong></p>
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase bg-orange-100 text-orange-900">
                      {sup.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold">{sup.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{sup.email}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>RFC: <strong className="font-mono">{sup.rfc}</strong></span>
                    </div>
                    <div className="col-span-2 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span>Banco: {sup.bankName} | CLABE: <strong className="font-mono">{sup.bankAccountClabe}</strong></span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Líneas / Productos Suministrados:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {sup.suppliesList.map((item, i) => (
                        <span key={i} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Días de Crédito: <strong>{sup.creditDays} días</strong></span>
                  <span className="text-emerald-700 font-semibold">Proveedor Verificado</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: NUEVO CLIENTE */}
      {showClientModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="bg-[#002855] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-300" />
                <h3 className="font-bold text-base">Registrar Nuevo Cliente / Flotilla</h3>
              </div>
              <button 
                onClick={() => setShowClientModal(false)}
                className="text-slate-300 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="p-6 space-y-3 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre o Razón Social *</label>
                <input
                  type="text"
                  required
                  placeholder="Transportes y Logística del Norte S.A."
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">RFC Fiscal</label>
                  <input
                    type="text"
                    placeholder="TLN190820AA1"
                    value={cRfc}
                    onChange={(e) => setCRfc(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs font-mono uppercase border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono Móvil *</label>
                  <input
                    type="tel"
                    required
                    placeholder="81 1234 5678"
                    value={cPhone}
                    onChange={(e) => setCPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico (Facturación)</label>
                <input
                  type="email"
                  placeholder="pagos@empresa.com"
                  value={cEmail}
                  onChange={(e) => setCEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dirección Fiscal / Taller</label>
                <input
                  type="text"
                  placeholder="Av. Lincoln 4500, Monterrey, N.L."
                  value={cAddress}
                  onChange={(e) => setCAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Vehicle info */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Vehículo Inicial (Opcional)</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Marca / Modelo</label>
                    <input
                      type="text"
                      placeholder="Freightliner Cascadia"
                      value={cVBrandModel}
                      onChange={(e) => setCVBrandModel(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Placas</label>
                    <input
                      type="text"
                      placeholder="82-AA-9K"
                      value={cVPlates}
                      onChange={(e) => setCVPlates(e.target.value.toUpperCase())}
                      className="w-full px-2 py-1.5 text-xs font-mono uppercase border border-slate-300 rounded font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowClientModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#002855] hover:bg-blue-900 rounded-lg shadow transition-all cursor-pointer"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO PROVEEDOR */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-[#002855] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-300" />
                <h3 className="font-bold text-base">Registrar Nuevo Proveedor</h3>
              </div>
              <button 
                onClick={() => setShowSupplierModal(false)}
                className="text-slate-300 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="p-6 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Comercial / Empresa *</label>
                <input
                  type="text"
                  required
                  placeholder="Distribuidora Diésel del Centro S.A."
                  value={sCompanyName}
                  onChange={(e) => setSCompanyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contacto / Asesor</label>
                  <input
                    type="text"
                    placeholder="Ing. Carlos Garza"
                    value={sContactPerson}
                    onChange={(e) => setSContactPerson(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoría</label>
                  <select
                    value={sCategory}
                    onChange={(e) => setSCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Refacciones Diésel">Refacciones Diésel</option>
                    <option value="Aceites y Lubricantes">Aceites y Lubricantes</option>
                    <option value="Filtros">Filtros</option>
                    <option value="Herramientas">Herramientas</option>
                    <option value="Servicios Externos">Servicios Externos (Torno/Rectificado)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono *</label>
                  <input
                    type="tel"
                    required
                    placeholder="81 8100 0000"
                    value={sPhone}
                    onChange={(e) => setSPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Correo de Ventas</label>
                  <input
                    type="email"
                    placeholder="pedidos@proveedor.com"
                    value={sEmail}
                    onChange={(e) => setSEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CLABE Interbancaria</label>
                <input
                  type="text"
                  placeholder="012580001234567890"
                  value={sClabe}
                  onChange={(e) => setSClabe(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#002855] hover:bg-blue-900 rounded-lg shadow transition-all cursor-pointer"
                >
                  Guardar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
