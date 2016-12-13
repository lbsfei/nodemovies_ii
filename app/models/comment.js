var mongoose = require('mongoose')
var CommentSchema = require('../schemas/comment')
//发布模型
var Comment = mongoose.model('Comment', CommentSchema)

module.exports = Comment