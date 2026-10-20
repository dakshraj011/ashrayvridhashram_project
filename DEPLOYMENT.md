# 🛕 आश्रय वृद्धाश्रम (Aashray Old Age Home) - Render डिप्लॉयमेंट एवं ऑडिट गाइड

यह गाइड आश्रय वृद्धाश्रम वेब पोर्टल को **Render.com** पर सफलतापूर्वक 100% प्रोडक्शन स्तर पर डिप्लॉय करने के लिए बनाई गई है।

---

## 🔍 त्रुटि का कारण एवं समाधान (Root Cause & Fix)

### समस्या:
```
[vite] http proxy error: /api/meals
AggregateError [ECONNREFUSED]:
    at internalConnectMultiple (node:net:1194:18)
    at afterConnectMultiple (node:net:1784:7)
```

### कारण:
1. **बैकएंड सर्वर रनिंग नहीं था**: जब आपने फ्रंटएंड को टेस्ट किया, तो बैकएंड सर्वर पोर्ट 5000 पर चालू नहीं था।
2. **Node 18+ IPv6 (`::1`) रेजोल्यूशन समस्या**: `vite.config.ts` में प्रॉक्सी `http://localhost:5000` सेट थी। आधुनिक Node.js में `localhost` पहले IPv6 `::1` पर कनेक्ट करने की कोशिश करता है, जिससे `ECONNREFUSED` आता है।

### समाधान जो लागू किए गए:
1. `vite.config.ts` में प्रॉक्सी को `http://127.0.0.1:5000` में बदल दिया गया।
2. `backend/server.js` को `0.0.0.0` पर बाइंड किया गया।
3. `backend/server.js` में Express 5 कम्पैटिबल प्रोडक्शन स्टेटिक बिल्ड सर्विंग जोड़ी गई, जिससे फ्रंटएंड और बैकएंड एक ही डोमेन पर रेंडर में बिना CORS एरर के चलेंगे।
4. `backend/package.json` और रूट `package.json` में प्रोडक्शन स्टार्ट और बिल्ड स्क्रिप्ट्स जोड़ी गईं।
5. `Login.tsx` में सामान्य यूजर रीडायरेक्ट बग (`/admin` की जगह `/dashboard`) ठीक किया गया।
6. `Navbar.tsx` में सामान्य यूजर डैशबोर्ड लिंक और रियल-टाइम `NotificationBell` जोड़ा गया।
7. सभी डैशबोर्ड्स में `Promise.allSettled` लगाया गया ताकि यदि कोई एक डेटा अनुपलब्ध हो, तो पूरा पेज क्रैश न हो।

---

## 🚀 Render.com पर डिप्लॉय करने के दो विकल्प

### ⭐ विकल्प 1 (अनुशंसित - Recommended & Easiest): सिंगल फुल-स्टैक वेब सर्विस
> **फ़ायदे:** एक ही सर्विस पर पूरा बैकएंड + फ्रंटएंड चलेगा। Render का फ़्री टियर पर्याप्त है, कोई CORS झंझट नहीं, कोई अलग-अलग URL सेटअप करने की आवश्यकता नहीं।

1. **GitHub पर कोड पुश करें**:
   ```bash
   git add .
   git commit -m "Production ready for Render deployment"
   git push origin main
   ```

