import React, { useState } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import { 
  Building2, 
  User, 
  ShieldCheck, 
  Key, 
  FileCheck, 
  Save, 
  CheckCircle2, 
  Upload, 
  Mail, 
  Phone, 
  MapPin,
  Lock,
  Receipt
} from 'lucide-react';

export const PerfilModule: React.FC = () => {
  const { currentRole, users } = useWorkshop();

  // Active user data
  const currentUser = users.find(u => u.role === currentRole) || users[0];

  // Company / Fiscal Data State
  const [razonSocial, setRazonSocial] = useState('TRACTOSERVICES AND DIESEL PARTS TSR SONORA SA DE CV');
  const [rfc, setRfc] = useState('TSR180901HD9');
  const [regimenFiscal, setRegimenFiscal] = useState('601 - General de Ley Personas Morales');
  const [codigoPostal, setCodigoPostal] = useState('83000');
  const [direccion, setDireccion] = useState('Blvd. Solidaridad #1024, Col. Palo Verde, Hermosillo, Sonora');
  const [telefonoEmpresa, setTelefonoEmpresa] = useState('662-289-4500');
  const [emailFacturacion, setEmailFacturacion] = useState('facturacion@tsrsonora.com');
  const [serieFactura, setSerieFactura] = useState('FAC');
  const [folioSiguiente, setFolioSiguiente] = useState('4025');

  // PAC & SAT CSD Certificates state
  const [pacUser, setPacUser] = useState('TSR_PAC_PROD_9918');
  const [cerFile, setCerFile] = useState<string | null>('TSR180901HD9_CSD.cer');
  const [keyFile, setKeyFile] = useState<string | null>('TSR180901HD9_CSD.key');
  const [csdPassword, setCsdPassword] = useState('••••••••••••');
  const [csdVigencia, setCsdVigencia] = useState('18/11/2028 (Válido ante el SAT)');

  // User Profile state
  const [userName, setUserName] = useState(currentUser?.name || 'Administrador General');
  const [userEmail, setUserEmail] = useState(currentUser?.email || 'admin@tsrsonora.com');
  const [userPhone, setUserPhone] = useState('662-311-8920');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification state
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#002855] flex items-center justify-center border border-blue-200">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-900 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Configuración & Datos Fiscales
              </span>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Mi Perfil y Configuración de la Empresa
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Administración de certificados CSD del SAT, datos de facturación CFDI 4.0 y perfil de acceso.
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-2 rounded-lg text-xs font-bold animate-fade-in shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>¡Configuración guardada exitosamente!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Datos Fiscales de la Empresa (Emisor CFDI 4.0) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Receipt className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-black uppercase tracking-wider text-[#002855]">
                Datos Fiscales del Emisor (CFDI 4.0)
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Razón Social (Emisor)
                </label>
                <input
                  type="text"
                  required
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-900 focus:border-blue-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                    RFC de la Empresa
                  </label>
                  <input
                    type="text"
                    required
                    value={rfc}
                    onChange={(e) => setRfc(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-blue-800 focus:border-blue-600 outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                    Código Postal Fiscal
                  </label>
                  <input
                    type="text"
                    required
                    value={codigoPostal}
                    onChange={(e) => setCodigoPostal(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-900 focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Régimen Fiscal (SAT)
                </label>
                <select
                  value={regimenFiscal}
                  onChange={(e) => setRegimenFiscal(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium focus:border-blue-600 outline-none"
                >
                  <option value="601 - General de Ley Personas Morales">601 - General de Ley Personas Morales</option>
                  <option value="612 - Personas Físicas con Actividades Empresariales y Profesionales">612 - Personas Físicas con Actividades Empresariales</option>
                  <option value="626 - Régimen Simplificado de Confianza (RESICO)">626 - Régimen Simplificado de Confianza (RESICO)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Domicilio Fiscal Completo
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:border-blue-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                    Teléfono del Taller
                  </label>
                  <input
                    type="text"
                    value={telefonoEmpresa}
                    onChange={(e) => setTelefonoEmpresa(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:border-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                    Correo Facturación
                  </label>
                  <input
                    type="email"
                    value={emailFacturacion}
                    onChange={(e) => setEmailFacturacion(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                    Serie de Facturas
                  </label>
                  <input
                    type="text"
                    value={serieFactura}
                    onChange={(e) => setSerieFactura(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-blue-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                    Siguiente Folio
                  </label>
                  <input
                    type="text"
                    value={folioSiguiente}
                    onChange={(e) => setFolioSiguiente(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Certificados CSD y Timbrado SAT */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-black uppercase tracking-wider text-[#002855]">
                Certificados Digitales (CSD) & PAC
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-900">Estatus Conexión SAT / PAC:</span>
                  <span className="bg-emerald-200 text-emerald-950 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                    Activo y Enlazado
                  </span>
                </div>
                <p className="text-[10px] text-emerald-800">
                  Vigencia CSD: <strong className="font-mono">{csdVigencia}</strong>
                </p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Certificado Público (.CER)
                </label>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-300 rounded-lg">
                  <span className="font-mono text-slate-800 font-bold truncate">{cerFile}</span>
                  <button type="button" className="text-blue-700 hover:text-blue-900 text-[11px] font-bold flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" /> Cambiar .cer
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Llave Privada (.KEY)
                </label>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-300 rounded-lg">
                  <span className="font-mono text-slate-800 font-bold truncate">{keyFile}</span>
                  <button type="button" className="text-blue-700 hover:text-blue-900 text-[11px] font-bold flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" /> Cambiar .key
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Contraseña de Clave Privada CSD
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={csdPassword}
                    onChange={(e) => setCsdPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-900 focus:border-blue-600 outline-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Usuario de Timbrado PAC Autorizado
                </label>
                <input
                  type="text"
                  value={pacUser}
                  onChange={(e) => setPacUser(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-900 focus:border-blue-600 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Mi Perfil de Usuario */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <User className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-black uppercase tracking-wider text-[#002855]">
              Información de Mi Cuenta de Usuario
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-900 focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Teléfono Directo
              </label>
              <input
                type="text"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-200">
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Nueva Contraseña (Opcional)
              </label>
              <input
                type="password"
                placeholder="Dejar en blanco para mantener la actual"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                placeholder="Confirmar nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:border-blue-600 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-[#002855] hover:bg-blue-900 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-lg shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Configuración y Perfil</span>
          </button>
        </div>
      </form>
    </div>
  );
};
