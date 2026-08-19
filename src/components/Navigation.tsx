import React, { useRef, useEffect } from 'react';
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
  ClipboardCheck,
  Calendar,
  Receipt,
  ShoppingBag,
  Building2,
  TrendingUp,
  Calculator,
  UserCheck
} from 'lucide-react';

export interface ModuleItem {
  id: string;
  name: string;
  icon: React.ElementType;
}

export const ROLE_MODULES: Record<RoleType, ModuleItem[]> = {
  direccion: [
    { id: 'dashboard', name: 'Dashboard Gerencial', icon: BarChart3 },
    { id: 'reportes', name: 'Ventas y Reportes', icon: TrendingUp },
    { id: 'finanzas', name: 'Bancos y Finanzas', icon: Wallet },
    { id: 'compras', name: 'Órdenes de Compra', icon: ShoppingBag },
    { id: 'contabilidad', name: 'Contabilidad y Fiscal', icon: Calculator },
    { id: 'pos', name: 'Punto de Venta', icon: ShoppingCart },
    { id: 'perfil', name: 'Mi Perfil Fiscal', icon: UserCheck },
    { id: 'contactos', name: 'Clientes y Flotas', icon: Building2 },
    { id: 'usuarios', name: 'Usuarios y Permisos', icon: Users },
    { id: 'ordentrabajo', name: 'Orden de Trabajo', icon: ClipboardCheck }
  ],
  contabilidad: [
    { id: 'facturacion', name: 'Facturación CFDI 4.0', icon: Receipt },
    { id: 'pos', name: 'Punto de Venta', icon: ShoppingCart },
    { id: 'perfil', name: 'Mi Perfil y Fiscal', icon: UserCheck },
    { id: 'bancos', name: 'Bancos y Tesorería', icon: Wallet },
    { id: 'reportes', name: 'Reportes y Cierres', icon: TrendingUp }
  ],
  asesor: [
    { id: 'citas', name: 'Gestión de Citas', icon: Calendar },
    { id: 'recepcion', name: 'Recepción e Ingreso', icon: Truck },
    { id: 'cotizaciones', name: 'Presupuestos y Links', icon: FileText },
    { id: 'ordentrabajo', name: 'Orden de Trabajo', icon: ClipboardCheck },
    { id: 'facturacion', name: 'Facturación y Caja', icon: Receipt },
    { id: 'pos', name: 'Punto de Venta', icon: ShoppingCart },
    { id: 'contactos', name: 'Directorio Clientes', icon: Users },
    { id: 'entrega', name: 'Entrega y Cierre', icon: CheckCircle2 }
  ],
  tecnico: [
    { id: 'panel', name: 'Panel de Taller', icon: Wrench },
    { id: 'ordentrabajo', name: 'Orden de Trabajo', icon: ClipboardCheck },
    { id: 'evidencia', name: 'Evidencia Digital', icon: Camera },
    { id: 'solicitud', name: 'Solicitud Refacciones', icon: PackagePlus }
  ],
  almacen: [
    { id: 'inventario', name: 'Inventario y Kardex', icon: Boxes },
    { id: 'herramientas', name: 'Control Herramientas', icon: Wrench },
    { id: 'compras', name: 'Órdenes de Compra', icon: ShoppingBag },
    { id: 'pos', name: 'Punto de Venta', icon: ShoppingCart },
    { id: 'surtido', name: 'Surtido a Taller', icon: SendToBack },
    { id: 'proveedores', name: 'Proveedores', icon: Building2 }
  ],
  cliente: [
    { id: 'seguimiento', name: 'Seguimiento de Orden', icon: Eye },
    { id: 'agendar', name: 'Agendar Cita en Línea', icon: Calendar }
  ]
};

interface NavigationProps {
  role: RoleType;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ role, activeTab, setActiveTab }) => {
  const modules = ROLE_MODULES[role] || [];
  const navContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active item into view on mobile
  useEffect(() => {
    if (navContainerRef.current) {
      const activeEl = navContainerRef.current.querySelector<HTMLButtonElement>(`[data-tab-id="${activeTab}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeTab]);

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

      {/* Mobile & Tablet Bottom Navigation Bar with Horizontal Smooth Scroll */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-40 shadow-xl">
        <div 
          ref={navContainerRef}
          className="flex items-center h-full px-2 gap-1.5 overflow-x-auto scroll-smooth overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {modules.map((mod) => {
            const Icon = mod.icon;
            const isActive = activeTab === mod.id;
            return (
              <button
                key={mod.id}
                data-tab-id={mod.id}
                onClick={() => setActiveTab(mod.id)}
                className={`flex flex-col items-center justify-center shrink-0 min-w-[78px] px-2 py-1.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-[#002855] font-extrabold border border-blue-200/80 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1 shrink-0 ${isActive ? 'text-blue-700 stroke-[2.5]' : 'text-slate-400'}`} />
                <span className="text-[10px] whitespace-nowrap leading-tight tracking-tight">
                  {mod.name}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
