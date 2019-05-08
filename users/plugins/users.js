

function Users( options )  {

  // 表
  const Table = 'users';

  // 模式：测试
  this.add({service:Table, cmd:'ping'}, (msg, respond)=>{
    console.log(">>>>>> Service Users Received Request!!!\n")
    
    respond(null, {response:"Users Service", data:msg.data})
  })
}


module.exports = Users