const path = require('path');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt=require('jsonwebtoken');
const dotenv=require('dotenv');
dotenv.config();



function generateAccessToken(id, name) {
     return jwt.sign({ userId: id, name: name }, "santosh");
 }

function invalidInput(input) {
     if (input === undefined || input.length === 0) {
          return true;
     }
     else {
          return false;
     }
}
exports.getSignupPage = (req, res, next) => {
     res.status(200).sendFile(path.join(__dirname, "..", "views", "signup.html"));
}
exports.postUserDetails = (req, res, next) => {

     const { name, email, phone, password } = req.body;
     if (invalidInput(name) || invalidInput(email) || invalidInput(password) || invalidInput(phone)) {
          return res.status(400).json({ message: 'input can not be empty or undefined' });
     }
     else{

          bcrypt.hash(password, 10, async (err, hash) => {
               try {

                         const user = await User.create({
                              name: name,
                              email: email,
                              phone: phone,
                              password: hash
                         });
                         res.status(201).json({ message: 'user is created successfully', success: true })
                   
     
               }
               catch (err) {
                    console.log("err post=>",err)
                    res.status(500).json({ message: "email id or phone number is already exist,Please Login", success: false });
     
               }
     
          })
     }


};
exports.getLoginPage=(req,res,next)=>{
     res.status(200).sendFile(path.join(__dirname, "..", "views", "login.html"));

}
exports.postLoginDetails=async(req,res,next)=>{
     try {

          const email = req.body.email;
          const password = req.body.password;
          if (invalidInput(email) || invalidInput(password)) {
              return res.status(400).json({ message: 'input can not be empty or undefined' })
          }
          const user = await User.findAll({ where: { email: email } });
          if (user.length > 0) {
              bcrypt.compare(password, user[0].password, (err, result) => {
                  if (err) {
                      res.status(500).json({ success: false, message: 'something went wrong!' })
  
                  }
                  if (result === true) {
                      res.status(200).json({ success: true, message: 'Logged in successful', token: generateAccessToken(user[0].id, user[0].name),userId:user[0].id })
                  }
                  else {
                      return res.status(400).json({ success: false, message: 'Incorrect Password! Please refresh the page and Enter again' })
  
                  }
              });
          }
          else {
              return res.status(404).json({ success: false, message: 'user does not exist' })
  
          }
      }
  
      catch (err) {
          res.status(500).json({ message: err, success: false })
      }
     
}




