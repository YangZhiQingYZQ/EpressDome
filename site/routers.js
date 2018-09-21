module.exports = function(app,express) {
	const 	vhost = require("vhost"),
			fs = require("fs"),
			fortune = require('./lib/fortune.js');
	//-------------------v14.2.0子域名
	const admin = express.Router();
	app.use(vhost("admin.*", admin));

	admin.get("/", (req, res) => {
		res.render("about");
	});

	//------------------------

	app.get('/', (req, res) => {
		res.render('home');
	});

	//------------v9.5.0
	app.get("/cookieNewsletter", (req, res) => {
		return res.render("cookieNewsletter");
	})
	app.post("/cookieNewsletterPost", (req, res) => {
		let name = req.body.name || "",
			email = req.body.email || "";
		if(!email.match("VALID_EMAIL_REGEX")) { //输入验证
			req.session.flash = {
				type: 'danger',
				intro: "Validation error!",
				message: "The email address you entered was not valid.",
			};
			return res.redirect(303, "/about")
		};
		new NewsletterSigup({
			name: name,
			email: email
		}).save((err) => {
			if(err) {
				if(req.xhr) return res.json({
					error: "Database error."
				});
				req.session.flash = {
					type: "danger",
					intro: "Database error!",
					message: "There was a datadase error;please try again later.",
				}
				return res.redirect(303, "/about");
			}
			if(req.xhr) return res.json({
				success: true
			});
			req.session.flash = {
				type: "success",
				intro: "Thank you!",
				message: "You have now been signed up for the newsletter.",
			}
			return res.redirect(303, "/about");
		})
	});
	//-------------

	//---------------v8.8.0jquery处理上传插件
	app.get('/jqupload', (req, res) => {
		res.render('jqupload', {
			layout: "test"
		});
	});
	//------------------

	//----------------v8.7.0处理上传的文件=======v13.1.0
	app.get('/contest/vacation-photo', (req, res) => {
		let now = new Date();
		res.render('contest/vacation-photo', {
			year: now.getFullYear(),
			month: now.getMonth()
		});
	});

	const dataDir = __dirname + "/data",
		vacationPhotoDir = dataDir + "/vaction-photo";
	fs.existsSync(dataDir) || fs.mkdirSync(dataDir);
	fs.existsSync(vacationPhotoDir) || fs.mkdirSync(vacationPhotoDir);

	function saveContestEntry(contestName, email, year, month, photoPath) {

	}

	app.post('/contest/vacation-photo/:year/:month', (req, res) => {
		//	let form = new formidable.IncomingForm();
		//	form.parse(req,(err,fields,file)=>{
		//		if(err) return res.redirect(303,'/about');
		//		console.log('received fields:');
		//		console.log(fields);
		//		console.log('received files:');
		//		console.log(files);
		//		res.redirect(303,"/about");
		//	})
		const form = new formidable.IncomingFrom();
		form.parse(req, (err, fields, files) => {
			if(err) return res.redirect(303, "/error");
			if(err) {
				res.session.flash = {
					type: "danger",
					intro: "Oops!",
					message: "There was an error processing your submission." + "Pealase try again",
				};
				return res.redirect(303, "/contest/vacation-photo");
			};
			const photo = files.photo;
			const dir = vacationPhotoDir + "/" + Date.now();
			const path = dir + "/" + photo.name;
			fs.mkdirSync(dir);
			fs.renameSync(photo.path, dir + "/" + "photo.name");
			saveContestEntry("vaction-photo", fields.email, req.params.year, req.params.month, path);
			req.session.flash = {
				type: "success",
				intro: "Good luck!",
				message: "You have been entered into the contest.",
			}
			return res.redirect(303, "/contest/vaction-photo");
		})
	});
	//----------------------------

	//------------v7.4.9针对nursery rhyme页面和AJAX调用的路由处理程序
	app.get('/nursery-rhyme', (req, res) => {
		res.render('nursery-rhyme', {
			layout: "test"
		});
	});
	app.get('/data/nursery-rhyme', (req, res) => {
		res.json({
			animal: "squirrel",
			bodyPart: 'tail',
			adjective: 'bushy',
			noun: 'heck'
		});
	});
	//----------------

	//-------------v8.5.0
	app.get("/newsletter", (req, res) => {
		res.render("newsletter", {
			csrf: 'CSRF token goes here'
		});
	});
	app.post("/process", (req, res) => {
		console.log(req.query);
		console.log('Form(from querystring):' + req.query.form);
		console.log('CSRF token (from hidden form field:' + req.body._csrf);
		console.log('Name (from visible from field):' + req.body.name);
		console.log('Email (from visible from field):' + req.body.email);
		console.log('Email (from visible form field):' + req.body.email);
		res.redirect(303, '/about');
	});
	//------------

	//--------------v8.6.0
	app.get('/newsletterAjax', (req, res) => {
		res.render("newsletterAjax", {
			layout: "test"
		})
	});
	app.post('/processAajx', (req, res) => {
		if(req.xhr || req.accepts('json,html') == 'json') {
			//如果发生错误，应该发送{error : "error description"}
			res.send({
				success: true
			});
		} else {
			//如果发生错误,应该重定向到错误页面
			res.redirect(303, "/about")
		}
	});
	//----------------

	app.get('/about', (req, res) => { //动态显示内容
		//	let randomFortune = fortune[Math.floor(Math.random()*fortune.length)];
		//	res.render("about",{fortune:fortune.getFortune()});
		//------------------针对about页面的测试代码
		res.render('about', {
			fortune: fortune.getFortune(),
			pageTestScript: '/qa/tests-about.js'
		});
		//-------------------
	});

	//--------------v5.70：设置旅游线路路由及其引用页面的路由
	app.get("/tours/hood-river", () => {
		res.render("tours/hood-river");
	});
	app.get("/tours/request-group-rate", () => {
		res.render("tours/request-group-rate");
	});
	//-------------

	//404 catch-all处理器（中间件）
	app.use((req, res, next) => {
		res.status(404);
		res.render("404");
	});
	//500错误处理器（中间件）
	app.use((err, req, res, next) => {
		console.error(err.stack);
		res.status(500).render("500");
	});

}