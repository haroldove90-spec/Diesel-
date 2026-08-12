import React, { useState, useEffect, useRef } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import { 
  WorkOrderData, 
  WorkOrderDiagnosisItem, 
  WorkOrderActivityLog, 
  WorkOrderPartItem, 
  WorkOrderChecklistItem,
  ServiceOrder 
} from '../../types';
import { 
  FileText, 
  Printer, 
  Download, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck,
  Save,
  Truck,
  Wrench,
  UserCheck,
  ClipboardList
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Default checklist items from PDF
const DEFAULT_CHECKLIST_ITEMS: Omit<WorkOrderChecklistItem, 'id'>[] = [
  { systemName: 'Niveles de fluidos (Aceite, Anticongelante, Dirección)', status: 'ok', comments: 'Niveles a nivel de operación correcto' },
  { systemName: 'Sistema de frenos, mangueras y presión de aire', status: 'ok', comments: 'Presión constante 120 PSI sin fugas' },
  { systemName: 'Sistema eléctrico (Luces, Baterías, Marcha, Tablero)', status: 'ok', comments: 'Luces y acumuladores en óptimo estado' },
  { systemName: 'Suspensión y dirección (Sin holguras)', status: 'ok', comments: 'Dirección suave sin juego excesivo' },
  { systemName: 'Ausencia de fugas (Aceite, refrigerante, aire, diésel)', status: 'ok', comments: 'Hermético' },
  { systemName: 'Limpieza del área de trabajo y herramienta recogida', status: 'ok', comments: 'Unidad y bahía limpias' }
];

interface WorkOrderModuleProps {
  // Allow opening for a specific order or embedding into role views
  defaultOrderId?: string;
}

export const WorkOrderModule: React.FC<WorkOrderModuleProps> = ({ defaultOrderId }) => {
  const { orders, updateWorkOrderData, users } = useWorkshop();

  const [selectedOrderId, setSelectedOrderId] = useState<string>(defaultOrderId || orders[0]?.id || '');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [saveNotification, setSaveNotification] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Current target Service Order
  const currentOS = orders.find(o => o.id === selectedOrderId) || orders[0];

  // Helper to initialize or extract WorkOrderData
  const getInitialWorkOrderData = (os: ServiceOrder): WorkOrderData => {
    if (os?.workOrderData) return os.workOrderData;

    // Build default data from existing OS
    const today = new Date().toISOString().split('T')[0];
    
    // Convert OS parts to WorkOrder parts
    const initialParts: WorkOrderPartItem[] = (os?.parts || []).map((p, idx) => ({
      id: `part-${idx}`,
      code: p.code,
      description: p.name,
      quantity: p.quantity
    }));

    if (initialParts.length === 0) {
      initialParts.push(
        { id: 'part-1', code: 'FLE-FF5776', description: 'Filtro de Combustible Separador Fleetguard', quantity: 1 },
        { id: 'part-2', code: 'ROT-15W40', description: 'Aceite Mineral Shell Rotella 15W-40 (Cubeta)', quantity: 2 }
      );
    }

    // Convert OS checklist or build defaults
    const finalChecklist: WorkOrderChecklistItem[] = DEFAULT_CHECKLIST_ITEMS.map((item, idx) => ({
      id: `chk-${idx}`,
      ...item
    }));

    return {
      id: `OT-${os?.id || '9283'}`,
      osNumber: os?.id || 'OS-9283',
      entryDate: os?.createdAt ? os.createdAt.split(' ')[0] : today,
      estimatedDeliveryDate: today,
      maintenanceType: 'Correctivo',
      unitNumber: os?.vehicle?.plates ? `UNI-${os.vehicle.plates.slice(-4)}` : 'ECO-104',
      brandAndModel: `${os?.vehicle?.brand || 'Kenworth'} ${os?.vehicle?.model || 'T680'}`,
      year: os?.vehicle?.year || '2021',
      vin: os?.vehicle?.vin || '1XKDDB9X1MD829103',
      plates: os?.vehicle?.plates || 'ABC-1234',
      currentMileage: os?.vehicle?.mileageOrHours || '420,400 KM',
      horometer: '12,400 hrs',
      responsibleMechanic: os?.assignedTechnicianName || 'Ricardo M.',
      supervisorInCharge: 'Ing. Fernando Garza',
      diagnoses: [
        {
          id: 'diag-1',
          no: 1,
          reportedFault: os?.faultReason || 'Pérdida de potencia en subida y humo negro.',
          initialDiagnosis: 'Fuga en manguera de intercooler e inyector #3 fuera de rango.',
          estimatedHours: 6
        }
      ],
      activityLogs: [
        {
          id: 'act-1',
          date: today,
          startTime: '08:00',
          endTime: '10:00',
          effectiveTime: '2.0 hrs',
          taskDescription: 'Escaneo con computadora Insite HD y prueba de hermeticidad de admisión.',
          initials: 'RM'
        },
        {
          id: 'act-2',
          date: today,
          startTime: '10:30',
          endTime: '14:30',
          effectiveTime: '4.0 hrs',
          taskDescription: 'Reemplazo de inyector dañado, ajuste de punterías y cambio de manguera intercooler.',
          initials: 'RM'
        }
      ],
      partsUsed: initialParts,
      finalChecklist,
      roadTestsDone: 'Prueba de ruta realizada en autopista (30 km con carga). Presión de turbo a 32 PSI estable, sin humo ni códigos de falla.',
      technicalRecommendations: 'Se recomienda cambio de aceite y filtros secundarios en los próximos 15,000 km. Monitorear nivel de anticongelante.',
      mechanicSigned: true,
      supervisorSigned: true,
      mechanicSignatureDate: today,
      supervisorSignatureDate: today
    };
  };

  const [formData, setFormData] = useState<WorkOrderData>(() => getInitialWorkOrderData(currentOS));

  // Sync formData when selectedOrderId changes
  useEffect(() => {
    if (currentOS) {
      setFormData(getInitialWorkOrderData(currentOS));
    }
  }, [selectedOrderId]);

  // Handle Save
  const handleSaveData = () => {
    if (currentOS) {
      updateWorkOrderData(currentOS.id, formData);
      setSaveNotification(true);
      setTimeout(() => setSaveNotification(false), 3000);
    }
  };

  // Add / Delete Diagnosis Row
  const handleAddDiagnosis = () => {
    setFormData(prev => ({
      ...prev,
      diagnoses: [
        ...prev.diagnoses,
        {
          id: `diag-${Date.now()}`,
          no: prev.diagnoses.length + 1,
          reportedFault: '',
          initialDiagnosis: '',
          estimatedHours: 1
        }
      ]
    }));
  };

  const handleDeleteDiagnosis = (id: string) => {
    setFormData(prev => ({
      ...prev,
      diagnoses: prev.diagnoses.filter(d => d.id !== id).map((d, i) => ({ ...d, no: i + 1 }))
    }));
  };

  // Add / Delete Activity Log Row
  const handleAddActivity = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      activityLogs: [
        ...prev.activityLogs,
        {
          id: `act-${Date.now()}`,
          date: today,
          startTime: '09:00',
          endTime: '11:00',
          effectiveTime: '2.0 hrs',
          taskDescription: '',
          initials: 'RM'
        }
      ]
    }));
  };

  const handleDeleteActivity = (id: string) => {
    setFormData(prev => ({
      ...prev,
      activityLogs: prev.activityLogs.filter(a => a.id !== id)
    }));
  };

  // Add / Delete Part Row
  const handleAddPart = () => {
    setFormData(prev => ({
      ...prev,
      partsUsed: [
        ...prev.partsUsed,
        {
          id: `part-${Date.now()}`,
          code: '',
          description: '',
          quantity: 1
        }
      ]
    }));
  };

  const handleDeletePart = (id: string) => {
    setFormData(prev => ({
      ...prev,
      partsUsed: prev.partsUsed.filter(p => p.id !== id)
    }));
  };

  // PDF Export Generation Ref
  const pdfPrintRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!pdfPrintRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const element = pdfPrintRef.current;
      
      // Temporarily ensure container is visible and styled for canvas capture
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`TSR_SONORA_Orden_de_Trabajo_${formData.osNumber}.pdf`);
    } catch (err) {
      console.error('Error generando PDF:', err);
      // Fallback to window print
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 bg-slate-50 overflow-y-auto min-h-0 space-y-6 text-slate-800">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#002855]" />
            <h1 className="text-sm md:text-base font-black text-[#002855] uppercase tracking-wider">
              Módulo de Orden de Trabajo (Hoja de Servicio y Bitácora)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registro de diagnosticos, tiempos efectivos de trabajo, refacciones, checklist y firmas de liberación.
          </p>
        </div>

        {/* Actions & Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Order Selector */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-600 uppercase px-1">Seleccionar OS:</span>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="bg-white border border-slate-300 text-xs text-[#002855] font-bold font-mono px-2 py-1 rounded outline-none"
            >
              {orders.map(o => (
                <option key={o.id} value={o.id}>
                  {o.id} - {o.vehicle.brand} ({o.vehicle.plates})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSaveData}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all shadow-sm cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar Cambios</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 bg-[#002855] hover:bg-blue-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isGeneratingPdf ? 'Generando PDF...' : 'Exportar PDF'}</span>
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Vista Previa Impresión</span>
          </button>
        </div>
      </div>

      {saveNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold uppercase rounded-lg flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>¡Datos de la Orden de Trabajo guardados correctamente en la base de datos!</span>
        </div>
      )}

      {/* FORM SECTIONS (1 to 9) */}
      <div className="space-y-6">

        {/* 1 & 2 & 3: GENERAL DATA, VEHICLE & STAFF */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#002855] border-b border-slate-200 pb-2 flex items-center justify-between">
            <span>1, 2 y 3. Datos Generales, Unidad y Personal Responsable</span>
            <span className="text-[10px] text-slate-400 font-mono">TSR SONORA DIESEL</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Section 1: Generales */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <p className="font-bold text-[#002855] uppercase text-[10px] border-b border-slate-200 pb-1">1. Datos Generales</p>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block">OS No.:</label>
                <input
                  type="text"
                  value={formData.osNumber}
                  onChange={(e) => setFormData({ ...formData, osNumber: e.target.value })}
                  className="w-full bg-white border border-slate-300 p-1 rounded font-mono font-bold text-blue-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block">Fecha Ingreso:</label>
                  <input
                    type="date"
                    value={formData.entryDate}
                    onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 p-1 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block">Entrega Estimada:</label>
                  <input
                    type="date"
                    value={formData.estimatedDeliveryDate}
                    onChange={(e) => setFormData({ ...formData, estimatedDeliveryDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 p-1 rounded font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">Tipo de Mantenimiento:</label>
                <div className="flex gap-2">
                  {(['Correctivo', 'Preventivo', 'Garantía'] as const).map(type => (
                    <label key={type} className="flex items-center gap-1 cursor-pointer text-[10px] font-bold">
                      <input
                        type="radio"
                        name="maintenanceType"
                        checked={formData.maintenanceType === type}
                        onChange={() => setFormData({ ...formData, maintenanceType: type })}
                        className="text-blue-800 focus:ring-0"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 2: Tractocamión */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <p className="font-bold text-[#002855] uppercase text-[10px] border-b border-slate-200 pb-1">2. Datos del Tractocamión</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block">Nº Económico / Unidad:</label>
                  <input
                    type="text"
                    value={formData.unitNumber}
                    onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                    className="w-full bg-white border border-slate-300 p-1 rounded font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block">Marca y Modelo:</label>
                  <input
                    type="text"
                    value={formData.brandAndModel}
                    onChange={(e) => setFormData({ ...formData, brandAndModel: e.target.value })}
                    className="w-full bg-white border border-slate-300 p-1 rounded font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block">Año:</label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full bg-white border border-slate-300 p-1 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block">Placas:</label>
                  <input
                    type="text"
                    value={formData.plates}
                    onChange={(e) => setFormData({ ...formData, plates: e.target.value })}
                    className="w-full bg-white border border-slate-300 p-1 rounded font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block">Horómetro:</label>
                  <input
                    type="text"
                    value={formData.horometer}
                    onChange={(e) => setFormData({ ...formData, horometer: e.target.value })}
                    className="w-full bg-white border border-slate-300 p-1 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block">Nº Serie (VIN):</label>
                  <input
                    type="text"
                    value={formData.vin}
                    onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                    className="w-full bg-white border border-slate-300 p-1 rounded font-mono text-[10px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block">Kilometraje Actual:</label>
                  <input
                    type="text"
                    value={formData.currentMileage}
                    onChange={(e) => setFormData({ ...formData, currentMileage: e.target.value })}
                    className="w-full bg-white border border-slate-300 p-1 rounded font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Personal */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <p className="font-bold text-[#002855] uppercase text-[10px] border-b border-slate-200 pb-1">3. Datos del Personal</p>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block">Mecánico Responsable:</label>
                <input
                  type="text"
                  value={formData.responsibleMechanic}
                  onChange={(e) => setFormData({ ...formData, responsibleMechanic: e.target.value })}
                  className="w-full bg-white border border-slate-300 p-1.5 rounded font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block">Supervisor a Cargo:</label>
                <input
                  type="text"
                  value={formData.supervisorInCharge}
                  onChange={(e) => setFormData({ ...formData, supervisorInCharge: e.target.value })}
                  className="w-full bg-white border border-slate-300 p-1.5 rounded font-bold text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. DIAGNÓSTICO Y PLAN DE REPARACIONES */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#002855]">
              4. Diagnóstico y Plan de Reparaciones (Resumen)
            </h2>
            <button
              onClick={handleAddDiagnosis}
              className="flex items-center gap-1 text-[10px] font-bold uppercase bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded hover:bg-blue-100"
            >
              <Plus className="w-3 h-3" /> Agregar Falla / Diagnóstico
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-[#002855] font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-2 w-12 text-center">No.</th>
                  <th className="p-2">Falla Reportada / Servicio Solicitado</th>
                  <th className="p-2">Diagnóstico Inicial</th>
                  <th className="p-2 w-28 text-center">T. Estimado (Hrs)</th>
                  <th className="p-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {formData.diagnoses.map((diag, idx) => (
                  <tr key={diag.id} className="hover:bg-slate-50">
                    <td className="p-2 text-center font-bold font-mono text-slate-500">{idx + 1}</td>
                    <td className="p-2">
                      <textarea
                        rows={1}
                        value={diag.reportedFault}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            diagnoses: prev.diagnoses.map(d => d.id === diag.id ? { ...d, reportedFault: val } : d)
                          }));
                        }}
                        className="w-full bg-white border border-slate-300 p-1 rounded text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <textarea
                        rows={1}
                        value={diag.initialDiagnosis}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            diagnoses: prev.diagnoses.map(d => d.id === diag.id ? { ...d, initialDiagnosis: val } : d)
                          }));
                        }}
                        className="w-full bg-white border border-slate-300 p-1 rounded text-xs"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        step="0.5"
                        value={diag.estimatedHours}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setFormData(prev => ({
                            ...prev,
                            diagnoses: prev.diagnoses.map(d => d.id === diag.id ? { ...d, estimatedHours: val } : d)
                          }));
                        }}
                        className="w-full text-center bg-white border border-slate-300 p-1 rounded font-mono font-bold"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleDeleteDiagnosis(diag.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. BITÁCORA DE ACTIVIDADES (DETALLE DEL TRABAJO) */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#002855]">
                5. Bitácora de Actividades (Detalle del Trabajo)
              </h2>
              <p className="text-[10px] text-slate-500 italic mt-0.5">
                En esta sección el mecánico debe documentar paso a paso las tareas realizadas, permitiendo un control exacto de los tiempos muertos y el tiempo efectivo de trabajo.
              </p>
            </div>
            <button
              onClick={handleAddActivity}
              className="flex items-center gap-1 text-[10px] font-bold uppercase bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded hover:bg-blue-100 shrink-0"
            >
              <Plus className="w-3 h-3" /> Registrar Tarea
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-[#002855] font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-2 w-28">Fecha</th>
                  <th className="p-2 w-24">Hora Inicio</th>
                  <th className="p-2 w-24">Hora Término</th>
                  <th className="p-2 w-28">Tiempo Efectivo</th>
                  <th className="p-2">Descripción Detallada de la Tarea Realizada</th>
                  <th className="p-2 w-16 text-center">Iniciales</th>
                  <th className="p-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {formData.activityLogs.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50">
                    <td className="p-2">
                      <input
                        type="date"
                        value={act.date}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            activityLogs: prev.activityLogs.map(a => a.id === act.id ? { ...a, date: val } : a)
                          }));
                        }}
                        className="w-full bg-white border border-slate-300 p-1 rounded font-mono text-[10px]"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={act.startTime}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            activityLogs: prev.activityLogs.map(a => a.id === act.id ? { ...a, startTime: val } : a)
                          }));
                        }}
                        placeholder="08:00"
                        className="w-full bg-white border border-slate-300 p-1 rounded font-mono text-center"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={act.endTime}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            activityLogs: prev.activityLogs.map(a => a.id === act.id ? { ...a, endTime: val } : a)
                          }));
                        }}
                        placeholder="10:00"
                        className="w-full bg-white border border-slate-300 p-1 rounded font-mono text-center"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={act.effectiveTime}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            activityLogs: prev.activityLogs.map(a => a.id === act.id ? { ...a, effectiveTime: val } : a)
                          }));
                        }}
                        placeholder="2.0 hrs"
                        className="w-full bg-white border border-slate-300 p-1 rounded font-mono text-center font-bold text-blue-900"
                      />
                    </td>
                    <td className="p-2">
                      <textarea
                        rows={1}
                        value={act.taskDescription}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            activityLogs: prev.activityLogs.map(a => a.id === act.id ? { ...a, taskDescription: val } : a)
                          }));
                        }}
                        className="w-full bg-white border border-slate-300 p-1 rounded text-xs"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={act.initials}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            activityLogs: prev.activityLogs.map(a => a.id === act.id ? { ...a, initials: val } : a)
                          }));
                        }}
                        className="w-full bg-white border border-slate-300 p-1 rounded font-mono font-bold text-center uppercase"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleDeleteActivity(act.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. REFACCIONES Y MATERIALES UTILIZADOS */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#002855]">
              6. Refacciones y Materiales Utilizados
            </h2>
            <button
              onClick={handleAddPart}
              className="flex items-center gap-1 text-[10px] font-bold uppercase bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded hover:bg-blue-100"
            >
              <Plus className="w-3 h-3" /> Agregar Pieza / Insumo
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-[#002855] font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-2 w-32">Código</th>
                  <th className="p-2">Descripción de la Pieza / Insumo</th>
                  <th className="p-2 w-28 text-center">Cantidad</th>
                  <th className="p-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {formData.partsUsed.map((part) => (
                  <tr key={part.id} className="hover:bg-slate-50">
                    <td className="p-2">
                      <input
                        type="text"
                        value={part.code}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            partsUsed: prev.partsUsed.map(p => p.id === part.id ? { ...p, code: val } : p)
                          }));
                        }}
                        className="w-full bg-white border border-slate-300 p-1 rounded font-mono font-bold text-blue-900"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={part.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            partsUsed: prev.partsUsed.map(p => p.id === part.id ? { ...p, description: val } : p)
                          }));
                        }}
                        className="w-full bg-white border border-slate-300 p-1 rounded text-xs"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min="1"
                        value={part.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setFormData(prev => ({
                            ...prev,
                            partsUsed: prev.partsUsed.map(p => p.id === part.id ? { ...p, quantity: val } : p)
                          }));
                        }}
                        className="w-full text-center bg-white border border-slate-300 p-1 rounded font-mono font-bold"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleDeletePart(part.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 7. CHECK LIST DE REVISIÓN FINAL (LIBERACIÓN DE UNIDAD) */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#002855]">
              7. Check List de Revisión Final (Liberación de Unidad)
            </h2>
            <p className="text-[10px] text-slate-500 italic mt-0.5">
              Marque con una "X" el estado final de cada sistema revisado antes de liberar la unidad.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-[#002855] font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Sistema / Componente</th>
                  <th className="p-2.5 w-16 text-center">OK</th>
                  <th className="p-2.5 w-32 text-center">Requiere Atención</th>
                  <th className="p-2.5 w-16 text-center">N/A</th>
                  <th className="p-2.5">Comentarios</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {formData.finalChecklist.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">{item.systemName}</td>
                    <td className="p-2.5 text-center">
                      <input
                        type="radio"
                        name={`chk-${item.id}`}
                        checked={item.status === 'ok'}
                        onChange={() => {
                          setFormData(prev => ({
                            ...prev,
                            finalChecklist: prev.finalChecklist.map(c => c.id === item.id ? { ...c, status: 'ok' } : c)
                          }));
                        }}
                        className="text-emerald-600 focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="p-2.5 text-center">
                      <input
                        type="radio"
                        name={`chk-${item.id}`}
                        checked={item.status === 'attention'}
                        onChange={() => {
                          setFormData(prev => ({
                            ...prev,
                            finalChecklist: prev.finalChecklist.map(c => c.id === item.id ? { ...c, status: 'attention' } : c)
                          }));
                        }}
                        className="text-amber-600 focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="p-2.5 text-center">
                      <input
                        type="radio"
                        name={`chk-${item.id}`}
                        checked={item.status === 'na'}
                        onChange={() => {
                          setFormData(prev => ({
                            ...prev,
                            finalChecklist: prev.finalChecklist.map(c => c.id === item.id ? { ...c, status: 'na' } : c)
                          }));
                        }}
                        className="text-slate-400 focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="p-2.5">
                      <input
                        type="text"
                        value={item.comments}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            finalChecklist: prev.finalChecklist.map(c => c.id === item.id ? { ...c, comments: val } : c)
                          }));
                        }}
                        placeholder="Observaciones de inspección..."
                        className="w-full bg-white border border-slate-300 p-1 rounded text-xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 8. OBSERVACIONES, PRUEBAS Y RECOMENDACIONES */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#002855] border-b border-slate-200 pb-2">
            8. Observaciones, Pruebas y Recomendaciones
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-800 uppercase text-[10px] block mb-1">
                Pruebas de ruta o funcionamiento realizadas:
              </label>
              <textarea
                rows={3}
                value={formData.roadTestsDone}
                onChange={(e) => setFormData({ ...formData, roadTestsDone: e.target.value })}
                placeholder="Describa los resultados de la prueba en carretera o banco de pruebas..."
                className="w-full bg-white border border-slate-300 p-2 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 uppercase text-[10px] block mb-1">
                Notas técnicas o recomendaciones para el próximo servicio:
              </label>
              <textarea
                rows={3}
                value={formData.technicalRecommendations}
                onChange={(e) => setFormData({ ...formData, technicalRecommendations: e.target.value })}
                placeholder="Indique mantenimientos futuros, cambios preventivos o sugerencias al cliente..."
                className="w-full bg-white border border-slate-300 p-2 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* 9. FIRMAS DE CONFORMIDAD */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#002855] border-b border-slate-200 pb-2">
            9. Firmas de Conformidad y Liberación
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Firma Mecánico */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-center">
              <p className="font-bold text-xs text-slate-900 uppercase">Firma del Mecánico Responsable</p>
              <p className="text-[10px] text-slate-500 italic">
                (Declaro que los trabajos descritos fueron realizados conforme a los estándares)
              </p>
              
              <div className="h-20 border-b-2 border-slate-400 flex items-end justify-center pb-2 bg-white rounded">
                <span className="font-serif italic text-lg text-blue-900 font-bold">
                  {formData.responsibleMechanic}
                </span>
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-emerald-800">
                  <input
                    type="checkbox"
                    checked={formData.mechanicSigned}
                    onChange={(e) => setFormData({ ...formData, mechanicSigned: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Acreditado y Firmado por Mecánico</span>
                </label>
              </div>
            </div>

            {/* Firma Supervisor */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-center">
              <p className="font-bold text-xs text-slate-900 uppercase">Firma del Supervisor de Taller</p>
              <p className="text-[10px] text-slate-500 italic">
                (Inspección final y liberación de la unidad)
              </p>

              <div className="h-20 border-b-2 border-slate-400 flex items-end justify-center pb-2 bg-white rounded">
                <span className="font-serif italic text-lg text-[#002855] font-bold">
                  {formData.supervisorInCharge}
                </span>
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-[#002855]">
                  <input
                    type="checkbox"
                    checked={formData.supervisorSigned}
                    onChange={(e) => setFormData({ ...formData, supervisorSigned: e.target.checked })}
                    className="w-4 h-4 text-[#002855] rounded"
                  />
                  <span>Inspeccionado y Liberado por Supervisor</span>
                </label>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* HIDDEN / OFF-SCREEN EXACT OFFICIAL TSR SONORA PDF SHEET FOR CANVAS & PRINT */}
      <div className="hidden">
        <div 
          ref={pdfPrintRef}
          className="w-[800px] bg-white text-slate-900 p-8 font-sans space-y-4 border border-slate-300"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          {/* PDF HEADER */}
          <div className="flex justify-between items-center border-b-2 border-[#002855] pb-3">
            <div className="flex items-center gap-3">
              <img src="/tsrlogo.png" alt="TSR Sonora" className="h-12 object-contain" />
              <div>
                <h1 className="text-xl font-black text-[#002855] uppercase tracking-wider">TSR SONORA</h1>
                <p className="text-[10px] text-slate-600 font-bold tracking-widest uppercase">TRACTOSERVICES AND DIESEL PARTS</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-black text-[#002855] uppercase">ORDEN DE TRABAJO</h2>
              <p className="text-xs font-mono font-bold text-blue-900">{formData.osNumber}</p>
            </div>
          </div>

          {/* 1. Datos Generales */}
          <div className="border border-slate-400 rounded p-2 text-[11px] space-y-1 bg-slate-50/50">
            <p className="font-bold text-[#002855] border-b border-slate-300 pb-0.5 uppercase">1. Datos Generales de la Orden</p>
            <div className="grid grid-cols-3 gap-2">
              <p><strong>OS No.:</strong> {formData.osNumber}</p>
              <p><strong>Fecha Ingreso:</strong> {formData.entryDate}</p>
              <p><strong>Fecha Est. Entrega:</strong> {formData.estimatedDeliveryDate}</p>
            </div>
            <p>
              <strong>Tipo de Mantenimiento:</strong> [{formData.maintenanceType === 'Correctivo' ? ' X ' : ' '}] Correctivo &nbsp;&nbsp;
              [{formData.maintenanceType === 'Preventivo' ? ' X ' : ' '}] Preventivo &nbsp;&nbsp;
              [{formData.maintenanceType === 'Garantía' ? ' X ' : ' '}] Garantía
            </p>
          </div>

          {/* 2. Datos del Tractocamión */}
          <div className="border border-slate-400 rounded p-2 text-[11px] space-y-1">
            <p className="font-bold text-[#002855] border-b border-slate-300 pb-0.5 uppercase">2. Datos del Tractocamión</p>
            <div className="grid grid-cols-2 gap-2">
              <p><strong>Número Económico / Unidad:</strong> {formData.unitNumber}</p>
              <p><strong>Marca y Modelo:</strong> {formData.brandAndModel}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <p><strong>Año:</strong> {formData.year}</p>
              <p><strong>VIN:</strong> {formData.vin}</p>
              <p><strong>Placas:</strong> {formData.plates}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <p><strong>Kilometraje Actual:</strong> {formData.currentMileage}</p>
              <p><strong>Horómetro:</strong> {formData.horometer}</p>
            </div>
          </div>

          {/* 3. Datos del Personal */}
          <div className="border border-slate-400 rounded p-2 text-[11px] space-y-1">
            <p className="font-bold text-[#002855] border-b border-slate-300 pb-0.5 uppercase">3. Datos del Personal</p>
            <p><strong>Mecánico Responsable:</strong> {formData.responsibleMechanic}</p>
            <p><strong>Supervisor a Cargo:</strong> {formData.supervisorInCharge}</p>
          </div>

          {/* 4. Diagnóstico y Plan */}
          <div className="border border-slate-400 rounded p-2 text-[10px] space-y-1">
            <p className="font-bold text-[#002855] border-b border-slate-300 pb-0.5 uppercase">4. Diagnóstico y Plan de Reparaciones (Resumen)</p>
            <table className="w-full border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-200 text-[#002855]">
                  <th className="border border-slate-400 p-1 w-8">No.</th>
                  <th className="border border-slate-400 p-1">Falla Reportada / Servicio Solicitado</th>
                  <th className="border border-slate-400 p-1">Diagnóstico Inicial</th>
                  <th className="border border-slate-400 p-1 w-20 text-center">T. Est. (Hrs)</th>
                </tr>
              </thead>
              <tbody>
                {formData.diagnoses.map((d, i) => (
                  <tr key={i}>
                    <td className="border border-slate-400 p-1 text-center font-bold">{d.no}</td>
                    <td className="border border-slate-400 p-1">{d.reportedFault}</td>
                    <td className="border border-slate-400 p-1">{d.initialDiagnosis}</td>
                    <td className="border border-slate-400 p-1 text-center">{d.estimatedHours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 5. Bitácora de Actividades */}
          <div className="border border-slate-400 rounded p-2 text-[10px] space-y-1">
            <p className="font-bold text-[#002855] uppercase">5. Bitácora de Actividades (Detalle del Trabajo)</p>
            <p className="text-[9px] italic text-slate-600 mb-1">
              En esta sección el mecánico debe documentar paso a paso las tareas realizadas, permitiendo un control exacto de los tiempos muertos y el tiempo efectivo de trabajo.
            </p>
            <table className="w-full border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-200 text-[#002855]">
                  <th className="border border-slate-400 p-1 w-20">Fecha</th>
                  <th className="border border-slate-400 p-1 w-16">Inicio</th>
                  <th className="border border-slate-400 p-1 w-16">Término</th>
                  <th className="border border-slate-400 p-1 w-20">T. Efectivo</th>
                  <th className="border border-slate-400 p-1">Descripción Detallada</th>
                  <th className="border border-slate-400 p-1 w-12 text-center">Inic.</th>
                </tr>
              </thead>
              <tbody>
                {formData.activityLogs.map((a, i) => (
                  <tr key={i}>
                    <td className="border border-slate-400 p-1">{a.date}</td>
                    <td className="border border-slate-400 p-1">{a.startTime}</td>
                    <td className="border border-slate-400 p-1">{a.endTime}</td>
                    <td className="border border-slate-400 p-1 font-bold">{a.effectiveTime}</td>
                    <td className="border border-slate-400 p-1">{a.taskDescription}</td>
                    <td className="border border-slate-400 p-1 text-center uppercase font-bold">{a.initials}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 6. Refacciones */}
          <div className="border border-slate-400 rounded p-2 text-[10px] space-y-1">
            <p className="font-bold text-[#002855] uppercase">6. Refacciones y Materiales Utilizados</p>
            <table className="w-full border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-200 text-[#002855]">
                  <th className="border border-slate-400 p-1 w-28">Código</th>
                  <th className="border border-slate-400 p-1">Descripción de la Pieza / Insumo</th>
                  <th className="border border-slate-400 p-1 w-20 text-center">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {formData.partsUsed.map((p, i) => (
                  <tr key={i}>
                    <td className="border border-slate-400 p-1 font-mono font-bold">{p.code}</td>
                    <td className="border border-slate-400 p-1">{p.description}</td>
                    <td className="border border-slate-400 p-1 text-center font-bold">{p.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 7. Checklist */}
          <div className="border border-slate-400 rounded p-2 text-[10px] space-y-1">
            <p className="font-bold text-[#002855] uppercase">7. Check List de Revisión Final (Liberación de Unidad)</p>
            <table className="w-full border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-200 text-[#002855]">
                  <th className="border border-slate-400 p-1">Sistema / Componente</th>
                  <th className="border border-slate-400 p-1 w-10 text-center">OK</th>
                  <th className="border border-slate-400 p-1 w-16 text-center">Atención</th>
                  <th className="border border-slate-400 p-1 w-10 text-center">N/A</th>
                  <th className="border border-slate-400 p-1">Comentarios</th>
                </tr>
              </thead>
              <tbody>
                {formData.finalChecklist.map((c, i) => (
                  <tr key={i}>
                    <td className="border border-slate-400 p-1 font-bold">{c.systemName}</td>
                    <td className="border border-slate-400 p-1 text-center font-bold">{c.status === 'ok' ? '[ X ]' : '[   ]'}</td>
                    <td className="border border-slate-400 p-1 text-center font-bold">{c.status === 'attention' ? '[ X ]' : '[   ]'}</td>
                    <td className="border border-slate-400 p-1 text-center font-bold">{c.status === 'na' ? '[ X ]' : '[   ]'}</td>
                    <td className="border border-slate-400 p-1">{c.comments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 8. Observaciones */}
          <div className="border border-slate-400 rounded p-2 text-[10px] space-y-2">
            <p className="font-bold text-[#002855] uppercase">8. Observaciones, Pruebas y Recomendaciones</p>
            <p><strong>Pruebas de ruta o funcionamiento realizadas:</strong> {formData.roadTestsDone}</p>
            <p><strong>Notas técnicas o recomendaciones para el próximo servicio:</strong> {formData.technicalRecommendations}</p>
          </div>

          {/* 9. Firmas */}
          <div className="border border-slate-400 rounded p-3 text-[10px] grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="h-12 border-b border-slate-800 flex items-end justify-center pb-1 font-bold text-xs italic">
                {formData.responsibleMechanic}
              </div>
              <p className="font-bold mt-1 text-[#002855]">Firma del Mecánico Responsable</p>
              <p className="text-[8px] text-slate-500">(Declaro que los trabajos descritos fueron realizados conforme a los estándares)</p>
            </div>

            <div>
              <div className="h-12 border-b border-slate-800 flex items-end justify-center pb-1 font-bold text-xs italic">
                {formData.supervisorInCharge}
              </div>
              <p className="font-bold mt-1 text-[#002855]">Firma del Supervisor de Taller</p>
              <p className="text-[8px] text-slate-500">(Inspección final y liberación de la unidad)</p>
            </div>
          </div>
        </div>
      </div>

      {/* PRINT PREVIEW MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-sm font-black uppercase text-[#002855]">Vista Previa Oficial de Orden de Trabajo TSR SONORA</h3>
              <button onClick={() => setShowPrintModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <div className="bg-slate-100 p-4 rounded-lg flex justify-center">
              {/* Visible preview */}
              <div className="w-full max-w-2xl bg-white p-6 rounded shadow border border-slate-300 text-xs space-y-3 text-slate-900">
                <div className="flex justify-between items-center border-b-2 border-[#002855] pb-2">
                  <div className="flex items-center gap-2">
                    <img src="/tsrlogo.png" alt="TSR Sonora" className="h-8 object-contain" />
                    <div>
                      <h4 className="font-black text-[#002855]">TSR SONORA</h4>
                      <p className="text-[9px] text-slate-500 font-bold uppercase">TRACTOSERVICES AND DIESEL PARTS</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h5 className="font-bold text-[#002855]">ORDEN DE TRABAJO</h5>
                    <p className="font-mono text-blue-900 font-bold">{formData.osNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2 border border-slate-200 rounded">
                  <p><strong>Unidad:</strong> {formData.unitNumber}</p>
                  <p><strong>Marca/Modelo:</strong> {formData.brandAndModel}</p>
                  <p><strong>Placas:</strong> {formData.plates}</p>
                  <p><strong>Mecánico:</strong> {formData.responsibleMechanic}</p>
                </div>

                <div className="text-[10px]">
                  <p className="font-bold text-[#002855] uppercase border-b mb-1">Diagnóstico Inicial</p>
                  <p>{formData.diagnoses[0]?.initialDiagnosis || 'Diagnóstico de motor'}</p>
                </div>

                <div className="text-[10px]">
                  <p className="font-bold text-[#002855] uppercase border-b mb-1">Bitácora de Actividades ({formData.activityLogs.length} tareas)</p>
                  {formData.activityLogs.map((a, i) => (
                    <p key={i} className="text-slate-700 font-mono">• {a.taskDescription} ({a.effectiveTime})</p>
                  ))}
                </div>

                <div className="text-[10px] grid grid-cols-2 gap-4 pt-2 border-t text-center">
                  <div>
                    <p className="font-bold text-slate-900">{formData.responsibleMechanic}</p>
                    <p className="text-[8px] text-slate-500">Mecánico Responsable</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{formData.supervisorInCharge}</p>
                    <p className="text-[8px] text-slate-500">Supervisor de Taller</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 border border-slate-300 text-xs font-bold uppercase text-slate-600 hover:text-slate-900 rounded-md"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setShowPrintModal(false);
                  handleExportPDF();
                }}
                className="flex items-center gap-1.5 bg-[#002855] hover:bg-blue-900 text-white px-4 py-2 text-xs font-bold uppercase rounded-md shadow-sm"
              >
                <Download className="w-4 h-4" /> Exportar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
