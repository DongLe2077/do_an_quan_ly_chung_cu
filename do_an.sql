-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: quanlychungcu
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `chisodichvu`
--

DROP TABLE IF EXISTS `chisodichvu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chisodichvu` (
  `MaGhi` varchar(50) NOT NULL,
  `MaDichVu` varchar(50) DEFAULT NULL,
  `MaHoaDon` varchar(50) DEFAULT NULL,
  `ChiSoLanGhiTruoc` double DEFAULT NULL,
  `ChiSoHienTai` double DEFAULT NULL,
  `SoLuong` double DEFAULT NULL,
  `NgayGhi` date DEFAULT NULL,
  PRIMARY KEY (`MaGhi`),
  KEY `fk_chiso_dichvu` (`MaDichVu`),
  KEY `fk_chiso_hoadon` (`MaHoaDon`),
  CONSTRAINT `fk_chiso_dichvu` FOREIGN KEY (`MaDichVu`) REFERENCES `danhsachdichvu` (`MaDichVu`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_chiso_hoadon` FOREIGN KEY (`MaHoaDon`) REFERENCES `hoadon` (`MaHoaDon`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chisodichvu`
--

LOCK TABLES `chisodichvu` WRITE;
/*!40000 ALTER TABLE `chisodichvu` DISABLE KEYS */;
INSERT INTO `chisodichvu` VALUES ('CS04333440DEY7','DV97099469OPVC',NULL,100,125,NULL,'2026-04-02'),('CS15441627XGCS','DV97085163N1Q7','HD154012165ZNP',210,280,70,'2026-04-29'),('CS154604294YU4','DV97099469OPVC','HD154012165ZNP',170,220,50,'2026-04-29'),('CS154779750XFN','DV97132815XTVC','HD154012165ZNP',NULL,NULL,4,'2026-04-28'),('CS154887272R0F','DV97169160RKCJ','HD154012165ZNP',NULL,NULL,1,'2026-04-29'),('CS155381728SKO','DV15517944BG9J','HD154012165ZNP',NULL,NULL,1,'2026-04-29'),('CS814317287A2W','DV97169160RKCJ',NULL,NULL,NULL,NULL,'2026-04-03'),('CS825501419PON','DV97085163N1Q7',NULL,1200,1354,154,'2026-04-03'),('CS82588385FP0P','DV97099469OPVC',NULL,240,280,40,'2026-04-03'),('CS82615235UN6I','DV97132815XTVC',NULL,NULL,NULL,3,'2026-04-03'),('CS826397069KOR','DV97169160RKCJ',NULL,NULL,NULL,1,'2026-04-03'),('CS8313430013F5','DV97169160RKCJ','HD83099659LH49',NULL,NULL,1,'2026-04-03'),('CS835273941HR4','DV97085163N1Q7','HD83099659LH49',800,880,80,'2026-04-03'),('CS83554438XTAK','DV97099469OPVC','HD83099659LH49',430,470,40,'2026-04-03'),('CS83593914BK3N','DV97169160RKCJ','HD83099659LH49',NULL,NULL,1,'2026-04-03'),('CS99008163A91C','DV97085163N1Q7',NULL,100,250,NULL,'2026-04-03'),('CS99134944PWDU','DV97132815XTVC',NULL,NULL,NULL,2,'2026-04-03'),('CS99252318JFZJ','DV97169160RKCJ',NULL,NULL,NULL,NULL,'2026-03-31');
/*!40000 ALTER TABLE `chisodichvu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cudan`
--

DROP TABLE IF EXISTS `cudan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cudan` (
  `MaCuDan` varchar(50) NOT NULL,
  `HoTen` varchar(255) NOT NULL,
  `SoDienThoai` varchar(20) DEFAULT NULL,
  `CCCD` varchar(20) DEFAULT NULL,
  `QueQuan` varchar(500) DEFAULT NULL,
  `MaPhong` varchar(50) DEFAULT NULL,
  `MaNguoiDung` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`MaCuDan`),
  KEY `fk_cudan_nguoidung` (`MaNguoiDung`),
  KEY `fk_cudan_phong` (`MaPhong`),
  CONSTRAINT `fk_cudan_nguoidung` FOREIGN KEY (`MaNguoiDung`) REFERENCES `nguoidung` (`MaNguoiDung`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_cudan_phong` FOREIGN KEY (`MaPhong`) REFERENCES `phong` (`MaPhong`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cudan`
--

LOCK TABLES `cudan` WRITE;
/*!40000 ALTER TABLE `cudan` DISABLE KEYS */;
INSERT INTO `cudan` VALUES ('CD07477093E2QR','Trần Văn Vũ','0986123213','045612934','Huế','P04147369QZUG','ND1775207447021'),('CD11439090K045','Nguyễn Bá C','0986123213','0459109481','Huế','P04147369QZUG','ND1775811419276'),('CD14241182SOT4','Tuấn Mai','01235665213','04583992357','Huế','P82215836FRZT','ND1777014194596'),('CD58634014QO72','Nguyễn Thị Thảo ','090132518812','079323456789','TP.HCM','P581983431VM3','ND1774858108089');
/*!40000 ALTER TABLE `cudan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `danhsachdichvu`
--

DROP TABLE IF EXISTS `danhsachdichvu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `danhsachdichvu` (
  `MaDichVu` varchar(50) NOT NULL,
  `TenDichVu` varchar(255) NOT NULL,
  `DonGia` double NOT NULL DEFAULT '0',
  `DonViTinh` varchar(50) DEFAULT NULL,
  `LoaiDichVu` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`MaDichVu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `danhsachdichvu`
--

LOCK TABLES `danhsachdichvu` WRITE;
/*!40000 ALTER TABLE `danhsachdichvu` DISABLE KEYS */;
INSERT INTO `danhsachdichvu` VALUES ('DV15517944BG9J','Phí Rác',50000,'tháng',2),('DV97085163N1Q7','Tiền điện',3500,'kWh',1),('DV97099469OPVC','Tiền nước',2500,'m3',1),('DV97132815XTVC','Gửi xe',50000,'chiếc/tháng',2),('DV97169160RKCJ','Phí quản lý',60000,'tháng',2);
/*!40000 ALTER TABLE `danhsachdichvu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hoadon`
--

DROP TABLE IF EXISTS `hoadon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hoadon` (
  `MaHoaDon` varchar(50) NOT NULL,
  `MaPhong` varchar(50) DEFAULT NULL,
  `ThangThu` varchar(20) DEFAULT NULL,
  `TongTien` double NOT NULL DEFAULT '0',
  `TrangThai` varchar(50) NOT NULL DEFAULT 'Chưa thanh toán',
  `NgayTao` date DEFAULT NULL,
  `HanDongTien` date DEFAULT NULL,
  PRIMARY KEY (`MaHoaDon`),
  KEY `fk_hoadon_phong` (`MaPhong`),
  CONSTRAINT `fk_hoadon_phong` FOREIGN KEY (`MaPhong`) REFERENCES `phong` (`MaPhong`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hoadon`
--

LOCK TABLES `hoadon` WRITE;
/*!40000 ALTER TABLE `hoadon` DISABLE KEYS */;
INSERT INTO `hoadon` VALUES ('HD04054494FFUX','P581983431VM3','03/2026',60000,'Đã thanh toán','2026-04-03','2026-04-15'),('HD154012165ZNP','P82215836FRZT','04/2026',680000,'Chờ xác nhận','2026-04-24','2026-05-16'),('HD83099659LH49','P04147369QZUG','2026-03',500000,'Đã thanh toán','2026-04-13','2026-04-26');
/*!40000 ALTER TABLE `hoadon` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nguoidung`
--

DROP TABLE IF EXISTS `nguoidung`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nguoidung` (
  `MaNguoiDung` varchar(50) NOT NULL,
  `TenDangNhap` varchar(100) NOT NULL,
  `MatKhau` varchar(255) NOT NULL,
  `VaiTro` enum('admin','user','cudan','kythuat') NOT NULL DEFAULT 'cudan',
  `TrangThai` varchar(50) NOT NULL DEFAULT 'Hoạt động',
  `Email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`MaNguoiDung`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nguoidung`
--

LOCK TABLES `nguoidung` WRITE;
/*!40000 ALTER TABLE `nguoidung` DISABLE KEYS */;
INSERT INTO `nguoidung` VALUES ('ND1774688384651','admin1','$2b$10$4TUxs3Iq48Cqo5i2TiK0SedOCX3s0HQ3Wsa9eOoG5edaFYFKBBFBK','admin','Hoạt động','admin01@chungcu.vn'),('ND1774858108089','cudan1','$2b$10$mfBMGEETSFEMC.2i1WSixuGZS2DmXnhf6Y0/q/tdAPDHDstS8Jkee','cudan','Hoạt động','cucan1@chungcu.vn'),('ND1775207447021','vu01','$2b$10$U5L7V9P0ATcTZ9hxtUxjz.HvLXlxQA0Jw5W1y2yrOb5Hm/bX2iAn2','cudan','Hoạt động','vu01@gmail.com'),('ND1775806265250','admin2','$2b$10$TKmLSE20SdORnGtV715W3OujlcleUTh4PlMaBvFpPukuQpXi24fwK','admin','Hoạt động','admin2@gmail.com'),('ND1775811419276','cudan2','$2b$10$n.EJlvfpUhUvJ1aqEdlFrebufSbv2iCrFHAIXSbkPjp82MKLfFqRq','cudan','Hoạt động','cudan2@gmail.com'),('ND1777014194596','tuan1','$2b$10$Ve8sYbSU6Qil7kiXSQ8V/ufXqgh0wdQiF55xmuxzpDnQrF9ctCMw6','cudan','Hoạt động','tuan1@gmail.com');
/*!40000 ALTER TABLE `nguoidung` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phong`
--

DROP TABLE IF EXISTS `phong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phong` (
  `MaPhong` varchar(50) NOT NULL,
  `SoPhong` varchar(50) NOT NULL,
  `MaToaNha` varchar(50) DEFAULT NULL,
  `TrangThai` varchar(50) NOT NULL DEFAULT 'Trống',
  `DienTich` float DEFAULT NULL,
  PRIMARY KEY (`MaPhong`),
  KEY `fk_phong_toanha` (`MaToaNha`),
  CONSTRAINT `fk_phong_toanha` FOREIGN KEY (`MaToaNha`) REFERENCES `toanha` (`MaToaNha`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phong`
--

LOCK TABLES `phong` WRITE;
/*!40000 ALTER TABLE `phong` DISABLE KEYS */;
INSERT INTO `phong` VALUES ('P04147369QZUG','101B','TN129162XMX','Trống',100),('P581983431VM3','102','TN9672292WR','Đã Sử Dụng',50),('P812161394JKN','104','TN9672292WR','Chưa Sử Dụng',80),('P82215836FRZT','105','TN9672292WR','Đang sử dụng',100);
/*!40000 ALTER TABLE `phong` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suco`
--

DROP TABLE IF EXISTS `suco`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suco` (
  `MaSuCo` varchar(50) NOT NULL,
  `MaNguoiBao` varchar(50) DEFAULT NULL,
  `MaPhong` varchar(50) DEFAULT NULL,
  `NguoiXuLy` varchar(255) DEFAULT NULL,
  `TenSuCo` varchar(255) DEFAULT NULL,
  `MoTa` text,
  `AnhSuCo` varchar(500) DEFAULT NULL,
  `NgayBaoCao` date DEFAULT NULL,
  `NgayXuLy` date DEFAULT NULL,
  `TrangThai` varchar(50) NOT NULL DEFAULT 'Chờ duyệt',
  PRIMARY KEY (`MaSuCo`),
  KEY `fk_suco_nguoibao` (`MaNguoiBao`),
  KEY `fk_suco_phong` (`MaPhong`),
  CONSTRAINT `fk_suco_nguoibao` FOREIGN KEY (`MaNguoiBao`) REFERENCES `nguoidung` (`MaNguoiDung`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_suco_phong` FOREIGN KEY (`MaPhong`) REFERENCES `phong` (`MaPhong`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suco`
--

LOCK TABLES `suco` WRITE;
/*!40000 ALTER TABLE `suco` DISABLE KEYS */;
INSERT INTO `suco` VALUES ('SC0731615123KM','ND1774858108089','P04147369QZUG',NULL,'Bóng đèn bị hỏng','Bóng đèn hành lang bị hỏng',NULL,'2026-04-03','2026-04-10','Đã xử lý'),('SC11505838401M','ND1775811419276',NULL,NULL,'Đèn Hành Lang Chớp Nháy','Đèn Hành Lang Chớp Nháy',NULL,'2026-04-10','2026-04-24','Đang xử lý'),('SC23629056HS5I','ND1774858108089','P581983431VM3',NULL,'Bóng Đèn','Bóng Đèn Bị Hư',NULL,'2026-04-24',NULL,'Chờ duyệt'),('SC23685118SMJ6','ND1774858108089','P581983431VM3',NULL,'Nhà vệ sinh rò rỉ nước','Nhà vệ sinh rò rỉ nước',NULL,'2026-04-24',NULL,'Chờ duyệt'),('SC99552932S52N','ND1774858108089','P581983431VM3','Kỹ thuật viên Trần Văn B','Ống nước bị vỡ','Ống nước tầng 3 bị vỡ, nước chảy ra hành lang',NULL,'2026-03-27','2026-04-03','Đang xử lý');
/*!40000 ALTER TABLE `suco` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `toanha`
--

DROP TABLE IF EXISTS `toanha`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `toanha` (
  `MaToaNha` varchar(50) NOT NULL,
  `TenToaNha` varchar(255) NOT NULL,
  `SoLuongPhong` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`MaToaNha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `toanha`
--

LOCK TABLES `toanha` WRITE;
/*!40000 ALTER TABLE `toanha` DISABLE KEYS */;
INSERT INTO `toanha` VALUES ('TN129162XMX','Toà B',30),('TN9672292WR','Toà A - Cao Cấp',50);
/*!40000 ALTER TABLE `toanha` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-25 13:24:24
