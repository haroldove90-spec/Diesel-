import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, Info, Smartphone, X } from 'lucide-react';

export const InstallPWAButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is running as standalone (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
    }

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowModal(true);
    }
  };

  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded font-mono font-bold">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
        <span>TSR App Instalada</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Instalar App TSR SONORA en tu dispositivo"
        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white border border-blue-400 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm"
      >
        <Download className="w-3.5 h-3.5 text-white animate-bounce" />
        <span className="hidden sm:inline">Instalar App</span>
        <span className="sm:hidden">App</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-xl max-w-sm w-full space-y-4 text-slate-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <img 
                  src="https://oejrrmtnluefhttqnutn.supabase.co/storage/v1/object/public/logo/tsricono.png" 
                  alt="TSR SONORA Icon" 
                  className="w-7 h-7 rounded object-contain"
                />
                <h3 className="text-xs font-black uppercase tracking-widest text-[#002855]">
                  Instalar TSR SONORA
                </h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p>
                Para instalar la aplicación <strong>TSR SONORA</strong> en tu dispositivo móvil o computadora:
              </p>

              {isIOS ? (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2 text-[11px]">
                  <p className="font-bold text-[#002855] flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-blue-600" /> En iPhone / iPad (Safari):
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-700">
                    <li>Toca el botón <strong>Compartir</strong> <span className="text-blue-600">⎋</span> abajo.</li>
                    <li>Selecciona <strong>"Agregar al inicio"</strong>.</li>
                    <li>¡Listo! Tendrás el icono de TSR SONORA en tu pantalla.</li>
                  </ol>
                </div>
              ) : (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2 text-[11px]">
                  <p className="font-bold text-[#002855] flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-600" /> En Chrome / Android / PC:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-700">
                    <li>Abre el menú de opciones de tu navegador <span className="text-blue-600 font-bold">⋮</span></li>
                    <li>Haz clic en <strong>"Instalar TSR SONORA"</strong> o <strong>"Agregar a la pantalla principal"</strong>.</li>
                  </ol>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-[#002855] text-white py-2 text-xs font-bold uppercase rounded-lg cursor-pointer hover:bg-blue-900 transition-colors shadow-md"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
