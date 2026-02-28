const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// قراءة الرابط من إعدادات Render (أكثر أماناً)
const uri = process.env.MONGODB_URI || "mongodb+srv://anisplus08:anis123456789@cluster0.z5mke.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// خدمة الملفات الثابتة (الموقع)
app.use(express.static(path.join(__dirname, '.')));

// نقطة اتصال التحقق (Login/Signup)
app.post('/api/auth', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('trading_academy');
        const users = database.collection('users');
        const { action, payload } = req.body;

        if (action === 'signup') {
            const existingUser = await users.findOne({ email: payload.email });
            if (existingUser) return res.status(400).json({ error: 'البريد مسجل مسبقاً' });

            const result = await users.insertOne({ ...payload, joined: new Date() });
            return res.json({ id: result.insertedId, ...payload });
        }

        if (action === 'login') {
            const user = await users.findOne({ email: payload.email, password: payload.password });
            if (user) return res.json(user);
            return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'خطأ في الخادم: ' + err.message });
    } finally {
        await client.close();
    }
});

// توجيه أي طلب آخر لملف index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
