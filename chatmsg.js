let token = localStorage.getItem('token');
let groupId = localStorage.getItem('groupId');
let userId=localStorage.getItem('userId');
let lastMsgId=0;
let socket=io();

window.addEventListener('DOMContentLoaded', async () => {
    try {
         
         const headingResp = await axios.get(`/group/heading-data/${groupId}`, { headers: { "Authorization": token } });
         document.getElementById('Groupchatheading').innerHTML = ` `;
         document.getElementById('chatbox').innerHTML=`Group: ${headingResp.data.groupName}`
         localStorage.setItem('userId',headingResp.data.userId);
        userId=headingResp.data.userId;


       const allMsgResp=await axios.get(`/all-messages/?groupId=${groupId}&lastMessageId=${lastMsgId}`);
  
      lastMsgId=allMsgResp.data[allMsgResp.data.length-1].id;

      allMsgResp.data.forEach((elem)=>{
        display(elem);
    });
 
        const allGroupMemberRes = await axios.get(`/userGroup/members/${groupId}`, { headers: { "Authorization": token } });
      
        allGroupMemberRes.data.forEach(element => {
            showgroupMembersOnScreen(element);

        });
        const adminsResp = await axios.get(`/group-admins/${groupId}`, { headers: { "Authorization": token } });
       
        adminsResp.data.forEach(element => {
            showgroupAdminsOnScreen(element);

        });
       

 
    
        


    }
    catch (err) {
       
        alert(err.response.data.message);
    }
});

async function showgroupMembersOnScreen(data) {
    let parent1 = document.getElementById('members');
    let child1 = `<li  id=${data.id} class="mt-1"><span class="fw-bold fst-italic">${data.name} </span><button class="btn btn-outline-primary btn-sm" onclick=makeAdmin('${data.id}') >Make Admin</button><button class=" btn btn-outline-danger btn-sm" onclick=removeUser('${data.id}')>Remove</button></li>`
    if (child1) {

        parent1.innerHTML += child1;
    }
        

};
async function showgroupAdminsOnScreen(data) {
    let parent2 = document.getElementById('admins');
    let child2 = `<li id=${data.id}>${data.name}</li>`
    if (child2) {

        parent2.innerHTML += child2;
    }

}
async function makeAdmin(userId) {
    try {
        const details = {
            userId: userId,
            groupId: groupId
        }

        const makeAdminResp = await axios.post('/make-admin', details, { headers: { "Authorization": token } });

        socket.emit('newAdmin',makeAdminResp.data);


    }
    catch (err) {
        alert(err.response.data.message);

    }

}
socket.on('newAmin-success',data=>{
    let parent5 = document.getElementById('members');
    let child5 = document.getElementById(data.id);
    parent5.removeChild(child5);
    
    showgroupAdminsOnScreen(data);

 });


async function removeUser(userId) {
    try {
        const details = {
            userId: userId,
            groupId: groupId
        }

        const removeRes = await axios.post('/remove-user', details, { headers: { "Authorization": token } });

       
       
       
        socket.emit('remove-user',details);
        


    }
    catch (err) {
        alert(err.response.data.message)

    }
}

socket.on('remove-success',data=>{
    if(data.groupId==groupId){

        let parent3 = document.getElementById('members');
        let child3 = document.getElementById(data.userId);
    
        parent3.removeChild(child3);
        
    }
})



document.getElementById('send').onclick = async function (e) {
    e.preventDefault();
    try {
        const messageDetails = {
            message: document.getElementById('textArea').value,
            userId: Number(userId),
            groupId:Number(groupId)  

        }
        const postResp = await axios.post('/user/message', messageDetails, { headers: { "Authorization": token } });
      
      
        document.getElementById('textArea').value="";

    
        socket.emit('send-message',(groupId));


       

    }
    catch (err) {
       
        alert(err.response.data.message);
    }

}


socket.on('receive', async(data)=>{
   
    try{
       
        if(groupId===data){
            const newMessages= await axios.get(`/new-messages/?groupId=${groupId}&lastMsgId=${lastMsgId}`);
           
            lastMsgId=newMessages.data[newMessages.data.length-1].id; 
           
            newMessages.data.forEach((elem)=>{
                display(elem);
            });
            
    
        }
    }
    catch(err){
        alert('something went wrong!!!')
    }

})

function display(data){
    if(data.id!==0){
        let parentNode=document.querySelector('#box');
        
        if(data.userId==userId){
            let childNode2=`<div class="right message" id=${data.id}><span class="fw-bold">${data.senderName}:</span> <span class="fst-italic">${data.message}</span></div>`;
            parentNode.innerHTML+=childNode2;
           
        }else{
            let childNode1=`<div class="left message" id=${data.id}><span class="fw-bold">${data.senderName}:</span> <span class="fst-italic">${data.message}</span></div>`;

            parentNode.innerHTML+=childNode1;

        }
        

    }
}



socket.on('join-success',async data=>{
    console.log("join-->",data)
    const userId=Number(data.userId);
    const groupId=Number(data.groupId);
    try{
           if(groupId==localStorage.getItem('groupId')){
               const joinedMember=await axios.get(`/joined-new-member/?userId=${userId}&groupId=${groupId}`);
               console.log('n u details-->',joinedMember.data)
               let parentN = document.getElementById('members');
               let childN = `<li id=${joinedMember.data.id}>${joinedMember.data.name} <button class="btn btn-outline-primary btn-sm" onclick=makeAdmin('${joinedMember.data.id}') >Make Admin</button><button class="ms-1 btn btn-outline-danger btn-sm" onclick=removeUser('${joinedMember.data.id}')>Remove</button></li>`
               if (childN) {
           
                   parentN.innerHTML += childN;
               }
       
           }
        
       }
       catch(err){
        console.log(err);
       }
       

       
});









