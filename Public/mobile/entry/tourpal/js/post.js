/**
 *@overfileView 发帖页
 *author Yoocky <mengyanzhou@gmail.com>
 */

define(['src/js/core', 'src/js/dialog', 'src/js/city', 'src/js/calendar', 'src/js/PluginManager' ,'entry/tourpal/js/upload', 'entry/tourpal/js/tourpal'], function(core, dialog, city, calendar, PluginManager, upload, tourpal){
  
    //路径配置
    var path = {
        'thumbnail' : 'http://192.168.14.132:8080/i/tourpal_184x184/',      //缩略图图床路径
        'postApi' : '/index.php/Api/Posts/post',                            //发帖接口  
        'getTags' : '/index.php/Api/Tags/getTags'                           //获取标签接口
    }
    
    //表单验证
    var validate = {

        //基本校验是不是为空值
        checkNull : function(form){
            return $(form).val().trim() != '';
        },

         //校验目的地
        checkDest : function(form) {
              if(this.checkNull(form)){
                 return true;
              }
              this.showError('目的地不能为空', form);   
              return false;             
        },

        //校验出发时间
        checkStart : function(form) {
              if(this.checkNull(form)){
                 return true;
              }
              this.showError('出发时间不能为空', form);   
              return false;                   
        },

        //校验出发天数
        checkDays : function(form) {
            if(this.checkNull(form)){
              var number = $(form).val().trim();
              number = number.replace(/^0*/g, '');
              $(form).val(number);
              if(number < 1){
                  this.showError('旅行时间不能小于1天', form); 
                  return false;            
              }else if(number > 99){
                   this.showError('旅行时间不能超过99天', form); 
                  return false; 
              }else{
                  return true;
              }          
            }else{
              this.showError('旅行时间不能为空', form);
              return false;
            }
        },

          //校验手机号
        checkPhone : function(form) {
          if(this.checkNull(form)){
              var phone = $(form).val().trim();
              var flag = /^1[3|4|5|8|7][0-9]\d{4,8}$/.test(phone);
              if(!flag){
                  this.showError('手机号格式错误', form);
              }
              return flag;
          }else{
            return true;
          }
        },

        //校验QQ
        checkQQ : function(form) {
              var number = $(form).val().trim();
              number = number.replace(/^0*/g, '');
              $(form).val(number);
              return true;                    
        },

        //校验微信
        checkWeixin : function(form) {
              return true;                
        },

        //校验内容
        checkContent : function(form) {
            if(this.checkNull(form)){
              return true;
            }
            this.showError('描述不能为空', form);   
            return false;                    
        },

        //错误提示
        showError : function(message, form){
            $(form).focus();
            tourpal.alert.show(message);
        },

        flag : true
    }

    core.onrender('post',function(dom){
        var init = function(){
            $(dom).find('.alert-bar').hide();
            var $btn = $(dom).find('.btn-post');
            var $form = $('#post_form');;
             //清空表单
            $btn.removeClass('disabled');
            $form[0].reset()
            $('.img-list li[data-id]').remove();
            $('#dest_list').html('');
            tagAction.clear();
            //初始化用户信息
            tourpal.getUserInfo(function(data){
               if(data.is_complete == 0){
                  core.addPager({
                      id:'mycard',
                      url:'mycard',
                      active:true,
                      reverse:true
                  });
               }else{
                  //destAction.add(localStorage.getItem('dest'));
                  $form.find('[name=nick_name]').val(data.nick_name);
                  $form.find('[name=sex]').val(data.sex);
                  $form.find('[name=age]').val(data.age);
                  $form.find('[name=weixin]').val(data.weixin);
                  $form.find('[name=qq]').val(data.qq);
                  //$form.find('[name=phone]').val(data.phone); 暂时不自动填写手机号
                  window.locationSuccess = function(data){
                    data = JSON.parse(data);
                    if(data.error == 0){
                      var coords = data.data.coords;
                      $form.find('[name=post_place]').val(coords.latitude + ',' + coords.longitude);
                    }
                  }
                  ElongApp.locationGet("locationSuccess");
               }
          })
        }
        //目的地
        var destAction = {
          add : function(data){
            if($.inArray(data[3], this.getList()) > -1){
              return;
            }
            $('#dest_list').append('<span class="btn btn-negative btn-outlined"><span class="dest-name" pid="' + data[3] + '">' + data[1] + '</span><span class="del-dest">&times</span></span>');
          },
          getList :function(){
            var list = [];
            $('#dest_list .dest-name').each(function(){
              list.push($(this).attr('pid'));
            })
            return list;
          },
          setValue : function(){
             var list = this.getList();
             $('#post_form').find('[name=dest]').val(list.join(','));
          }
        }
        //城市选择
        $("#dest_selector").on("click", function(){
              pluginDest.show(function(data) {
                  destAction.add(data);
              });
        });
        PluginManager.add("dest", city);
        pluginDest = PluginManager.getItem('dest');

        //删除城市
        $('#dest_list').on('click', '.del-dest', function(){
            $(this).parent().remove();
        })

        //日期选择
        var date = new Date();
        var cln = $("#date_selector").calendar({
            mindate: date,
            maxdate: date.add(2, 2),
            eventCallBack: function(data) {
                $("#date_selector").val(data);
            }
        });
        PluginManager.add("calendar", cln);

        //标签选择
        var tagAction = {
          getTags : function(){
            var tags = [];
            $('.tag-list .active').each(function(){
                tags.push($(this).text());
            })
            return tags.join(',');
          },
          initList : function(){
            $.getJSON(path.getTags, function(data){
                var html = '';
                data.data.forEach(function(tag){
                  html += '<span class="btn gray">' + tag + '</span>\n';
                })
                $('.tag-list').html(html);
            })
          },
          clear : function(){
              $('.tag-list .btn').removeClass('active');
          } 
        }
        //便签选择
        $('.tag-list').on('click', '.btn', function(){
            $(this).toggleClass('active');
            if($('.tag-list .active').length > 3){
              $(this).removeClass('active');
            }
        })
        tagAction.initList();

        //初始化图片上传插件
        upload({
          successFn : function(data){
            if(data.code == 0){
              var url = data.data[0];
              var picId = url.substr(url.lastIndexOf('/')+1).replace('.jpg', '');
              var $li = $('.img-list').find('[data-id="' + data.data.id + '"]');
              $li.find('img').attr('src', url);
              $li.attr('data-picid', picId);
            } 
          }
        });
        
        //删除照片
        $(dom).find('.img-list').on('click', '.del', function(){
            $(this).parents('li').remove();
        })
        
        //地理位置开关
        $(dom).on('click', '.position-switch', function(){
            var $ico = $(this).find('.ico');
            var $text = $(this).find('label em').eq(1);
            $ico.toggleClass('ico-positionact');
            if($ico.hasClass('ico-positionact')){
              $text.text('已显示我的位置');
            }else{
              $text.text('点击显示我的位置');
            }
        })

        //图片个数限制
        $(dom).find('.add-btn').on('click', function(){
            if($('.img-list li[data-id]').length >= 3){
                dialog.alert('最多上传三张照片');
                return false;
            }
        })

        //发帖
        $(dom).find('.btn-post').on('click', function(){
           var $btn = $(this);
           if($btn.hasClass('disabled')){
              return false;
           }
           
           var $form = $('#post_form');
           destAction.setValue();
           validate.flag = true;
           $form.find('[data-check]').each(function(){
               if(validate.flag){
                 var checkType = $(this).attr('data-check');
                 validate.flag &= validate[checkType](this);
                }
           })
           if(!validate.flag){
              return false;
           }  

           //校验至少有一个联系方式
           var allNull = true;
           $form.find('.needone').each(function(){
                allNull &= !validate.checkNull(this);
           })
           if(allNull){
              tourpal.alert.show('至少输入一个联系方式');
              return false;
           }
           //通过校验提交表单
           tourpal.alert.hide();
           var data = $form.serialize();
           data = tourpal.unparam(data);
           //是否提交地理位置
           if(!$('.position-switch').find('.ico').hasClass('ico-positionact')){
              data.post_place = '';
           }
           var imgs = [];
           $('.img-list [data-picid]').each(function(){
              var picId = $(this).attr('data-picid');
              imgs.push(picId);
           })
           data.imgs = imgs.join(',');
           data.tags = tagAction.getTags();
           var dest = $('#dest_list .dest-name').eq(0).text();
           $btn.addClass('disabled');
           $.ajax({
              url : path.postApi,
              data : data,
              dataType : 'json',
              type : 'POST',
              success: function(data){
                 if(data.code == 0){
                    $btn.removeClass('disabled');
                    var params = $.param({'city': dest, 'r' : new Date().getTime()});
                    core.addPager({
                        id:'postlist',
                        url:'postlist?' + params,
                        active:true,
                        reverse:true
                    });
                 }
              }
           })
        })
        
        $(dom).on("beforeshow", function(eve) {
            if (eve.detail === 'post') {
              init();
            }
        });

        init();
    });
});