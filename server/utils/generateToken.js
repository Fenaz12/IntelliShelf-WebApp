const jwt = require('jsonwebtoken');

const genereateToken = (email) =>{
    return jwt.sign({email}, process.env.JWT_SECRET,{
        expiresIn: '30d',
    });
};

module.exports = genereateToken;