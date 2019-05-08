

require('seneca')()
  .use('./plugins/roles')
  .listen({port:3002, type:"http"})