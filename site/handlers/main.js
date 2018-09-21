//-------------------------------v14.8.0
const fs = require("fs"),
	  fortune = require('../lib/fortune.js');
exports.home = function(req, res) {
	res.render('home');
}
exports.cookieNewsletter = function(req, res) {
	return res.render("cookieNewsletter");
}
exports.cookieNewsletterPost = function(req, res) {
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
}
exports.jqupload = function(req, res) {
	res.render('jqupload', {
		layout: "test"
	});
}
exports.vacationPhoto = function(req, res) {
	let now = new Date();
	res.render('contest/vacation-photo', {
		year: now.getFullYear(),
		month: now.getMonth()
	});
}
const dataDir = __dirname + "/data",
	vacationPhotoDir = dataDir + "/vaction-photo";
	fs.existsSync(dataDir) || fs.mkdirSync(dataDir);
	fs.existsSync(vacationPhotoDir) || fs.mkdirSync(vacationPhotoDir);
function saveContestEntry(contestName, email, year, month, photoPath) {

}
exports.vacationPhotoYearMonth = function(req,res){
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
	form.parse(req,(err,fields,files)=>{
		if(err) return res.redirect(303,"/error");
		if(err){
			res.session.flash = {
				type : "danger",
				intro : "Oops!",
				message : "There was an error processing your submission."+"Pealase try again",
			};
			return res.redirect(303,"/contest/vacation-photo");
		};
		const photo = files.photo;
		const dir = vacationPhotoDir + "/" + Date.now();
		const path = dir + "/" + photo.name;
		fs.mkdirSync(dir);
		fs.renameSync(photo.path,dir + "/" + "photo.name");
		saveContestEntry("vaction-photo",fields.email,req.params.year,req.params.month,path);
		req.session.flash = {
			type : "success",
			intro :"Good luck!",
			message : "You have been entered into the contest.",
		}
		return res.redirect(303,"/contest/vaction-photo");
	})
}
exports.nurseryRhyme = function(req,res){
	res.render('nursery-rhyme',{layout:"test"});
}
exports.dataNurseryRhyme = function(req,res){
	res.json({
		animal : "squirrel",
		bodyPart : 'tail',
		adjective : 'bushy',
		noun : 'heck'
	});
}
exports.newsletter = function(req,res){
	res.render("newsletter",{csrf : 'CSRF token goes here'});
}
exports.process = function(req,res){
	console.log(req.query);
	console.log('Form(from querystring):'+req.query.form);
	console.log('CSRF token (from hidden form field:'+ req.body._csrf);
	console.log('Name (from visible from field):'+req.body.name);
	console.log('Email (from visible from field):'+req.body.email);
	console.log('Email (from visible form field):' + req.body.email);
	res.redirect(303,'/about');
}
exports.newsletterAjax = function(req,res){
	res.render("newsletterAjax",{layout : "test"})
}
exports.processAajx = function(req,res){
	if(req.xhr || req.accepts('json,html') == 'json'){
		//如果发生错误，应该发送{error : "error description"}
		res.send({success:true});
	}else{
		//如果发生错误,应该重定向到错误页面
		res.redirect(303,"/about")
	}
}
exports.about = function(req,res){//动态显示内容
//	let randomFortune = fortune[Math.floor(Math.random()*fortune.length)];
//	res.render("about",{fortune:fortune.getFortune()});
//------------------针对about页面的测试代码
	res.render('about',{
		fortune:fortune.getFortune(),
		pageTestScript:'/qa/tests-about.js'
	});
//-------------------
}
exports.hoodRiver = function(){
	res.render("tours/hood-river");
}
exports.requestGroupRate = function(){
	res.render("tours/request-group-rate");
}
//------------------------------------