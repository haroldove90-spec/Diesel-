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

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    code: 'P55126',
    name: 'Filtro de Aceite Donaldson Lube',
    category: 'Mantenimiento',
    subcategory: 'Filtros de Aceite',
    brand: 'Donaldson',
    costPrice: 450,
    salePrice: 850,
    engineApplications: 'Cummins ISX / Detroit DD15 / Paccar MX13',
    equivalences: ['Fleetguard LF14000NN', 'Baldwin BD7154', 'Wix 57746XD', 'Cummins 4367100'],
    stock: 8,
    minStock: 10,
    unit: 'pz'
  },
  {
    id: 'inv-2',
    code: 'BOS-INJ-4307',
    name: 'Kit Inyectores Diesel Reman Bosch',
    category: 'Motor / Inyección',
    subcategory: 'Inyectores Common Rail',
    brand: 'Bosch',
    costPrice: 14500,
    salePrice: 21800,
    engineApplications: 'Cummins ISX15 High Pressure',
    equivalences: ['Cummins 4062569RX', 'Cummins 2872405', 'Delphi EX634307'],
    stock: 3,
    minStock: 3,
    unit: 'juego'
  },
  {
    id: 'inv-3',
    code: 'HOL-TURB-351',
    name: 'Turbocargador Holset HE351VE VGT',
    category: 'Motor / Turbo',
    subcategory: 'Turbos Geometría Variable',
    brand: 'Holset',
    costPrice: 18900,
    salePrice: 27500,
    engineApplications: 'Cummins ISX / ISM / QSM11',
    equivalences: ['Cummins 2838153', 'Cummins 4045034RX', 'BorgWarner 179035'],
    stock: 4,
    minStock: 2,
    unit: 'pz'
  },
  {
    id: 'inv-4',
    code: 'DD15-WP-992',
    name: 'Bomba de Agua Heavy Duty Detroit',
    category: 'Sistemas de Enfriamiento',
    subcategory: 'Bombas de Agua',
    brand: 'Detroit Diesel',
    costPrice: 3200,
    salePrice: 4900,
    engineApplications: 'Detroit Diesel DD13 / DD15',
    equivalences: ['Detroit A4722001601', 'Freightliner EA4722001601', 'Airtex AW6688'],
    stock: 5,
    minStock: 4,
    unit: 'pz'
  },
  {
    id: 'inv-5',
    code: 'BEN-BRK-4001',
    name: 'Válvula Reguladora de Freno Bendix R-12',
    category: 'Sistema de Frenos',
    subcategory: 'Válvulas Neumáticas',
    brand: 'Bendix',
    costPrice: 1100,
    salePrice: 1850,
    engineApplications: 'Universal Tractocamión / Remolques',
    equivalences: ['Bendix 102626', 'Midland KN28140', 'Wabco 9730110000'],
    stock: 7,
    minStock: 5,
    unit: 'pz'
  },
  {
    id: 'inv-6',
    code: 'FLE-FF5776',
    name: 'Filtro Separador Diésel Fleetguard',
    category: 'Mantenimiento',
    subcategory: 'Separadores de Agua',
    brand: 'Fleetguard',
    costPrice: 620,
    salePrice: 1150,
    engineApplications: 'Cummins ISX / Detroit DD15',
    equivalences: ['Donaldson P550888', 'Baldwin BF1386-O', 'Racor R90P'],
    stock: 12,
    minStock: 6,
    unit: 'pz'
  },
  {
    id: 'inv-7',
    code: 'ROT-15W40',
    name: 'Aceite Mineral Shell Rotella 15W-40',
    category: 'Lubricantes',
    subcategory: 'Aceites de Motor',
    brand: 'Shell',
    costPrice: 1850,
    salePrice: 2800,
    engineApplications: 'Heavy Duty Diésel API CK-4 / CJ-4',
    equivalences: ['Mobil Delvac 1300 Super', 'Chevron Delo 400 SDE', 'Castrol Vecton'],
    stock: 15,
    minStock: 8,
    unit: 'cubeta 19L'
  },
  {
    id: 'inv-8',
    code: 'KEM-DEF-20L',
    name: 'Fluido de Escape Diésel DEF / Urea 20L',
    category: 'Emisiones',
    subcategory: 'Urea Automotriz',
    brand: 'Kem',
    costPrice: 380,
    salePrice: 620,
    engineApplications: 'Sistemas SCR Euro V / EPA 2010+',
    equivalences: ['BlueDEF 2.5 Gal', 'TerraCair DEF', 'Peak Commercial DEF'],
    stock: 22,
    minStock: 10,
    unit: 'bidon 20L'
  }
];

