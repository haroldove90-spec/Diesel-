import { 
  UserRoleInfo, 
  ServiceOrder, 
  InventoryItem, 
  WarehouseRequest, 
  User, 
  CashCut, 
  Expense,
  POSReceipt,
  Appointment,
  BillingOrder,
  InvoiceRecord,
  ToolItem,
  ToolAssignmentLog,
  PurchaseOrder,
  ClientContact,
  SupplierContact,
  BankAccount,
  FinancialMovement
} from '../types';

export const ROLES: UserRoleInfo[] = [
  {
    id: 'direccion',
    name: 'Dirección Administrativa',
    icon: 'Building2',
    badge: 'Administración'
  },
  {
    id: 'contabilidad',
    name: 'Contabilidad y Finanzas',
    icon: 'Receipt',
    badge: 'Fiscal & POS'
  },
  {
    id: 'asesor',
    name: 'Asesor de Servicio',
    icon: 'ClipboardList',
    badge: 'Recepción'
  },
  {
    id: 'tecnico',
    name: 'Técnico Diesel',
    icon: 'Wrench',
    badge: 'Taller'
  },
  {
    id: 'almacen',
    name: 'Encargado de Almacén',
    icon: 'PackageSearch',
    badge: 'Ventas y Stock'
  },
  {
    id: 'cliente',
    name: 'Cliente Final',
    icon: 'Truck',
    badge: 'Portal Web'
  }
];

// CLEAN EMPTY COLLECTIONS READY FOR REAL DATA
export const INITIAL_INVENTORY: InventoryItem[] = [];

export const INITIAL_ORDERS: ServiceOrder[] = [];

export const INITIAL_WAREHOUSE_REQUESTS: WarehouseRequest[] = [];

export const INITIAL_USERS: User[] = [];

export const INITIAL_CASH_CUT: CashCut = {
  id: 'cut-init',
  date: new Date().toISOString().split('T')[0],
  initialCash: 0,
  cashSales: 0,
  cardSales: 0,
  transferSales: 0,
  totalIncome: 0,
  expensesTotal: 0,
  calculatedCash: 0,
  actualCash: 0,
  difference: 0,
  status: 'abierto',
  notes: 'Caja inicial en ceros para inicio de operaciones.'
};

export const INITIAL_EXPENSES: Expense[] = [];

export const INITIAL_POS_RECEIPTS: POSReceipt[] = [];

// 1. CITAS
export const INITIAL_APPOINTMENTS: Appointment[] = [];

// 3. FACTURACIÓN Y COBRO
export const INITIAL_BILLING_ORDERS: BillingOrder[] = [];

export const INITIAL_INVOICES: InvoiceRecord[] = [];

// 5. HERRAMIENTAS
export const INITIAL_TOOLS: ToolItem[] = [];

export const INITIAL_TOOL_LOGS: ToolAssignmentLog[] = [];

// 6. ÓRDENES DE COMPRA Y GASTOS
export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [];

// 7. DIRECTORIO DE CONTACTOS
export const INITIAL_CLIENT_CONTACTS: ClientContact[] = [];

export const INITIAL_SUPPLIER_CONTACTS: SupplierContact[] = [];

// 8. BANCOS Y FINANZAS
export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'bank-1',
    name: 'Cuenta Maestra Operativa',
    bankName: 'BBVA Bancomer',
    type: 'Banco',
    accountNumber: '0123456789',
    clabe: '012760000000000000',
    currency: 'MXN',
    currentBalance: 0
  },
  {
    id: 'bank-2',
    name: 'Caja Principal de Efectivo',
    bankName: 'Caja Física Taller',
    type: 'Caja Efectivo',
    accountNumber: 'CAJA-01',
    currency: 'MXN',
    currentBalance: 0
  }
];

export const INITIAL_FINANCIAL_MOVEMENTS: FinancialMovement[] = [];
