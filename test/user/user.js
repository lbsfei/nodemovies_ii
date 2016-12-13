//测试用例
var crypto = require('crypto')
var bcrypt = require('bcrypt')

function getRandomString(len) {
  if (!len) len = 16

  return crypto.randomBytes(Math.ceil(len / 2)).toString('hex')
}

var should = require('should')
var app = require('../../app')
var mongoose = require('mongoose')

// var User = require('../../app/models/user')
//或用下面的形式加载
var User = mongoose.model('User')

var user

// test
//describe是可以嵌套测试的
describe('<Unit Test', function() {
  describe('Model User:', function() {
    //1.测试之前
    before(function(done) {
      user = {
        name: getRandomString(),
        password: 'password'
      }

      done()
    })

    describe('Before Method save', function() {
      //2.在save调用之前，此测试用户是不存在的，开始的时候是没有这个测试用户在数据库的
      it('should begin without test user', function(done) {
        User.find({name: user.name}, function(err, users) {
          //在save调用之前查不到该测试用户
          users.should.have.length(0)

          done()
        })
      })
    })

    describe('User save', function() {
      //3.1测试这个save方法没有问题
      it('should save without problems', function(done) {
        var _user = new User(user)
        //确定保存没有问题
        _user.save(function(err) {
          should.not.exist(err)
          //然后删除该用户，也不存在问题
          _user.remove(function(err) {
            should.not.exist(err)
            done()
          })
        })
      })

      //3.2测试密码生成是没有问题的
      it('should password be hashed correctly', function(done) {
        var password = user.password
        var _user = new User(user)

        //确认保存没有问题
        _user.save(function(err) {
          should.not.exist(err)
          _user.password.should.not.have.length(0)
          //确保密码在比对时不要报错
          bcrypt.compare(password, _user.password, function(err, isMatch) {
            should.not.exist(err)
            //确保密码是相同的
            isMatch.should.equal(true)
            //然后删除该用户，也不存在问题
            _user.remove(function(err) {
              should.not.exist(err)
              done()
            })
          })
        })
      })


      //3.3确保用户权限的默认权限是0
      it('should have default role 0', function(done) {
        var _user = new User(user)

        _user.save(function(err) {
          _user.role.should.equal(0)

          _user.remove(function(err) {
            done()
          })
        })
      })


      //3.4确保创建的用户不存在有同名的情况
      it('should fail to save an existing user', function(done) {
        var _user1 = new User(user)
        //保存用户第一次
        _user1.save(function(err) {
          should.not.exist(err)

          var _user2 = new User(user)
          //保存用户第二次
          _user2.save(function(err) {
            //出现报错：表明测试是成功的
            should.exist(err)
            //然后删除测试用户一
            _user1.remove(function(err) {
              if (!err) {
                //然后删除测试用户二
                _user2.remove(function(err) {
                  done()
                })
              }
            })
          })
        })
      })
    })

    after(function(done) {
      // clear user info
      done()
    })
  })
})