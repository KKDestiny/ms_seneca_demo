

function Roles( options )  {

  // 模式：测试
  this.add({service:'roles', cmd:'ping'}, (msg, respond)=>{
    console.log(">>>>>> Service Roles Received Request!!!\n")

    respond(null, {response:"Roles Service", data:msg.data})
  })
}


module.exports = Roles