2. **Render डैशबोर्ड पर जाएँ**:
   - [dashboard.render.com](https://dashboard.render.com/) पर लॉगिन करें।
   - **New +** बटन दबाएँ और **Web Service** चुनें।
   - अपना GitHub रिपॉजिटरी कनेक्ट करें।

3. **सेटिंग्स भरें**:
   - **Name**: `aashray-old-age-home`
   - **Region**: Oregon या Singapore
   - **Branch**: `main`
   - **Root Directory**: *(खाली छोड़ें / Leave blank)*
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Instance Type**: `Free`

4. **Environment Variables जोड़ें**:
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `JWT_SECRET` | `aashray_krishna_prem_jwt_secret_key_2026_super_secure` |
   | `DATABASE_URL` | *(आपकी Aiven MySQL सर्विस URI - नीचे देखें)* |

   > **💡 नोट:** यदि आप अभी कोई बाहरी डेटाबेस नहीं जोड़ना चाहते, तो `DATABASE_URL` की जगह `DB_DRIVER = sqlite` सेट कर सकते हैं।

5. **Deploy Web Service** पर क्लिक करें। 
   - 2-3 मिनट में बिल्ड पूरा होगा और आपको लाइव लिंक (जैसे: `https://aashray-old-age-home.onrender.com`) मिल जाएगा।

---

## 🗄️ Aiven मुफ़्त क्लाउड MySQL सेटअप (100% Free Forever - 5 GB)

Aiven आपको बिना किसी क्रेडिट कार्ड के **5 GB का मुफ़्त MySQL डेटाबेस** देता है, जिसमें आपका डेटा हमेशा सुरक्षित रहेगा और कभी डिलीट नहीं होगा।

### चरण 1: Aiven पर अकाउंट बनाएँ
1. [https://aiven.io/](https://aiven.io/) पर जाएँ और **Sign Up** पर क्लिक करें (आप सीधे Google या GitHub से लॉगिन कर सकते हैं)।
2. ईमेल वेरिफाई करें।

### चरण 2: नया MySQL डेटाबेस बनाएँ
1. Aiven डैशबोर्ड में **Create Service** बटन पर क्लिक करें।
2. डेटाबेस में **MySQL** चुनें।
3. क्लाउड प्रोवाइडर व रीजन चुनें (उदा: AWS या Google Cloud - कोई भी नजदीकी रीजन चुन सकते हैं)।
4. सर्विस प्लान में **Free Plan** (Free tier) चुनें।
5. **Create Service** पर क्लिक करें। 1-2 मिनट में आपका डेटाबेस तैयार हो जाएगा।

### चरण 3: Service URI कॉपी करें
1. डेटाबेस बनने के बाद Overview पेज पर आपको **Service URI** दिखाई देगा, जैसे:
   ```text
   mysql://avnadmin:AVNS_xxxxxxxxx@mysql-xxxxx.aivencloud.com:12345/defaultdb?ssl-mode=REQUIRED
   ```
2. इस URI को कॉपी कर लें।

### चरण 4: अपने प्रोजेक्ट में जोड़ें
- **लोकल टेस्टिंग के लिए:** `backend/.env` में जोड़ें:
  ```env
  DATABASE_URL=mysql://avnadmin:AVNS_xxxxxxxxx@mysql-xxxxx.aivencloud.com:12345/defaultdb?ssl-mode=REQUIRED
  ```
- **Render.com पर डिप्लॉयमेंट के लिए:** 
  Render के Environment Variables सेक्शन में `DATABASE_URL` की वैल्यू में यही URI पेस्ट कर दें।

> **✅ स्वतः सेटअप:** जब आपका बैकएंड पहली बार कनेक्ट होगा, तो वह अपने-आप सभी 11 टेबल्स (`users`, `needs`, `meal_requests`, `events`, आदि) बना देगा, डिफ़ॉल्ट डेटा भर देगा और एडमिन यूजर रजिस्टर कर देगा। आपको कुछ भी मैन्युअल करने की ज़रूरत नहीं है!

---

### विकल्प 2: फ्रंटएंड (Static Site) + बैकएंड (Web Service) अलग-अलग

यदि आप फ्रंटएंड को Static Site और बैकएंड को Web Service के रूप में अलग-अलग रखना चाहते हैं:

#### भाग A: बैकएंड (Web Service)
1. **New Web Service** चुनें।
2. **Root Directory**: `backend`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `aashray_krishna_prem_jwt_secret_key_2026_super_secure`
   - `DB_DRIVER`: `sqlite` (या यदि MySQL यूज़ कर रहे हैं तो DB क्रेडेंशियल्स)
   - `FRONTEND_URL`: `https://your-frontend-site.onrender.com`

#### भाग B: फ्रंटएंड (Static Site)
1. **New Static Site** चुनें।
2. **Root Directory**: `frontend`
3. **Build Command**: `npm install && npm run build`
4. **Publish Directory**: `dist`
5. **Environment Variables**:
   - `VITE_API_URL`: `https://your-backend-service.onrender.com`

---

## 🔑 डिफ़ॉल्ट एडमिन क्रेडेंशियल्स (Default Admin Login)

- **मोबाइल नंबर**: `6306638958`
- **पासवर्ड**: `hare krishna`
- **रोल**: `admin`
