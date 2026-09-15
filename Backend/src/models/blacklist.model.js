const mongoose = require ("mongoose")
const { applyTimestamps } = require("./user.model")

const blackListingTokenSchema =new mongoose.Schema({
    token : {
        type:String, 
        required:true
    }
}, {
        timestamps:true
    }
)

const tokenBlacklistModel = mongoose.model("blacklistTokens",blackListingTokenSchema)

module.exports = tokenBlacklistModel