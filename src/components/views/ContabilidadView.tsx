import React from 'react';
import { FacturacionCajaModule } from '../modules/FacturacionCajaModule';
import { PosModule } from '../modules/PosModule';
import { PerfilModule } from '../modules/PerfilModule';
import { FinanzasBancosModule } from '../modules/FinanzasBancosModule';
import { ReportesVentasModule } from '../modules/ReportesVentasModule';

interface ContabilidadViewProps {
  activeTab: string;
}

export const ContabilidadView: React.FC<ContabilidadViewProps> = ({ activeTab }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Tab: Facturación y Timbrado CFDI 4.0 */}
      {(activeTab === 'facturacion' || activeTab === 'contabilidad') && (
        <FacturacionCajaModule />
      )}

      {/* Tab: Punto de Venta Mostrador */}
      {activeTab === 'pos' && (
        <PosModule />
      )}

      {/* Tab: Mi Perfil y Datos Fiscales */}
      {activeTab === 'perfil' && (
        <PerfilModule />
      )}

      {/* Tab: Bancos y Finanzas */}
      {activeTab === 'bancos' && (
        <FinanzasBancosModule />
      )}

      {/* Tab: Reportes Fiscales y de Ventas */}
      {activeTab === 'reportes' && (
        <ReportesVentasModule />
      )}
    </div>
  );
};
