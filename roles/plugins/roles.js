

function Roles( options )  {

  // 表
  const Table = 'roles';

  // 模式：测试
  this.add({service:Table, cmd:'ping'}, (msg, respond)=>{
    console.log(">>>>>> Service Roles Received Request!!!\n")

    respond(null, {response:"Roles Service", data:msg.data})
  })
}


module.exports = Roles