export const INITIAL_ORDERS: ServiceOrder[] = [
  {
    id: 'OS-9283',
    trackingToken: 'OS-9283-TRK',
    vehicle: {
      plates: 'ABC-1234',
      vin: '1XKDDB9X1MD829103',
      brand: 'Kenworth',
      model: 'T680 Aerocab',
      mileageOrHours: '420,400 KM',
      year: '2021',
      clientName: 'Transportes Logísticos del Norte S.A.',
      clientPhone: '+52 81 1892 4029'
    },
    faultReason: 'Pérdida de potencia en subida, humo negro excesivo y luz Check Engine encendida en tablero.',
    checklist: [
      { id: 'chk-1', name: 'Nivel de Aceite de Motor', status: 'fail', notes: 'Bajo y contaminado' },
      { id: 'chk-2', name: 'Sistema de Frenos Neumáticos', status: 'ok' },
      { id: 'chk-3', name: 'Estado de Neumáticos', status: 'ok' },
      { id: 'chk-4', name: 'Luces y Sistema Eléctrico', status: 'ok' },
      { id: 'chk-5', name: 'Presión Turbo / Mangueras', status: 'fail', notes: 'Fuga de aire en manguera de intercooler' }
    ],
    assignedTechnicianId: 'tech-1',
    assignedTechnicianName: 'Ricardo M.',
    status: 'En Proceso',
    parts: [
      { id: 'p-101', code: 'P55126', name: 'Filtro de Aceite Donaldson Lube', quantity: 1, unitPrice: 850, status: 'despachado' },
      { id: 'p-102', code: 'ROT-15W40-20L', name: 'Aceite Shell Rotella 15W-40 20L', quantity: 2, unitPrice: 2400, status: 'despachado' },
      { id: 'p-103', code: 'BOS-INJ-4307', name: 'Kit Inyectores Diesel Reman Bosch', quantity: 1, unitPrice: 21800, status: 'solicitado' }
    ],
    labor: [
      { id: 'l-101', description: 'Diagnóstico por Escáner Cummins Insite HD', hours: 2, hourlyRate: 1200, status: 'aprobado_cliente' },
      { id: 'l-102', description: 'Calibración y Reemplazo de Inyectores Bancada A', hours: 8, hourlyRate: 1100, status: 'aprobado_cliente' }
    ],
    evidences: [
      {
        id: 'ev-1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        description: 'Tobera de inyector #3 con acumulación severa de carbón y fisura en microválvula.',
        date: '2026-08-05 09:30',
        partType: 'dañada'
      },
      {
        id: 'ev-2',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
        description: 'Empaque de manguera intercooler roto provocando fuga de presión de sobrealimentación.',
        date: '2026-08-05 10:15',
        partType: 'dañada'
      }
    ],
    createdAt: '2026-08-05 08:00',
    updatedAt: '2026-08-05 10:30',
    estimatedCost: 38250,
    clientApproved: true,
    paymentStatus: 'pendiente',
    notes: 'Unidad prioritaria para viaje a Laredo el jueves.'
  },
  {
    id: 'OS-9284',
    trackingToken: 'OS-9284-TRK',
    vehicle: {
      plates: 'XYZ-9876',
      vin: '3AKJHCDR9LS892110',
      brand: 'Freightliner',
      model: 'Cascadia 126',
      mileageOrHours: '285,900 KM',
      year: '2022',
      clientName: 'Flota Flete Rápido S.A. de C.V.',
      clientPhone: '+52 81 8390 1200'
    },
    faultReason: 'Ruido metálico agudo en zona de turbocargador al acelerar en carga pesada.',
    checklist: [
      { id: 'chk-21', name: 'Juego Axial de Flecha de Turbo', status: 'fail', notes: 'Rozamiento de propulsor de escape' },
      { id: 'chk-22', name: 'Filtro de Aire Primario/Secundario', status: 'fail', notes: 'Saturado 95%' }
    ],
    assignedTechnicianId: 'tech-2',
    assignedTechnicianName: 'Samuel V.',
    status: 'Esperando Refacción',
    parts: [
      { id: 'p-201', code: 'HOL-TURB-351', name: 'Turbocargador Holset HE351VE VGT', quantity: 1, unitPrice: 27500, status: 'solicitado' },
      { id: 'p-202', code: 'FLE-FF5776', name: 'Filtro de Combustible Fleetguard', quantity: 2, unitPrice: 620, status: 'solicitado' }
    ],
    labor: [
      { id: 'l-201', description: 'Desmontaje e inspección técnica de turbo VGT Detroit', hours: 5, hourlyRate: 1100, status: 'pendiente' }
    ],
    evidences: [
      {
        id: 'ev-3',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
        description: 'Alabes de geometría variable atascados con depósitos de hollín térmico.',
        date: '2026-08-05 11:00',
        partType: 'dañada'
      }
    ],
    createdAt: '2026-08-04 14:00',
    updatedAt: '2026-08-05 11:00',
    estimatedCost: 34240,
    clientApproved: null,
    paymentStatus: 'pendiente',
    notes: 'Cotización enviada al cliente mediante link de WhatsApp.'
  },
  {
    id: 'OS-9285',
    trackingToken: 'OS-9285-TRK',
    vehicle: {
      plates: 'BAN-5521',
      vin: '4UZAA2AK8KC901823',
      brand: 'International',
      model: 'ProStar ISX',
      mileageOrHours: '12,400 Horas Engine',
      year: '2020',
      clientName: 'Logística Exprés de Monterrey',
      clientPhone: '+52 81 5500 8812'
    },
    faultReason: 'Servicio de mantenimiento preventivo B (Cambio de aceite, filtros de aire, combustible y frenos).',
    checklist: [
      { id: 'chk-31', name: 'Filtros y Aceite', status: 'ok' },
      { id: 'chk-32', name: 'Pastillas Bendix Neumáticas', status: 'ok' }
    ],
    assignedTechnicianId: 'tech-3',
    assignedTechnicianName: 'Daniel O.',
    status: 'Finalizada',
    parts: [
      { id: 'p-301', code: 'BEN-BRK-4001', name: 'Pastillas de Freno Neumático Bendix', quantity: 2, unitPrice: 1850, status: 'despachado' },
      { id: 'p-302', code: 'ROT-15W40-20L', name: 'Aceite Shell Rotella 15W-40', quantity: 3, unitPrice: 2400, status: 'despachado' }
    ],
    labor: [
      { id: 'l-301', description: 'Mantenimiento preventivo completo 500 hrs', hours: 4, hourlyRate: 950, status: 'aprobado_cliente' }
    ],
    evidences: [
      {
        id: 'ev-4',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
        description: 'Instalación de pastillas Bendix nuevas y calibración de matracas neumáticas.',
        date: '2026-08-04 16:20',
        partType: 'nueva'
      }
    ],
    createdAt: '2026-08-04 09:00',
    updatedAt: '2026-08-04 18:00',
    estimatedCost: 14700,
    clientApproved: true,
    paymentStatus: 'liquidado',
    paymentMethod: 'Transferencia',
    warrantyDetails: 'Garantía de 90 días o 15,000 KM en repuestos instalados y mano de obra de frenado.'
  },
  {
    id: 'OS-9286',
    trackingToken: 'OS-9286-TRK',
    vehicle: {
      plates: 'NL-8841-A',
      vin: 'YV1A42G41MB772109',
      brand: 'Volvo',
      model: 'VNL 860',
      mileageOrHours: '310,000 KM',
      year: '2021',
      clientName: 'Autotransportes del Golfo',
      clientPhone: '+52 81 2233 4455'
    },
    faultReason: 'Fuga de anticongelante por tapa de bomba de agua Detroit y sobrecalentamiento intermitente.',
    checklist: [
      { id: 'chk-41', name: 'Bomba de Agua', status: 'fail', notes: 'Sello mecánico dañado' }
    ],
    assignedTechnicianId: 'tech-1',
    assignedTechnicianName: 'Ricardo M.',
    status: 'Prueba de Manejo',
    parts: [
      { id: 'p-401', code: 'DD15-WP-992', name: 'Bomba de Agua Heavy Duty Detroit', quantity: 1, unitPrice: 4900, status: 'despachado' }
    ],
    labor: [
      { id: 'l-401', description: 'Reemplazo bomba de agua y purga de sistema de enfriamiento', hours: 4, hourlyRate: 1100, status: 'aprobado_cliente' }
    ],
    evidences: [],
    createdAt: '2026-08-05 07:30',
    updatedAt: '2026-08-05 11:30',
    estimatedCost: 9300,
    clientApproved: true,
    paymentStatus: 'pendiente'
  }
];

