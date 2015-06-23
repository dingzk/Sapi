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

     //检测用户是否登录
     tourpal.isLogin = function(){
        return tourpal.cookie('TourpalCheck');
     }

     //跳转h5登录
     tourpal.login = function(dest){
        dest = dest || location.href;
        var params = $.param({RedirectUrl : dest});
        var ssoUrl =  'https://msecure.elong.com/login/';
        location.href = ssoUrl + '?' + params;
     }

     //退出登录
     tourpal.loginOut = function(dest){
        dest = dest || location.href + '/../hotcity';
        var params = $.param({RedirectUrl : dest});
        var ssoUrl =  'https://msecure.elong.com/login/Logout';
        location.href = ssoUrl + '?' + params;
     }

     //获取地理位置
     tourpal.getLocation = function(callback){
       var options = {
           enableHighAccuracy:true, 
           maximumAge:1000
       }
       var data = {
          error: 1,
          message : ''
       }
       if(navigator.geolocation){
           //浏览器支持geolocation
           navigator.geolocation.getCurrentPosition(onSuccess,onError,options);
           
       }else{
           data.message = "您的浏览器不支持获取地理位置";
           callback(data);
       }
       //成功时
       function onSuccess(position){
           data.error = 0;
           data.message = "已显示我的位置",
           data.coords = position.coords;
           callback(data);
       }
  
       //失败时
       function onError(error){
           switch(error.code){
               case 1:
               data.message = "位置服务被拒绝";
               break;
               case 2:
               data.message = "暂时获取不到位置信息";
               break;
               case 3:
               data.message = "获取信息超时";
               break;
               case 4:
               data.message = "获取位置失败";
               break;
           }
           callback(data);
       }
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
    return tourpal;
});
