-- Schema for NAIRISTEM Workshop Detailing Management System

-- Drop tables if exists
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS service_catalog CASCADE;
DROP TABLE IF EXISTS technicians CASCADE;

-- Technicians table
CREATE TABLE technicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'Senior Detailer',
    default_commission_pct NUMERIC(5,2) DEFAULT 15.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Catalog table
CREATE TABLE service_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'coating', 'correction', 'interior', 'glass', 'engine'
    base_price NUMERIC(12,2) NOT NULL,
    estimated_duration_hours NUMERIC(4,1) DEFAULT 4.0,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders (SPK - Surat Perintah Kerja)
CREATE TABLE orders (
    id VARCHAR(100) PRIMARY KEY,
    spk_number VARCHAR(30) UNIQUE NOT NULL,
    plate_number VARCHAR(20) NOT NULL,
    vehicle_model VARCHAR(100) NOT NULL,
    vehicle_color VARCHAR(50) NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    technician_name VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'queue' 
        CHECK (status IN ('queue', 'detailing', 'finishing', 'ready', 'completed')),
    service_package VARCHAR(150) NOT NULL,
    service_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    polish_materials JSONB NOT NULL DEFAULT '[]'::jsonb,
    scratch_points JSONB NOT NULL DEFAULT '[]'::jsonb,
    initial_photos JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_service_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    material_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    technician_commission_pct NUMERIC(5,2) NOT NULL DEFAULT 15.00,
    technician_commission_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount NUMERIC(12,2) NOT NULL DEFAULT 0,
    final_total NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid' 
        CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
    notes TEXT,
    estimated_completion TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning fast queries
CREATE INDEX idx_orders_plate_number ON orders(plate_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;

-- Public can read orders by plate_number for customer tracking
CREATE POLICY "Public can view tracking by plate_number" 
    ON orders FOR SELECT 
    USING (true);

-- Allow all operations for anon / authenticated key in demo workshop
CREATE POLICY "Allow all access to authenticated and anon" 
    ON orders FOR ALL 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Allow read catalog" 
    ON service_catalog FOR ALL 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Allow read technicians" 
    ON technicians FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Insert Default Technicians
INSERT INTO technicians (name, phone, role, default_commission_pct) VALUES
('Rudi Haryanto', '08123456781', 'Lead Specialist Coating', 15.00),
('Doni Wahyudi', '08123456782', 'Paint Correction Master', 15.00),
('Eko Prasetyo', '08123456783', 'Interior & Glass Specialist', 12.50),
('Fajar Kurniawan', '08123456784', 'Junior Detailer', 10.00);

-- Insert Default Service Catalog
INSERT INTO service_catalog (name, category, base_price, estimated_duration_hours, description) VALUES
('Nano Ceramic Coating Platinum 9H (3 Layer)', 'coating', 3800000, 18.0, 'Perlindungan cat maksimal 3 lapis 9H Ceramic Coating, hydrophobic effect tahan 3 tahun.'),
('Paint Correction & Multi-Stage Swirl Removal', 'correction', 1750000, 8.0, 'Menghilangkan baret halus, swirl mark, oksidasi cat, dan mengembalikan kedalaman warna (deep wet look).'),
('Full Interior Deep Detailing & Ozone Sanitation', 'interior', 950000, 5.0, 'Pembersihan jok kulit/fabric, plafon, karpet dasar, dashboard dan sterilisasi bakteri dengan Ozone.'),
('Glass Polish & Rain Repellent Coating', 'glass', 650000, 3.0, 'Menghilangkan jamur kaca ekstrem dan memberikan lapisan efek daun talas tahan 6 bulan.'),
('Engine Bay Dressing & Deep Detailing', 'engine', 450000, 2.0, 'Pembersihan ruang mesin aman dari kerak oli dan conditioning selang kabel.'),
('Express Detailing + Hydro Sealant', 'coating', 550000, 2.5, 'Cuci premium, decontamination clay bar, dan semprot pelindung sintetis kilap instan.');