export const INITIAL_WAREHOUSE_REQUESTS: WarehouseRequest[] = [
  {
    id: 'req-101',
    osId: 'OS-9283',
    vehicleInfo: 'Kenworth T680 (ABC-1234)',
    technicianName: 'Ricardo M.',
    itemCode: 'BOS-INJ-4307',
    itemName: 'Kit Inyectores Diesel Reman Bosch',
    quantity: 1,
    status: 'pendiente',
    requestedAt: '2026-08-05 10:15'
  },
  {
    id: 'req-102',
    osId: 'OS-9284',
    vehicleInfo: 'Freightliner Cascadia (XYZ-9876)',
    technicianName: 'Samuel V.',
    itemCode: 'HOL-TURB-351',
    itemName: 'Turbocargador Holset HE351VE VGT',
    quantity: 1,
    status: 'pendiente',
    requestedAt: '2026-08-05 11:05'
  }
];

export const INITIAL_USERS: User[] = [
  { id: 'usr-1', name: 'Ing. Fernando Garza', email: 'fgarza@tallerdiesel.com', role: 'direccion', status: 'activo', specialty: 'Administración General' },
  { id: 'usr-2', name: 'Lic. Mariana Treviño', email: 'mtrevino@tallerdiesel.com', role: 'asesor', status: 'activo', specialty: 'Recepción y Atención a Clientes' },
  { id: 'tech-1', name: 'Ricardo M.', email: 'rmartinez@tallerdiesel.com', role: 'tecnico', status: 'activo', specialty: 'Motores Cummins & Detroit' },
  { id: 'tech-2', name: 'Samuel V.', email: 'svazquez@tallerdiesel.com', role: 'tecnico', status: 'activo', specialty: 'Turbos y Sistemas de Emisión' },
  { id: 'tech-3', name: 'Daniel O.', email: 'dortiz@tallerdiesel.com', role: 'tecnico', status: 'activo', specialty: 'Frenos y Tren Motriz' },
  { id: 'usr-6', name: 'Carlos G.', email: 'cgonzalez@tallerdiesel.com', role: 'almacen', status: 'activo', specialty: 'Control de Inventario y Mostrador' }
];

