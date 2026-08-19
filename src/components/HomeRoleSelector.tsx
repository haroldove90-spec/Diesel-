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
  Truck,
  Receipt,
  Coins,
  DollarSign,
  Calculator,
  ChevronRight,
  Shield
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
  const { setCurrentRole } = useWorkshop();

  return (
    <div className="h-screen w-full bg-slate-100 flex flex-col items-center justify-start overflow-y-auto p-4 md:p-6 lg:py-10 select-none relative">
      {/* Top bar with discreet PWA install button */}
      <div className="w-full max-w-4xl flex justify-end mb-2">
        <InstallPWAButton />
      </div>

      {/* Main Content Wrapper to guarantee full scrolling and no bottom clipping */}
      <div className="w-full max-w-4xl flex flex-col items-center my-auto py-4">
        {/* TSR SONORA Logo & System Name */}
        <div className="flex flex-col items-center mb-6 md:mb-8 text-center">
          <img 
            src="https://oejrrmtnluefhttqnutn.supabase.co/storage/v1/object/public/logo/tsrlogo.png" 
            alt="TSR SONORA Logo" 
            className="h-20 sm:h-24 md:h-28 w-auto object-contain mb-3 drop-shadow-md"
          />
          <h1 className="text-2xl sm:text-3xl font-black tracking-[0.2em] text-[#002855] uppercase">
            TSR SONORA
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 font-extrabold tracking-[0.15em] uppercase mt-1">
            Tractoservices & Diesel Parts
          </p>
          <p className="text-[10px] sm:text-xs text-slate-500 font-mono tracking-wider uppercase mt-0.5">
            Sistema Integrado de Gestión Taller • CFDI 4.0
          </p>
        </div>

        {/* Grid of Role Access Buttons - Responsive and Fully Accessible */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 w-full max-w-3xl pb-10">
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
        <div className="text-center text-[11px] text-slate-400 font-mono pb-6">
          <span>TSR SONORA v2.5 • Hermosillo, Sonora México</span>
        </div>
      </div>
    </div>
  );
};
