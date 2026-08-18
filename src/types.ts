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
  subcategory?: string;
  brand: string;
  costPrice: number;
  salePrice: number;
  engineApplications: string;
  equivalences?: string[]; // Cross-reference / Cruce de aplicaciones (Cummins, Donaldson, Fleetguard, etc.)
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

// 1. GESTIÓN DE CITAS
export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  vehiclePlates: string;
  vehicleBrandModel: string;
  vehicleYear: string;
  preferredDate: string;
  preferredTime: string;
  serviceType: 'Preventivo' | 'Correctivo' | 'Diagnóstico' | 'Garantía';
  serviceReason: string;
  status: 'Pendiente' | 'Confirmada' | 'Convertida' | 'Cancelada';
  source: 'Portal Web Cliente' | 'Asesor Interno';
  bayAssigned?: string;
  convertedOrderId?: string;
  createdAt: string;
}

// 3. FACTURACIÓN Y CAJA (ÓRDENES DE COBRO Y COMPROBANTES)
export type ChargeSourceType = 'Mostrador' | 'Taller';

export interface BillingOrder {
  id: string; // e.g. "COB-1092"
  sourceType: ChargeSourceType;
  referenceId: string; // e.g. "OS-9283" or "TICKET-8291"
  clientName: string;
  clientRfc?: string;
  clientEmail?: string;
  subtotal: number;
  taxIva: number;
  total: number;
  status: 'Pendiente de Pago' | 'Pagado' | 'Facturado';
  paymentMethod?: 'Efectivo' | 'Tarjeta' | 'Transferencia';
  paidAt?: string;
  dispatchedInWarehouse: boolean; // Vale de entrega para ventanilla
  warehouseVoucherNumber?: string;
  invoiceId?: string;
  createdAt: string;
  itemsSummary: string;
}

export interface InvoiceRecord {
  id: string;
  folio: string; // e.g. "FAC-4019"
  uuid: string; // SAT UUID
  orderReferenceId: string;
  clientName: string;
  rfc: string;
  regimenFiscal: string;
  usoCfdi: string;
  email: string;
  subtotal: number;
  taxIva: number;
  total: number;
  paymentMethod: 'Efectivo' | 'Tarjeta' | 'Transferencia';
  paymentForm: '01 - Efectivo' | '03 - Transferencia electrónica' | '04 - Tarjeta de crédito' | '28 - Tarjeta de débito';
  date: string;
  xmlData: string;
  sentByEmail: boolean;
  emailSentAt?: string;
}

// 5. CONTROL INTERNO DE HERRAMIENTA
export interface ToolItem {
  id: string;
  code: string; // e.g. "HRR-ESC-01"
  name: string;
  brand: string;
  serialNumber: string;
  category: 'Diagnóstico Electrónico' | 'Extractor / Prensa' | 'Torque / Medición' | 'Neumática / Taller' | 'Especial Diésel';
  status: 'Disponible' | 'Asignada' | 'Mantenimiento';
  currentTechnicianId?: string;
  currentTechnicianName?: string;
  assignedDate?: string;
  condition: 'Excelente' | 'Bueno' | 'Regular';
  notes?: string;
}

export interface ToolAssignmentLog {
  id: string;
  toolId: string;
  toolCode: string;
  toolName: string;
  technicianId: string;
  technicianName: string;
  assignedDate: string;
  returnDate?: string;
  status: 'Activa' | 'Devuelta';
  responsibilitySigned: boolean;
  returnCondition?: 'Excelente' | 'Bueno' | 'Regular' | 'Dañada';
  observations?: string;
}

// 6. COMPRAS Y PROVEEDORES
export interface PurchaseOrderItem {
  id: string;
  partCode: string;
  description: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface PurchaseOrder {
  id: string; // e.g. "OC-8021"
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  date: string;
  status: 'Borrador' | 'Enviada a Proveedor' | 'Recibida en Almacén' | 'Cancelada';
  isDirectExpense: boolean;
  expenseCategory: 'Refacciones Almacén' | 'Herramientas' | 'Consumibles Taller' | 'Gasto Operativo / Administrativo';
  paymentMethod: 'Transferencia' | 'Efectivo' | 'Crédito Proveedor';
  bankAccountId?: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxIva: number;
  total: number;
  notes?: string;
  sentAt?: string;
  receivedAt?: string;
}

// 7. CONTACTOS (DIRECTORIO DE CLIENTES Y PROVEEDORES)
export interface ClientContactVehicle {
  plates: string;
  brand: string;
  model: string;
  year: string;
  vin: string;
  engine: string;
}

export interface ClientContact {
  id: string;
  name: string;
  commercialName?: string;
  rfc: string;
  regimenFiscal: string;
  usoCfdi: string;
  email: string;
  phone: string;
  address: string;
  vehicles: ClientContactVehicle[];
  creditDays?: number;
  creditLimit?: number;
  totalOrdersCount: number;
  createdAt: string;
}

export interface SupplierContact {
  id: string;
  companyName: string;
  contactPerson: string;
  rfc: string;
  email: string;
  phone: string;
  address: string;
  category: 'Refacciones Diésel' | 'Aceites y Lubricantes' | 'Filtros' | 'Herramientas' | 'Servicios Externos';
  creditDays: number;
  bankName?: string;
  bankAccountClabe?: string;
  suppliesList: string[];
}

// 8. BANCOS Y FINANZAS
export interface BankAccount {
  id: string;
  name: string; // e.g. "BBVA Bancomer Corporativa 4912"
  type: 'Banco' | 'Caja Efectivo';
  accountNumber: string;
  clabe?: string;
  currency: 'MXN';
  currentBalance: number;
  bankName: string;
}

export interface FinancialMovement {
  id: string;
  accountId: string;
  accountName: string;
  type: 'Ingreso' | 'Egreso';
  concept: string;
  category: 'Cobro Taller' | 'Cobro Mostrador' | 'Compra Refacciones' | 'Herramientas' | 'Nómina / Taller' | 'Gasto Operativo';
  amount: number;
  date: string;
  reference?: string;
  relatedOrderId?: string;
  relatedPurchaseId?: string;
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
