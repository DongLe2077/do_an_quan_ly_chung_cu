-- =====================================================
-- Migration: Rename Vietnamese tables & columns to English
-- Strategy: Option A - Keep Vietnamese enum VALUES intact
-- Date: 2026-05-06
-- =====================================================
-- WARNING: Run this on a BACKUP of your database first!
-- =====================================================

-- Disable FK checks during migration
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 1. RENAME TABLES
-- =====================================================
-- RENAME TABLE nguoidung TO users;
-- RENAME TABLE toanha TO buildings;
-- RENAME TABLE phong TO apartments;
-- RENAME TABLE cudan TO residents;
-- RENAME TABLE danhsachdichvu TO services;
-- RENAME TABLE chisodichvu TO service_readings;
-- RENAME TABLE hoadon TO invoices;
-- RENAME TABLE suco TO incidents;

-- =====================================================
-- 2. RENAME COLUMNS - users (nguoidung)
-- =====================================================
ALTER TABLE users
  RENAME COLUMN MaNguoiDung TO user_id,
  RENAME COLUMN TenDangNhap TO username,
  RENAME COLUMN MatKhau TO password,
  RENAME COLUMN VaiTro TO role,
  RENAME COLUMN TrangThai TO status,
  RENAME COLUMN Email TO email;

-- =====================================================
-- 3. RENAME COLUMNS - buildings (toanha)
-- =====================================================
ALTER TABLE buildings
  RENAME COLUMN MaToaNha TO building_id,
  RENAME COLUMN TenToaNha TO building_name,
  RENAME COLUMN SoLuongPhong TO max_apartments;

-- =====================================================
-- 4. RENAME COLUMNS - apartments (phong)
-- =====================================================
ALTER TABLE apartments
  RENAME COLUMN MaPhong TO apartment_id,
  RENAME COLUMN SoPhong TO apartment_number,
  RENAME COLUMN MaToaNha TO building_id,
  RENAME COLUMN TrangThai TO status,
  RENAME COLUMN DienTich TO area;

-- =====================================================
-- 5. RENAME COLUMNS - residents (cudan)
-- =====================================================
ALTER TABLE residents
  RENAME COLUMN MaCuDan TO resident_id,
  RENAME COLUMN HoTen TO full_name,
  RENAME COLUMN SoDienThoai TO phone,
  RENAME COLUMN CCCD TO id_card,
  RENAME COLUMN QueQuan TO hometown,
  RENAME COLUMN MaPhong TO apartment_id,
  RENAME COLUMN MaNguoiDung TO user_id;

-- =====================================================
-- 6. RENAME COLUMNS - services (danhsachdichvu)
-- =====================================================
ALTER TABLE services
  RENAME COLUMN MaDichVu TO service_id,
  RENAME COLUMN TenDichVu TO service_name,
  RENAME COLUMN DonGia TO unit_price,
  RENAME COLUMN DonViTinh TO unit,
  RENAME COLUMN LoaiDichVu TO service_type;

-- =====================================================
-- 7. RENAME COLUMNS - service_readings (chisodichvu)
-- =====================================================
ALTER TABLE service_readings
  RENAME COLUMN MaGhi TO reading_id,
  RENAME COLUMN MaDichVu TO service_id,
  RENAME COLUMN MaHoaDon TO invoice_id,
  RENAME COLUMN ChiSoLanGhiTruoc TO previous_reading,
  RENAME COLUMN ChiSoHienTai TO current_reading,
  RENAME COLUMN SoLuong TO quantity,
  RENAME COLUMN NgayGhi TO reading_date;

-- =====================================================
-- 8. RENAME COLUMNS - invoices (hoadon)
-- =====================================================
ALTER TABLE invoices
  RENAME COLUMN MaHoaDon TO invoice_id,
  RENAME COLUMN MaPhong TO apartment_id,
  RENAME COLUMN ThangThu TO billing_month,
  RENAME COLUMN TongTien TO total_amount,
  RENAME COLUMN TrangThai TO status,
  RENAME COLUMN NgayTao TO created_at,
  RENAME COLUMN HanDongTien TO due_date;

-- =====================================================
-- 9. RENAME COLUMNS - incidents (suco)
-- =====================================================
ALTER TABLE incidents
  RENAME COLUMN MaSuCo TO incident_id,
  RENAME COLUMN MaNguoiBao TO reporter_id,
  RENAME COLUMN MaPhong TO apartment_id,
  RENAME COLUMN TenSuCo TO title,
  RENAME COLUMN MoTa TO description,
  RENAME COLUMN AnhSuCo TO images,
  RENAME COLUMN NgayBaoCao TO report_date,
  RENAME COLUMN TrangThai TO status,
  RENAME COLUMN NguoiXuLy TO handler,
  RENAME COLUMN NgayXuLy TO resolved_date;

-- =====================================================
-- Re-enable FK checks
-- =====================================================
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- DONE! Verify with: SHOW TABLES; DESC users; etc.
-- =====================================================
