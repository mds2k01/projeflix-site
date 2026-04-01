const pool = require('../config/database_rasp');
var bcrypt = require('bcrypt');
const axios = require('axios');

const User = {

    // Insere ou atualiza a categoria do device
    async setUser(user) {

        const name = user.name;
        const email = user.email;
        const phone = user.phone || '';
        const password = cryptUser(user.password);
        const state = user.state || '';
        const city = user.city || '';

        try {

            const query = `
                INSERT INTO user (name, email, phone, password, state, city)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            await pool.query(query, [name, email, phone, password, state, city]);

            return {
                success: true
            };

        } catch (error) {

            console.error('Erro em setUser:', error);

            return {
                success: false,
                error: error.message
            };
        }

    },

    login: async function (req) {

        await localUser(req);

        const email = req.body.email;
        const pwd = req.body.password;

        try {
            // console.log('email: ', email);
            // console.log('pwd: ', pwd);

            const users = await pool.query("SELECT * FROM user WHERE email = ?", [email]);

            if (!users || users.length === 0) {
                return { success: false, message: 'User not found' };
            }

            const user = users[0];

            const isPasswordValid = await bcrypt.compare(pwd, user.password);
            if (!isPasswordValid) {
                return { success: false, message: 'Problem with pwd' };
            }

            // console.log('user: ', user);

            //Update last_login (await se for async)
            await updateLastLogin(user.email); // ⚠️ Adicionar await se for async

            return {
                success: true,
                id: user.id,
                name: user.name,
                mail: user.email,
                phone: user.phone,
                last_login: user.last_login
            }

        } catch (error) {
            // console.error('Auth Error:', error);
            return { success: false, message: error.message }; // ⚠️ Retornar error.message
        }
    }
};

async function updateLastLogin(email) {
    try {

        // Sem desestruturação - mais seguro
        const result = await pool.query(
            "UPDATE user SET last_login = NOW() WHERE email = ?",
            [email]
        );

        // console.log('Resultado da query:', result); // Para debug

    } catch (error) {
        console.error('Error authModel (updateLastLogin): ' + error);
        console.error('Error authModel details (updateLastLogin): ' + error.code);
    }
}

function cryptUser(pwd) {

    var salt = bcrypt.genSaltSync(10);
    var psw = bcrypt.hashSync(pwd, salt);

    return psw;

}

async function localUser(req) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] ||
        req.socket.remoteAddress ||
        req.ip;

    try {
        const response = await axios.get(`http://ip-api.com/json/${ip}`);
        // console.log('localUser:', response.data);
        return response.data;
    } catch (error) {
        console.error(err);
    }
}

module.exports = { User };