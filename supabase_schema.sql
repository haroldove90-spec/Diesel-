-- =========================================================
-- SUPABASE DATABASE INITIALIZATION SCRIPT FOR TSR TALLER DIESEL
-- Project: tsrsonora@appdesignsoftware.com's Project
-- Project ID: oejrrmtnluefhttqnutn
-- Execute this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/oejrrmtnluefhttqnutn/sql/new
-- =========================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------
-- 1. SERVICE ORDERS (Ordenes de Servicio)
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
-- 2. INVENTORY ITEMS (Refacciones e Inventario)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    brand TEXT NOT NULL,
    cost_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    sale_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    engine_applications TEXT NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 0,
    unit TEXT DEFAULT 'pz',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 3. WAREHOUSE REQUESTS (Solicitudes de Almacén)
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
-- 4. POS RECEIPTS (Ventas de Mostrador)
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
-- 5. EXPENSES (Gastos Operativos)
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
-- 6. USERS APP (Personal y Usuarios)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users_app (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'activo',
    specialty TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 7. CASH CUTS (Cortes de Caja)
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
-- ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC ACCESS POLICIES
-- ---------------------------------------------------------
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_app ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_cuts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write on service_orders" ON public.service_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on inventory_items" ON public.inventory_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on warehouse_requests" ON public.warehouse_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on pos_receipts" ON public.pos_receipts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on users_app" ON public.users_app FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on cash_cuts" ON public.cash_cuts FOR ALL USING (true) WITH CHECK (true);

-- ---------------------------------------------------------
-- SEED INITIAL DATA (Datos Iniciales del Sistema)
-- ---------------------------------------------------------
INSERT INTO public.inventory_items (id, code, name, category, brand, cost_price, sale_price, engine_applications, stock, min_stock, unit)
VALUES
('inv-101', 'FIL-CUM-ISX', 'Filtro de Aceite LF14000NN', 'Filtros', 'Fleetguard', 450.00, 780.00, 'Cummins ISX / X15', 18, 5, 'pz'),
('inv-102', 'INJ-DET-DD15', 'Inyector diésel Reman A4720700887', 'Inyección', 'Detroit Diesel', 3200.00, 4850.00, 'Detroit DD15 Tier 4', 6, 2, 'pz'),
('inv-103', 'SEN-NOX-DD13', 'Sensor NOx Salida DD13/DD15', 'Sistemas SCR/Emisiones', 'Continental', 2100.00, 3200.00, 'Detroit DD13/DD15 EPA10', 4, 2, 'pz'),
('inv-104', 'TUR-GAR-HE400', 'Turbocargador VGT Holset HE400VG', 'Turbos', 'Holset', 14500.00, 21900.00, 'Cummins ISX15 / QSX15', 2, 1, 'pz'),
('inv-105', 'VAL-EGR-MAXX', 'Válvula EGR MaxxForce 13', 'Motor', 'Navistar', 4800.00, 7100.00, 'International MaxxForce 11/13', 3, 1, 'pz'),
('inv-106', 'BOM-DEF-BOSCH', 'Bomba de Urea Doser DEF Denoxtronic', 'Sistemas SCR/Emisiones', 'Bosch', 5500.00, 8400.00, 'Universal Kenworth/Freightliner', 5, 2, 'pz')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users_app (id, name, email, role, status, specialty, phone)
VALUES
('usr-1', 'Roberto Garza', 'rgarza@tsr.com', 'Dirección Administrativa', 'activo', 'Administración General', '662-100-2001'),
('usr-2', 'Carlos Mendoza', 'cmendoza@tsr.com', 'Jefe de Taller', 'activo', 'Diagnóstico Pesado', '662-100-2002'),
('usr-3', 'Ing. Miguel Ángel Solís', 'msolis@tsr.com', 'Técnico Especialista', 'activo', 'Sistemas Cummins & SCR', '662-100-2003'),
('usr-4', 'Jorge Luis Torres', 'jtorres@tsr.com', 'Técnico Especialista', 'activo', 'Detroit DD15 & Transmisiones', '662-100-2004'),
('usr-5', 'Esteban Peralta', 'eperalta@tsr.com', 'Almacén de Refacciones', 'activo', 'Gestión de Partes', '662-100-2005'),
('usr-6', 'Laura Elena Ruiz', 'lruiz@tsr.com', 'Mostrador y Facturación', 'activo', 'Atención al Cliente', '662-100-2006')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.service_orders (
    id, tracking_token, vehicle, fault_reason, checklist, assigned_technician_id, assigned_technician_name,
    status, parts, labor, evidences, created_at, updated_at, estimated_cost, client_approved, payment_status
)
VALUES
(
    'OS-9283',
    'OS-9283-TRK',
    '{"vin": "3AKJH35D8KS921049", "plates": "88-AA-1B", "brand": "Freightliner", "model": "Cascadia 2021", "engine": "Detroit DD15", "mileage": "412,500 KM", "ownerName": "Transportes Flotil SA de CV", "ownerPhone": "662-555-0192"}'::jsonb,
    'Perdida severa de potencia bajo carga y código de falla de presión DEF elevado (Regeneración DPF bloqueada).',
    '[{"id": "chk-1", "label": "Presión del sistema DEF en línea", "checked": true}, {"id": "chk-2", "label": "Escaneo de códigos OBD / J1939", "checked": true}, {"id": "chk-3", "label": "Inspección visual de fugas de refrigerante/aceite", "checked": false}]'::jsonb,
    'usr-3',
    'Ing. Miguel Ángel Solís',
    'En Proceso',
    '[{"id": "p-1", "code": "SEN-NOX-DD13", "name": "Sensor NOx Salida DD13/DD15", "quantity": 1, "unitPrice": 3200, "status": "aprobado_cliente"}]'::jsonb,
    '[{"id": "l-1", "description": "Diagnóstico escáner J1939 y cambio de sensor NOx", "hours": 3.5, "hourlyRate": 650, "status": "aprobado_cliente"}]'::jsonb,
    '[{"id": "ev-1", "type": "foto", "url": "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80", "description": "Léctura de contrapresión DPF con sensor obstruido.", "date": "2026-03-30 09:15"}]'::jsonb,
    '2026-03-30 08:30',
    '2026-03-30 11:20',
    5475.00,
    true,
    'pendiente'
),
(
    'OS-9284',
    'OS-9284-TRK',
    '{"vin": "1XKDP49X7KJ384920", "plates": "32-BB-9C", "brand": "Kenworth", "model": "T680 2020", "engine": "Cummins ISX15", "mileage": "520,100 KM", "ownerName": "Logística del Norte", "ownerPhone": "662-555-8833"}'::jsonb,
    'Mantenimiento preventivo B de 50,000 KM y revisión de fuga de aceite en retén frontal.',
    '[{"id": "chk-1", "label": "Cambio de filtro de aceite y combustible", "checked": true}, {"id": "chk-2", "label": "Inspección de bandas y poleas", "checked": true}]'::jsonb,
    'usr-4',
    'Jorge Luis Torres',
    'Esperando Refacción',
    '[{"id": "p-2", "code": "FIL-CUM-ISX", "name": "Filtro de Aceite LF14000NN", "quantity": 2, "unitPrice": 780, "status": "solicitado"}]'::jsonb,
    '[{"id": "l-2", "description": "Mantenimiento preventivo general e inspección de sellos", "hours": 4, "hourlyRate": 600, "status": "pendiente_aprobacion"}]'::jsonb,
    '[]'::jsonb,
    '2026-03-30 10:10',
    '2026-03-30 10:45',
    3960.00,
    null,
    'pendiente'
)
ON CONFLICT (id) DO NOTHING;
