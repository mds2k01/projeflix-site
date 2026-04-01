const mysql = require('mysql2');
require('dotenv').config();
const util = require('util');

// Pool de conexões para o Raspberry Pi
const pool = mysql.createPool({
    host: process.env.DB_HOST_PI,     // IP
    user: process.env.DB_USER_PI,          // Seu usuário
    password: process.env.DB_PASSWORD_PI, // Senha do banco
    database: process.env.DB_DATABASE_PI,
    port: process.env.DB_PORT_PI || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 15000,
    // Se quiser conexão segura via SSH (opcional)
    // ssl: process.env.NODE_ENV === 'production' ? {} : false
});

const query = util.promisify(pool.query).bind(pool);

module.exports = {
    pool,
    query
};

// // Promisify para usar async/await
// const query = util.promisify(pool.query).bind(pool);

// // Testar conexão inicial
// const testConnection = async () => {
//     try {
//         const [result] = await query('SELECT 1 + 1 AS solution');
//         console.log('✅ Conectado ao MySQL do Raspberry Pi!');
//         console.log(`📊 Banco: ${pool.config.connectionConfig.database}`);
//         console.log(`🖥️  Host: ${pool.config.connectionConfig.host}`);
//         return true;
//     } catch (error) {
//         console.error('❌ Erro ao conectar ao MySQL:', error.message);
//         return false;
//     }
// };

// module.exports = {
//     pool,
//     query,
//     testConnection
// };