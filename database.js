const { Sequelize } = require("sequelize");
const sequelize=new Sequelize('group_chat','root','Root@123',{
    dialect:'mysql',
    host: 'localhost'
});

module.exports=sequelize;