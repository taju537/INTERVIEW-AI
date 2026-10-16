const jwt = require("jsonwebtoken");
const tokenBlacklistModel =require("../models/blacklist.model")


async function authUser (req , res , next){
    let token = req.cookies.token;

    if (!token && req.headers.authorization) {
        if (req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.slice(7).trim();
        } else {
            token = req.headers.authorization.trim();
        }
    }

    if(!token){
        return res.status(401).json({
            message:"token not provided"
        })
    }

    const isTokenBlacklisted = await tokenBlacklistModel.findOne({
        token
    })

    if(isTokenBlacklisted){
        return res.status(401).json({
            message:"token is invalid "
        })
    }

    try {
        const decoded = jwt.verify(token , process.env.JWT_SECRET)

        req.user = decoded
        if (!req.user._id && req.user.id) {
            req.user._id = req.user.id
        }

        next()

    }catch (err){
        return res.status(401).json({
            message:"invalid token"
        })
    }
    

}

module.exports ={authUser}