export const INITIAL_CASH_CUT: CashCut = {
  id: 'cut-2026-08-05',
  date: '2026-08-05',
  initialCash: 5000,
  cashSales: 12800,
  cardSales: 24500,
  transferSales: 94000,
  totalIncome: 131300,
  expensesTotal: 3450,
  calculatedCash: 14350,
  actualCash: 14350,
  difference: 0,
  status: 'abierto',
  notes: 'Caja del día iniciada con $5,000 MXN en fondo de morralla.'
};

export const INITIAL_EXPENSES: Expense[] = [
  { id: 'exp-1', date: '2026-08-05 08:30', concept: 'Compra urgente de abrazaderas de presión de turbos', category: 'Repuestos', amount: 850, supplier: 'Refaccionaria Heavy Diesel', receiptNumber: 'FAC-8891' },
  { id: 'exp-2', date: '2026-08-05 09:15', concept: 'Insumos de limpieza para bahías de taller (Detergente industrial)', category: 'Otros', amount: 1200, supplier: 'Comercializadora Química', receiptNumber: 'FAC-4412' },
  { id: 'exp-3', date: '2026-08-05 10:00', concept: 'Calibración de torquímetro Snap-On', category: 'Herramientas', amount: 1400, supplier: 'Servicios de Metrología NL', receiptNumber: 'FAC-1200' }
];

export const INITIAL_POS_RECEIPTS: POSReceipt[] = [
  {
    id: 'pos-1001',
    folio: 'TICK-901',
    date: '2026-08-05 09:45',
    items: [
      { item: INITIAL_INVENTORY[0], quantity: 2 },
      { item: INITIAL_INVENTORY[7], quantity: 2 }
    ],
    subtotal: 2940,
    tax: 470.4,
    total: 3410.4,
    paymentMethod: 'Efectivo',
    clientName: 'Taller Flotilla Express'
  }
];

