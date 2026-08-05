import React from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import { ROLES } from '../data/mockData';
import { RoleType } from '../types';
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
    <div className="min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center p-6 select-none">
      {/* Minimal Logo ONLY */}
      <div className="flex flex-col items-center mb-12">
        <div className="w-16 h-16 bg-amber-500 rounded-lg flex items-center justify-center text-black font-black italic text-2xl shadow-lg shadow-amber-500/10 mb-4">
          TD
        </div>
        <h1 className="text-xl font-bold tracking-[0.25em] text-white uppercase">
          Taller Diesel
        </h1>
      </div>

      {/* Grid of 5 Role Access Buttons - Minimalist: Icon + Name ONLY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full max-w-5xl">
        {ROLES.map((role) => {
          const IconComponent = iconMap[role.icon] || Wrench;
          return (
            <button
              key={role.id}
              onClick={() => setCurrentRole(role.id as RoleType)}
              className="group relative flex flex-col items-center justify-center p-6 bg-[#0c0c0c] border border-white/10 rounded-lg hover:border-amber-500 hover:bg-[#141414] transition-all duration-200 cursor-pointer"
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
