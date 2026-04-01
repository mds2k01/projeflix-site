
exports.index = (req, res) => {
    const dataManager = {};

    res.render('index', { dataManager, title_page: 'ProjeFlix' });
};

exports.termos = (req, res) => {
    const dataManager = {};

    res.render('termos', { dataManager, title_page: 'ProjeFlix - Termos de Uso' });
};

exports.privacidade = (req, res) => {
    const dataManager = {};

    res.render('privacidade', { dataManager, title_page: 'ProjeFlix - Poítica de Privacidade' });
};

