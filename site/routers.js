//---------------v14.8.0
const main = require("./handlers/main.js");
module.exports = function(app) {
	app.get('/', main.home);
	//------------v9.5.0
	app.get("/cookieNewsletter", main.cookieNewsletter);
	app.post("/cookieNewsletterPost", main.cookieNewsletterPost);
	//-------------
	//---------------v8.8.0jquery处理上传插件
	app.get('/jqupload', main.jqupload);
	//------------------
	//----------------v8.7.0处理上传的文件=======v13.1.0
	app.get('/contest/vacation-photo', main.vacationPhoto);
	app.post('/contest/vacation-photo/:year/:month', main.vacationPhotoYearMonth);
	//----------------------------
	//------------v7.4.9针对nursery rhyme页面和AJAX调用的路由处理程序
	app.get('/nursery-rhyme', main.nurseryRhyme);
	app.get('/data/nursery-rhyme', main.dataNurseryRhyme);
	//----------------
	//-------------v8.5.0
	app.get("/newsletter", main.newsletter);
	app.post("/process", main.process);
	//------------
	//--------------v8.6.0
	app.get('/newsletterAjax', main.newsletterAjax);
	app.post('/processAajx', main.processAajx);
	//----------------
	app.get('/about', main.about);
	//--------------v5.70：设置旅游线路路由及其引用页面的路由
	app.get("/tours/hood-river", main.hoodRiver);
	app.get("/tours/request-group-rate", main.requestGroupRate);
	//-------------
	//----------------自动化渲染视图v14.9.0
	app.use((req,res,next)=>{
		let path = req.path.toLowerCase();
		//检查缓存，如果它存在，渲染这个视图
		console.log(autoViews)
		if(autoViews[path]) return res.render(autoViews[path]);
		//如果不在缓存中，查看是否有.hanlebars文件能匹配
		if(fs.existsSync(__dirname + "/views" + path + ".hanlebars")){
			autoViews[path] = path.replace(/^\//,"");
			return res.render(autoViews[path]);
		}
		//没有发现视图，转到404
		next();
	})
}

//-------------------------