// 1. CITAS INICIALES
export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'APT-1001',
    clientName: 'Transportes Logísticos del Norte S.A.',
    clientPhone: '+52 81 1892 4029',
    clientEmail: 'mantenimiento@logisticanorte.com.mx',
    vehiclePlates: 'ABC-1234',
    vehicleBrandModel: 'Kenworth T680',
    vehicleYear: '2021',
    preferredDate: '2026-08-19',
    preferredTime: '08:30 AM',
    serviceType: 'Correctivo',
    serviceReason: 'Pérdida de potencia en pendientes y humo negro intermitente.',
    status: 'Pendiente',
    source: 'Portal Web Cliente',
    createdAt: '2026-08-18 10:15'
  },
  {
    id: 'APT-1002',
    clientName: 'Fletes y Enlaces del Pacífico',
    clientPhone: '+52 662 214 8890',
    clientEmail: 'taller@fletespacifico.com',
    vehiclePlates: 'XYZ-9876',
    vehicleBrandModel: 'Freightliner Cascadia',
    vehicleYear: '2020',
    preferredDate: '2026-08-19',
    preferredTime: '10:00 AM',
    serviceType: 'Preventivo',
    serviceReason: 'Mantenimiento preventivo tipo B (Aceite, filtros y calibración de válvulas).',
    status: 'Confirmada',
    bayAssigned: 'Bahía 2 - Diésel Pesado',
    source: 'Asesor Interno',
    createdAt: '2026-08-18 11:30'
  },
  {
    id: 'APT-1003',
    clientName: 'Cargas Rápidas de Sonora',
    clientPhone: '+52 662 312 9011',
    clientEmail: 'operaciones@cargasgrr.com',
    vehiclePlates: 'SON-7712',
    vehicleBrandModel: 'International ProStar',
    vehicleYear: '2019',
    preferredDate: '2026-08-18',
    preferredTime: '07:30 AM',
    serviceType: 'Diagnóstico',
    serviceReason: 'Código de falla SCR / Calentador DEF en tablero.',
    status: 'Convertida',
    convertedOrderId: 'OS-9283',
    source: 'Portal Web Cliente',
    createdAt: '2026-08-17 16:20'
  }
];

// 3. ÓRDENES DE COBRO Y BANDEJA DE FACTURACIÓN
export const INITIAL_BILLING_ORDERS: BillingOrder[] = [
  {
    id: 'COB-1091',
    sourceType: 'Mostrador',
    referenceId: 'TICK-901',
    clientName: 'Taller Flotilla Express',
    clientRfc: 'TFE980412HL8',
    clientEmail: 'pagos@flotillaexpress.mx',
    subtotal: 2940,
    taxIva: 470.4,
    total: 3410.4,
    status: 'Pagado',
    paymentMethod: 'Efectivo',
    paidAt: '2026-08-05 09:45',
    dispatchedInWarehouse: true,
    warehouseVoucherNumber: 'VALE-8891',
    itemsSummary: '2x Filtro Donaldson + 2x Urea DEF 20L',
    createdAt: '2026-08-05 09:40'
  },
  {
    id: 'COB-1092',
    sourceType: 'Taller',
    referenceId: 'OS-9283',
    clientName: 'Transportes Logísticos del Norte S.A.',
    clientRfc: 'TLN1402219X3',
    clientEmail: 'facturacion@logisticanorte.com.mx',
    subtotal: 36700,
    taxIva: 5872,
    total: 42572,
    status: 'Facturado',
    paymentMethod: 'Transferencia',
    paidAt: '2026-08-05 16:30',
    dispatchedInWarehouse: true,
    invoiceId: 'FAC-4019',
    itemsSummary: 'Servicio Correctivo Kenworth T680 (Inyectores, Mangueras y Mano de Obra)',
    createdAt: '2026-08-05 15:45'
  },
  {
    id: 'COB-1093',
    sourceType: 'Taller',
    referenceId: 'OS-9284',
    clientName: 'Fletes y Enlaces del Pacífico',
    clientRfc: 'FEP091103KA1',
    clientEmail: 'admon@fletespacifico.com',
    subtotal: 31400,
    taxIva: 5024,
    total: 36424,
    status: 'Pendiente de Pago',
    dispatchedInWarehouse: false,
    itemsSummary: 'Servicio Turbo Cascadia DD15 (Holset HE351VE + Diagnóstico)',
    createdAt: '2026-08-18 12:00'
  }
];

// FACTURAS CFDI EMITIDAS
export const INITIAL_INVOICES: InvoiceRecord[] = [
  {
    id: 'inv-cfdi-1',
    folio: 'FAC-4019',
    uuid: '4A9F21E0-8D3C-4C91-912A-FB3948A2019C',
    orderReferenceId: 'OS-9283',
    clientName: 'Transportes Logísticos del Norte S.A. de C.V.',
    rfc: 'TLN1402219X3',
    regimenFiscal: '601 - General de Ley Personas Morales',
    usoCfdi: 'G03 - Gastos en general',
    email: 'facturacion@logisticanorte.com.mx',
    subtotal: 36700,
    taxIva: 5872,
    total: 42572,
    paymentMethod: 'Transferencia',
    paymentForm: '03 - Transferencia electrónica',
    date: '2026-08-05 16:45',
    xmlData: '<?xml version="1.0" encoding="UTF-8"?><cfdi:Comprobante Version="4.0" Folio="4019" SubTotal="36700.00" Total="42572.00" TipoDeComprobante="I" xmlns:cfdi="http://www.sat.gob.mx/cfd/4"><cfdi:Emisor Rfc="TSR180901HD9" Nombre="TRACTOSERVICES AND DIESEL PARTS TSR SONORA SA DE CV" RegimenFiscal="601"/><cfdi:Receptor Rfc="TLN1402219X3" Nombre="TRANSPORTES LOGISTICOS DEL NORTE SA DE CV" UsoCFDI="G03"/></cfdi:Comprobante>',
    sentByEmail: true,
    emailSentAt: '2026-08-05 16:46'
  }
];

