import React from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import { ROLES } from '../data/mockData';
import { RoleType } from '../types';
import { InstallPWAButton } from './InstallPWAButton';
import { 
  Building2, 
  ClipboardList, 
  Wrench, 
  PackageSearch, 
  Truck 
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Building2,
  ClipboardList,
  Wrench,
  PackageSearch,
  Truck
};

export const HomeRoleSelector: React.FC = () => {
  const { setCurrentRole } = useWorkshop();

  return (
    <div className="min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center p-6 select-none relative">
      {/* Top bar with discreet PWA install button */}
      <div className="absolute top-4 right-4">
        <InstallPWAButton />
      </div>

      {/* TSR Logo & System Name */}
      <div className="flex flex-col items-center mb-10 text-center">
        <img 
          src="https://oejrrmtnluefhttqnutn.supabase.co/storage/v1/object/public/logo/tsrlogo.png" 
          alt="TSR Logo" 
          className="h-16 md:h-20 w-auto object-contain mb-4 drop-shadow-md"
        />
        <h1 className="text-xl md:text-2xl font-bold tracking-[0.25em] text-white uppercase">
          TSR
        </h1>
        <p className="text-xs text-slate-400 tracking-wider uppercase mt-1">
          Sistema Integrado de Gestión para Taller Diesel
        </p>
      </div>

      {/* Grid of 5 Role Access Buttons - 2 Columns Layout */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-xl">
        {ROLES.map((role) => {
          const IconComponent = iconMap[role.icon] || Wrench;
          return (
            <button
              key={role.id}
              onClick={() => setCurrentRole(role.id as RoleType)}
              className="group relative flex flex-col items-center justify-center p-6 bg-[#0c0c0c] border border-white/10 rounded-lg hover:border-amber-500 hover:bg-[#141414] transition-all duration-200 cursor-pointer last:col-span-2"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-colors mb-4">
                <IconComponent className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold tracking-wider text-slate-200 group-hover:text-white uppercase text-center">
                {role.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

