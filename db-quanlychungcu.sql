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
-- Table structure for table `apartments`
--

DROP TABLE IF EXISTS `apartments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `apartments` (
  `apartment_id` varchar(50) NOT NULL,
  `apartment_number` varchar(50) NOT NULL,
  `building_id` varchar(50) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Trống',
  `area` float DEFAULT NULL,
  PRIMARY KEY (`apartment_id`),
  KEY `fk_phong_toanha` (`building_id`),
  CONSTRAINT `fk_phong_toanha` FOREIGN KEY (`building_id`) REFERENCES `buildings` (`building_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `apartments`
--

LOCK TABLES `apartments` WRITE;
/*!40000 ALTER TABLE `apartments` DISABLE KEYS */;
INSERT INTO `apartments` VALUES ('P04147369QZUG','101B','TN129162XMX','Trống',100),('P581983431VM3','102','TN9672292WR','Đã Sử Dụng',50),('P812161394JKN','104','TN9672292WR','Chưa Sử Dụng',80),('P82215836FRZT','105','TN9672292WR','Đang sử dụng',100);
/*!40000 ALTER TABLE `apartments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `buildings`
--

DROP TABLE IF EXISTS `buildings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `buildings` (
  `building_id` varchar(50) NOT NULL,
  `building_name` varchar(255) NOT NULL,
  `max_apartments` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`building_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `buildings`
--

LOCK TABLES `buildings` WRITE;
/*!40000 ALTER TABLE `buildings` DISABLE KEYS */;
INSERT INTO `buildings` VALUES ('TN129162XMX','Toà B',30),('TN9672292WR','Toà A - Cao Cấp',50);
/*!40000 ALTER TABLE `buildings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incidents`
--

DROP TABLE IF EXISTS `incidents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incidents` (
  `incident_id` varchar(50) NOT NULL,
  `reporter_id` varchar(50) DEFAULT NULL,
  `apartment_id` varchar(50) DEFAULT NULL,
  `handler` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `images` varchar(500) DEFAULT NULL,
  `report_date` date DEFAULT NULL,
  `resolved_date` date DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Chờ duyệt',
  PRIMARY KEY (`incident_id`),
  KEY `fk_suco_nguoibao` (`reporter_id`),
  KEY `fk_suco_phong` (`apartment_id`),
  CONSTRAINT `fk_suco_nguoibao` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_suco_phong` FOREIGN KEY (`apartment_id`) REFERENCES `apartments` (`apartment_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incidents`
--

LOCK TABLES `incidents` WRITE;
/*!40000 ALTER TABLE `incidents` DISABLE KEYS */;
INSERT INTO `incidents` VALUES ('SC02453563EK7D','CD1777014194596','P82215836FRZT',NULL,'Ống nước bị hỏng','Ống nước bị thủng khiến nước chảy lênh láng khắp sàn','/uploads/1777102452102-370811331.jpg','2026-04-25','2026-04-25','Đang xử lý'),('SC0731615123KM','CD1774858108089','P04147369QZUG',NULL,'Bóng đèn bị hỏng','Bóng đèn hành lang bị hỏng',NULL,'2026-04-03','2026-04-10','Đã xử lý'),('SC23629056HS5I','CD1774858108089','P581983431VM3',NULL,'Bóng Đèn','Bóng Đèn Bị Hư',NULL,'2026-04-24',NULL,'Chờ duyệt'),('SC23685118SMJ6','CD1774858108089','P581983431VM3',NULL,'Nhà vệ sinh rò rỉ nước','Nhà vệ sinh rò rỉ nước',NULL,'2026-04-24',NULL,'Chờ duyệt'),('SC99552932S52N','CD1774858108089','P581983431VM3',NULL,'Ống nước bị vỡ','Ống nước tầng 3 bị vỡ, nước chảy ra hành lang',NULL,'2026-03-27','2026-05-06','Đã xử lý');
/*!40000 ALTER TABLE `incidents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `invoice_id` varchar(50) NOT NULL,
  `apartment_id` varchar(50) DEFAULT NULL,
  `billing_month` varchar(20) DEFAULT NULL,
  `total_amount` double NOT NULL DEFAULT '0',
  `status` varchar(50) NOT NULL DEFAULT 'Chưa thanh toán',
  `created_at` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  PRIMARY KEY (`invoice_id`),
  KEY `fk_hoadon_phong` (`apartment_id`),
  CONSTRAINT `fk_hoadon_phong` FOREIGN KEY (`apartment_id`) REFERENCES `apartments` (`apartment_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES ('HD03360566MOAB','P581983431VM3','04/2026',1342500,'Chưa thanh toán','2026-04-25','2026-05-15'),('HD04054494FFUX','P581983431VM3','03/2026',60000,'Đã thanh toán','2026-04-03','2026-04-15'),('HD154012165ZNP','P82215836FRZT','04/2026',680000,'Đã thanh toán','2026-04-24','2026-05-16'),('HD83099659LH49','P04147369QZUG','2026-03',500000,'Đã thanh toán','2026-04-13','2026-04-26');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `residents`
--

DROP TABLE IF EXISTS `residents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `residents` (
  `resident_id` varchar(50) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `id_card` varchar(20) DEFAULT NULL,
  `hometown` varchar(500) DEFAULT NULL,
  `apartment_id` varchar(50) DEFAULT NULL,
  `user_id` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`resident_id`),
  KEY `fk_cudan_nguoidung` (`user_id`),
  KEY `fk_cudan_phong` (`apartment_id`),
  CONSTRAINT `fk_cudan_nguoidung` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_cudan_phong` FOREIGN KEY (`apartment_id`) REFERENCES `apartments` (`apartment_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `residents`
--

LOCK TABLES `residents` WRITE;
/*!40000 ALTER TABLE `residents` DISABLE KEYS */;
INSERT INTO `residents` VALUES ('CD07477093E2QR','Trần Văn Vũ','0986123213','045612934','Huế','P04147369QZUG','CD1775207447021'),('CD11439090K045','Nguyễn Bá C','0986123213','0459109481','Huế','P04147369QZUG','CD1775811419276'),('CD14241182SOT4','Tuấn Mai','01235665213','04583992357','Huế','P82215836FRZT','CD1777014194596'),('CD58634014QO72','Nguyễn Thị Thảo ','090132518812','079323456789','TP.HCM','P581983431VM3','CD1774858108089');
/*!40000 ALTER TABLE `residents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_readings`
--

DROP TABLE IF EXISTS `service_readings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_readings` (
  `reading_id` varchar(50) NOT NULL,
  `service_id` varchar(50) DEFAULT NULL,
  `invoice_id` varchar(50) DEFAULT NULL,
  `previous_reading` double DEFAULT NULL,
  `current_reading` double DEFAULT NULL,
  `quantity` double DEFAULT NULL,
  `reading_date` date DEFAULT NULL,
  PRIMARY KEY (`reading_id`),
  KEY `fk_chiso_dichvu` (`service_id`),
  KEY `fk_chiso_hoadon` (`invoice_id`),
  CONSTRAINT `fk_chiso_dichvu` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_chiso_hoadon` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`invoice_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_readings`
--

LOCK TABLES `service_readings` WRITE;
/*!40000 ALTER TABLE `service_readings` DISABLE KEYS */;
INSERT INTO `service_readings` VALUES ('CS03396544PAFA','DV97085163N1Q7','HD03360566MOAB',170,260,90,'2026-04-29'),('CS03427938SO8K','DV97099469OPVC','HD03360566MOAB',110,185,75,'2026-04-29'),('CS034489109YGL','DV15517944BG9J','HD03360566MOAB',NULL,NULL,1,'2026-04-29'),('CS03468677MZ4R','DV97132815XTVC','HD03360566MOAB',NULL,NULL,4,'2026-04-29'),('CS03483904JCGE','DV97169160RKCJ','HD03360566MOAB',NULL,NULL,1,'2026-04-29'),('CS04333440DEY7','DV97099469OPVC',NULL,100,125,NULL,'2026-04-02'),('CS15441627XGCS','DV97085163N1Q7','HD154012165ZNP',210,280,70,'2026-04-29'),('CS154604294YU4','DV97099469OPVC','HD154012165ZNP',170,220,50,'2026-04-29'),('CS154779750XFN','DV97132815XTVC','HD154012165ZNP',NULL,NULL,4,'2026-04-28'),('CS154887272R0F','DV97169160RKCJ','HD154012165ZNP',NULL,NULL,1,'2026-04-29'),('CS155381728SKO','DV15517944BG9J','HD154012165ZNP',NULL,NULL,1,'2026-04-29'),('CS814317287A2W','DV97169160RKCJ',NULL,NULL,NULL,NULL,'2026-04-03'),('CS825501419PON','DV97085163N1Q7',NULL,1200,1354,154,'2026-04-03'),('CS82588385FP0P','DV97099469OPVC',NULL,240,280,40,'2026-04-03'),('CS82615235UN6I','DV97132815XTVC',NULL,NULL,NULL,3,'2026-04-03'),('CS826397069KOR','DV97169160RKCJ',NULL,NULL,NULL,1,'2026-04-03'),('CS8313430013F5','DV97169160RKCJ','HD83099659LH49',NULL,NULL,1,'2026-04-03'),('CS835273941HR4','DV97085163N1Q7','HD83099659LH49',800,880,80,'2026-04-03'),('CS83554438XTAK','DV97099469OPVC','HD83099659LH49',430,470,40,'2026-04-03'),('CS83593914BK3N','DV97169160RKCJ','HD83099659LH49',NULL,NULL,1,'2026-04-03'),('CS99008163A91C','DV97085163N1Q7',NULL,100,250,NULL,'2026-04-03'),('CS99134944PWDU','DV97132815XTVC',NULL,NULL,NULL,2,'2026-04-03'),('CS99252318JFZJ','DV97169160RKCJ',NULL,NULL,NULL,NULL,'2026-03-31');
/*!40000 ALTER TABLE `service_readings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `service_id` varchar(50) NOT NULL,
  `service_name` varchar(255) NOT NULL,
  `unit_price` double NOT NULL DEFAULT '0',
  `unit` varchar(50) DEFAULT NULL,
  `service_type` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES ('DV05661501KPDU','Gửi Xe OTo',120000,'chiếc/tháng',2),('DV15517944BG9J','Phí Rác',50000,'tháng',2),('DV97085163N1Q7','Tiền điện',3500,'kWh',1),('DV97099469OPVC','Tiền nước',8500,'m3',1),('DV97132815XTVC','Gửi Xe Máy',70000,'chiếc/tháng',2),('DV97169160RKCJ','Phí quản lý',60000,'tháng',2);
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` varchar(50) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user','cudan','kythuat') NOT NULL DEFAULT 'cudan',
  `status` varchar(50) NOT NULL DEFAULT 'Hoạt động',
  `email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('AD1774688384651','admin1','$2b$10$4TUxs3Iq48Cqo5i2TiK0SedOCX3s0HQ3Wsa9eOoG5edaFYFKBBFBK','admin','Hoạt động','admin01@chungcu.vn'),('AD1775806265250','admin2','$2b$10$TKmLSE20SdORnGtV715W3OujlcleUTh4PlMaBvFpPukuQpXi24fwK','admin','Hoạt động','admin2@gmail.com'),('CD1774858108089','cudan1','$2b$10$mfBMGEETSFEMC.2i1WSixuGZS2DmXnhf6Y0/q/tdAPDHDstS8Jkee','cudan','Hoạt động','cucan1@chungcu.vn'),('CD1775207447021','vu01','$2b$10$U5L7V9P0ATcTZ9hxtUxjz.HvLXlxQA0Jw5W1y2yrOb5Hm/bX2iAn2','cudan','Hoạt động','vu01@gmail.com'),('CD1775811419276','cudan2','$2b$10$n.EJlvfpUhUvJ1aqEdlFrebufSbv2iCrFHAIXSbkPjp82MKLfFqRq','cudan','Hoạt động','cudan2@gmail.com'),('CD1777014194596','tuan1','$2b$10$Ve8sYbSU6Qil7kiXSQ8V/ufXqgh0wdQiF55xmuxzpDnQrF9ctCMw6','cudan','Hoạt động','tuan1@gmail.com');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-06  9:26:11
