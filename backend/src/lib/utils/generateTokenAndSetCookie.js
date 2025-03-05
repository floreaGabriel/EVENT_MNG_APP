import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (id, res) => {
    console.log("Generated token and cookie");
    
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '24h'
    });

    res.cookie("jwt", token, {  
        maxAge:  15 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== 'development',
    });

    console.log("final generate token");

    return token;
};