export type RoleType = 'direccion' | 'asesor' | 'tecnico' | 'almacen' | 'cliente';

export interface UserRoleInfo {
  id: RoleType;
  name: string;
  icon: string;
  badge: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  status: 'activo' | 'inactivo';
  specialty?: string;
  phone?: string;
}

export type OSStatus = 
  | 'Diagnóstico' 
  | 'En Proceso' 
  | 'Esperando Refacción' 
  | 'Prueba de Manejo' 
  | 'Listo para Entrega' 
  | 'Finalizada';

export interface VehicleData {
  plates: string;
  vin: string;
  brand: string;
  model: string;
  mileageOrHours: string;
  year?: string;
  clientName: string;
  clientPhone: string;
}

export interface ChecklistItem {
  id: string;
  name: string;
  status: 'ok' | 'fail' | 'na';
  notes?: string;
}

export interface OSPart {
  id: string;
  code: string;
  name: string;
  quantity: number;
  unitPrice: number;
  status: 'solicitado' | 'despachado' | 'aprobado_cliente' | 'rechazado_cliente';
}

export interface OSLabor {
  id: string;
  description: string;
  hours: number;
  hourlyRate: number;
  status: 'pendiente' | 'aprobado_cliente' | 'rechazado_cliente';
}

export interface OSEvidence {
  id: string;
  type: 'photo' | 'video';
  url: string;
  description: string;
  date: string;
  partType: 'dañada' | 'nueva';
}

export interface WorkOrderDiagnosisItem {
  id: string;
  no: number;
  reportedFault: string;
  initialDiagnosis: string;
  estimatedHours: number;
}

export interface WorkOrderActivityLog {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  effectiveTime: string;
  taskDescription: string;
  initials: string;
}

export interface WorkOrderPartItem {
  id: string;
  code: string;
  description: string;
  quantity: number;
}

export interface WorkOrderChecklistItem {
  id: string;
  systemName: string;
  status: 'ok' | 'attention' | 'na';
  comments: string;
}

export interface WorkOrderData {
  id: string;
  osNumber: string;
  entryDate: string;
  estimatedDeliveryDate: string;
  maintenanceType: 'Correctivo' | 'Preventivo' | 'Garantía';
  unitNumber: string;
  brandAndModel: string;
  year: string;
  vin: string;
  plates: string;
  currentMileage: string;
  horometer: string;
  responsibleMechanic: string;
  supervisorInCharge: string;
  diagnoses: WorkOrderDiagnosisItem[];
  activityLogs: WorkOrderActivityLog[];
  partsUsed: WorkOrderPartItem[];
  finalChecklist: WorkOrderChecklistItem[];
  roadTestsDone: string;
  technicalRecommendations: string;
  mechanicSigned: boolean;
  supervisorSigned: boolean;
  mechanicSignatureDate?: string;
  supervisorSignatureDate?: string;
}

export interface ServiceOrder {
  id: string; // e.g., "OS-9283"
  trackingToken: string;
  vehicle: VehicleData;
  faultReason: string;
  checklist: ChecklistItem[];
  assignedTechnicianId: string;
  assignedTechnicianName: string;
  status: OSStatus;
  parts: OSPart[];
  labor: OSLabor[];
  evidences: OSEvidence[];
  createdAt: string;
  updatedAt: string;
  estimatedCost: number;
  clientApproved: boolean | null; // null = pending, true = approved, false = rejected
  paymentStatus: 'pendiente' | 'liquidado';
  paymentMethod?: 'Efectivo' | 'Tarjeta' | 'Transferencia';
  warrantyDetails?: string;
  techNotes?: string;
  notes?: string;
  workOrderData?: WorkOrderData;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  brand: string;
  costPrice: number;
  salePrice: number;
  engineApplications: string;
  stock: number;
  minStock: number;
  unit: string;
}

export interface StockMovement {
  id: string;
  date: string;
  type: 'entrada' | 'salida_taller' | 'venta_mostrador';
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  reference: string;
  user: string;
}

export interface POSCartItem {
  item: InventoryItem;
  quantity: number;
}

export interface POSReceipt {
  id: string;
  folio: string;
  date: string;
  items: POSCartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'Efectivo' | 'Tarjeta' | 'Transferencia';
  clientName?: string;
}

export interface CashCut {
  id: string;
  date: string;
  initialCash: number;
  cashSales: number;
  cardSales: number;
  transferSales: number;
  totalIncome: number;
  expensesTotal: number;
  calculatedCash: number;
  actualCash: number;
  difference: number;
  status: 'abierto' | 'cerrado';
  notes: string;
}

export interface Expense {
  id: string;
  date: string;
  concept: string;
  category: 'Repuestos' | 'Herramientas' | 'Servicios' | 'Nómina' | 'Otros';
  amount: number;
  supplier?: string;
  receiptNumber?: string;
}

export interface WarehouseRequest {
  id: string;
  osId: string;
  vehicleInfo: string;
  technicianName: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  status: 'pendiente' | 'surtido' | 'rechazado';
  requestedAt: string;
}
