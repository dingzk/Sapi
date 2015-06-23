/**
 *@overfileView 公共方法
 *author Yoocky <mengyanzhou@gmail.com>
 */

define(['src/js/core'], function(core){
    
    var tourpal = {};
    
    //接口地址
    var path ={
        'getUserInfo' : '/index.php/Api/User/getUserInfoById',               //获取用户信息
        'getMessage' : '/index.php/Api/Liked/getNewsNum'                     //获取用户信息
    }

    //将简单查询串转换为对象
    tourpal.unparam =  function(query){
        var args = {};
        var pairs = query.split("&"); 
        for(var i = 0; i < pairs.length; i++) {
            var pos = pairs[i].indexOf('=');
            if (pos == -1) continue;
            var argname = pairs[i].substring(0,pos);
            var value = pairs[i].substring(pos+1);
            value = decodeURIComponent(value);
            args[argname] = value;
        }
        return args;
    }

    //cookie方法扩展
     tourpal.cookie = function (key, value, options) {
          var days, time, result, decode

          // A key and value were given. Set cookie.
          if (arguments.length > 1 && String(value) !== "[object Object]") {
              // Enforce object
              options = $.extend({}, options)

              if (value === null || value === undefined) options.expires = -1

              if (typeof options.expires === 'number') {
                  days = (options.expires * 24 * 60 * 60 * 1000)
                  time = options.expires = new Date()

                  time.setTime(time.getTime() + days)
              }

              value = String(value)

              return (document.cookie = [
                  encodeURIComponent(key), '=',
                  options.raw ? value : encodeURIComponent(value),
                  options.expires ? '; expires=' + options.expires.toUTCString() : '',
                  options.path ? '; path=' + options.path : '',
                  options.domain ? '; domain=' + options.domain : '',
                  options.secure ? '; secure' : ''
              ].join(''))
          }

          // Key and possibly options given, get cookie
          options = value || {}

          decode = options.raw ? function (s) { return s } : decodeURIComponent

          return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null
      }

    //获取url参数
    tourpal.getArgs = function() { 
        var query = location.search.substring(1);
        var args = this.unparam(query);
        return args;
     }

     //通用弹窗
     tourpal.alert = {
        show : function(text, className, close, closeFn){
            var html =  text || '';
            if(close){
              html += '<span class="icon icon-close" style="float: right;"></span>';
            }  
            var $layer = $(core.getActiveLayer());
            var $header = $layer.find('header').eq(0);
            $layer.find('.alert-bar').remove();
            $header.after('<div class="alert-bar ' + (className || '') + '">' + html + '</div>');
            $layer.find(".alert-bar .icon-close").on('click', function(){
                if(closeFn){
                    tourpal.alert.hide();
                    closeFn();
                }
            });
        },
        hide : function(){
            var $layer = $(core.getActiveLayer());
            $layer.find('.alert-bar').remove();
        }
     }
     
     //获取用户信息
     tourpal.getUserInfo = function(callback, uid){
        var params = uid ? {'uid' : uid} : {};
        $.ajax({
          url : path.getUserInfo,
          data : params,
          dataType : 'json',
          type : 'GET',
          success: function(data){
             if(data.code == 0){
                callback(data.data);
             }
          }
       })
     }

     //获取用户信息
     tourpal.getMessage = function(){
        $.getJSON(path.getMessage, function(data){
            var $newMessage = $('.new-message');
            if(data.code == 0){
              if(data.data == 0){
                $newMessage.addClass('none');
              }else{
                $newMessage.text(data.data).removeClass('none');
              }
            }else{
               $newMessage.addClass('none');
            }
        });
     }
     /** 登录相关回调 **/
     
     tourpal.getToken = function(data, callback){
         callback = callback || function(){};
         if(data.session_token){
             url = "https://msecure.elong.com/Member/SSO?cardno=" + data.cardno + "&sessiontoken=" + data.session_token;
             var img = new Image();
             img.src = url;
             img.onerror = function(){
               tourpal.cookie('SessionToken', data.session_token, { path: '/' });
               callback();
             }
          }else{
             tourpal.cookie('SessionToken', '', { path: '/' });
          }
     }

     //写入用户token
     tourpal.setToken = function(){
        window.myonsuccess = function(data){
            data = JSON.parse(data);
            if(!data.error){
              data = data.data;
              tourpal.getToken(data);
            } 
          }
          ElongApp.accountGet("myonsuccess");
     }

     //检测用户是否登录
     tourpal.isLogin = function(){
        return tourpal.cookie('SessionToken');
     }

     //调起客户端登录
     tourpal.login = function(callback){
        window.loginSuccess = function(data){
          data = JSON.parse(data);
          if (!data.error){
            tourpal.getToken(data.data, function(){
                if(typeof callback == 'function'){
                  callback();
                }
            });
          }
        }
        ElongApp.accountLogin("loginSuccess");
     }
     
    //测试用户资料完成度并发帖发帖
    tourpal.post = function(){
        tourpal.getUserInfo(function(data){
            if(data.is_complete == 0){
                  dialog.confirm({
                    content : '发帖前请完善用户信息！',
                    success : function(){
                        var params = $.param({redirect : 'post'});
                        core.addPager({
                            id:'mycard',
                            url:'mycard?' + params,
                            active:true
                        });
                    }
                  })
            }else{
                core.addPager({
                    id:'post',
                    url:'post',
                    active:true
                });
            }
        })
    }
    return tourpal
});
