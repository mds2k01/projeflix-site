const { User } = require('../models/authModel');
const jwt = require('jsonwebtoken');
const { track, trackAsync } = require('../data/events');

const STREAM_SECRET = 'Alpha@25';

const generateTokenTest = () => {
    return jwt.sign(
        {
            userId: 0,
            email: 'mds2k01@gmail.com'
        },
        STREAM_SECRET,
        { expiresIn: '2h' }
    );
};

const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user.id,
            email: user.email
        },
        STREAM_SECRET,
        { expiresIn: '10m' } //10s 5m 7d 3600=1hora
    );
};

// Valida token recebido
const validateToken = (token) => {
    try {
        const decoded = jwt.verify(token, STREAM_SECRET);
        return { valid: true, decoded };
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return { expired: true, decoded: jwt.decode(token) };
        }
        return { valid: false, error: err.message };
    }
};


exports.validateStreamToken = async (req, res) => {

    // console.log('req.query validateStreamToken:', JSON.stringify(req.query));

    //Allow shorts always
    const originalUri = req.query.original_uri || '';
    const match = originalUri.match(/^\/stream\/([^?]+)\?/);
    const category = match ? match[1] : null;
    // console.log('Categoria:', category);

    if (category === 'shorts') {
        return res.sendStatus(200);
    }
    //////////////////////

    let token = req.query.token;

    if (!token && req.query.original_uri) {
        try {
            const params = new URL(req.query.original_uri, 'http://localhost');
            token = params.searchParams.get('token');
        } catch (e) {
            console.error("Erro ao processar original_uri:", e);
        }
    }

    // console.log('Token to be validate:', token);

    if (!token) {
        // console.log('Bloqueado: Token ausente');
        return res.sendStatus(401);
    }

    const validation = validateToken(token);

    // ✅ 1. Token válido
    if (validation.valid) {
        // console.log('Permitido:', validation.decoded.email);
        return res.sendStatus(200);
    }

    // 🔁 2. Token expirado → tenta renovar
    if (validation.expired) {
        console.log('Token expirado, tentando renovar...');

        // verifica sessão ativa
        if (req.session && req.session.userData) {
            const newToken = generateToken(req.session.userData);

            // console.log('Novo token gerado:', newToken);

            // ⚠️ IMPORTANTE:
            // NGINX NÃO recebe esse token automaticamente
            // isso só serve para debug ou APIs normais

            return res.status(200).json({
                refreshed: true,
                token: newToken
            });
        }

        console.log('Sem sessão válida');
        return res.sendStatus(401);
    }

    // ❌ 3. Token inválido
    console.log('❌ Token inválido');
    return res.sendStatus(403);
};

