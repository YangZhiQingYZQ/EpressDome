//适合于动态路由，路由数据从数据库或JSON文件中获取；
class Rout {
	constructor(method,path,callBack){
		this.method = method;
		this.path = path;
		this.callBack = callBack;
	}
}
module.exports = function(){
	const routers = [];
	routers.push(new Rout("get","/",(req,res)=>{res.render("home")}));
	return routers;
}
