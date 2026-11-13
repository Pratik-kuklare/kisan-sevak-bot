const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = 'kisansevak2026';
const WA_TOKEN = process.env.WA_TOKEN;
const PHONE_ID = process.env.PHONE_ID;

app.get('/webhook', (req, res) => {
    if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);
    } else res.sendStatus(403);
});

app.post('/webhook', async (req, res) => {
    const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!msg) return res.sendStatus(200);
    const from = msg.from;
    const text = msg.text?.body || '';
    const reply = getReply(text);
    await axios.post(
        `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`,
        { messaging_product: 'whatsapp', to: from, text: { body: reply } },
        { headers: { Authorization: `Bearer ${WA_TOKEN}` } }
    );
    res.sendStatus(200);
});

function detectLanguage(text) {
    // Marathi
    if (/[\u0900-\u097F]/.test(text) && (text.includes('भाव') || text.includes('शेती') || text.includes('पाऊस'))) return 'marathi';
    // Punjabi
    if (/[\u0A00-\u0A7F]/.test(text)) return 'punjabi';
    // Telugu
    if (/[\u0C00-\u0C7F]/.test(text)) return 'telugu';
    // Bengali
    if (/[\u0980-\u09FF]/.test(text)) return 'bengali';
    // English
    if (/^[a-zA-Z\s]+$/.test(text)) return 'english';
    // Default Hindi
    return 'hindi';
}