// 5. CONTROL INTERNO DE HERRAMIENTAS
export const INITIAL_TOOLS: ToolItem[] = [
  {
    id: 'tool-1',
    code: 'HRR-ESC-01',
    name: 'Scanner Diagnóstico Cummins Inline 7 HD',
    brand: 'Cummins Genuine',
    serialNumber: 'INL7-994021',
    category: 'Diagnóstico Electrónico',
    status: 'Asignada',
    currentTechnicianId: 'tech-1',
    currentTechnicianName: 'Ricardo M.',
    assignedDate: '2026-08-18 08:00',
    condition: 'Excelente',
    notes: 'Incluye adaptador 9 pines y cable USB blindado.'
  },
  {
    id: 'tool-2',
    code: 'HRR-TOR-02',
    name: 'Torquímetro Digital 3/4" (100 - 600 Ft-Lb)',
    brand: 'Snap-On',
    serialNumber: 'SN-TORQ-8812',
    category: 'Torque / Medición',
    status: 'Disponible',
    condition: 'Excelente',
    notes: 'Calibrado el 2026-08-05 por laboratorio acreditado.'
  },
  {
    id: 'tool-3',
    code: 'HRR-EXT-03',
    name: 'Extractor Hidráulico de Camisas de Cilindro ISX',
    brand: 'OTC Tools',
    serialNumber: 'OTC-5040-HD',
    category: 'Extractor / Prensa',
    status: 'Disponible',
    condition: 'Bueno',
    notes: 'Juego de adaptadores para camisas de 15L.'
  },
  {
    id: 'tool-4',
    code: 'HRR-PRE-04',
    name: 'Pistola de Impacto Neumática 1" Heavy Duty',
    brand: 'Ingersoll Rand',
    serialNumber: 'IR-285B-6',
    category: 'Neumática / Taller',
    status: 'Asignada',
    currentTechnicianId: 'tech-3',
    currentTechnicianName: 'Daniel O.',
    assignedDate: '2026-08-18 09:30',
    condition: 'Bueno',
    notes: 'Asignada para desmontaje de ruedas y tambores.'
  },
  {
    id: 'tool-5',
    code: 'HRR-DIAG-05',
    name: 'Kit de Presión de Riel Common Rail (2500 Bar)',
    brand: 'Bosch Diagnostic',
    serialNumber: 'BOS-CR-771',
    category: 'Especial Diésel',
    status: 'Disponible',
    condition: 'Excelente',
    notes: 'Para pruebas de bomba de alta presión CP4 y XPI.'
  }
];

export const INITIAL_TOOL_LOGS: ToolAssignmentLog[] = [
  {
    id: 'tlog-1',
    toolId: 'tool-1',
    toolCode: 'HRR-ESC-01',
    toolName: 'Scanner Diagnóstico Cummins Inline 7 HD',
    technicianId: 'tech-1',
    technicianName: 'Ricardo M.',
    assignedDate: '2026-08-18 08:00',
    status: 'Activa',
    responsibilitySigned: true,
    observations: 'Entrega en maletín de uso rudo con todos sus cables.'
  },
  {
    id: 'tlog-2',
    toolId: 'tool-4',
    toolCode: 'HRR-PRE-04',
    toolName: 'Pistola de Impacto Neumática 1" Heavy Duty',
    technicianId: 'tech-3',
    technicianName: 'Daniel O.',
    assignedDate: '2026-08-18 09:30',
    status: 'Activa',
    responsibilitySigned: true,
    observations: 'Se entrega lubricada.'
  }
];

