//所有用户的操作
var User = require('../models/user')


//注册页面
exports.showSignup = function(req,res){
	res.render('signup',{
		title:'注册页面'
	})
}
//登录页面
exports.showSignin = function(req,res){
	res.render('signin',{
		title:'登录页面'
	})
}

// signup 注册
exports.signup = function(req, res) {
  var _user = req.body.user

  User.findOne({name: _user.name},  function(err, user) {
    if (err) {
      console.log(err)
    }

    if (user) {
      return res.redirect('/signin')
    }
    else {
      user = new User(_user)
      user.save(function(err, user) {
        if (err) {
          console.log(err)
        }

        res.redirect('/')
      })
    }
  })
}




//用户列表页 userlist page  访问：http://localhost:3000/admin/list
exports.list = function(req,res){
	// var _user = req.session.user
	// if(!_user){
	// 	return res.redirect('/signin')
	// }			
	User.fetch(function(err,users){
		if(err){
			console.log(err)
		}

		res.render('userlist',{
			title:'Movies 用户列表页',
			users: users
		})
	})
	

}

// signin 登录
exports.signin = function(req,res){
	var _user = req.body.user
	var name = _user.name
	var password = _user.password

	User.findOne({name:name}, function(err,user){
		if(err){
			console.log(err)
		}
		if(!user){
			//用户不存在
			return res.redirect('/signup')
		}
		//此方法是模式schemas/user.js中定义的，验证密码是否正确
		user.comparePassword(password, function(err,isMatch){
			if(err){
				console.log(err)
			}
			if(isMatch){
				//保存用户登录状态
				req.session.user = user
				// console.log('Password is matched!')
				return res.redirect('/')
			}else{
				return res.redirect('/signin')
			}
		})
	})

}

//登出
exports.logout = function(req,res){
	//删除session
	delete req.session.user
	// delete app.locals.user
	res.redirect('/')
}

//midware signinRequired 定义中间件 作用是验证是否已登录成功了
exports.signinRequired = function(req,res,next){
	var _user = req.session.user
	if(!_user){
		return res.redirect('/signin')
	}
	next()

}

//midware adminRequired 定义中间件 作用是验证是否管理员
exports.adminRequired = function(req,res,next){
	var _user = req.session.user
	if(_user.role <= 10){
		return res.redirect('/signin')
	}
	next()

}
