
function ensureAuthenticated(req, res, next) {

    // console.log('Verificando autenticação:');
    // console.log('- Session ID:', req.sessionID);
    // console.log('- Session exists:', !!req.session);
    // console.log('- userData exists:', !!(req.session && req.session.userData));
    // console.log('- Cookie maxAge:', req.session?.cookie?.maxAge);
    // console.log('- Cookie expires:', req.session?.cookie?._expires);

    // Verifica se a sessão existe e tem userData
    if (req.session && req.session.userData) {
        return next();
    }

    return res.redirect('/login?error=InvalidSession');
}

module.exports = { ensureAuthenticated };