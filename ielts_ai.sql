-- MySQL dump 10.13  Distrib 9.7.0, for macos15 (x86_64)
--
-- Host: localhost    Database: ielts_ai
-- ------------------------------------------------------
-- Server version	9.7.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '2196ca24-5e71-11f1-b2f8-d279e512aa1e:1-21';

--
-- Table structure for table `answers`
--

DROP TABLE IF EXISTS `answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `answers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question_id` int DEFAULT NULL,
  `answer_text` text,
  `score` float DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `answers`
--

LOCK TABLES `answers` WRITE;
/*!40000 ALTER TABLE `answers` DISABLE KEYS */;
/*!40000 ALTER TABLE `answers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_results`
--

DROP TABLE IF EXISTS `exam_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_results` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `reading` float DEFAULT NULL,
  `writing` float DEFAULT NULL,
  `listening` float DEFAULT NULL,
  `speaking` float DEFAULT NULL,
  `overall` float DEFAULT NULL,
  `feedback` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `difficulty` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_results`
--

LOCK TABLES `exam_results` WRITE;
/*!40000 ALTER TABLE `exam_results` DISABLE KEYS */;
INSERT INTO `exam_results` VALUES (1,5,9,6.5,9,7,7.5,'Strengths: Reading and Listening scores are excellent, indicating strong comprehension of main ideas, details, and inference. The candidate demonstrated accuracy in answering all questions. Weaknesses: Writing requires improvement in task response, coherence, and lexical resource. Speaking needs better fluency, grammatical accuracy, and vocabulary range. Practice structured writing frameworks and expand vocabulary for higher scores.','2026-06-08 13:35:39','easy'),(2,5,7.5,6.5,8,7,7,'Reading: Answers are mostly correct but lack detailed analysis. Listening: Answers are accurate with good comprehension. Writing: Task 1 is incomplete (no content provided), Task 2 lacks depth and examples. Speaking: Prompts are addressed but responses are brief and lack elaboration. Overall, strong listening skills but weaknesses in writing and speaking.','2026-06-08 13:39:10','easy'),(3,5,6.5,5,7,5,5.9,'Strengths: Listening section answers are accurate and well-structured. Reading answers are correct but lack punctuation. Weaknesses: Writing tasks were not attempted (only \'Yes\' responses), and speaking answers were entirely missing content. These sections require significant improvement in task completion and language use.','2026-06-09 07:25:16','easy'),(4,5,3,3,3,3,3,'All answers are completely incorrect and lack any meaningful content. The responses are nonsensical strings of random characters that do not address the questions. For Reading, no attempt was made to identify benefits from the passages. Writing tasks were not completed, with no coherent structure or content. Listening answers failed to extract key information from the transcripts. Speaking responses were minimal and irrelevant, showing no understanding of the prompts. Significant improvement is needed in all areas, including task comprehension, content development, and language use.','2026-06-09 08:48:42','easy'),(5,5,6,4,7,5,5.5,'Strengths: Listening section answers were fully correct, demonstrating good comprehension. Reading section had 4/6 correct answers, showing reasonable understanding. Weaknesses: Writing tasks were incomplete and lacked content, with no attempt to summarize data or discuss advantages/disadvantages. Speaking responses were overly brief, vague, and lacked detail or examples. Grammar and vocabulary were limited, and answers did not meet task requirements.','2026-06-09 10:39:52','easy'),(6,5,3,3,4,3.5,3.25,'Reading: Answers are completely off-topic and fail to address the questions. No relevant content or understanding of the passage. Writing: Tasks are not attempted; responses are non-responsive and lack coherence. Listening: Partially correct answers with some accurate information but vague or incomplete responses. Speaking: Very brief answers with minimal detail, lack of elaboration, and insufficient vocabulary. Overall, all sections demonstrate severe limitations in task completion, coherence, and language use.','2026-06-09 10:56:28','easy'),(7,5,9,4,5.5,4,5.5,'Strengths: Reading section answers are fully correct, demonstrating strong comprehension and accuracy. Weaknesses: Writing tasks are incomplete and lack structure, scoring very low. Listening section has one incorrect answer (misinterpreting \'not given\' as \'true\'), and Speaking responses are entirely missing, showing significant gaps in fluency and coherence.','2026-06-09 11:13:37','easy');
/*!40000 ALTER TABLE `exam_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exams`
--

DROP TABLE IF EXISTS `exams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `difficulty` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exams`
--

LOCK TABLES `exams` WRITE;
/*!40000 ALTER TABLE `exams` DISABLE KEYS */;
/*!40000 ALTER TABLE `exams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exam_id` int DEFAULT NULL,
  `skill` varchar(20) DEFAULT NULL,
  `question_text` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Daniel','daniel@test.com','123456'),(2,'Dan','dan@test.com','mypassword'),(3,'Test User','test2@test.com','hello123'),(4,'TestUser','test3@test.com','$2b$10$7G7LeSnJbbCqLXQPdCa/Ru1kfW49BgUHkZqdtFflKOyhO8ZUFOGUq'),(5,'Hello','danielaung215@gmail.com','$2b$10$Kn2Pd2N0zM6yRpsk4li0MeGZb2NCgvIis1EL4geJqgijXvN1/xEEq');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-09 18:19:17
