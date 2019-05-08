// 全局定义
const Protocol = 'http';

// 服务列表
const ServiceList = {
	users : {
		name : "users",
		port : 3001,
	},
	roles : {
		name : "roles",
		port : 3002,
	},
	articles : {
		name : "articles",
		port : 3003,
	},
};


const Config = function(){};

Config.prototype.Protocol = Protocol;
Config.prototype.ServiceList = ServiceList;


module.exports = new Config();