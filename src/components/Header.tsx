import React from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import { ROLES } from '../data/mockData';
import { LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentRole, setCurrentRole, orders, warehouseRequests } = useWorkshop();

  const roleInfo = ROLES.find(r => r.id === currentRole);

  const activeUnitsCount = orders.filter(o => o.status !== 'Finalizada').length;
  const pendingPartsCount = warehouseRequests.filter(r => r.status === 'pendiente').length;

  return (
    <header className="h-14 border-b border-white/10 px-4 md:px-6 flex items-center justify-between bg-black z-20 shrink-0 w-full">
      {/* Brand & System Name */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center text-black font-black italic text-sm shadow-sm">
          TD
        </div>
        <span className="text-white font-bold tracking-widest text-xs md:text-sm uppercase flex items-center gap-2">
          Taller Diesel <span className="font-thin opacity-50 hidden sm:inline">| OS System</span>
        </span>
      </div>

      {/* Workshop Live Metrics (Minimalist pills) */}
      <div className="hidden lg:flex items-center gap-6 text-[11px] font-semibold tracking-wider uppercase">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> 
          <span>{activeUnitsCount} Unidades en Piso</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span> 
          <span>{pendingPartsCount} Pendientes de Repuesto</span>
        </div>
      </div>

      {/* Role Indicator & Cerrar Sesión Button */}
      <div className="flex items-center gap-3">
        {roleInfo && (
          <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded text-xs">
            <span className="text-amber-500 font-bold uppercase">{roleInfo.name}</span>
          </div>
        )}

        <button
          onClick={() => setCurrentRole(null)}
          title="Cambiar de Rol / Cerrar Sesión"
          className="flex items-center gap-2 border border-white/10 hover:border-red-500 hover:text-red-400 text-slate-300 px-3 py-1.5 text-xs rounded transition-colors font-bold uppercase tracking-wider cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Cerrar Sesión</span>
        </button>
      </div>
    </header>
  );
};
