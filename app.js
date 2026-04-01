const express = require('express');
const path = require('path');
const cors = require('cors');

require('dotenv').config({
    path: __dirname + '/.env'
});

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const rateLimit = require('express-rate-limit');

const homeRoutes = require('./src/routes/homeRoutes');
const authRoutes = require('./src/routes/authRoutes');
const customerRoutes = require('./src/routes/customerRoutes');

const app = express();
const dbPi = require('./src/config/database_rasp');

// -------------------------
// Configuração da sessão
// -------------------------
let sessionStore;
try {
    sessionStore = new MySQLStore({
        expiration: 12 * 60 * 60 * 1000, // 1 minuto (mesmo valor do cookie)
        checkExpirationInterval: 10 * 1000, // limpa a cada 10 segundos
        clearExpired: true
    }, dbPi);
    console.log('✅ MySQLStore inicializado para sessão');
} catch (err) {
    console.error('⚠️ Falha ao inicializar MySQLStore, fallback MemoryStore:', err.message);
    sessionStore = new session.MemoryStore();
}

app.use(session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    name: 'hrk.sid',
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 12 * 60 * 60 * 1000 //12 hours
        // maxAge: 1 * 60 * 1000 //1 minuto
    },
    rolling: false // ou false, dependendo do comportamento desejado
}));

// -------------------------
// Segurança e rateLimit
// -------------------------
if (process.env.NODE_ENV !== 'development') {
    app.use(rateLimit({
        windowMs: 30 * 60 * 1000, // 30 minutos
        max: 1500, // limite de 1500 requisições por IP no período
        message: { error: 'Too many requests, try again later.' },
        standardHeaders: true,
        legacyHeaders: false,
        validate: {
            // Desabilita validações que causam erro com proxy
            xForwardedForHeader: false,
            trustProxy: false,
        },
    }));
} else {
    console.log('⚠️ rateLimit disabled on development mode...');
}

app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// views
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

// routes
app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/customer', customerRoutes);

async function testarBancos() {
    console.log('🔄 Testando conexões com os bancos...');
    try {
        await dbPi.query('SELECT 1');
        console.log('✅ Conexão DB Pi OK');
    } catch (err) {
        console.error('❌ Erro DB Pi:', err.message);
    }
}

const http = require('http');
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

(async () => {

    // await testarBancos();

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

})();