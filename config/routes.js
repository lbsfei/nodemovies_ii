//1.引入控制器
var Index = require('../app/controller/index')
var User = require('../app/controller/user')
var Movie = require('../app/controller/movie')
var Comment = require('../app/controller/comment')
var Category = require('../app/controller/category')


//处理文件上传的中间件
// app.use(express.multipart())//这个是旧版的express用的；新版的要使用下面的中间件
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();


//向外提供接口,并将外部的参数app传入该模块中，以便调用
module.exports = function(app){

	//2.保存路由相关的
	//预处理一下user 登录用户
	app.use(function(req,res,next){
		var _user = req.session.user
		
		app.locals.user = _user
		
		return next()
	})

	/**
	**   Index 相关
	**/

	//首页 http://localhost:3000/
	app.get('/',Index.index)



	/**
	**   User 相关
	**/

	//注册
	app.post('/user/signup',User.signup)

	//登录
	app.post('/user/signin',User.signin)

	//登录页面
	app.get('/signin',User.showSignin)
	//注册页面
	app.get('/signup',User.showSignup)

	//登出
	app.get('/logout',User.logout)

	//用户列表页   ---采用中间件来控制权限，或做权限管理
	/**登录到下面的页面需要两个条件：
	** 1.signinRequired  必须是登录的
	** 2.adminRequired   必须是管理员权限
	**/

	//http://localhost:3000/admin/user/list
	app.get('/admin/user/list',User.signinRequired,User.adminRequired,User.list)

	//不加权限的写法
	// app.get('/admin/userlist',User.list)



	/**
	**   Movie 相关
	**/

	//详情页 http://localhost:3000/movie/584d4eae1f3b795b4cb9a80f
	app.get('/movie/:id',Movie.detail)

	//电影新增页面    http://localhost:3000/admin/movie/new
	app.get('/admin/movie/new',User.signinRequired,User.adminRequired,Movie.new)
	

	//影片列表页 http://localhost:3000/admin/movie/list
	app.get('/admin/movie/list',User.signinRequired,User.adminRequired,Movie.list)
	


	//电影新增和更新  中间：操作页面，上传完了海报后才更新和插入数据；权限管理顺序是从左至右，
	//例如Movie.savePoster处理完后(next就是继续向下去执行下一个环节的动作)，它的下一个环节就是Movie.save操作
	app.post('/admin/movie',multipartMiddleware,User.signinRequired,User.adminRequired,Movie.savePoster,Movie.save)

	//电影更新页面  中间：操作页面
	app.get('/admin/movie/update/:id',User.signinRequired,User.adminRequired,Movie.update)

	//删除影片     中间：操作页面
	app.delete('/admin/movie/list',User.signinRequired,User.adminRequired,Movie.del)


	//评论 Comment
	app.post('/user/comment',User.signinRequired,Comment.save)


	 // Category
	 //http://localhost:3000/admin/category/new
	app.get('/admin/category/new', User.signinRequired, User.adminRequired, Category.new)

	app.post('/admin/category', User.signinRequired, User.adminRequired, Category.save)
	app.get('/admin/category/list', User.signinRequired, User.adminRequired, Category.list)

	// results
    app.get('/results', Index.search)


}
