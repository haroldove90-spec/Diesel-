import React from 'react';
import { RoleType } from '../types';
import { 
  BarChart3, 
  Wallet, 
  Users, 
  Truck, 
  FileText, 
  CheckCircle2, 
  Wrench, 
  Camera, 
  PackagePlus, 
  Boxes, 
  ShoppingCart, 
  SendToBack,
  Eye,
  ClipboardCheck
} from 'lucide-react';

export interface ModuleItem {
  id: string;
  name: string;
  icon: React.ElementType;
}

export const ROLE_MODULES: Record<RoleType, ModuleItem[]> = {
  direccion: [
    { id: 'dashboard', name: 'Dashboard Gerencial', icon: BarChart3 },
    { id: 'finanzas', name: 'Finanzas y Cajas', icon: Wallet },
    { id: 'usuarios', name: 'Usuarios y Permisos', icon: Users },
    { id: 'ordentrabajo', name: 'Orden de Trabajo', icon: ClipboardCheck }
  ],
  asesor: [
    { id: 'recepcion', name: 'Recepción e Ingreso', icon: Truck },
    { id: 'cotizaciones', name: 'Presupuestos y Links', icon: FileText },
    { id: 'ordentrabajo', name: 'Orden de Trabajo', icon: ClipboardCheck },
    { id: 'entrega', name: 'Entrega y Cierre', icon: CheckCircle2 }
  ],
  tecnico: [
    { id: 'panel', name: 'Panel de Taller', icon: Wrench },
    { id: 'ordentrabajo', name: 'Orden de Trabajo', icon: ClipboardCheck },
    { id: 'evidencia', name: 'Evidencia Digital', icon: Camera },
    { id: 'solicitud', name: 'Solicitud de Refacciones', icon: PackagePlus }
  ],
  almacen: [
    { id: 'inventario', name: 'Inventario y Kardex', icon: Boxes },
    { id: 'pos', name: 'Punto de Venta', icon: ShoppingCart },
    { id: 'surtido', name: 'Surtido a Taller', icon: SendToBack }
  ],
  cliente: [
    { id: 'seguimiento', name: 'Seguimiento de Orden', icon: Eye }
  ]
};

interface NavigationProps {
  role: RoleType;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ role, activeTab, setActiveTab }) => {
  const modules = ROLE_MODULES[role] || [];

  return (
    <>
      {/* Desktop Left Sidebar Navigation */}
      <aside className="hidden md:flex w-64 border-r border-slate-200 flex-col justify-between py-6 bg-white shrink-0 h-full shadow-sm">
        <div className="px-4">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">
            Módulos del Rol
          </p>
          <nav className="space-y-1.5">
            {modules.map((mod) => {
              const Icon = mod.icon;
              const isActive = activeTab === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveTab(mod.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold tracking-wide rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#002855] text-white shadow-md font-bold'
                      : 'text-slate-600 hover:text-blue-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-300' : 'text-blue-600'}`} />
                  <span className="truncate">{mod.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile & Tablet Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around z-30 px-2 shadow-lg">
        {modules.map((mod) => {
          const Icon = mod.icon;
          const isActive = activeTab === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveTab(mod.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold transition-colors ${
                isActive ? 'text-[#002855] font-extrabold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-[#002855]' : 'text-slate-400'}`} />
              <span className="truncate max-w-[80px]">{mod.name}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
