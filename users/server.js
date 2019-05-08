

require('seneca')()
  .use('./plugins/users')
  .listen({port:3001, type:"http"})