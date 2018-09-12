//v11.8.3封装邮件功能
let nodemailer = require("nodemailer");
module.exports = (credentials)=>{
	let mailTransoport = nodemailer.createTransport({
		host : "smtp.163.com",
		// service : "Gmail",
		secureConnection:true,
		auth : {
			user : credentials["163"].user,
			pass : credentials["163"].password,
		}
	});
	let from = '"Meadowlark Travel"';
	let errorRecipient = '493583130@qq.com';
	return {
		send(to,suj,body){
			mailTransoport.sendMail({
				from : from,
				to : to,
				subject : suj,
				html : body,
				generateTextFromHtml :true				
			},(err)=>{
				if(err) console.error("Unable to send email:"+err);
			});
		},
		emailError(message,filename,exception){
			let body = "<h1>Meadowlark Travel site Error</h1>";
			if(exception) body += 'exception:<br><pre>'+exception+"</pre><br>";
			if(filename) body += "filename:<br><pre>"+filename+"</pre><br>";
			mailTransoport.sendMail({
				from :from,
				to : errorRecipient,
				subject :"Meadowlark Travel Site Error",
				html:body,
				generateTextFromHtml:true
			},err=>{
				if(err) console.error("Unable to sen Email:"+err);
			})
		}
	}
}
