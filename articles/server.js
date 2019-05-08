

require('seneca')()
  .use('./plugins/articles')
  .listen({port:3003, type:"http"})