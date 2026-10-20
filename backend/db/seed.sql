-- =========================================================
-- AASHRAY (आश्रय) SEED DATA FOR MYSQL
-- Default Admin: 9876543210 / admin123
-- Default Manager: 9876543211 / manager123
-- Default User: 9876543212 / user123
-- Password hashes created using bcryptjs (salt 10)
-- =========================================================

USE `aashray_db`;

-- Insert Default Users (Admin, Manager, User)
-- Admin Password: admin123 -> $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- Manager Password: manager123 -> $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- User Password: user123 -> $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

INSERT INTO `users` (`id`, `name`, `email`, `mobile`, `password`, `role`, `address`, `is_active`) VALUES
(1, 'मुख्य प्रशासक', 'admin@aashray.org', '9876543210', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'आश्रय धाम, वृंदावन रोड, मथुरा, उत्तर प्रदेश', 1),
(2, 'राजेश शर्मा (प्रबंधक)', 'rajesh@aashray.org', '9876543211', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager', 'वृंदावन, मथुरा', 1),
(3, 'अमित कुमार (दानदाता)', 'amit@gmail.com', '9876543212', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'सिविल लाइन्स, जयपुर', 1)
ON DUPLICATE KEY UPDATE `name`=`name`;

-- Home Information Initial Record
INSERT INTO `home_information` (`id`, `name`, `tagline`, `description`, `address`, `phone`, `email`, `facilities`, `hero_image`, `about_images`) VALUES
(1, 'आश्रय वृद्धाश्रम', 'वरिष्ठ नागरिकों का अपना स्नेहास्पद एवं सुरक्षित घर', 
'आश्रय वृद्धाश्रम श्री कृष्ण की पावन नगरी में असहाय, बेघर एवं वरिष्ठ नागरिकों की सेवा और देखभाल के लिए समर्पित एक गैर-लाभकारी संस्था है। यहाँ बुजुर्गों को सात्विक भोजन, नियमित स्वास्थ्य देखभाल, योगाभ्यास, भक्ति भजन और आत्मीय परिवार जैसा वातावरण प्रदान किया जाता है।',
'आश्रम पता, उरई, जिला जालौन (उत्तर प्रदेश)',
'7860437507',
'dakshrajs104@gmail.com',
'["24x7 स्वास्थ्य देखभाल एवं डॉक्टर परामर्श", "सात्विक एवं पौष्टिक भोजन", "हवादार एवं आरामदायक कमरे", "दैनिक योग, ध्यान एवं श्री कृष्ण संकीर्तन", "पुस्तकालय एवं मनोरंजन कक्ष", "हरिद्वार व वृंदावन दर्शन यात्राएँ"]',
'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=1200&q=80',
'["https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80"]')
ON DUPLICATE KEY UPDATE `name`=`name`;

-- Needs Initial Seed Data
INSERT INTO `needs` (`id`, `title`, `category`, `description`, `required_quantity`, `available_quantity`, `unit`, `photo_url`, `status`, `created_by`) VALUES
(1, 'सर्दियों के लिए गर्म कंबल एवं चादरें', 'कपड़े', 'आश्रम के 45 बुजुर्ग निवासियों के लिए सर्दियों हेतु ऊनी कंबल और कॉटन चादरों की आवश्यकता है।', 50, 15, 'नग', 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80', 'सक्रिय', 1),
(2, 'दैनिक मधुमेह एवं बीपी की दवाइयाँ', 'दवाइयाँ', 'बुजुर्गों के नियमित स्वास्थ्य परीक्षण और मासिक दवाओं के लिए सहायता।', 100, 40, 'पैकेट', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80', 'सक्रिय', 1),
(3, 'कमरों के लिए खड़े पंखे (Stand Fans)', 'पंखे', 'गर्मी के मौसम में बुजुर्गों के विश्राम कक्षों के लिए वाटर कूलिंग स्टैंड फैन्स।', 10, 4, 'नग', 'https://images.unsplash.com/photo-1618961734760-466979ce35b0?auto=format&fit=crop&w=600&q=80', 'सक्रिय', 2),
(4, 'सात्विक भोजन सामग्री (आटा, चावल, दाल)', ' भोजन', 'मासिक रसोई हेतु शुद्ध देश ी घी, बासमती चावल, अरहर दाल और गेहूं के आटे की रसद।', 200, 120, 'किलो', 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&w=600&q=80', 'सक्रिय', 1)
ON DUPLICATE KEY UPDATE `title`=`title`;

-- Events Initial Seed Data
INSERT INTO `events` (`id`, `title`, `event_date`, `description`, `image_url`, `is_published`, `created_by`) VALUES
(1, 'श्री कृष्ण जन्माष्टमी उत्सव एवं महाप्रसाद', '2026-08-25', 'आश्रय परिसर में बाबाओं और माताओं द्वारा कृष्ण भजन संध्या, झांकी एवं 56 भोग महाप्रसाद वितरण समारोह।', 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80', 1, 1),
(2, 'निःशुल्क नेत्र जांच एवं स्वास्थ्य शिविर', '2026-09-15', 'प्रसिद्ध नेत्र विशेषज्ञों द्वारा आश्रम के सभी बुजुर्गों की आँखों की जांच और निःशुल्क चश्मों का वितरण।', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80', 1, 1),
(3, 'दीपावली स्नेहमिलन एवं दीपदान उत्सव', '2026-11-01', 'आश्रम के प्रांगण में 1100 मिट्टी के दीयों से रोशनी और बुजुर्गों संग आनंदमयी दीवाली उत्सव।', 'https://images.unsplash.com/photo-1574269909862-7e4d705a4d08?auto=format&fit=crop&w=800&q=80', 1, 2)
ON DUPLICATE KEY UPDATE `title`=`title`;

-- Initial Meal Sponsorship Request
INSERT INTO `meal_requests` (`id`, `user_id`, `user_name`, `mobile`, `preferred_date`, `people_count`, `meal_type`, `message`, `status`, `admin_note`) VALUES
(1, 3, 'अमित कुमार (दानदाता)', '9876543212', '2026-10-15', 50, 'दोपहर का भोजन', 'मेरे पिताजी के जन्मदिन के पावन अवसर पर सभी बुजुर्गों को विशेष खीर-पूरी का भोजन।', 'लंबित', NULL)
ON DUPLICATE KEY UPDATE `user_name`=`user_name`;

-- Initial Volunteer Registration
INSERT INTO `volunteer_registrations` (`id`, `user_id`, `full_name`, `mobile`, `email`, `address`, `preferred_date`, `help_type`, `message`, `status`) VALUES
(1, 3, 'अमित कुमार', '9876543212', 'amit@gmail.com', 'जयपुर', '2026-10-15', 'भोजन वितरण', 'रविवार को बुजुर्गों को भोजन परोसने और उनके साथ संवाद करने का अवसर चाहिए।', 'स्वीकार किया गया')
ON DUPLICATE KEY UPDATE `full_name`=`full_name`;

-- Initial Assistance Request
INSERT INTO `assistance_requests` (`id`, `user_id`, `elderly_name`, `elderly_age`, `contact_number`, `address`, `assistance_type`, `description`, `status`) VALUES
(1, 3, 'रामलाल जी (उम्र 72)', 72, '9876500000', 'मथुरा स्टेशन के पास', 'भोजन', 'वृद्ध व्यक्ति बेघर हैं और उन्हें नियमित भोजन तथा आश्रय की तत्काल आवश्यकता है।', 'लंबित')
ON DUPLICATE KEY UPDATE `elderly_name`=`elderly_name`;

-- Notifications Seed
INSERT INTO `notifications` (`user_id`, `title`, `message`, `type`, `is_read`) VALUES
(3, 'पंजीकरण सफल', 'आश्रय पोर्टल पर आपका हार्दिक स्वागत है! राधे राधे।', 'general', 0),
(3, 'स्वयंसेवक आवेदन स्वीकृत', 'आपका भोजन वितरण स्वयंसेवक आवेदन स्वीकार कर लिया गया है।', 'volunteer', 0);
