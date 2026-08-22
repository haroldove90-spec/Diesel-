-- =========================================================
-- SCRIPT DE INICIALIZACIÓN SQL COMPLETO PARA SUPABASE
-- Sistema: TSR TALLER DIESEL (Tractoservices and Diesel Parts)
-- Proyecto Supabase: oejrrmtnluefhttqnutn
-- Enlace SQL Editor: https://supabase.com/dashboard/project/oejrrmtnluefhttqnutn/sql/new
-- =========================================================

-- 0. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------
-- 1. TABLA: app_users (Usuarios y Personal del Taller)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'activo',
    specialty TEXT DEFAULT 'General',
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla alias/espejo users_app para compatibilidad total
CREATE TABLE IF NOT EXISTS public.users_app (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'activo',
    specialty TEXT DEFAULT 'General',
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 2. TABLA: service_orders (Órdenes de Servicio de Taller)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_orders (
    id TEXT PRIMARY KEY,
    tracking_token TEXT UNIQUE NOT NULL,
    vehicle JSONB NOT NULL,
    fault_reason TEXT NOT NULL,
    checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
    assigned_technician_id TEXT,
    assigned_technician_name TEXT,
    status TEXT NOT NULL DEFAULT 'Diagnóstico',
    parts JSONB NOT NULL DEFAULT '[]'::jsonb,
    labor JSONB NOT NULL DEFAULT '[]'::jsonb,
    evidences JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estimated_cost NUMERIC(12,2) DEFAULT 0.00,
    client_approved BOOLEAN,
    payment_status TEXT DEFAULT 'pendiente',
    payment_method TEXT,
    warranty_details TEXT,
    tech_notes TEXT,
    notes TEXT
);

-- ---------------------------------------------------------
-- 3. TABLA: inventory_items (Inventario y Refacciones Diésel)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    brand TEXT NOT NULL,
    cost_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    sale_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    engine_applications TEXT NOT NULL,
    equivalences JSONB DEFAULT '[]'::jsonb,
    stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 0,
    unit TEXT DEFAULT 'pz',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 4. TABLA: warehouse_requests (Vales y Solicitudes de Almacén)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.warehouse_requests (
    id TEXT PRIMARY KEY,
    os_id TEXT NOT NULL,
    vehicle_info TEXT NOT NULL,
    technician_name TEXT NOT NULL,
    item_code TEXT NOT NULL,
    item_name TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pendiente',
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 5. TABLA: pos_receipts (Ventas de Mostrador / Punto de Venta)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pos_receipts (
    id TEXT PRIMARY KEY,
    folio TEXT UNIQUE NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    items JSONB NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,
    tax NUMERIC(12,2) NOT NULL,
    total NUMERIC(12,2) NOT NULL,
    payment_method TEXT NOT NULL,
    client_name TEXT DEFAULT 'Cliente de Mostrador'
);

-- ---------------------------------------------------------
-- 6. TABLA: expenses (Gastos y Egresos Operativos)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    concept TEXT NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    supplier TEXT,
    receipt_number TEXT
);

-- ---------------------------------------------------------
-- 7. TABLA: cash_cuts (Cortes de Caja)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cash_cuts (
    id TEXT PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE,
    initial_cash NUMERIC(12,2) NOT NULL DEFAULT 2500.00,
    cash_sales NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    card_sales NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    transfer_sales NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_income NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    expenses_total NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    calculated_cash NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    actual_cash NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    difference NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'abierto',
    notes TEXT
);

-- ---------------------------------------------------------
-- 8. TABLA: appointments (Citas y Recepción Programada)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT,
    vehicle_brand_model TEXT NOT NULL,
    vehicle_year TEXT,
    vehicle_plates TEXT NOT NULL,
    service_type TEXT NOT NULL,
    service_reason TEXT NOT NULL,
    preferred_date TEXT NOT NULL,
    preferred_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Confirmada',
    source TEXT NOT NULL DEFAULT 'WhatsApp',
    bay_assigned TEXT,
    converted_order_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 9. TABLA: billing_orders (Caja y Cobranza)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.billing_orders (
    id TEXT PRIMARY KEY,
    source_type TEXT NOT NULL,
    reference_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_rfc TEXT,
    subtotal NUMERIC(12,2) NOT NULL,
    tax_iva NUMERIC(12,2) NOT NULL,
    total NUMERIC(12,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pendiente de Pago',
    payment_method TEXT,
    paid_at TEXT,
    invoice_id TEXT,
    dispatched_in_warehouse BOOLEAN DEFAULT false,
    warehouse_voucher_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    items_summary TEXT
);

-- ---------------------------------------------------------
-- 10. TABLA: invoices (Facturas CFDI 4.0 Timbradas)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY,
    folio TEXT UNIQUE NOT NULL,
    uuid TEXT UNIQUE NOT NULL,
    order_reference_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    rfc TEXT NOT NULL,
    regimen_fiscal TEXT NOT NULL,
    uso_cfdi TEXT NOT NULL,
    email TEXT NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,
    tax_iva NUMERIC(12,2) NOT NULL,
    total NUMERIC(12,2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_form TEXT NOT NULL,
    date TEXT NOT NULL,
    xml_data TEXT,
    sent_by_email BOOLEAN DEFAULT false,
    email_sent_at TEXT
);

-- ---------------------------------------------------------
-- 11. TABLA: tools (Herramientas y Equipos de Diagnóstico)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tools (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    brand TEXT NOT NULL,
    serial_number TEXT,
    location TEXT NOT NULL,
    condition TEXT NOT NULL DEFAULT 'Excelente',
    status TEXT NOT NULL DEFAULT 'Disponible',
    current_technician_id TEXT,
    current_technician_name TEXT,
    assigned_date TEXT,
    purchase_date TEXT,
    cost NUMERIC(12,2) DEFAULT 0.00,
    notes TEXT
);

-- ---------------------------------------------------------
-- 12. TABLA: tool_logs (Historial de Préstamos de Herramienta)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tool_logs (
    id TEXT PRIMARY KEY,
    tool_id TEXT NOT NULL,
    tool_code TEXT NOT NULL,
    tool_name TEXT NOT NULL,
    technician_id TEXT NOT NULL,
    technician_name TEXT NOT NULL,
    assigned_date TEXT NOT NULL,
    return_date TEXT,
    status TEXT NOT NULL DEFAULT 'Activa',
    return_condition TEXT,
    responsibility_signed BOOLEAN DEFAULT true,
    observations TEXT
);

-- ---------------------------------------------------------
-- 13. TABLA: purchase_orders (Órdenes de Compra y Proveedores)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    supplier_id TEXT NOT NULL,
    supplier_name TEXT NOT NULL,
    supplier_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Enviada a Proveedor',
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(12,2) NOT NULL,
    tax_iva NUMERIC(12,2) NOT NULL,
    total NUMERIC(12,2) NOT NULL,
    payment_method TEXT NOT NULL,
    bank_account_id TEXT,
    is_direct_expense BOOLEAN DEFAULT false,
    expense_category TEXT,
    notes TEXT,
    authorized_by TEXT,
    authorized_at TEXT,
    sent_at TEXT,
    received_at TEXT,
    created_by_role TEXT
);

-- ---------------------------------------------------------
-- 14. TABLA: client_contacts (Directorio Clientes & Flotas)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.client_contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    commercial_name TEXT,
    rfc TEXT,
    regimen_fiscal TEXT,
    uso_cfdi TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    credit_days INT DEFAULT 0,
    credit_limit NUMERIC(12,2) DEFAULT 0.00,
    vehicles JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 15. TABLA: supplier_contacts (Directorio Proveedores Diésel)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.supplier_contacts (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_person TEXT,
    rfc TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    category TEXT NOT NULL,
    credit_days INT DEFAULT 0,
    bank_name TEXT,
    bank_account_clabe TEXT,
    supplies_list JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 16. TABLA: bank_accounts (Cuentas Bancarias y Caja Fuerte)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    type TEXT NOT NULL,
    account_number TEXT,
    clabe TEXT,
    currency TEXT DEFAULT 'MXN',
    current_balance NUMERIC(12,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 17. TABLA: financial_movements (Flujo Bancario y Movimientos)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.financial_movements (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    account_name TEXT NOT NULL,
    type TEXT NOT NULL,
    concept TEXT NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reference TEXT,
    related_order_id TEXT,
    related_purchase_id TEXT
);

-- =========================================================
-- POLÍTICAS DE ACCESO (ROW LEVEL SECURITY - RLS)
-- Permite lectura y escritura transparente para la app cliente
-- =========================================================
DO $$ 
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'app_users', 'users_app', 'service_orders', 'inventory_items',
        'warehouse_requests', 'pos_receipts', 'expenses', 'cash_cuts',
        'appointments', 'billing_orders', 'invoices', 'tools', 'tool_logs',
        'purchase_orders', 'client_contacts', 'supplier_contacts',
        'bank_accounts', 'financial_movements'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE IF EXISTS public.%I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'Allow_Public_Full_Access_' || tbl, tbl);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING (true) WITH CHECK (true);', 'Allow_Public_Full_Access_' || tbl, tbl);
    END LOOP;
END $$;

-- ---------------------------------------------------------
-- SEED DE DATOS INICIALES (Usuarios y Catálogos de Demostración)
-- ---------------------------------------------------------
INSERT INTO public.app_users (id, name, email, role, status, specialty, phone)
VALUES
('usr-1', 'Roberto Garza', 'rgarza@tsr.com', 'direccion', 'activo', 'Administración General', '662-100-2001'),
('usr-2', 'Carlos Mendoza', 'cmendoza@tsr.com', 'asesor', 'activo', 'Diagnóstico Pesado', '662-100-2002'),
('usr-3', 'Ing. Miguel Ángel Solís', 'msolis@tsr.com', 'tecnico', 'activo', 'Sistemas Cummins & SCR', '662-100-2003'),
('usr-4', 'Jorge Luis Torres', 'jtorres@tsr.com', 'tecnico', 'activo', 'Detroit DD15 & Transmisiones', '662-100-2004'),
('usr-5', 'Esteban Peralta', 'eperalta@tsr.com', 'almacen', 'activo', 'Gestión de Partes', '662-100-2005'),
('usr-6', 'Laura Elena Ruiz', 'lruiz@tsr.com', 'contabilidad', 'activo', 'Atención al Cliente y Facturación', '662-100-2006')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users_app (id, name, email, role, status, specialty, phone)
VALUES
('usr-1', 'Roberto Garza', 'rgarza@tsr.com', 'direccion', 'activo', 'Administración General', '662-100-2001'),
('usr-2', 'Carlos Mendoza', 'cmendoza@tsr.com', 'asesor', 'activo', 'Diagnóstico Pesado', '662-100-2002'),
('usr-3', 'Ing. Miguel Ángel Solís', 'msolis@tsr.com', 'tecnico', 'activo', 'Sistemas Cummins & SCR', '662-100-2003'),
('usr-4', 'Jorge Luis Torres', 'jtorres@tsr.com', 'tecnico', 'activo', 'Detroit DD15 & Transmisiones', '662-100-2004'),
('usr-5', 'Esteban Peralta', 'eperalta@tsr.com', 'almacen', 'activo', 'Gestión de Partes', '662-100-2005'),
('usr-6', 'Laura Elena Ruiz', 'lruiz@tsr.com', 'contabilidad', 'activo', 'Atención al Cliente y Facturación', '662-100-2006')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.inventory_items (id, code, name, category, brand, cost_price, sale_price, engine_applications, stock, min_stock, unit)
VALUES
('inv-101', 'FIL-CUM-ISX', 'Filtro de Aceite LF14000NN', 'Filtros', 'Fleetguard', 450.00, 780.00, 'Cummins ISX / X15', 18, 5, 'pz'),
('inv-102', 'INJ-DET-DD15', 'Inyector diésel Reman A4720700887', 'Inyección', 'Detroit Diesel', 3200.00, 4850.00, 'Detroit DD15 Tier 4', 6, 2, 'pz'),
('inv-103', 'SEN-NOX-DD13', 'Sensor NOx Salida DD13/DD15', 'Sistemas SCR/Emisiones', 'Continental', 2100.00, 3200.00, 'Detroit DD13/DD15 EPA10', 4, 2, 'pz'),
('inv-104', 'TUR-GAR-HE400', 'Turbocargador VGT Holset HE400VG', 'Turbos', 'Holset', 14500.00, 21900.00, 'Cummins ISX15 / QSX15', 2, 1, 'pz'),
('inv-105', 'VAL-EGR-MAXX', 'Válvula EGR MaxxForce 13', 'Motor', 'Navistar', 4800.00, 7100.00, 'International MaxxForce 11/13', 3, 1, 'pz'),
('inv-106', 'BOM-DEF-BOSCH', 'Bomba de Urea Doser DEF Denoxtronic', 'Sistemas SCR/Emisiones', 'Bosch', 5500.00, 8400.00, 'Universal Kenworth/Freightliner', 5, 2, 'pz')
ON CONFLICT (id) DO NOTHING;
