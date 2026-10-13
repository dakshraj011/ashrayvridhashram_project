# 🛕 आश्रय (AASHRAY) - वृद्धाश्रम वेबसाइट 

**आश्रय (AASHRAY)** वरिष्ठ नागरिकों एवं असहाय बुजुर्गों की सेवा, सम्मान और सम्भाल हेतु बनाया गया एक पूर्णतः क्रियात्मक, उत्तरदायी (Responsive), एवं सुरक्षात्मक Full-Stack वेब पोर्टल है।

यह वेबसाइट **भगवान श्री कृष्ण** से प्रेरित पारंपरिक भारतीय थीम (केसरिया नारंगी `#E87924`, मैरून `#852D36`, सुनहरा स्वर्ण `#D9AA55`, और मलाईदार क्रीम `#FFF6E9`) में निर्मित है। संपूर्ण यूजर इंटरफेस एवं संदेश **सरल एवं स्पष्ट हिंदी (देवनागरी)** भाषा में हैं।

---

## 🌟 प्रमुख विशेषताएँ (Key Features)

1. **100% हिंदी (देवनागरी) इंटरफेस**:
   - बुजुर्गों और आम जनता के लिए अत्यंत सरल, पठनीय एवं बड़े फॉन्ट आकार वाला डिजाइन।
   - शीर्षक, बटन, फॉर्म, डैशबोर्ड, सूचनाएँ, एवं त्रुटि संदेश पूरी तरह हिंदी में हैं।

2. **रोल आधारित प्रमाणीकरण एवं सुरक्षा (Role-Based Access Control)**:
   - **सामान्य उपयोगकर्ता (User)**: आवश्यकताएँ देखना, भोजन प्रायोजन, स्वयंसेवक पंजीकरण, बुजुर्ग सहायता अनुरोध दर्ज करना एवं अपने अनुरोधों की स्थिति का ट्रैक रखना।
   - **वृद्धाश्रम प्रबंधक (Manager)**: आवश्यकताओं की पूर्ति सम्पादित करना, उपलब्ध मात्रा अपडेट करना, भोजन एवं स्वयंसेवक अनुरोधों को स्वीकार/अस्वीकार करना।
   - **मुख्य व्यवस्थापक (Admin)**: संपूर्ण सिस्टम नियंत्रण, उपयोगकर्ता/प्रबंधक प्रबंधन, सार्वजनिक घोषणाएँ, कार्यक्रम सम्पादन, संपर्क संदेश एवं CSV रिपोर्ट एक्सपोर्ट।

3. **वास्तविक डेटाबेस एकीकरण (MySQL / SQLite Dual Driver)**:
   - पूर्ण रिलेशनलschema जिसमें `users`, `home_information`, `needs`, `meal_requests`, `volunteer_registrations`, `assistance_requests`, `events`, `gallery_images`, `contact_submissions`, `notifications`, एवं `request_status_history` शामिल हैं।
   - स्थानीय स्तर पर MySQL न होने पर सर्वर बिना किसी त्रुटि के स्वतः Embedded SQLite में प्रारम्भ हो जाता है ताकि बिना सेटअप के 1-क्लिक में चालू हो सके।

4. **अन्नदान एवं सेवा (Meal Sponsorship & Volunteer Care)**:
   - जन्मदिन, पुण्यतिथि या विशेष अवसर पर बुजुर्गों को नाश्ता, दोपहर या रात का भोजन प्रायोजित करने की सुविधा।
   - स्वयंसेवक पंजीकरण तथा असहाय बुजुर्गों के लिए सहायता अनुरोध प्रणाली।

5. **इन-ऐप नोटिफिकेशन (Real-time In-app Notifications)**:
   - अनुरोध की स्थिति बदलने (लंबित -> स्वीकार / अस्वीकार / पूर्ण) पर उपयोगकर्ता को स्वचालित हिंदी नोटिफिकेशन।
   - एडमिन द्वारा सभी उपयोगकर्ताओं को एक साथ सार्वजनिक घोषणा भेजने की सुविधा।

6. **डार्क/लाइट मोड (Dark & Light Theme Toggle)**:
   - रात में पढ़ने और बुजुर्गों के आँखों के आराम के लिए 1-क्लिक लाइट एवं डार्क मोड।

7. **मुफ्त क्लाउड इमेज सेवा (Cloudinary Image Upload Integration)**:
   - Local Storage तथा Cloudinary दोनों के लिए फॉलबैक सपोर्ट।

---

## 🔑 डिफ़ॉल्ट परीक्षण क्रेडेंशियल (Demo Login Credentials)

| भूमिका (Role) | मोबाइल नंबर (Mobile) | पासवर्ड (Password) |
| :--- | :--- | :--- |
| **व्यवस्थापक (Admin)** | `9876543210` | `admin123` |
| **प्रबंधक (Manager)** | `9876543211` | `manager123` |
| **उपयोगकर्ता (User)** | `9876543212` | `user123` |

---

## 🛠️ प्रयुक्त टेक्नोलॉजी (Tech Stack)

- **Frontend**: React (TypeScript), Vite, Tailwind CSS (v4 / PostCSS), Lucide React Icons, React Router v7, Axios.
- **Backend**: Node.js, Express.js, JWT, bcryptjs, Multer, Cloudinary SDK.
- **Database**: MySQL (Primary) / SQLite (Local Auto-Fallback), promise-based queries.

---

## 🚀 स्थानीय स्तर पर चलाने के निर्देश (How to Run Locally)

### 1. बैकएंड प्रारम्भ करना (Backend Setup):
```bash
cd backend
npm install
npm start
```
*बैकएंड सर्वर `http://localhost:5000` पर प्रारम्भ होगा।*

### 2. फ्रंटएंड प्रारम्भ करना (Frontend Setup):
```bash
cd frontend
npm install
npm run dev
```
*वेबसाइट `http://localhost:3000` पर चालू हो जाएगी।*

---

## ☁️ नि:शुल्क परिनियोजन निर्देश (Free Deployment Guide)

1. **Frontend**:
   - Vercel या Netlify पर कनेक्ट करें।
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variable: `VITE_API_BASE_URL=https://your-backend.onrender.com/api`

2. **Backend**:
   - Render.com या Railway.app (Free Web Service) पर परिनियोजित करें।
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Add `.env` variables (`PORT`, `JWT_SECRET`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).

3. **Database**:
   - Aiven.io Free MySQL Database या PlanetScale Free Tier का उपयोग करें।
   - `backend/db/schema.sql` और `backend/db/seed.sql` को निष्पादित (Execute) करें।

---

**॥ राधे राधे ॥**