// 6. COMPRAS Y PROVEEDORES
export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'OC-8021',
    supplierId: 'prov-1',
    supplierName: 'Distribuidora Diésel del Noroeste S.A.',
    supplierEmail: 'ventas@dieselnoroeste.mx',
    date: '2026-08-16',
    status: 'Recibida en Almacén',
    isDirectExpense: false,
    expenseCategory: 'Refacciones Almacén',
    paymentMethod: 'Transferencia',
    bankAccountId: 'bank-1',
    items: [
      { id: 'poi-1', partCode: 'P55126', description: 'Filtro de Aceite Donaldson Lube', quantity: 15, unitCost: 450, total: 6750 },
      { id: 'poi-2', partCode: 'FLE-FF5776', description: 'Filtro Separador Diésel Fleetguard', quantity: 20, unitCost: 620, total: 12400 }
    ],
    subtotal: 19150,
    taxIva: 3064,
    total: 22214,
    notes: 'Surtido para stock general de almacén quincenal.',
    sentAt: '2026-08-16 10:00',
    receivedAt: '2026-08-17 14:30'
  },
  {
    id: 'OC-8022',
    supplierId: 'prov-2',
    supplierName: 'Lubricantes y Químicos Industriales',
    supplierEmail: 'pedidos@lubriq.com.mx',
    date: '2026-08-18',
    status: 'Enviada a Proveedor',
    isDirectExpense: false,
    expenseCategory: 'Refacciones Almacén',
    paymentMethod: 'Crédito Proveedor',
    items: [
      { id: 'poi-3', partCode: 'ROT-15W40', description: 'Aceite Mineral Shell Rotella 15W-40 (Cubetas 19L)', quantity: 20, unitCost: 1850, total: 37000 }
    ],
    subtotal: 37000,
    taxIva: 5920,
    total: 42920,
    notes: 'Solicitud urgente por agotamiento de tambores de servicio.',
    sentAt: '2026-08-18 09:15'
  }
];

// 7. CONTACTOS (DIRECTORIO DE CLIENTES Y PROVEEDORES)
export const INITIAL_CLIENT_CONTACTS: ClientContact[] = [
  {
    id: 'cli-1',
    name: 'Transportes Logísticos del Norte S.A. de C.V.',
    commercialName: 'TLN Logistics',
    rfc: 'TLN1402219X3',
    regimenFiscal: '601 - General de Ley Personas Morales',
    usoCfdi: 'G03 - Gastos en general',
    email: 'facturacion@logisticanorte.com.mx',
    phone: '+52 81 1892 4029',
    address: 'Blvd. García Morales Km 6.5, Hermosillo, Sonora',
    creditDays: 30,
    creditLimit: 250000,
    totalOrdersCount: 14,
    createdAt: '2025-01-10',
    vehicles: [
      { plates: 'ABC-1234', brand: 'Kenworth', model: 'T680', year: '2021', vin: '1XKDDB9X1MD829103', engine: 'Cummins ISX15' },
      { plates: 'SON-4091', brand: 'Kenworth', model: 'T660', year: '2018', vin: '2XKDDB8X9KD491823', engine: 'Cummins ISX' }
    ]
  },
  {
    id: 'cli-2',
    name: 'Fletes y Enlaces del Pacífico S.A.',
    commercialName: 'FEP Express',
    rfc: 'FEP091103KA1',
    regimenFiscal: '601 - General de Ley Personas Morales',
    usoCfdi: 'G03 - Gastos en general',
    email: 'admon@fletespacifico.com',
    phone: '+52 662 214 8890',
    address: 'Parque Industrial Dynatech, Hermosillo, Sonora',
    creditDays: 15,
    creditLimit: 150000,
    totalOrdersCount: 8,
    createdAt: '2025-03-22',
    vehicles: [
      { plates: 'XYZ-9876', brand: 'Freightliner', model: 'Cascadia', year: '2020', vin: '3AKJHHDR8LS901234', engine: 'Detroit DD15' }
    ]
  },
  {
    id: 'cli-3',
    name: 'Cargas Rápidas de Sonora',
    commercialName: 'GRR Transport',
    rfc: 'CRS180514P90',
    regimenFiscal: '612 - Personas Físicas con Actividades Empresariales',
    usoCfdi: 'G03 - Gastos en general',
    email: 'operaciones@cargasgrr.com',
    phone: '+52 662 312 9011',
    address: 'Carretera a Sahuaripa Km 3.2, Hermosillo, Sonora',
    creditDays: 0,
    creditLimit: 0,
    totalOrdersCount: 5,
    createdAt: '2025-06-15',
    vehicles: [
      { plates: 'SON-7712', brand: 'International', model: 'ProStar', year: '2019', vin: '3HSCAPR64KN890123', engine: 'Navistar N13' }
    ]
  }
];

