

function Articles( options )  {

  // 模式：测试
  this.add({service:'articles', cmd:'ping'}, (msg, respond)=>{
    console.log(">>>>>> Service Articles Received Request!!!\n")
    
    respond(null, {response:"Articles Service", data:msg.data})
  })
}


module.exports = Articles