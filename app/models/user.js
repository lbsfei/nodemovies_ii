//再设计模型二
var mongoose = require('mongoose')
//引入模式中的模块
var UserSchema = require('../schemas/user')
var User = mongoose.model('User',UserSchema)

//导出
module.exports = User