export const INITIAL_SUPPLIER_CONTACTS: SupplierContact[] = [
  {
    id: 'prov-1',
    companyName: 'Distribuidora Diésel del Noroeste S.A. de C.V.',
    contactPerson: 'Lic. Roberto Valenzuela',
    rfc: 'DDN040912HA1',
    email: 'ventas@dieselnoroeste.mx',
    phone: '+52 662 289 9000',
    address: 'Blvd. Kino #401, Hermosillo, Sonora',
    category: 'Refacciones Diésel',
    creditDays: 30,
    bankName: 'BBVA Bancomer',
    bankAccountClabe: '012760001928374651',
    suppliesList: ['Filtros Donaldson', 'Fleetguard', 'Inyectores Bosch', 'Turbos Holset']
  },
  {
    id: 'prov-2',
    companyName: 'Lubricantes y Químicos Industriales S.A.',
    contactPerson: 'Ing. Sandra Mendoza',
    rfc: 'LQI110823KJ9',
    email: 'pedidos@lubriq.com.mx',
    phone: '+52 662 254 3321',
    address: 'Calle de los Pinos 88, Zona Industrial, Hermosillo',
    category: 'Aceites y Lubricantes',
    creditDays: 21,
    bankName: 'Banorte',
    bankAccountClabe: '072760009182736452',
    suppliesList: ['Shell Rotella 15W40', 'Mobil Delvac', 'Fluido DEF Urea', 'Anticongelante ELC']
  },
  {
    id: 'prov-3',
    companyName: 'Metrología y Herramientas Especiales del Norte',
    contactPerson: 'Ing. Carlos Peralta',
    rfc: 'MHN190302KL8',
    email: 'contacto@herramientasnorte.com',
    phone: '+52 81 8390 1200',
    address: 'Av. Gonzalitos 1200, Monterrey, NL',
    category: 'Herramientas',
    creditDays: 15,
    bankName: 'Santander',
    bankAccountClabe: '014760004819203948',
    suppliesList: ['Scanners Cummins Inline', 'Torquímetros Snap-On', 'Prensas Hidráulicas OTC']
  }
];

// 8. BANCOS Y FINANZAS
export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'bank-1',
    name: 'BBVA Bancomer Cuenta Maestra Operativa',
    bankName: 'BBVA Bancomer',
    type: 'Banco',
    accountNumber: '0114920194',
    clabe: '012760001149201948',
    currency: 'MXN',
    currentBalance: 485900.50
  },
  {
    id: 'bank-2',
    name: 'Banorte Cuenta Fiscal Cobranza',
    bankName: 'Banorte',
    type: 'Banco',
    accountNumber: '0892019382',
    clabe: '072760008920193821',
    currency: 'MXN',
    currentBalance: 298400.00
  },
  {
    id: 'bank-3',
    name: 'Caja Principal de Efectivo (Mostrador y Taller)',
    bankName: 'Caja Física Taller',
    type: 'Caja Efectivo',
    accountNumber: 'CAJA-EFECTIVO-01',
    currency: 'MXN',
    currentBalance: 18450.00
  }
];

export const INITIAL_FINANCIAL_MOVEMENTS: FinancialMovement[] = [
  {
    id: 'mov-1',
    accountId: 'bank-1',
    accountName: 'BBVA Bancomer Cuenta Maestra Operativa',
    type: 'Ingreso',
    concept: 'Pago Transferencia OS-9283 Transportes Logísticos',
    category: 'Cobro Taller',
    amount: 42572.00,
    date: '2026-08-05 16:30',
    reference: 'SPEI-8891024',
    relatedOrderId: 'OS-9283'
  },
  {
    id: 'mov-2',
    accountId: 'bank-3',
    accountName: 'Caja Principal de Efectivo (Mostrador y Taller)',
    type: 'Ingreso',
    concept: 'Venta mostrador Mostrador TICK-901 Flotilla Express',
    category: 'Cobro Mostrador',
    amount: 3410.40,
    date: '2026-08-05 09:45',
    reference: 'EFECTIVO-CAJA',
    relatedOrderId: 'TICK-901'
  },
  {
    id: 'mov-3',
    accountId: 'bank-1',
    accountName: 'BBVA Bancomer Cuenta Maestra Operativa',
    type: 'Egreso',
    concept: 'Pago OC-8021 Distribuidora Diésel del Noroeste',
    category: 'Compra Refacciones',
    amount: 22214.00,
    date: '2026-08-17 14:45',
    reference: 'SPEI-1928301',
    relatedPurchaseId: 'OC-8021'
  },
  {
    id: 'mov-4',
    accountId: 'bank-3',
    accountName: 'Caja Principal de Efectivo (Mostrador y Taller)',
    type: 'Egreso',
    concept: 'Compra urgente de abrazaderas de presión de turbos',
    category: 'Compra Refacciones',
    amount: 850.00,
    date: '2026-08-05 08:30',
    reference: 'FAC-8891'
  }
];
