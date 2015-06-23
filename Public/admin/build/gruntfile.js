module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        files: [
          {
            expand: true,     // Enable dynamic expansion.
            cwd: '../js/',      // Src matches are relative to this path.
            src: ['**/*.js'], // Actual pattern(s) to match.
            dest: '../dist/js',   // Destination path prefix.
            ext: '.js',   // Dest filepaths will have this extension.
          }
        ]
      }
    },
    cssmin: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        //美化代码
        beautify: {
        //中文ascii化，非常有用！防止中文乱码的神配置
            ascii_only: true
        }
      },
      build: {
        files: [
          {
            expand: true,     // Enable dynamic expansion.
            cwd: '../css/',      // Src matches are relative to this path.
            src: ['**/*.css'], // Actual pattern(s) to match.
            dest: '../dist/css',   // Destination path prefix.
            ext: '.css',   // Dest filepaths will have this extension.
          }
        ]
      }
    }
  });

  // 加载包含 "uglify" 任务的插件。
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // 默认被执行的任务列表。
  grunt.registerTask('default', ['uglify', 'cssmin']);

};