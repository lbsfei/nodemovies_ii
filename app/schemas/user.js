//先设计模式一

var mongoose = require('mongoose')
//加密算法的库
var bcrypt = require('bcrypt')
//密码难度设置
var SALT_WORK_FACT = 10

//数据表的字段信息
var UserSchema = new mongoose.Schema({
	name:{
		unique:true,
		type:String
	},
	password:String,
	role:{
		type:Number,
		default:0
	},
	meta:{
		createAt:{
			type:Date,
			default:Date.now()
		},
		updateAt:{
			type:Date,
			default:Date.now()
		}
	}
})

//每次存储之前都会调用此方法
UserSchema.pre('save',function(next){
	var user = this
	if(this.isNew){
		this.meta.createAt = this.meta.updateAt = Date.now()
	}else{
		this.meta.updateAt = Date.now()
	}

	//处理密码加密
	bcrypt.genSalt(SALT_WORK_FACT,function(err,salt){
		if(err) return next(err)
			bcrypt.hash(user.password,salt,function(err,hash){
				if(err) return next(err)
				user.password = hash
				next()
			})

	})
})

//添加密码验证的方法
UserSchema.methods = {
	comparePassword:function(_password,cb){
		bcrypt.compare(_password,this.password,function(err,isMatch){
			if(err) return cb(err)
			cb(null,isMatch)
		})
	}
}

//模型编译之后才会有这下面的方法
UserSchema.statics = {
	fetch:function(cb){
		return this
			.find({})
			.sort('meta.updateAt')
			.exec(cb)
	},
	findById:function(id,cb){
		return this
			.findOne({_id:id})
			.exec(cb)
	}
}

//导出,即向外提供接口
module.exports = UserSchema