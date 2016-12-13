//电影相关的控制器

//模型中的对象
var Movie = require('../models/movie')
var Category = require('../models/category')
var Comment = require('../models/comment')


//require('underscore')作用就是 将post过来的object 作为 存储 更新掉已有的object
var _ = require('underscore')

//处理上传
var fs = require('fs')
var path = require('path')



//详情页 detail page   访问：http://localhost:3000/movie/detail
exports.detail = function(req, res) {
  var id = req.params.id

  //访客统计
  Movie.update({_id: id}, {$inc: {pv: 1}}, function(err) {
    if (err) {
      console.log(err)
    }
  })

  Movie.findById(id, function(err, movie) {
    Comment
      .find({movie: id})
      .populate('from', 'name')
      .populate('reply.from reply.to', 'name')
      .exec(function(err, comments) {
        res.render('detail', {
          title: 'movie 详情页',
          movie: movie,
          comments: comments
        })
      })
  })
}


//后台录入页 admin page  访问：http://localhost:3000/admin/movie
exports.new = function(req, res) {
  Category.find({}, function(err, categories) {
    res.render('admin', {
      title: 'Movies 后台录入页',
      categories: categories,
      movie: {}
    })
  })
}



//在后台点击更新时
exports.update = function(req, res) {
  var id = req.params.id

  if (id) {
    Movie.findById(id, function(err, movie) {
      Category.find({}, function(err, categories) {
      	console.log(movie)
      	console.log(categories)
        res.render('admin', {
          title: 'Movie 后台更新页',
          movie: movie,
          categories: categories
        })
      })
    })
  }
}


// admin poster 海报上传
exports.savePoster = function(req, res, next) {
  var posterData = req.files.uploadPoster
  var filePath = posterData.path
  var originalFilename = posterData.originalFilename

  if (originalFilename) {
    fs.readFile(filePath, function(err, data) {
      var timestamp = Date.now()
      var type = posterData.type.split('/')[1]
      var poster = timestamp + '.' + type
      var newPath = path.join(__dirname, '../../', '/public/upload/' + poster)
      console.log('newPath ----------')
      console.log(newPath)

      fs.writeFile(newPath, data, function(err) {
        req.poster = poster
        next()
      })
    })
  }
  else {
    next()
  }
}




//表单的新增和更新数据
exports.save = function(req, res) {	
	if(!req.body){
		console.log('没有上传');
	}else{
		var id = req.body.movie._id
		var movieObj = req.body.movie
		var _movie
	}	
  

  if (req.poster) {
    //如果有上传海报，保存上传的海报数据
    movieObj.poster = req.poster
  }

  if (id) {
    Movie.findById(id, function(err, movie) {
      if (err) {
        console.log(err)
      }

      _movie = _.extend(movie, movieObj)
      _movie.save(function(err, movie) {
        if (err) {
          console.log(err)
        }

        res.redirect('/movie/' + movie._id)
      })
    })
  }
  else {
    _movie = new Movie(movieObj)

    var categoryId = movieObj.category
    var categoryName = movieObj.categoryName

    _movie.save(function(err, movie) {
      if (err) {
        console.log(err)
      }
      if (categoryId) {
        Category.findById(categoryId, function(err, category) {
          category.movies.push(movie._id)

          category.save(function(err, category) {
            res.redirect('/movie/' + movie._id)
          })
        })
      }
      else if (categoryName) {
        var category = new Category({
          name: categoryName,
          movies: [movie._id]
        })

        category.save(function(err, category) {
          movie.category = category._id
          movie.save(function(err, movie) {
            res.redirect('/movie/' + movie._id)
          })
        })
      }
    })
  }
}

//列表页 list page  访问：http://localhost:3000/admin/list
exports.list = function(req,res){
	Movie.fetch(function(err,movies){
		if(err){
			console.log(err)
		}

		res.render('list',{
			title:'Movies 列表页',
			movies: movies
		})
	})

}

//数据删除的处理
exports.del = function(req,res){
	var id = req.query.id

	if(id){
		Movie.remove({_id: id},function(err,movie){
			if(err){
				console.log(err)
			}else{
				res.json({success: 1})
			}
		})
	}
}