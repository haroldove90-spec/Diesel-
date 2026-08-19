import React, { useState, useEffect } from 'react';
import { WorkshopProvider, useWorkshop } from './context/WorkshopContext';
import { HomeRoleSelector } from './components/HomeRoleSelector';
import { Header } from './components/Header';
import { Navigation, ROLE_MODULES } from './components/Navigation';
import { DireccionView } from './components/views/DireccionView';
import { AsesorView } from './components/views/AsesorView';
import { TecnicoView } from './components/views/TecnicoView';
import { AlmacenView } from './components/views/AlmacenView';
import { ContabilidadView } from './components/views/ContabilidadView';
import { ClienteView } from './components/views/ClienteView';

const MainLayout: React.FC = () => {
  const { currentRole } = useWorkshop();

  // Active module tab state initialized from localStorage if available
  const [activeTab, setActiveTabState] = useState<string>(() => {
    try {
      if (currentRole) {
        const savedTab = localStorage.getItem('TSR_ACTIVE_TAB');
        const modules = ROLE_MODULES[currentRole];
        if (savedTab && modules && modules.some(m => m.id === savedTab)) {
          return savedTab;
        }
        if (modules && modules.length > 0) {
          return modules[0].id;
        }
      }
    } catch {}
    return '';
  });

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    try {
      if (tab) {
        localStorage.setItem('TSR_ACTIVE_TAB', tab);
      }
    } catch {}
  };

  // Whenever role changes, verify that activeTab belongs to current role
  useEffect(() => {
    if (currentRole) {
      const modules = ROLE_MODULES[currentRole];
      if (modules && modules.length > 0) {
        const savedTab = localStorage.getItem('TSR_ACTIVE_TAB');
        if (savedTab && modules.some(m => m.id === savedTab)) {
          setActiveTabState(savedTab);
        } else {
          setActiveTabState(modules[0].id);
          try {
            localStorage.setItem('TSR_ACTIVE_TAB', modules[0].id);
          } catch {}
        }
      }
    }
  }, [currentRole]);

  // If no role is selected, render minimalist Home Role Selector with NO header
  if (!currentRole) {
    return <HomeRoleSelector />;
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 text-slate-800 overflow-hidden font-sans">
      {/* Top Header with Logo, System Name, Metrics & Logout button */}
      <Header />

      {/* Main Container: Sidebar/Mobile Nav + Main Content View */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden pb-16 md:pb-0">
        {/* Navigation (Left sidebar on desktop, bottom bar on mobile) */}
        <Navigation 
          role={currentRole} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        {/* Main Role Content View */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
          {currentRole === 'direccion' && <DireccionView activeTab={activeTab} />}
          {currentRole === 'contabilidad' && <ContabilidadView activeTab={activeTab} />}
          {currentRole === 'asesor' && <AsesorView activeTab={activeTab} />}
          {currentRole === 'tecnico' && <TecnicoView activeTab={activeTab} />}
          {currentRole === 'almacen' && <AlmacenView activeTab={activeTab} />}
          {currentRole === 'cliente' && <ClienteView activeTab={activeTab} />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <WorkshopProvider>
      <MainLayout />
    </WorkshopProvider>
  );
}
