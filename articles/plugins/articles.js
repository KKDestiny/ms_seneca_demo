

function Articles( options )  {

  // 表
  const Table = 'articles';

  // 模式：测试
  this.add({service:Table, cmd:'ping'}, (msg, respond)=>{
    console.log(">>>>>> Service Articles Received Request!!!\n")
    
    respond(null, {response:"Articles Service", data:msg.data})
  })
}


module.exports = Articles