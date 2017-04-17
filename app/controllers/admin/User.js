var express = require('express'),
 nodemailer = require('nodemailer'),
 passport=require('passport');
  router = express.Router(),
  mongoose = require('mongoose'),
  md5=require('md5');
  post = mongoose.model('Post');
  User=mongoose.model('User');
  Category=mongoose.model('Category');

module.exports = function (app) {
  app.use('/admin', router);
};
//权限校验
module.exports.requireLogin = function (req, res, next) {
    if (req.user) {
        next();
    } else {
        req.flash('error', '只有登录用户才能访问');
        res.redirect('/admin/users/login');
    }
};
router.get('/', function (req, res, next) {
  res.redirect('/admin/users/login');
});
router.get('/users/login',function(req,res,next){
  res.render('admin/user/login',{
  	title:'user login',
  	pretty:true
  });
});
router.get('/users/loginout',function(req,res,next){
   req.logout();
   res.redirect('/posts/');
});
router.post('/users/login',passport.authenticate('local', { failureRedirect: '/admin/users/login' }),function(req,res,next){
  res.redirect('/admin/posts');
  
});
router.get('/users/register',function(req,res,next){
  res.render('admin/user/register',{
  	title:'user register',
  	pretty:true
  });
});
// 生成随机4-6的验证码
   function  dataRandom(){
     var arr=[];
     for(var i=0;i<4;i++){
       var RandomItem=parseInt(Math.ceil(Math.random()*10));
       arr.push(RandomItem);
     }
     return arr.join('');
   }

//发送注册的用户邮件验证
      function sendEmail(verificationCode,emailAdress){
		          var transporter = nodemailer.createTransport({
				  //https://github.com/andris9/nodemailer-wellknown#supported-services 支持列表
				  service: 'qq',
				  port: 465, // SMTP 端口
				  secureConnection: true, // 使用 SSL
				  auth: {
				    user: '1302151931@qq.com',
				    //这里密码不是qq密码，是你设置的smtp密码
				    pass: 'paecdbajmovohdha'
				  }
				     });
                 //参数
					var mailOptions = {
						  from: '1302151931@qq.com', // 发件地址
						  to: emailAdress, // 收件列表
						  subject: 'Hello sir blog verificationCode ', // 标题
						  //text和html两者只支持一种
						  text: 'Hello sir blog verificationCode,欢迎使用心语为提供的博客系统，你的验证码:'+verificationCode,
						  // html: '<b>Hello world @xinyu</b> ' // html 内容
					};
					// send mail with defined transport object
					transporter.sendMail(mailOptions, function(error, info){
					  if(error){
					    return console.log(error);
					  }
					  console.log('Message sent: ' + info.response);
					}); 
			   
    }
    //生成随机的验证码
     var verificationCode=dataRandom();

router.post('/users/register',function(req,res,next){
	   var Useremail=req.body.email;
	   var Username=req.body.name;
	   var Userpassword=req.body.password;
	   var VCode=req.body.verification;
	   console.log(verificationCode+"------------------------------------"+VCode);
	     if(verificationCode==VCode){
	             var user =new User({
		     	name:Username,
		     	email:Useremail,
		     	password:md5(Userpassword),
		     	created:new Date()
		     });
		    user.save(function(err,user){
	              if(err){
	                req.flash('error','用户注册失败！请联系Administrator');
	                res.redirect('/admin/users/register');
	              }else{
	              	req.flash('error','注册成功！');
	                res.redirect('/admin/users/login');
	              }
		    });
	     }else{
	     	req.flash('error','您的验证码不正确!');
            res.redirect('/admin/users/register');
	     }
	            
});
router.get('/users/email',function(req,res,next){
     
      sendEmail(verificationCode,req.query.emails);
      res.send('验证码已发送您的邮箱,请注意查收!');
      res.end();
  
});
