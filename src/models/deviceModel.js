const pool = require('../config/database_rasp');

const Devices = {

    async getAllDevicesFromUser(owner) {

        try {
            const query = `SELECT * FROM devices WHERE owner = ?`;
            const result = await pool.query(query, owner);
            return {
                success: true,
                devices: result
            }
        } catch (error) {
            console.error('Erro em getAllDevicesFromUser:', error);
            return {
                success: false,
                error: error.message
            }
        }
    },

    async updateDateToDevice(device_id) {
        try {
            const query = `
            UPDATE device
            SET updated_at = CURRENT_TIMESTAMP
            WHERE device_id = ?
        `;

            const result = await pool.query(query, [device_id]);

            return {
                success: true,
                affectedRows: result.affectedRows
            };

        } catch (error) {
            console.error('Erro em updateDateToDevice:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    async getDeviceContentFromDevice(device_id) {

        try {
            const query = `SELECT * FROM stream WHERE device_id = ?`;
            const result = await pool.query(query, device_id);
            return {
                success: true,
                content: result
            }
        } catch (error) {
            console.error('Erro em getDeviceContentFromDevice:', error);
            return {
                success: false,
                error: error.message
            }
        }
    },

    async updateContentForDevice(device_ids_string, ip, last_category, title, category) {

        try {

            // console.log('Title:', title);
            // console.log('Category:', category);

            // 1. Converte a string "ID1,ID2" em um array ["ID1", "ID2"]
            const ids = device_ids_string.split(',').map(id => id.trim());

            const query = `
            INSERT INTO projeflix_radio.stream (device_id, ip, last_category, title, category) 
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                ip = VALUES(ip), 
                last_category = VALUES(last_category),
                title = VALUES(title),
                category = VALUES(category),
                last_access = CURRENT_TIMESTAMP
        `;

            // 2. Cria uma promessa para cada ID e executa todas simultaneamente
            const promises = ids.map(id => pool.query(query, [id, ip, last_category, title, category]));
            const results = await Promise.all(promises);

            return {
                success: true,
                count: results.length, // Quantidade de dispositivos processados
                content: results
            };

        } catch (error) {
            console.error('Erro em updateContentForDevice:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = { Devices };