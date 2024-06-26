const path = require('path');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const User = require('../models/user');
const Message=require('../models/chatbox');
const Group=require('../models/group');
const User_Group=require('../models/usergroup')




function invalidInput(input) {
    if (input === undefined || input.length === 0) {
         return true;
    }
    else {
         return false;
    }
}
exports.groupMessagePage=async(req,res,next)=>{
    res.sendFile(path.join(__dirname,'..','views','chatFrontend.html'));
};

exports.getHeadingData=async (req,res,next)=>{
    try{
        const {groupId}=req.params;
        const groupDetails=await Group.findByPk(groupId);
        const groupName=groupDetails.nameOfGroup;
        res.status(200).json({groupName:groupName,userName:req.user.name,userId:req.user.id})
    }
    catch(err){
        res.status(500).json({message:'Heading: something went wrong'});

    }
}


exports.getMessages=async(req,res,next)=>{
    try{
        const {groupId}=req.query;
        const messages=await Message.findAll({where:{
            groupId:groupId
        }});
        let dummy=[{id:0}];
       if(messages.length===0){
        res.status(200).json(dummy);
       }
        else if( messages.length>0 && messages.length<11){
            res.status(200).json(messages);
        }
        else if (messages.length>=11){
            res.status(200).json(messages.slice((messages.length-10),messages.length));
        }      
    }
    catch(err){
        res.status(500).json({message:'Get Messages: something went wrong'});

    }
}
exports.postMessages=async (req,res,next)=>{
    try{
        const {message,userId,groupId}=req.body;
        const isIngroup=await User_Group.findOne({where:{
            userId:userId,
            groupId:groupId
        }});

        if(isIngroup){
            if(invalidInput(message)){
                return res.status(404).json({ message: "Post Message: Message field can't be empty!", success: false });
        
            }

            const saveToDb=await Message.create({
                message:message,
                senderName:req.user.name,
                userId:userId,
                groupId:groupId
    
            });
            res.status(201).json(saveToDb);
        }
        else{
            return res.status(403).json({ message: "Post Message: unothorized!", success: false });

        }


    }
    catch(err){
        res.status(500).json({ message: "Post Message: something went wrong", success: false });


    }
}



exports.getNewMessages=async(req,res,next)=>{
    try{
        const {lastMsgId,groupId}=req.query;
       
    
        let newmsg=await Message.findAll({where: {
            id: {
              [Op.gt]: lastMsgId 
            },
            groupId:groupId

          }
        });
       
        res.status(200).json(newmsg);
    }
    catch(err){
        res.status(500).json({ message: "something went wrong", success: false });

    }



   
}

