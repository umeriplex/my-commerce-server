var jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try{
        const token = req.header('x-auth-token');
        if(!token) return res.status(401).json({ statusCode: 401, success: false, message: 'Unauthorized!'});

        const isVerified = jwt.verify(token, "passwordKey");
        if(!isVerified) return res.status(401).json({ statusCode: 401, success: false, message: 'Unauthorized!'});

        if (isVerified.exp <= Math.floor(Date.now() / 1000)) {
            return res.status(401).json({ statusCode: 401, success: false, message: 'Token expired!' });
          }

        req.user = isVerified.id;
        req.token = token;
        next();

    }catch(ex){
        if (ex instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ statusCode: 401, success: false, message: 'Token expired!' });
          } else {
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
          }
    }
};

module.exports = auth;