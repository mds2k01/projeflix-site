// const deviceCache = require('../services/deviceCache'); // Ajuste o caminho
// const { Readable, pipeline } = require('stream');
const http = require('http');
const posthog = require('../config/posthog');
const { track, trackAsync } = require('../data/events');
const { Devices } = require('../models/deviceModel');
const { getDevicesByUser } = require('../services/deviceService');

exports.dashboard = async (req, res) => {

    try {
        // const allDevices = await deviceCache.getAllDevices();
        let allDevices = {};

        if (req.session.userData) {
            const owner = req.session.userData.mail;
            allDevices = await getDevicesByUser(owner);
        }

        // console.log('allDevices:', allDevices);

        const dataUser = req.session.userData;
        // console.log('dataUser:', dataUser);
        /*
        dataUser: {
            success: true,
            id: 9,
            name: 'Marcelo dos Santos',
            mail: 'mds2k01@gmail.com',
            phone: '(19) 99603-1622',
            last_login: '2026-03-27T16:29:20.000Z'
            }
        */

        if (!dataUser?.id) {
            console.log('❌ Usuário não logado - now_playing não enviado');
        } else {

            const { mail, id } = dataUser;

            trackAsync('dashboard_enter', id, {
                mail
            });
        }

        res.render('customer/dashboard', {
            title_page: 'ProjeFlix',
            devices: allDevices || {}, // Garante que não seja undefined
            devicesCount: Object.keys(allDevices || {}).length,
            userData: req.session.userData
        });

    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        res.render('customer/dashboard', {
            title_page: 'ProjeFlix',
            devices: {},
            devicesCount: 0
        });
    }
};

exports.infoDevices = async (req, res) => {

    if (req.session.userData) {
        const user = req.session.userData.mail;

        let allDevices = {};

        if (req.session.userData) {
            const owner = req.session.userData.mail;
            allDevices = await getDevicesByUser(owner);
        }
        res.send(allDevices);

    } else {
        console.log('userData not found!');
    }
}

exports.updateDeviceStream = async (req, res) => {

    /*
    title: 'Nosso Pop',
    category: 'Pop',
    last_category: 'http://api.projeflix.com.br:8080/stream/pop?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjksImlhdCI6MTc3NTI2MzY5MCwiZXhwIjoxNzc1MjY0MjkwfQ.HeQtY21VJ5ynMODaEE9ouQDQjthDc3INLO6rY5lxT0Y',
    ip: '',
    device_id: 'D4E9F4E987D4,00700725E0A0,A4F00F909398'
    */

    // device_ids_string, ip, last_category
    // console.log('req body:', req.body);

    if (req.session.userData) {
        Devices.updateContentForDevice(req.body.device_id || '000', '',
            req.body.last_category || 'http://api.projeflix.com.br:8080/stream/shorts?token=projeflix', req.body.title || 'Radio Projeflix', req.body.category || 'Projeflix');
        // console.log('updateStream:', updateStream);
    }

    res.end();
}
