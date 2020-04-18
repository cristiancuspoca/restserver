const jwt = require('jsonwebtoken')

let verifyToken = (req, res, next)  => {
    let token = req.get('Authorization')

    jwt.verify(token, process.env.SEED_TOKEN, function(err, decoded) {
        if (err) {
            return res.status(404).json({
                ok: 0,
                err,
                msg: 'Operation not allowed'
            })
        }
        req.user = decoded.user
        next()
    });
}

let verifyAdminRole = (req, res, next)  => {
    let user = req.user;
    if (user.role != 'ADMIN_ROLE') {
        return res.status(404).json({
            ok: 0,
            msg: 'Action not authorized with this role'
        })
    } else {
        next()
    }
}

module.exports = {
    verifyToken,
    verifyAdminRole
}