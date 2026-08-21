import React from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import { ROLES } from '../data/mockData';
import { LogOut, User as UserIcon } from 'lucide-react';
import { InstallPWAButton } from './InstallPWAButton';

export const Header: React.FC = () => {
  const { currentRole, setCurrentRole, currentUser, setCurrentUser, orders, warehouseRequests } = useWorkshop();

  const roleInfo = ROLES.find(r => r.id === currentRole);

  const activeUnitsCount = orders.filter(o => o.status !== 'Finalizada').length;
  const pendingPartsCount = warehouseRequests.filter(r => r.status === 'pendiente').length;

  const handleLogout = () => {
    setCurrentRole(null);
  };

  return (
    <header className="h-14 border-b border-blue-900 px-4 md:px-6 flex items-center justify-between bg-[#002855] text-white z-20 shrink-0 w-full shadow-md">
      {/* Brand & System Name */}
      <div className="flex items-center gap-3">
        <img 
          src="https://oejrrmtnluefhttqnutn.supabase.co/storage/v1/object/public/logo/tsrlogo.png" 
          alt="TSR SONORA Logo" 
          className="h-9 w-auto object-contain max-w-[140px] drop-shadow"
        />
        <div className="flex flex-col">
          <span className="text-white font-extrabold tracking-wider text-xs md:text-sm uppercase flex items-center gap-2">
            TSR SONORA
          </span>
          <span className="text-[10px] text-blue-200 tracking-widest uppercase font-medium hidden sm:inline">
            Tractoservices & Diesel Parts
          </span>
        </div>
      </div>

      {/* Workshop Live Metrics (Minimalist pills) */}
      <div className="hidden lg:flex items-center gap-6 text-[11px] font-semibold tracking-wider uppercase">
        <div className="flex items-center gap-2 text-blue-100 bg-blue-900/50 border border-blue-700/60 px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> 
          <span>{activeUnitsCount} Unidades en Piso</span>
        </div>
        <div className="flex items-center gap-2 text-blue-200 bg-blue-900/40 border border-blue-800/60 px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span> 
          <span>{pendingPartsCount} Pendientes de Repuesto</span>
        </div>
      </div>

      {/* User Name & Role Indicator, PWA Install & Cerrar Sesión Button */}
      <div className="flex items-center gap-2 sm:gap-3">
        <InstallPWAButton />

        {/* Logged-in User Identity Display */}
        {currentUser ? (
          <div className="flex items-center gap-2 bg-blue-950/80 border border-blue-600/70 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold text-white shadow-sm">
            <div className="w-6 h-6 rounded-full bg-amber-400 text-blue-950 font-black text-xs flex items-center justify-center shrink-0 shadow">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-white font-bold text-[11px] max-w-[110px] sm:max-w-[160px] truncate">
                {currentUser.name}
              </span>
              <span className="text-[9px] text-amber-300 font-semibold uppercase tracking-wider">
                {currentUser.role === 'direccion' ? 'Dirección General' : (roleInfo?.name || currentUser.role)}
              </span>
            </div>
          </div>
        ) : roleInfo ? (
          <div className="hidden sm:flex items-center gap-2 bg-blue-900/60 border border-blue-600/50 px-3 py-1 rounded text-xs font-bold text-white shadow-sm">
            <span className="text-blue-200 uppercase">{roleInfo.name}</span>
          </div>
        ) : null}

        <button
          onClick={handleLogout}
          title="Cerrar Sesión / Salir al Menú"
          className="flex items-center gap-1.5 bg-blue-900/80 hover:bg-red-600 text-white border border-blue-600 hover:border-red-500 px-2.5 sm:px-3 py-1.5 text-xs rounded transition-all font-bold uppercase tracking-wider cursor-pointer shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Cerrar Sesión</span>
        </button>
      </div>
    </header>
  );
};

