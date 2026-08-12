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
      <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded font-mono">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>TSR App Instalada</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Instalar App TSR en tu dispositivo"
        className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
      >
        <Download className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
        <span className="hidden sm:inline">Instalar TSR</span>
        <span className="sm:hidden">App</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0c0c] border border-white/20 p-6 rounded-lg max-w-sm w-full space-y-4 text-slate-200">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <img 
                  src="https://oejrrmtnluefhttqnutn.supabase.co/storage/v1/object/public/logo/tsricono.png" 
                  alt="TSR Icon" 
                  className="w-6 h-6 rounded object-contain"
                />
                <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500">
                  Instalar App TSR
                </h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p>
                Para instalar la aplicación <strong>TSR</strong> en tu dispositivo móvil o computadora:
              </p>

              {isIOS ? (
                <div className="p-3 bg-white/5 border border-white/10 rounded space-y-2 text-[11px]">
                  <p className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" /> En iPhone / iPad (Safari):
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300">
                    <li>Toca el botón <strong>Compartir</strong> <span className="text-amber-400">⎋</span> abajo.</li>
                    <li>Selecciona <strong>"Agregar al inicio"</strong>.</li>
                    <li>¡Listo! Tendrás el icono de TSR en tu pantalla.</li>
                  </ol>
                </div>
              ) : (
                <div className="p-3 bg-white/5 border border-white/10 rounded space-y-2 text-[11px]">
                  <p className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Info className="w-4 h-4" /> En Chrome / Android / PC:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300">
                    <li>Abre el menú de opciones de tu navegador <span className="text-amber-400 font-bold">⋮</span></li>
                    <li>Haz clic en <strong>"Instalar TSR"</strong> o <strong>"Agregar a la pantalla principal"</strong>.</li>
                  </ol>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-amber-500 text-black py-2 text-xs font-bold uppercase rounded cursor-pointer hover:bg-amber-400 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
