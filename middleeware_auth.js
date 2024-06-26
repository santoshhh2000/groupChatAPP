const jwt=require('jsonwebtoken');
const User=require('../models/user');
const dotenv=require('dotenv');
dotenv.config();

const authenticate=async(req,res,next)=>{

    try{
        const token=req.header('Authorization');
        const user=jwt.verify(token,"santosh");

        User.findByPk(user.userId).then(user=>{
            req.user=user;
            next();
        })

    }
    catch(err){
        return res.status(401).json({success:false});

    }
}

module.exports=authenticate;