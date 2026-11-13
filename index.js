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
    const text = msg.text?.body?.toLowerCase() || '';
    let reply = '🙏 नमस्ते! मैं किसान सेवक हूं। पूछें: मौसम, मंडी भाव, या फसल रोग।';
    if (text.includes('मौसम') || text.includes('weather'))
        reply = '🌤️ आज का मौसम: 28°C, हल्की बारिश संभव। सिंचाई कल करें।';
    if (text.includes('भाव') || text.includes('price') || text.includes('मंडी'))
        reply = '📊 टमाटर: ₹1200/क्विंटल | गेहूं: ₹2200/क्विंटल | धान: ₹1800/क्विंटल';
    if (text.includes('रोग') || text.includes('disease'))
        reply = '🌿 फसल की फोटो भेजें, हम रोग पहचानेंगे और इलाज बताएंगे।';
    await axios.post(
        `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`,
        { messaging_product: 'whatsapp', to: from, text: { body: reply } },
        { headers: { Authorization: `Bearer ${WA_TOKEN}` } }
    );
    res.sendStatus(200);
});

app.get('/privacy', (req, res) => {
  res.send(`<h1>Kisan Sevak Privacy Policy</h1>
  <p>Kisan Sevak collects farmer messages only to provide agricultural advisory services. 
  We do not share any personal data with third parties.</p>
  <p>Contact: pratikkuklare1903@gmail.com</p>`);
});
app.listen(process.env.PORT || 3000, () => console.log('Kisan Sevak Bot running!'));
