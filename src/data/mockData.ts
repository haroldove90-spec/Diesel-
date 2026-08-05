import { 
  UserRoleInfo, 
  ServiceOrder, 
  InventoryItem, 
  WarehouseRequest, 
  User, 
  CashCut, 
  Expense,
  POSReceipt
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
    brand: 'Donaldson',
    costPrice: 450,
    salePrice: 850,
    engineApplications: 'Cummins ISX / Detroit DD15 / Paccar MX13',
    stock: 2,
    minStock: 10,
    unit: 'pz'
  },
  {
    id: 'inv-2',
    code: 'BOS-INJ-4307',
    name: 'Kit Inyectores Diesel Reman Bosch',
    category: 'Motor / Inyección',
    brand: 'Bosch',
    costPrice: 14500,
    salePrice: 21800,
    engineApplications: 'Cummins ISX15 High Pressure',
    stock: 1,
    minStock: 3,
    unit: 'juego'
  },
  {
    id: 'inv-3',
    code: 'HOL-TURB-351',
    name: 'Turbocargador Holset HE351VE VGT',
    category: 'Motor / Turbo',
    brand: 'Holset',
    costPrice: 18900,
    salePrice: 27500,
    engineApplications: 'Cummins ISX / ISM',
    stock: 3,
    minStock: 2,
    unit: 'pz'
  },
  {
    id: 'inv-4',
    code: 'DD15-WP-992',
    name: 'Bomba de Agua Heavy Duty Detroit',
    category: 'Sistemas de Enfriamiento',
    brand: 'Detroit Diesel',
    costPrice: 3200,
    salePrice: 4900,
    engineApplications: 'Detroit Diesel DD13 / DD15',
    stock: 5,
    minStock: 4,
    unit: 'pz'
  },
  {
    id: 'inv-5',
    code: 'BEN-BRK-4001',
    name: 'Pastillas de Freno Neumático Bendix',
    category: 'Frenos y Suspensión',
    brand: 'Bendix',
    costPrice: 1100,
    salePrice: 1850,
    engineApplications: 'Universal Kenworth / Freightliner / Navistar',
    stock: 14,
    minStock: 8,
    unit: 'juego'
  },
  {
    id: 'inv-6',
    code: 'ROT-15W40-20L',
    name: 'Aceite Mineral 15W-40 Shell Rotella T4 (20 Litros)',
    category: 'Lubricantes y Fluidos',
    brand: 'Shell Rotella',
    costPrice: 1650,
    salePrice: 2400,
    engineApplications: 'Motores Diesel Heavy Duty Euro IV/V',
    stock: 18,
    minStock: 12,
    unit: 'cubeta'
  },
  {
    id: 'inv-7',
    code: 'EGR-BW-8821',
    name: 'Válvula EGR Reenfriada BorgWarner',
    category: 'Emisiones',
    brand: 'BorgWarner',
    costPrice: 8900,
    salePrice: 13200,
    engineApplications: 'Navistar MaxxForce 11/13',
    stock: 0,
    minStock: 2,
    unit: 'pz'
  },
  {
    id: 'inv-8',
    code: 'FLE-FF5776',
    name: 'Filtro de Combustible Separador Agua Fleetguard',
    category: 'Mantenimiento',
    brand: 'Fleetguard',
    costPrice: 380,
    salePrice: 620,
    engineApplications: 'Cummins QSB / ISB / ISX',
    stock: 25,
    minStock: 15,
    unit: 'pz'
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
