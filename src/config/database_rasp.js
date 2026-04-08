const mysql = require('mysql2');
require('dotenv').config();
const util = require('util');

// Pool de conexões para o TiDB Cloud (SSL obrigatório)
const pool = mysql.createPool({
    host: process.env.DB_HOST_PI,     // gateway01.us-east-1.prod.aws.tidbcloud.com
    user: process.env.DB_USER_PI,     // 28Hd8MnboARUACH.root
    password: process.env.DB_PASSWORD_PI,
    database: process.env.DB_DATABASE_PI, // meu_app
    port: process.env.DB_PORT_PI || 4000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 15000,
    // 🔑 Adicione esta linha - SSL é OBRIGATÓRIO
    ssl: {
        rejectUnauthorized: true  // Verifica o certificado (recomendado)
    }
});

const query = util.promisify(pool.query).bind(pool);

module.exports = {
    pool,
    query
};

// const mysql = require('mysql2');
// require('dotenv').config();
// const util = require('util');

// // Pool de conexões para o Raspberry Pi
// const pool = mysql.createPool({
//     host: process.env.DB_HOST_PI,     // IP
//     user: process.env.DB_USER_PI,          // Seu usuário
//     password: process.env.DB_PASSWORD_PI, // Senha do banco
//     database: process.env.DB_DATABASE_PI,
//     port: process.env.DB_PORT_PI || 3306,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0,
//     connectTimeout: 15000,
//     // Se quiser conexão segura via SSH (opcional)
//     // ssl: process.env.NODE_ENV === 'production' ? {} : false
// });

// const query = util.promisify(pool.query).bind(pool);

// module.exports = {
//     pool,
//     query
// };
