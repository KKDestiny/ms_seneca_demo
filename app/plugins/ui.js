/**
 * 插件ui
 * 用于显示UI
 * @DateTime 2019-05-08
 */
function ui(options) {
	this.add('service:ui,path:home', function (msg, respond) {
		var service = msg.args.params.service;
		var data = msg.args.query.data;

		respond({msg:"This is home page"})
	})

	this.add('init:ui', function (msg, respond) {
		this.act('role:web',{routes:{
			prefix: '/',
			pin:    'service:ui,path:*',
			map: {
				home: { GET:true },
			}
		}}, respond)
	})
}



module.exports = ui