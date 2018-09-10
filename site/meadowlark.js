let express = require("express"),
	app = express(),
	fortune = require('./lib/fortune.js'),
	cartValidation = require("./lib/cartValidations.js"),
	credentials = require('./credentials.js'),//v9.1.0cookie秘钥
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
	}),
	nodemailer = require("nodemailer"),//v11.6.0
	mailTransport = nodemailer.createTransport({//v11.6.0
		host : "smtp.163.com",
		// service : "Gmail",
		secureConnection:true,
		auth : {
			user : credentials["163"].user,
			pass : credentials["163"].password,
		}
	}),
	formidable = require('formidable'),//v8.7.0加载处理上传文件的插件
	jqupload = require('jquery-file-upload-middleware');//v8.8.0加载处理上传文件的jquery插件
	
app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');
//------------
//--------------11.6.1
mailTransport.sendMail({//发送单个邮件
	from : '"Meadowalrk Traval"<m18620309063@163.com>',
	to : "493583130@qq.com",
	subject:"Your Meadowlark Traval Tour",
	text: "Thank you for booking your trip whit Meadowlark Travl."+"We look forward to your visit!",
},function(err){
	if(err) console.error("Unable to send emaile:"+err);
});

//---------------

//---------------v11.6.2
mailTransport.sendMail({//发送多封邮件
	from : "'Meadowlark Travel'<m18620309063@163.com>",
	to:"493583130@qq.com,18620309063@163.com",
	subject : "Your Meadowlark Travel Tour",
	text : "Thank you for booking your trip with Meadowlark Travel"
},(err)=>{
	if(err) console.log('Unable to send email:'+err);
})
//-----------------

//---------------v10.0.0
app.use(require("./lib/tourRequiresWaiver.js"));
app.use(cartValidation.checkWaivers);
app.use(cartValidation.checkGuestCounts);
//-------------------

//-------------v11.8.0
mailTransport.sendMail({//同时发送html和text邮件
	from : '"Meadowlark Travel',
	to : '493583130@qq.com',
	subject : "Your Meadowlark Travel Tour",
	html:"<h1>1231</h1>",
	genrateTextFromHtml : true
},(err)=>{
	if(err) console.log("Unable to send Email:" + err);
});
//------------------


//------------v9.2.0引入并使用cookie-parser中间件
app.use(require('cookie-parser')(credentials.cookieSecret));
//使用方式
// res.cookie("monster",nom nom);
// res.cookie("signed_monster","nom nom",{signed : true});
//----------------

//------------v9.4.1引入并使用express-session中间件
app.use(require('express-session')());
//---------------

//-------------v9.5.0
app.use((req,res,next)=>{
	//如果有即显消息，把它传到上下文中，然后清楚它
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	next();
});
//-----------------

//----------------v8.8.8（使用jquery处理上传插件）
app.use('/upload',(req,res)=>{
	let now = Date.now();
	jpupload.fileHandler({
		uploadDir(){
			return __dirname + '/public/uploads/'+now;
		},
		uploadUrl(){
			return "/uploads/"+now;
		}
	})(req,res,next);
});
//------------------

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

//------------v9.5.0
app.get("/cookieNewsletter",(req,res)=>{
	return res.render("cookieNewsletter");
})
app.post("/cookieNewsletterPost",(req,res)=>{
	let name = req.body.name || "",
		email = req.body.email || "";
	if(!email.match("VALID_EMAIL_REGEX")){//输入验证
		req.session.flash = {
			type : 'danger',
			intro : "Validation error!",
			message : "The email address you entered was not valid.",
		};
		return res.redirect(303,"/about")
	};
	new NewsletterSigup({name : name ,email:email}).save((err)=>{
		if(err){
			if(req.xhr) return res.json({error : "Database error."});
			req.session.flash = {
				type : "danger",
				intro : "Database error!",
				message : "There was a datadase error;please try again later.",
			}
			return res.redirect(303,"/about");
		}
		if(req.xhr) return res.json({success : true});
		req.session.flash = {
			type : "success",
			intro : "Thank you!",
			message : "You have now been signed up for the newsletter.",
		}
		return res.redirect(303,"/about");
	})
});
//-------------

//---------------v8.8.0jquery处理上传插件
app.get('/jqupload',(req,res)=>{
	res.render('jqupload',{layout:"test"});
});
//------------------

//----------------v8.7.0处理上传的文件
app.get('/contest/vacation-photo',(req,res)=>{
	let now  = new Date();
	res.render('contest/vacation-photo',{
		year : now.getFullYear(),
		month : now.getMonth()
	});
});
app.post('/contest/vacation-photo/:year/:month',(req,res)=>{
	let form = new formidable.IncomingForm();
	form.parse(req,(err,fields,file)=>{
		if(err) return res.redirect(303,'/about');
		console.log('received fields:');
		console.log(fields);
		console.log('received files:');
		console.log(files);
		res.redirect(303,"/about");
	})
});
//----------------------------

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
