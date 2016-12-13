module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),    

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        ignores: ['public/libs/**/*.js']
      },
      all: ['public/js/*.js', 'test/**/*.js', 'app/**/*.js']
    },

    less: {
      development: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2
        },
        files: {
          'public/build/index.css': 'public/less/index.less'
        }
      }
    },

    uglify: {
      development: {
        files: {
          'public/build/admin.min.js': 'public/js/admin.js',
          'public/build/detail.min.js': [
            'public/js/detail.js'
          ]
        }
      }
    },

    watch:{
      jade:{
        files:['views/**'],
        options:{
          livereload:true
        }
      },
      js:{
        files:[
          'public/js/**',
          'models/**/*.js',
          'schemas/**/*.js'
        ],
        // tasks:['jshint'],
        options:{
          //当文件发生改动时候，会重新启动服务
          livereload:true
        }
      }
    },

    nodemon:{
      dev:{
        options:{
          file:'app.js',
          args:[],
          ignoredFiles:['README.md','node_modules/**','.DS_Store'],
          watchedExtensions:['js'],
          watchedFolders:['./'],
          debug:true,
          delayTime:1,
          env:{
            PORT:3000
          },
          cwd:__dirname
        }
      }
    },

    mochaTest: {
      options: {
        reporter: 'spec'
      },
      src: ['test/**/*.js']
    },
    
    concurrent: {
      tasks: ['nodemon', 'watch', 'less', 'uglify', 'jshint'],
      options: {
        logConcurrentOutput: true
      }
    }

  });

  // Load the plugin that provides the "uglify" task. 压缩一个文件夹的所有文件
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Load the plugin that provides the "grunt-contrib-watch" task.
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Load the plugin that provides the "grunt-nodemon" task.
  grunt.loadNpmTasks('grunt-nodemon');

   // Load the plugin that provides the "grunt-concurrent" task.
  grunt.loadNpmTasks('grunt-concurrent');

  //单元测试
  grunt.loadNpmTasks('grunt-mocha-test');

  //less编译
  grunt.loadNpmTasks('grunt-contrib-less')

  //检查语法，编码规范
  grunt.loadNpmTasks('grunt-contrib-jshint')

  //避免语法，警告而中断了服务
  grunt.option('force',true)





  // Default task(s).
  grunt.registerTask('default', ['concurrent','uglify']);//uglify

  grunt.registerTask('test', ['mochaTest']);//注册任务

};
