

function Users( options )  {

  // 模式：测试
  this.add({service:'users', cmd:'ping'}, (msg, respond)=>{
    console.log(">>>>>> Service Users Received Request!!!\n")
    
    respond(null, {response:"Users Service", data:msg.data})
  })
}


module.exports = Users