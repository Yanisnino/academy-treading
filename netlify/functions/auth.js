const { MongoClient } = require('mongodb');

// Use environment variable in production, but hardcode for now for simplicity of setup
const uri = process.env.MONGODB_URI || "mongodb+srv://yyanisniss43_db_user:uJTDKI0TsUBUGNvu@cluster0.fyfdsbb.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

let dbConnection;

async function connectToDb() {
    if (dbConnection) return dbConnection;
    await client.connect();
    dbConnection = client.db("trading_academy");
    return dbConnection;
}

exports.handler = async (event, context) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' }, body: '' };
    }

    try {
        const db = await connectToDb();
        const usersCollection = db.collection('users');
        const { action, payload } = JSON.parse(event.body);

        if (action === 'signup') {
            const existing = await usersCollection.findOne({ email: payload.email.toLowerCase() });
            if (existing) {
                return { statusCode: 400, body: JSON.stringify({ error: 'المستخدم موجود بالفعل' }) };
            }
            const newUser = { ...payload, email: payload.email.toLowerCase(), joined: new Date().toLocaleDateString() };
            await usersCollection.insertOne(newUser);
            return { statusCode: 201, body: JSON.stringify(newUser) };
        }

        if (action === 'login') {
            const user = await usersCollection.findOne({
                email: payload.email.toLowerCase(),
                password: payload.password
            });
            if (!user) {
                return { statusCode: 401, body: JSON.stringify({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }) };
            }
            return { statusCode: 200, body: JSON.stringify(user) };
        }

        return { statusCode: 404, body: 'Not Found' };
    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
};
