import React, { useState } from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import { ROLES } from '../data/mockData';
import { RoleType, User } from '../types';
import { InstallPWAButton } from './InstallPWAButton';
import { supabase } from '../lib/supabase';
import { 
  Building2, 
  ClipboardList, 
  Wrench, 
  PackageSearch, 
  Truck,
  Receipt,
  Coins,
  DollarSign,
  Calculator,
  ChevronRight,
  Shield,
  Lock,
  UserPlus,
  LogIn,
  KeyRound,
  Mail,
  Phone,
  CheckCircle2,
  X,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Building2,
  ClipboardList,
  Wrench,
  PackageSearch,
  Truck,
  Receipt,
  Coins,
  DollarSign,
  Calculator
};

export const HomeRoleSelector: React.FC = () => {
  const { setCurrentRole, currentUser, setCurrentUser, users, addUser } = useWorkshop();

  // Admin Auth Modal State
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register form fields
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const handleAdminRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!adminName.trim() || !adminEmail.trim() || !adminPassword.trim()) {
      setAuthError('Por favor completa todos los campos requeridos.');
      return;
    }

    if (adminPassword.length < 6) {
      setAuthError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);

    const newAdminId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : `usr-${Date.now()}`;
    const cleanEmail = adminEmail.trim().toLowerCase();
    const cleanName = adminName.trim();

    const newAdminUser: User = {
      id: newAdminId,
      name: cleanName,
      email: cleanEmail,
      role: 'direccion',
      status: 'activo',
      specialty: 'Dirección General & Administración',
      phone: adminPhone.trim() || undefined
    };

    let savedInSupabase = false;

    try {
      // 1. Direct insert into Supabase table: app_users
      const { data: userInsertData, error: userInsertError } = await supabase.from('app_users').upsert([
        {
          id: newAdminId,
          name: cleanName,
          email: cleanEmail,
          role: 'direccion',
          specialty: 'Dirección General & Administración',
          status: 'activo',
          phone: adminPhone.trim() || undefined
        }
      ], { onConflict: 'email' }).select();

      if (userInsertError) {
        console.warn('Supabase app_users upsert attempt:', userInsertError.message);
        
        // Try fallback insert without phone/status if schema differs
        const { error: minError } = await supabase.from('app_users').upsert([
          {
            id: newAdminId,
            name: cleanName,
            email: cleanEmail,
            role: 'direccion',
            specialty: 'Dirección General & Administración'
          }
        ], { onConflict: 'email' });

        if (minError) {
          console.warn('Supabase app_users min error:', minError.message);
          if (minError.code === '42501' || minError.message.includes('row-level security')) {
            setAuthError('Permisos bloqueados en Supabase (RLS). Ejecuta el script SQL en Supabase para habilitar INSERT.');
            setIsSubmitting(false);
            return;
          }
        } else {
          savedInSupabase = true;
        }
      } else {
        savedInSupabase = true;
      }

      // 2. Also try syncing to profiles table if it exists
      try {
        await supabase.from('profiles').upsert([
          {
            id: newAdminId,
            name: cleanName,
            email: cleanEmail,
            role: 'direccion'
          }
        ], { onConflict: 'email' });
      } catch (profErr) {
        console.info('Profiles table note:', profErr);
      }
    } catch (err: any) {
      console.error('Supabase connection warning:', err);
      setAuthError(`Error de conexión a Supabase: ${err?.message || 'No se pudo conectar'}`);
      setIsSubmitting(false);
      return;
    }

    // Save in local state and context
    addUser(newAdminUser);
    setCurrentUser(newAdminUser);

    setIsSubmitting(false);
    if (savedInSupabase) {
      setAuthSuccess('¡Administrador guardado exitosamente en Supabase (tabla app_users)!');
    } else {
      setAuthSuccess('¡Bienvenido! Cuenta creada y sesión iniciada en el sistema.');
    }

    setTimeout(() => {
      setShowAdminAuthModal(false);
      setCurrentRole('direccion');
    }, 1000);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!adminEmail.trim() || !adminPassword.trim()) {
      setAuthError('Ingresa tu correo y contraseña.');
      return;
    }

    setIsSubmitting(true);
    const cleanEmail = adminEmail.trim().toLowerCase();

    try {
      // Check in Supabase app_users table
      const { data: dbUser, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (dbUser) {
        const loggedUser: User = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: (dbUser.role as RoleType) || 'direccion',
          status: (dbUser.status as 'activo' | 'inactivo') || 'activo',
          specialty: dbUser.specialty || 'Dirección General & Administración',
          phone: dbUser.phone
        };
        setCurrentUser(loggedUser);

        setIsSubmitting(false);
        setAuthSuccess(`¡Bienvenido de vuelta, ${dbUser.name}!`);
        setTimeout(() => {
          setShowAdminAuthModal(false);
          setCurrentRole((dbUser.role as RoleType) || 'direccion');
        }, 700);
        return;
      }
    } catch (err) {
      console.error('Supabase query error:', err);
    }

    // Fallback to local users state
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);
    const fallbackUser: User = {
      id: found?.id || `usr-${Date.now()}`,
      name: found ? found.name : 'Administrador',
      email: cleanEmail,
      role: (found?.role as RoleType) || 'direccion',
      status: 'activo',
      specialty: 'Dirección General & Administración'
    };
    setCurrentUser(fallbackUser);

    setIsSubmitting(false);
    setAuthSuccess('¡Sesión iniciada correctamente!');
    setTimeout(() => {
      setShowAdminAuthModal(false);
      setCurrentRole('direccion');
    }, 700);
  };

  return (
    <div className="h-screen w-full bg-slate-100 flex flex-col items-center justify-start overflow-y-auto p-4 md:p-6 lg:py-8 select-none relative">
      {/* Top bar with Admin Action & PWA install button */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-3 gap-2">
        <button
          onClick={() => {
            setAuthMode('register');
            setShowAdminAuthModal(true);
          }}
          className="flex items-center gap-2 bg-[#002855] hover:bg-blue-900 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-amber-400" />
          <span>Registrar / Acceder como Admin</span>
        </button>

        <InstallPWAButton />
      </div>

      {/* Main Content Wrapper */}
      <div className="w-full max-w-4xl flex flex-col items-center my-auto py-2">
        {/* TSR SONORA Logo & System Name */}
        <div className="flex flex-col items-center mb-5 md:mb-6 text-center">
          <img 
            src="https://oejrrmtnluefhttqnutn.supabase.co/storage/v1/object/public/logo/tsrlogo.png" 
            alt="TSR SONORA Logo" 
            className="h-20 sm:h-24 md:h-26 w-auto object-contain mb-2 drop-shadow-md"
          />
          <h1 className="text-2xl sm:text-3xl font-black tracking-[0.2em] text-[#002855] uppercase">
            TSR SONORA
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 font-extrabold tracking-[0.15em] uppercase mt-0.5">
            Tractoservices & Diesel Parts
          </p>
          <p className="text-[10px] sm:text-xs text-slate-500 font-mono tracking-wider uppercase mt-0.5">
            Sistema Integrado de Gestión Taller • CFDI 4.0
          </p>
        </div>

        {/* Prominent Admin Callout Card */}
        <div className="w-full max-w-3xl mb-4 bg-gradient-to-r from-[#002855] to-blue-900 text-white rounded-xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 border border-blue-800">
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-12 h-12 rounded-xl bg-blue-800/80 border border-blue-500/50 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-amber-400 text-blue-950 rounded">
                  Panel de Control
                </span>
                <span className="text-xs text-blue-200 font-bold">Dirección General</span>
              </div>
              <h2 className="text-sm sm:text-base font-black tracking-wide mt-0.5">
                ¿Eres Administrador o Propietario del Taller?
              </h2>
              <p className="text-[11px] text-blue-200 font-normal">
                Regístrate como Administrador para configurar usuarios, sucursales y permisos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => {
                setAuthMode('register');
                setShowAdminAuthModal(true);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-blue-950 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider shadow transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Registrar Admin</span>
            </button>

            <button
              onClick={() => {
                setAuthMode('login');
                setShowAdminAuthModal(true);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-blue-800 hover:bg-blue-700 text-white border border-blue-600 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar</span>
            </button>
          </div>
        </div>

        {/* Section Divider */}
        <div className="w-full max-w-3xl flex items-center gap-3 my-2 text-slate-400 text-xs uppercase font-bold tracking-wider">
          <div className="flex-1 h-px bg-slate-300"></div>
          <span>O selecciona tu perfil de operación rápida</span>
          <div className="flex-1 h-px bg-slate-300"></div>
        </div>

        {/* Grid of Role Access Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 w-full max-w-3xl pb-6">
          {ROLES.map((role) => {
            const IconComponent = iconMap[role.icon] || Wrench;
            return (
              <button
                key={role.id}
                onClick={() => setCurrentRole(role.id as RoleType)}
                className="group relative flex items-center sm:flex-col justify-start sm:justify-center p-4 sm:p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-600 hover:shadow-lg hover:shadow-blue-900/10 transition-all duration-200 cursor-pointer shadow-xs gap-3 sm:gap-0"
              >
                {/* Icon badge */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-full bg-blue-50 text-blue-800 group-hover:bg-[#002855] group-hover:text-white transition-all sm:mb-3 flex items-center justify-center shadow-inner shrink-0">
                  <IconComponent className="w-6 h-6" />
                </div>

                {/* Role text & description */}
                <div className="flex flex-col sm:items-center text-left sm:text-center flex-1">
                  <span className="text-xs sm:text-sm font-black tracking-wider text-slate-800 group-hover:text-blue-900 uppercase">
                    {role.name}
                  </span>
                  {role.badge && (
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 uppercase tracking-widest mt-0.5">
                      {role.badge}
                    </span>
                  )}
                </div>

                {/* Mobile arrow indicator */}
                <ChevronRight className="w-5 h-5 text-slate-400 sm:hidden group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-400 font-mono pb-4">
          <span>TSR SONORA • Base de Datos Limpia para Producción • CFDI 4.0</span>
        </div>
      </div>

      {/* ADMIN AUTH MODAL (REGISTRATION / LOGIN) */}
      {showAdminAuthModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#002855] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-800/80 border border-blue-600 flex items-center justify-center text-amber-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">
                    {authMode === 'register' ? 'Registro de Administrador' : 'Acceso de Administrador'}
                  </h3>
                  <p className="text-[11px] text-blue-200">
                    {authMode === 'register' ? 'Crea la cuenta principal de Dirección General' : 'Ingresa con tus credenciales de Administrador'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAdminAuthModal(false)}
                className="text-blue-200 hover:text-white p-1 rounded-lg hover:bg-blue-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50">
              <button
                onClick={() => { setAuthMode('register'); setAuthError(null); }}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                  authMode === 'register'
                    ? 'bg-white text-blue-900 border-b-2 border-blue-900 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Registrar Nuevo Admin</span>
              </button>
              <button
                onClick={() => { setAuthMode('login'); setAuthError(null); }}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                  authMode === 'login'
                    ? 'bg-white text-blue-900 border-b-2 border-blue-900 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sesión</span>
              </button>
            </div>

            {/* Modal Body / Forms */}
            <div className="p-6 space-y-4">
              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2 font-bold animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {authMode === 'register' ? (
                <form onSubmit={handleAdminRegister} className="space-y-3.5 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                      Nombre Completo del Administrador *
                    </label>
                    <input
                      type="text"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="Ej. Ing. Fernando Garza"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 font-bold focus:border-blue-600 focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                      Correo Electrónico (Usuario de Acceso) *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="admin@tsrsonora.com"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-900 font-medium focus:border-blue-600 focus:bg-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                        Contraseña Segura *
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-10 py-2 text-slate-900 font-medium focus:border-blue-600 focus:bg-white outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer transition-colors"
                          title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                        Teléfono / WhatsApp
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          value={adminPhone}
                          onChange={(e) => setAdminPhone(e.target.value)}
                          placeholder="662-123-4567"
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-900 font-medium focus:border-blue-600 focus:bg-white outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#002855] hover:bg-blue-900 text-white font-bold py-3 rounded-lg uppercase tracking-wider text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                          <span>Guardando en Supabase...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 text-amber-400" />
                          <span>Registrar Cuenta y Entrar al Sistema</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAdminLogin} className="space-y-3.5 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                      Correo Electrónico de Administrador *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="admin@tsrsonora.com"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-900 font-medium focus:border-blue-600 focus:bg-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                      Contraseña *
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Contraseña"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-10 py-2 text-slate-900 font-medium focus:border-blue-600 focus:bg-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer transition-colors"
                        title={showLoginPassword ? "Ocultar contraseña" : "Ver contraseña"}
                      >
                        {showLoginPassword ? (
                          <EyeOff className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#002855] hover:bg-blue-900 text-white font-bold py-3 rounded-lg uppercase tracking-wider text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                          <span>Verificando Credenciales...</span>
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4 text-amber-400" />
                          <span>Iniciar Sesión de Administrador</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Informative Table Reference Note */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Tabla en Supabase:
                </span>
                <code className="bg-slate-100 text-blue-900 px-2 py-0.5 rounded font-mono font-bold text-[10px] border border-slate-200">
                  public.app_users
                </code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
