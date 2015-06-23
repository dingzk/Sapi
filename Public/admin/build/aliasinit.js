/* @fileOverview 遍历js文件生成依赖
 * @author zhoumengyan
 */

//依赖模块
var path = require('path');
var fs = require('fs');

//基本配置
var config = {
  //默认路径
  basePath : '../js/',
  //需要生成别名的路径列表
  PathArr : ['libs', 'base', 'tools', 'widget'],
  //遍历深度
  deep : 2,
  //模式
  debug : true
}

//是不是js文件
function isJsFile(file){
  var reg = /.js$/;
  return reg.test(file);
}

//遍历文件夹并生成别名
function explorer(path, deep){
  deep = deep || 0;
  fs.readdir(path, function(err, files){
      deep++;
      //err 为错误 , files 文件名列表包含文件夹与文件
      if(err){
          console.log('error:\n' + err);
          return;
      }
      files.forEach(function(file){
          fs.stat(path + '/' + file, function(err, stat){
              if(err){
                console.log(err); 
                return;
              }
              if(stat.isDirectory()){             
                  // 如果是文件夹遍历
                  if(deep <= config.deep){
                    explorer(path + '/' + file, deep);
                  }
              }else{
                  //输出
                  if(isJsFile(file)){
                    var _file = file.replace(/.js$/g, '');
                    var _path = path.replace(new RegExp('^' + config.basePath), '');
                    _path += '/' + file;
                    console.log("'" + _file  + "' : '" + _path + "',");
                  }
              }               
          });
      });
  });
}

//默认任务
function task(){
  config.PathArr.forEach(function(path){
       path = config.basePath + path;
       explorer(path);
  })
}

//执行
task();
