
const Config = require('./../config');
const ServiceList = Config.ServiceList;


/**
 * 插件test
 * 用于测试访问各个微服务
 * @DateTime 2019-05-08
 */
function test(options) {
	this.add('service:test,path:ping', function (msg, respond) {
		var service = msg.args.params.service;
		var data = msg.args.query.data;

		// 检查是否有此服务
		if(!ServiceList[service]) {
			respond({err:"Sorry, service is not access!"}, null)
			return
		}

		this.act('service:'+service+',cmd:ping', {
			service:   service,
			data:  data,
		}, respond)
	})

	this.add('init:test', function (msg, respond) {
		this.act('role:web',{routes:{
			prefix: '/test',
			pin:    'service:test,path:*',
			map: {
				ping: { GET:true, suffix:'/:service' },
			}
		}}, respond)
	})
}


module.exports = test