exports.getStreamToken = async (req, res) => {

    const category = req.query.category || req.body.category || 'all';

    const dataUser = req.session.userData;

    // console.log('category:', category);

    const streamMapOld = {
        playradio: "http://n02.radiojar.com/d9cm273ystzuv?rj-ttl=5&rj-tok=AAABnQiCmn4AyQu3jyMnMq7tew",
        tango: "http://sonic.radiostreaminglatino.com/8072/stream",
        italia: "http://kisskiss.fluidstream.eu/KKItalia.mp3",
        gaucha: "http://campeiro.stream.laut.fm/campeiro",
        patriagaucha: "http://servidor16-3.brlogic.com:7614/live",
        alphafm: "http://playerservices.streamtheworld.com/api/livestream-redirect/RADIO_ALPHAFM_ADP_SC?dist=site-alphafm",
        jazz: "http://jazz-wr04.ice.infomaniak.ch/jazz-wr04-128.mp3",
        mpb: "http://live.hunter.fm/mpb_stream?ag=mp3",
        paradise: "http://stream.radioparadise.com/mp3-128",
        lush: "http://ice4.somafm.com/lush-128-mp3",
        seventies: "http://ice4.somafm.com/seventies-128-mp3",
        covers: "http://ice4.somafm.com/covers-128-mp3",
        street: "http://ice4.somafm.com/illstreet-128-mp3",
        top40: "http://listen.011fm.com/stream18",
        usabrasil: "http://cast4.hoost.com.br:20165/stream",
        brasilgospel: "http://stream3.svrdedicado.org/8152/stream",
        gospelfm: "http://stream3.svrdedicado.org/8070/stream",
        forro: "http://stm5.painelcast.com:7600/stream",
        cbnfm: "http://playerservices.streamtheworld.com/api/livestream-redirect/CBN_SPAAC_SC?dist=radioaovivocom",
        transamericafm: "http://24503.live.streamtheworld.com/RT_CWB.mp3",
        unifm: "http://stream3.svrdedicado.org/8150/stream",
        antigas: "http://stream3.svrdedicado.org/8040/stream",
        cancaonovafm: "http://streaming.fox.srv.br:8074/stream",
        bossanova: "http://ice4.somafm.com/bossa-128-mp3",
        raulseixas: "http://stream.zeno.fm/xrhbskhanz4tv?1774627673474",
        flashback: "http://stream3.svrdedicado.org/8012/stream",
        gym: "http://holidaygym.emitironline.com/",
        disco: "http://discomixradio.stream.laut.fm/discomixradio",
        // pop2: "http://disco.stream.laut.fm/pop",
        pop2: "http://poprockfm.stream.laut.fm/poprockfm",
        dance: "http://disco.stream.laut.fm/dance",
        // sertanejo2: "http://s09.maxcast.com.br:8102/live",
        sertanejo3: "http://s17.maxcast.com.br:8669/live",
        modaosertanejo2: "http://stream03.dghost.com.br:8290/stream",
        portaltradicao: "http://servidor18-3.brlogic.com:8486/live",
        evangelizarfm: "http://8239.brasilstream.com.br/stream"
    };

    const streamMap = {
        playradio: { url: "http://n02.radiojar.com/d9cm273ystzuv?rj-ttl=5&rj-tok=AAABnQiCmn4AyQu3jyMnMq7tew", track: "Play Radio", category: "Atuais" },
        tango: { url: "http://sonic.radiostreaminglatino.com/8072/stream", track: "Argentina", category: "Tango" },
        italia: { url: "http://kisskiss.fluidstream.eu/KKItalia.mp3", track: "Kiss", category: "Italia" },
        gaucha: { url: "http://campeiro.stream.laut.fm/campeiro", track: "Campeiro", category: "Gaucha" },
        patriagaucha: { url: "http://servidor16-3.brlogic.com:7614/live", track: "Patria Gaucha", category: "Gaucha" },
        alphafm: { url: "http://playerservices.streamtheworld.com/api/livestream-redirect/RADIO_ALPHAFM_ADP_SC?dist=site-alphafm", track: "Alpha FM", category: "Pop" },
        jazz: { url: "http://jazz-wr04.ice.infomaniak.ch/jazz-wr04-128.mp3", track: "Jazz", category: "Jazz" },
        mpb: { url: "http://live.hunter.fm/mpb_stream?ag=mp3", track: "Brasil", category: "MPB" },
        paradise: { url: "http://stream.radioparadise.com/mp3-128", track: "Paradise", category: "Web Radio" },
        lush: { url: "http://ice4.somafm.com/lush-128-mp3", track: "SomaFm", category: "Lush" },
        seventies: { url: "http://ice4.somafm.com/seventies-128-mp3", track: "SomaFm", category: "70s" },
        covers: { url: "http://ice4.somafm.com/covers-128-mp3", track: "SomaFm", category: "Covers" },
        street: { url: "http://ice4.somafm.com/illstreet-128-mp3", track: "SomaFm", category: "Street" },
        top40: { url: "http://listen.011fm.com/stream18", track: "Hits", category: "Atuais" },
        usabrasil: { url: "http://cast4.hoost.com.br:20165/stream", track: "USA Brasil", category: "Nacionais" },
        brasilgospel: { url: "http://stream3.svrdedicado.org/8152/stream", track: "Brasil Gospel", category: "Gospel" },
        gospelfm: { url: "http://stream3.svrdedicado.org/8070/stream", track: "Gospel FM", category: "Gospel" },
        forro: { url: "http://stm5.painelcast.com:7600/stream", track: "Popular", category: "Forro" },
        cbnfm: { url: "http://playerservices.streamtheworld.com/api/livestream-redirect/CBN_SPAAC_SC?dist=radioaovivocom", track: "CBN SP", category: "Noticias" },
        transamericafm: { url: "http://24503.live.streamtheworld.com/RT_CWB.mp3", track: "Transamerica PR", category: "Esportes" },
        unifm: { url: "http://stream3.svrdedicado.org/8150/stream", track: "UniFm", category: "Diversas" },
        antigas: { url: "http://stream3.svrdedicado.org/8040/stream", track: "Oldies", category: "Antigas" },
        cancaonovafm: { url: "http://streaming.fox.srv.br:8074/stream", track: "Cancao Nova", category: "Catolica" },
        bossanova: { url: "http://ice4.somafm.com/bossa-128-mp3", track: "Jobim & Cia.", category: "Bossa Nova" },
        raulseixas: { url: "https://stream.zeno.fm/xrhbskhanz4tv", track: "Raul Seixas", category: "Nacionais" },
        flashback: { url: "http://stream3.svrdedicado.org/8012/stream", track: "Recordar", category: "Flashback" },
        gym: { url: "http://holidaygym.emitironline.com/", track: "Academia 1", category: "Ritmo" },
        gym2: { url: "http://stream.laut.fm/workout", track: "Academia 2", category: "Ritmo" },
        gym3: { url: "http://mp3.ffh.de/ffhchannels/hqworkout.mp3", track: "Academia 2", category: "Ritmo" },
        gym4: { url: "http://gb25.streamgates.net/radios-audio/100Workout/icecast.audio", track: "Academia 2", category: "Ritmo" },
        disco: { url: "http://discomixradio.stream.laut.fm/discomixradio", track: "Dance", category: "Disco" },
        pop2: { url: "http://poprockfm.stream.laut.fm/poprockfm", track: "Pop New", category: "Pop" },
        dance: { url: "http://disco.stream.laut.fm/dance", track: "Ritmo", category: "Dance" },
        sertanejo3: { url: "http://s17.maxcast.com.br:8669/live", track: "Caipira", category: "Sertanejo" },
        modaosertanejo2: { url: "http://stream03.dghost.com.br:8290/stream", track: "Modao Sertanejo", category: "Sertanejo" },
        portaltradicao: { url: "http://servidor18-3.brlogic.com:8486/live", track: "P. Tradicao", category: "Gaucha" },
        evangelizarfm: { url: "http://8239.brasilstream.com.br/stream", track: "Evangelizar FM", category: "Catolica" }
    };

    // http://stream.zeno.fm/xrhbskhanz4tv?1774627673474 - Raul

    if (streamMap[category]) {

        let urlHTTP = streamMap[category].url;
        const urlHTTPS = urlHTTP.replace(/^http:\/\//, "https://");

        if (!dataUser?.id) {
            console.log('❌ Usuário não logado - now_playing não enviado');
        } else {

            const { mail, id } = dataUser;

            trackAsync('now_playing', id, {
                email: mail,
                track: streamMap[category].track,
                category: streamMap[category].category,
                url: urlHTTP
            });
        }

        return res.status(200).json({
            success: true,
            token: '',
            track: streamMap[category].track,
            category: streamMap[category].category,
            streamUrlDirect: urlHTTP,
            streamUrl: urlHTTPS
        });
    }

    // console.log('Gerando token para categoria:', category);

    if (!req.session.userData) {
        // console.log('user not auth!');
        return res.status(401).json({
            success: false,
            message: 'Usuário não autenticado'
        });
    }

    try {

        const token = generateToken(req.session.userData);
        // const token = generateTokenTest();
        // console.log('generated token:', token);

        //http://187.39.148.202/stream/piano?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJpYXQiOjE3NzQ0NjYwNzcsImV4cCI6MTc3NDQ2NjY3N30.9uDFtfLh2ZwwSH5BAO8cpCA-kVUkPgwGfD_BSQ2F15E
        // const streamUrl = `http://187.39.148.202:8000/${category}?token=${token}`;
        // const streamUrlTemp = `http://187.39.148.202/stream/${category}?token=${token}`;
        // const streamUrl = `http://187.39.148.202/auth/stream-proxy?url=${encodeURIComponent(streamUrlTemp)}`;
        const streamUrlTemp = `http://api.projeflix.com.br:8080/stream/${category}?token=${token}`;
        const streamUrl = `https://api.projeflix.com.br/stream/${category}?token=${token}`;
        // console.log('streamUrl:', streamUrl);
        // console.log('streamUrlTemp:', streamUrl);
        const streamUrlPostHog = `http://api.projeflix.com.br:8080/stream/${category}`;

        let infoStationTrack = 'Radio Projeflix';
        let infoStationCategory = 'Projeflix';

        const streamMapProjeflix = {
            all: { track: "Radio Projeflix", category: "Variadas" },
            ambient: { track: "Paz no Ambiente", category: "Lounge" },
            classic: { track: "Os Classicos", category: "Classicas" },
            piano: { track: "Sofisticado", category: "Piano" },
            pop: { track: "Nosso Pop", category: "Pop" },
            rock: { track: "Mais Energia", category: "Rock" },
            shorts: { track: "Welcome", category: "Radio Projeflix" }
        }

        if (!dataUser?.id) {
            console.log('❌ Usuário não logado - now_playing não enviado');
        } else {

            const { mail, id } = dataUser;

            trackAsync('now_playing', id, {
                email: mail,
                track: streamMapProjeflix[category].track,
                category: streamMapProjeflix[category].category,
                url: streamUrlPostHog
            });
        }

        if (streamMapProjeflix[category]) {
            infoStationTrack = streamMapProjeflix[category].track;
            infoStationCategory = streamMapProjeflix[category].category;
        }

        return res.status(200).json({
            success: true,
            token: token,
            track: infoStationTrack,
            category: infoStationCategory,
            streamUrl: streamUrl,
            streamUrlDirect: streamUrlTemp
        });

    } catch (err) {

        console.error('Erro ao gerar token:', err);

        return res.status(500).json({
            success: false,
            message: 'Erro interno'
        });
    }
};

const fetch = require('node-fetch'); // node-fetch v2

exports.streamProxy = async (req, res) => {

    // console.log('streamProxy called!');

    try {
        const { url } = req.query;

        const response = await fetch(url);

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        response.body.pipe(res);

    } catch (err) {
        console.error('Erro no proxy:', err);
        res.status(500).send('Erro no proxy');
    }
};
// exports.validateToken = validateToken;

exports.checkSession = async (req, res) => {

    // console.log('req.session checkSession:', req.session);

    if (req.session.userData) {
        return true;
    } else {
        // console.log('return FALSE');
        return false;
    }

}

exports.login = async (req, res) => {

    const dataManager = {}

    // console.log('req.body:', req.body);

    if (req.method === 'GET') {
        res.render('auth/login', { dataManager, title_page: 'ProjeFlix' });
    } else {

        const userData = await User.login(req);
        // console.log('userData:', userData);

        if (userData.success == true) {

            req.session.userData = userData;

            dataManager.userData = userData;

            req.session.save();

            res.redirect('/customer/dashboard');

        } else {
            console.log('error login:', userData);

            const errorMessages = {
                'EHOSTDOWN': 'O servidor do banco de dados está indisponível. Verifique sua conexão de rede e tente novamente.',
                'ECONNREFUSED': 'Não foi possível conectar ao servidor. Tente mais tarde.',
                'ETIMEDOUT': 'Estamos com um problema interno temporário de conexão. Tente novamente mais tarde.',
                'ECONNRESET': 'A conexão com o servidor foi interrompida. Tente novamente.',
                'EHOSTUNREACH': 'O servidor está temporariamente inacessível. Tente novamente mais tarde.',
                'PROTOCOL_CONNECTION_LOST': 'Estamos com instabilidade na conexão com o banco. Tente novamente em instantes.'
            };

            let msgError = 'Encontramos um problema. Por gentileza, tente novamente.';

            if (userData && userData.message) {
                for (const [key, value] of Object.entries(errorMessages)) {
                    if (userData.message.includes(key)) {
                        msgError = value;
                        break; // Para no primeiro que encontrar
                    }
                }
            }

            dataManager.error = msgError;

            console.log('dataManager:', dataManager);
            res.render('auth/login', { dataManager, title_page: 'ProjeFlix' });
        }

    }

};

exports.logout = (req, res) => {

    req.session.destroy((err) => {
        if (err) {
            console.error('Logout session error:', err);
            return res.status(500).send('Logout error.');
        }
        res.redirect('/');
    });

}

exports.register = (req, res) => {

    res.render('auth/register', { title_page: 'ProjeFlix: Cadastro' });
}

exports.addUser = async (req, res) => {

    // console.log('body', req.body);

    const { name, email, phone, password, state, city } = req.body;

    // Validar dados obrigatórios
    const errors = {};

    if (!name || name.length < 3) {
        errors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!email || !email.includes('@')) {
        errors.email = 'E-mail inválido';
    }

    // Se houver erros
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Erro de validação',
            errors: errors
        });
    }

    const addUser = await User.setUser(req.body);
    // console.log('addUser:', addUser);


    if (addUser.success === false && addUser.error) {

        if (addUser.error.toLowerCase().includes('duplicate entry')) {
            return res.status(400).json({
                success: false,
                message: 'Este e-mail já está cadastrado',
                errors: { email: 'E-mail já existe' }
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Erro ao cadastrar usuário. Tente mais tarde.',
                error: addUser.error
            });
        };
    };

    // res.end();
    // return;

    res.status(200).json({
        success: true,
        message: 'Usuário cadastrado com sucesso',
        redirectTo: '/customer/dashboard' // Opcional: para onde redirecionar
    });
}