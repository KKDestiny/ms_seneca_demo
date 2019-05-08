var SenecaWeb = require('seneca-web')
var Express = require('express')
var Router = Express.Router
var context = new Router()

var senecaWebConfig = {
      context: context,
      adapter: require('seneca-web-adapter-express'),
      options: { parseBody: false } // so we can use body-parser
}

var app = Express()
      .use( require('body-parser').json() )
      .use( context )
      .listen(3000)


// 获取配置信息
const Config = require('./config');
const Protocol = Config.Protocol;
const ServiceList = Config.ServiceList;


// 启用Seneca
var seneca = require('seneca')()
      .use(SenecaWeb, senecaWebConfig )
      .use('./plugins/test')
      .use('./plugins/ui')
      .client( { type:Protocol, pin:'service:'+ServiceList.users.name, port:ServiceList.users.port} )
      .client( { type:Protocol, pin:'service:'+ServiceList.roles.name, port:ServiceList.roles.port} )
      .client( { type:Protocol, pin:'service:'+ServiceList.articles.name, port:ServiceList.articles.port} )

