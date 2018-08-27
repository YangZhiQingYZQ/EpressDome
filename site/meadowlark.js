let express = require("express"),
	app = express(),
	fortune = require('./lib/fortune.js'),
//-----------创建视图引擎，对Express进行配置，将其作为默认的视图引擎
	handlebars = require("express3-handlebars").create({
		defaultLayout:"main",
		//------ v7.4.7
		helpers : {
			section : function(name,options){
				if(!this._sections) this._sections = {}
				this._sections[name] = options.fn(this);
				return null;
			}
		}
		//--------
	});
app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');
//------------

//----v8.5.0(使用表单中间件)
app.use(require('body-parser')());
//-----

//------------v7.4.6局部文件
function getWeatherData(){
	return {
		locations : [
			{
				name : 'Portland',
				forecastUrl : "http://www.wunderground.com/US/OR/Portland.html",
				iconUrl : "http://icons-ak.wxug.com/i/c/k/cloudy.gif",
				weather : 'Overcast',
				temp:'54.1 F (12.3C)',
			},
			{
				name : "Bend",
				forecastUrl : "http://www.wunderground.com/US/OR/Bend.html",
				iconUrl: "http://icons-ak.wxug.com/i/c/k/partlycloudy.gif",
				weather:'Partly Cloudy',
				temp : "55.0 F (12.8 C)",
			},
			{
				name : 'Manzanita',
				forecastUrl : 'http://www.wunderground.com/US/OR/Manzanita.html',
				iconUrl : "http://icons-ak.wxug.com/i/c/k/rain.gif",
				weather:'Light Rain',
				temp:"55.0 F (12.8 C)"
			}
		]
	}
}
//创建中间件,给res.locals.partials对象添加数据
app.use((req,res,next)=>{
	if(!res.locals.partials) res.locals.partials = {};
	res.locals.partials.weather = getWeatherData();
	next();
})
//-------------



//----------检测查询字符串的中间件
app.use((req,res,next)=>{
	res.locals.showTests = app.get('env') !== 'production' && req.query.test === "1";
	next();
});
//--------------

//--------------v7.4.3服务器端模板：启用视图缓存
app.set("view cache",true);
//--------------

//-----------v-6.4.0禁用Express的X-Powered-By头信息（因为这里可以让黑客攻击）
//返回的时候包含了框架的名称（测试看到的，但是可能不准确）
app.disable("x-powered-by");
//---------------

//-----------v-6.3.0请求报头：查看浏览器发送的信息
app.get('/headers',(req,res)=>{
	res.set("Content-Type","text/plain");
	let s = "";
	for(let name in req.headers){
		s += `${name}:${req.headers[name]}\n`;
	};
	res.send(s);
});
//----------------------




//static中间件（将一个或多个目录指派包含静态资源的目录，其中的资源不经过任何特殊处理直接发送到客户端）
//相当于给你想要发送的所有静态文件创建了一个路由，并发送给客户端
app.use(express.static(__dirname+"/public"));

app.set('port',process.env.PORT ||3000);//设置端口

app.get('/',(req,res)=>{
	res.render('home');
});

//------------v7.4.9针对nursery rhyme页面和AJAX调用的路由处理程序
app.get('/nursery-rhyme',(req,res)=>{
	res.render('nursery-rhyme',{layout:"test"});
});
app.get('/data/nursery-rhyme',(req,res)=>{
	res.json({
		animal : "squirrel",
		bodyPart : 'tail',
		adjective : 'bushy',
		noun : 'heck'
	});
});
//----------------

//-------------v8.5.0
app.get("/newsletter",(req,res)=>{
	res.render("newsletter",{csrf : 'CSRF token goes here'});
});
app.post("/process",(req,res)=>{
	console.log(req.query);
	console.log('Form(from querystring):'+req.query.form);
	console.log('CSRF token (from hidden form field:'+ req.body._csrf);
	console.log('Name (from visible from field):'+req.body.name);
	console.log('Email (from visible from field):'+req.body.email);
	console.log('Email (from visible form field):' + req.body.email);
	res.redirect(303,'/about');
});
//------------

//--------------v8.6.0
app.get('/newsletterAjax',(req,res)=>{
	res.render("newsletterAjax",{layout : "test"})
});
app.post('/processAajx',(req,res)=>{
	if(req.xhr || req.accepts('json,html') == 'json'){
		//如果发生错误，应该发送{error : "error description"}
		res.send({success:true});
	}else{
		//如果发生错误,应该重定向到错误页面
		res.redirect(303,"/about")
	}
});
//----------------

app.get('/about',(req,res)=>{//动态显示内容
//	let randomFortune = fortune[Math.floor(Math.random()*fortune.length)];
//	res.render("about",{fortune:fortune.getFortune()});
//------------------针对about页面的测试代码
	res.render('about',{
		fortune:fortune.getFortune(),
		pageTestScript:'/qa/tests-about.js'
	});
//-------------------
});

//--------------v5.70：设置旅游线路路由及其引用页面的路由
app.get("/tours/hood-river",()=>{
	res.render("tours/hood-river");
});
app.get("/tours/request-group-rate",()=>{
	res.render("tours/request-group-rate");
});
//-------------

//404 catch-all处理器（中间件）
app.use((req,res,next)=>{
	res.status(404);
	res.render("404");
});
//500错误处理器（中间件）
app.use((err,req,res,next)=>{
	console.error(err.stack);
	res.status(500);
	res.render("500");
});


app.listen(app.get('port'),()=>{
	console.log("Express started on http://localhost:"+app.get("port")+";press Ctrl-C to terminate.");
});
