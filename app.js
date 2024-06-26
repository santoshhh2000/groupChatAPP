const path=require('path');
const express=require('express');
const cors=require('cors');
const bodyParser=require('body-parser');
const sequelize=require('./util/database');
const User=require('./models/user');
const Message=require('./models/chatbox');
const Group=require('./models/group');
const User_Group=require('./models/usergroup');
const userRoute=require('./routes/user');
const chatRoute=require('./routes/chatbox');
const groupRoute=require('./routes/group');
const errorController=require('./controllers/error')


const app=express();
const server=require('http').createServer(app);
const io=require('socket.io')(server);

io.on('connection',socket=>{
    socket.on('send-message',(data)=>{
        io.emit('receive',data);
    })

    socket.on('remove-user',data=>{

        io.emit('remove-success',data);
    });
    socket.on('join-user',data=>{
        io.emit('join-success',data)

    })
    socket.on('showNewGroup',data=>{
        io.emit('display-success',data)

    });
    socket.on('newAdmin',data=>{
        io.emit('newAmin-success',data);
    });

    socket.on('delete-group',data=>{
        io.emit('delete-success',data)
    });
});

app.use(bodyParser.json({extended:false}));
app.use(express.static(path.join(__dirname,'public')));
app.use(cors());


app.use(userRoute);
app.use(groupRoute);
app.use(chatRoute);
app.use(errorController.get404Page);


User.hasMany(Message);
Message.belongsTo(User);
User.belongsToMany(Group,{through:User_Group});
Group.belongsToMany(User,{through:User_Group});
Group.hasMany(Message);
Message.belongsTo(Group);

const port=3000;
sequelize.sync()
server.listen(port)
console.log(`"http://localhost:${port}"`);



