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
    <div className="min-h-screen w-full bg-slate-100 flex flex-col items-center justify-center p-6 select-none relative">
      {/* Top bar with discreet PWA install button */}
      <div className="absolute top-4 right-4">
        <InstallPWAButton />
      </div>

      {/* TSR SONORA Logo & System Name */}
      <div className="flex flex-col items-center mb-10 text-center">
        <img 
          src="https://oejrrmtnluefhttqnutn.supabase.co/storage/v1/object/public/logo/tsrlogo.png" 
          alt="TSR SONORA Logo" 
          className="h-24 md:h-28 w-auto object-contain mb-4 drop-shadow-md"
        />
        <h1 className="text-2xl md:text-3xl font-black tracking-[0.25em] text-[#002855] uppercase">
          TSR SONORA
        </h1>
        <p className="text-xs text-slate-600 font-bold tracking-[0.2em] uppercase mt-1">
          Tractoservices & Diesel Parts
        </p>
        <p className="text-[11px] text-slate-500 font-mono tracking-wider uppercase mt-0.5">
          Sistema Integrado de Gestión Taller
        </p>
      </div>

      {/* Grid of 5 Role Access Buttons - 2 Columns Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
        {ROLES.map((role) => {
          const IconComponent = iconMap[role.icon] || Wrench;
          return (
            <button
              key={role.id}
              onClick={() => setCurrentRole(role.id as RoleType)}
              className="group relative flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-xl hover:border-blue-600 hover:shadow-lg hover:shadow-blue-900/10 transition-all duration-200 cursor-pointer last:sm:col-span-2 shadow-sm"
            >
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-700 group-hover:bg-[#002855] group-hover:text-white transition-colors mb-3 flex items-center justify-center shadow-inner">
                <IconComponent className="w-7 h-7" />
              </div>
              <span className="text-sm font-extrabold tracking-wider text-slate-800 group-hover:text-blue-900 uppercase text-center">
                {role.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