function getReply(text) {
    const t = text.toLowerCase().trim();
    const lang = detectLanguage(t);

    if (lang === 'english') {
        if (t.includes('price') || t.includes('mandi') || t.includes('rate')) {
            return `📊 *Today's Mandi Prices*
• Wheat: ₹2,275/quintal
• Rice: ₹1,850/quintal
• Tomato: ₹1,200/quintal
• Onion: ₹1,550/quintal
• Soybean: ₹4,250/quintal`;
        }
        if (t.includes('weather')) {
            return `🌤️ *Today's Weather*
Temp: 26°C | Humidity: 65%
Light rain expected in evening
✅ Irrigate before 10 AM`;
        }
        if (t.includes('disease') || t.includes('pest')) {
            return `🌿 *Crop Disease Help*
Tell me:
• Which crop?
• Yellow leaves?
• Brown spots?
• Insects visible?`;
        }
        return `🌱 *Welcome to Kisan Sevak!*
Type: price / weather / disease / fertilizer / scheme`;
    }

    if (lang === 'marathi') {
        if (t.includes('भाव') || t.includes('मंडी') || t.includes('बाजार')) {
            return `📊 *आजचे मंडी भाव*
• गहू: ₹2,275/क्विंटल
• धान: ₹1,850/क्विंटल
• टोमॅटो: ₹1,200/क्विंटल
• कांदा: ₹1,550/क्विंटल
• सोयाबीन: ₹4,250/क्विंटल`;
        }
        if (t.includes('पाऊस') || t.includes('हवामान')) {
            return `🌤️ *आजचे हवामान*
तापमान: 26°C | आर्द्रता: 65%
सायंकाळी हलका पाऊस शक्य
✅ सकाळी 10 पूर्वी सिंचन करा`;
        }
        if (t.includes('रोग') || t.includes('किड')) {
            return `🌿 *पीक रोग मदत*
सांगा:
• कोणते पीक?
• पाने पिवळी?
• तपकिरी डाग?
• किडे दिसत आहेत?`;
        }
        return `🌱 *किसान सेवकमध्ये आपले स्वागत!*
टाइप करा: भाव / हवामान / रोग / खत / योजना`;
    }

    // MENU
    if (t === 'menu' || t === 'मेनू' || t === 'help' || t === 'मदद' || t === 'hi' || t === 'hello' || t === 'नमस्ते' || t === 'हेलो') {
        return `🌱 *किसान सेवक में आपका स्वागत है!*

मैं आपकी इन विषयों में मदद कर सकता हूं:

1️⃣ *मंडी भाव* - आज के फसल के दाम
2️⃣ *मौसम* - आज का मौसम और सलाह
3️⃣ *रोग* - फसल रोग और इलाज
4️⃣ *खाद* - खाद और कीटनाशक जानकारी
5️⃣ *सिंचाई* - सिंचाई की सलाह
6️⃣ *बीज* - बीज की जानकारी
7️⃣ *सरकारी योजना* - किसान योजनाएं

👉 कोई भी शब्द हिंदी में टाइप करें!
जैसे: "गेहूं का भाव" या "टमाटर में रोग"`;
    }

    // MANDI PRICES
    if (t.includes('भाव') || t.includes('मंडी') || t.includes('price') || t.includes('rate') || t.includes('दाम')) {
        return `📊 *आज के मंडी भाव*
📅 ${getDate()} | 📍 मध्यप्रदेश मंडी

*अनाज:*
• गेहूं: ₹2,275/क्विंटल
• धान: ₹1,850/क्विंटल
• मक्का: ₹1,920/क्विंटल
• जौ: ₹1,650/क्विंटल
• बाजरा: ₹2,100/क्विंटल

*दलहन:*
• चना: ₹5,440/क्विंटल
• मूंग: ₹7,200/क्विंटल
• उड़द: ₹6,800/क्विंटल
• मसूर: ₹5,100/क्विंटल

*तिलहन:*
• सोयाबीन: ₹4,250/क्विंटल
• सरसों: ₹5,150/क्विंटल
• मूंगफली: ₹5,800/क्विंटल

*सब्जियां:*
• टमाटर: ₹1,200/क्विंटल
• प्याज: ₹1,550/क्विंटल
• आलू: ₹950/क्विंटल
• लहसुन: ₹12,000/क्विंटल

📌 अपनी नजदीकी मंडी का भाव जानने के लिए मंडी का नाम लिखें।`;
    }

    // WEATHER
    if (t.includes('मौसम') || t.includes('weather') || t.includes('बारिश') || t.includes('तापमान')) {
        return `🌤️ *आज का मौसम*
📅 ${getDate()}

🌡️ तापमान: 26°C (अधिकतम 31°C)
💧 नमी: 65%
💨 हवा: 14 km/h (पश्चिम से)
🌧️ बारिश: शाम 5 बजे के बाद संभव

*किसान सलाह:*
✅ सुबह 10 बजे से पहले सिंचाई करें
✅ कीटनाशक छिड़काव बारिश से पहले न करें
✅ फसल कटाई के लिए कल सुबह उपयुक्त
⚠️ तेज हवा से फसल को नुकसान हो सकता है

🌱 अगले 3 दिन: हल्की बारिश की संभावना`;
    }

    // DISEASE
    if (t.includes('रोग') || t.includes('बीमारी') || t.includes('disease') || t.includes('कीट') || t.includes('पीला') || t.includes('धब्बा')) {
        return `🌿 *फसल रोग पहचान*

बताएं आपकी फसल में क्या दिख रहा है:

🟡 *पत्ते पीले* → "पीले पत्ते" लिखें
🟤 *भूरे धब्बे* → "भूरे धब्बे" लिखें  
🔴 *लाल धब्बे* → "लाल धब्बे" लिखें
🍃 *पत्ते मुड़ना* → "मुड़े पत्ते" लिखें
🐛 *कीड़े लगना* → "कीड़े" लिखें
🌾 *फसल सूखना* → "सूखना" लिखें

या सीधे बताएं:
"गेहूं में रोग" / "धान में रोग" / "टमाटर में रोग"`;
    }

    // YELLOW LEAVES
    if (t.includes('पीले पत्ते') || t.includes('पत्ते पीले')) {
        return `🟡 *पत्ते पीले होने के कारण और इलाज*

*कारण 1: नाइट्रोजन की कमी*
→ इलाज: यूरिया 5kg/एकड़ डालें

*कारण 2: आयरन की कमी*
→ इलाज: फेरस सल्फेट 500g/15L पानी छिड़कें

*कारण 3: पानी की अधिकता*
→ इलाज: खेत से पानी निकालें, 2 दिन सूखने दें

*कारण 4: पीला मोजेक वायरस*
→ इलाज: इमिडाक्लोप्रिड 1ml/L पानी छिड़कें

⚠️ कौन सी फसल है? बताएं तो सटीक सलाह देंगे।`;
    }

    // INSECTS
    if (t.includes('कीड़े') || t.includes('कीट') || t.includes('इल्ली') || t.includes('सुंडी')) {
        return `🐛 *कीट नियंत्रण*

*सामान्य कीटनाशक:*
• क्लोरपायरीफॉस 2ml/L पानी
• इमिडाक्लोप्रिड 1ml/L पानी
• लैम्बडा साइहेलोथ्रिन 1ml/L पानी

*छिड़काव का सही समय:*
✅ सुबह 7-10 बजे या शाम 4-7 बजे
❌ दोपहर में और बारिश से पहले नहीं

*जैविक उपाय:*
• नीम का तेल 5ml/L पानी
• सुबह ओस में छिड़काव करें

⚠️ कौन सा कीड़ा है? फोटो भेजें।`;
    }

    // FERTILIZER
    if (t.includes('खाद') || t.includes('fertilizer') || t.includes('यूरिया') || t.includes('डीएपी') || t.includes('dap')) {
        return `🧪 *खाद की जानकारी*

*आज के खाद के भाव:*
• यूरिया (45kg): ₹266/बैग
• DAP (50kg): ₹1,350/बैग
• MOP (50kg): ₹1,100/बैग
• NPK 12:32:16: ₹1,500/बैग
• जिंक सल्फेट: ₹80/kg

*कौन सी खाद कब डालें:*
🌱 बुवाई पर: DAP + MOP
🌿 30 दिन बाद: यूरिया
🌾 60 दिन बाद: यूरिया + जिंक

💡 सलाह: मिट्टी जांच करवाएं - KVK में मुफ्त होती है`;
    }

    // IRRIGATION
    if (t.includes('सिंचाई') || t.includes('पानी') || t.includes('irrigation')) {
        return `💧 *सिंचाई की सलाह*

*आज का सुझाव:*
✅ सुबह 6-10 बजे सिंचाई करें
✅ शाम को भी कर सकते हैं
❌ दोपहर में सिंचाई नुकसानदायक

*फसल के अनुसार सिंचाई:*
• गेहूं: हर 15-20 दिन
• धान: हमेशा 2-3 इंच पानी
• सोयाबीन: हर 10-12 दिन
• टमाटर: हर 3-4 दिन
• प्याज: हर 7-8 दिन

💡 ड्रिप सिंचाई से 40% पानी बचता है
📞 ड्रिप सब्सिडी: 1800-180-1551`;
    }

    // SEEDS
    if (t.includes('बीज') || t.includes('seed') || t.includes('किस्म') || t.includes('variety')) {
        return `🌱 *बीज की जानकारी*

*गेहूं की अच्छी किस्में:*
• GW 496 - 45-50 क्विंटल/हेक्टेयर
• HD 3086 - 50-55 क्विंटल/हेक्टेयर

*धान की अच्छी किस्में:*
• पूसा बासमती 1121
• MTU 1010 - 60 क्विंटल/हेक्टेयर

*सोयाबीन की अच्छी किस्में:*
• JS 335 - 20-25 क्विंटल/हेक्टेयर
• NRC 86

💡 प्रमाणित बीज ही खरीदें
📍 नजदीकी KVK से मुफ्त बीज मिल सकते हैं`;
    }

    // GOVERNMENT SCHEMES
    if (t.includes('योजना') || t.includes('scheme') || t.includes('सरकार') || t.includes('subsidy') || t.includes('सब्सिडी')) {
        return `🏛️ *किसान सरकारी योजनाएं*

*पैसे सीधे खाते में:*
💰 PM किसान सम्मान निधि
→ ₹6,000/साल | pmkisan.gov.in

*फसल बीमा:*
🛡️ PM फसल बीमा योजना  
→ मात्र 2% प्रीमियम | 14447 पर कॉल करें

*कर्ज माफी/KCC:*
🏦 किसान क्रेडिट कार्ड
→ 4% ब्याज पर ₹3 लाख तक

*मुफ्त ट्रेनिंग:*
📚 KVK (कृषि विज्ञान केंद्र)
→ नजदीकी KVK: 1800-180-1551

*सोलर पंप सब्सिडी:*
☀️ PM कुसुम योजना → 90% सब्सिडी`;
    }

    // WHEAT SPECIFIC
    if (t.includes('गेहूं')) {
        return `🌾 *गेहूं की जानकारी*

💰 आज का भाव: ₹2,275/क्विंटल
📅 बुवाई: अक्टूबर 15 - नवंबर 30
🌱 बीज: 100kg/हेक्टेयर

*खाद:*
• बुवाई: DAP 100kg + MOP 60kg
• 21 दिन: यूरिया 65kg
• 45 दिन: यूरिया 65kg

*सिंचाई:* 5-6 बार (CRI, टिलरिंग, जॉइंटिंग, बूटिंग, मिल्क, डफ)

*रोग से बचाव:*
⚠️ करनाल बंट: Propiconazole छिड़कें
⚠️ पीला रतुआ: Tebuconazole छिड़कें`;
    }

    // PADDY SPECIFIC  
    if (t.includes('धान') || t.includes('चावल') || t.includes('rice')) {
        return `🌾 *धान की जानकारी*

💰 आज का भाव: ₹1,850/क्विंटल
📅 रोपाई: जून 15 - जुलाई 15
🌱 नर्सरी: रोपाई से 25-30 दिन पहले

*खाद (हेक्टेयर):*
• रोपाई: DAP 100kg + MOP 60kg
• 21 दिन: यूरिया 65kg
• 45 दिन: यूरिया 65kg

*पानी:* हमेशा 3-5 cm पानी रखें

*रोग:*
⚠️ ब्लास्ट: Tricyclazole 0.6g/L
⚠️ शीथ ब्लाइट: Hexaconazole 1ml/L`;
    }

    // SOYBEAN
    if (t.includes('सोयाबीन') || t.includes('soybean')) {
        return `🫘 *सोयाबीन की जानकारी*

💰 आज का भाव: ₹4,250/क्विंटल
📅 बुवाई: जून 20 - जुलाई 10
🌱 बीज: 70-80 kg/हेक्टेयर

*खाद:*
• बुवाई: DAP 100kg + MOP 50kg
• यूरिया की जरूरत नहीं (नाइट्रोजन खुद बनाती है)

*सिंचाई:* फूल आने पर और फली भरते समय जरूर करें

*रोग:*
⚠️ पीला मोजेक: इमिडाक्लोप्रिड छिड़कें
⚠️ चक्र भृंग: क्लोरपायरीफॉस छिड़कें`;
    }

    // ONION
    if (t.includes('प्याज') || t.includes('onion')) {
        return `🧅 *प्याज की जानकारी*

💰 आज का भाव: ₹1,550/क्विंटल
📅 रोपाई: अक्टूबर-नवंबर (रबी)
🌱 पौध: 8-10 सप्ताह पुरानी

*खाद:*
• रोपाई: DAP 100kg + MOP 100kg
• 30 दिन: यूरिया 50kg
• 60 दिन: यूरिया 50kg

*सिंचाई:* हर 7-8 दिन, कटाई से 15 दिन पहले बंद

*रोग:*
⚠️ थ्रिप्स: Fipronil छिड़कें
⚠️ बैंगनी धब्बा: Mancozeb छिड़कें`;
    }

    // TOMATO
    if (t.includes('टमाटर') || t.includes('tomato')) {
        return `🍅 *टमाटर की जानकारी*

💰 आज का भाव: ₹1,200/क्विंटल
📅 रोपाई: जून-जुलाई और नवंबर-दिसंबर
🌱 पौध दूरी: 60×45 cm

*खाद:*
• रोपाई: DAP 100kg + MOP 60kg
• हर 15 दिन: 19:19:19 @ 2kg/पंप

*सिंचाई:* हर 3-4 दिन (ड्रिप सबसे अच्छा)

*रोग:*
⚠️ अर्ली ब्लाइट: Mancozeb छिड़कें
⚠️ फल छेदक: Spinosad छिड़कें`;
    }

    // DEFAULT
    return `🙏 *नमस्ते! मैं किसान सेवक हूं।*

आपका संदेश मिला। मैं इन विषयों में मदद करता हूं:

👉 *"मेनू"* लिखें - सभी सेवाएं देखें
👉 *"मंडी भाव"* - आज के दाम
👉 *"मौसम"* - मौसम जानकारी
👉 *"रोग"* - फसल रोग
👉 *"खाद"* - खाद जानकारी
👉 *"सरकारी योजना"* - किसान योजनाएं

🌾 Team AgroSpark | SEVA FIRST 2026`;
}

function getDate() {
    return new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

app.get('/privacy', (req, res) => {
    res.send(`<h1>Kisan Sevak Privacy Policy</h1>
  <p>Kisan Sevak collects farmer messages only to provide agricultural advisory services. 
  We do not share any personal data with third parties.</p>
  <p>Contact: pratikkuklare1903@gmail.com</p>`);
});

app.listen(process.env.PORT || 3000, () => console.log('Kisan Sevak Bot running!'));
