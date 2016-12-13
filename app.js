var express = require('express');//加载express模块
var path = require('path');//因为我们加入了样式，所以要指定从那里找样式文件
var fs = require('fs')
//mongodb 做会话session的持久化
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);

var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')

//数据库操作
var mongoose = require('mongoose')

//express.logger 在express 4.0后已经迁出，现在为morgan
var logger = require('morgan');

var serveStatic = require('serve-static')






var port = process.env.PORT || 3000; //设置端口
var app = express();//启动web服务器


//连接本地数据库 movies
var dbUrl = 'mongodb://localhost/movies'
mongoose.connect(dbUrl)

// models loading 自动加载所有的模型
var models_path = __dirname + '/app/models'
var walk = function(path) {
  fs
    .readdirSync(path)
    .forEach(function(file) {
      var newPath = path + '/' + file
      var stat = fs.statSync(newPath)

      if (stat.isFile()) {
        if (/(.*)\.(js|coffee)/.test(file)) {
          require(newPath)
        }
      }
      else if (stat.isDirectory()) {
        walk(newPath)
      }
    })
}
walk(models_path)



app.set('views','./app/views/pages');//设置视图的根目录
app.set('view engine','jade');//设置默认的模板引擎，这里使用jade模板引擎

//表单提交的格式化
// app.use(express.bodyParser()) 此bodyParser在新版本的express中不在支持了，要改为下面的形式
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())





app.use(cookieParser());


//session持久化
app.use(session({
	secret: 'moviesproject',
	store: new mongoStore({
		url:dbUrl,
		//将session保存到MongoDB的位置
		collection: 'sessions'
	}),
	resave: false,
  saveUninitialized: true
}))

//在屏幕中打印错误
var env = process.env.NODE_ENV || 'development'
if('development' === env){
// if('development' === app.get('env')){
	app.set('showStackError',true)
	app.use(logger(':method :url :status'))
	//将源码格式化，不要压缩
	app.locals.pretty = true
	//将mongoDB调试打开
	mongoose.set('debug',true)
}

//引入routes.js
require('./config/routes')(app)


//然后监听这个端口
app.listen(port)
//调用样式
app.use(serveStatic(path.join(__dirname,'public')))

//在jade文件中使用到了moment，所以这里需要引入
app.locals.moment = require('moment')
//再打印一条日志
console.log('project Movies started on port :' + port)

