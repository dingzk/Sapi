/**
 *@overfileView 用户反馈
 *author Yoocky <mengyanzhou@gmail.com>
 */

define(['src/js/core', 'entry/tourpal/js/tourpal'], function(core, tourpal){
  
    //路径配置
    var path = {
        'feedback' : '/index.php/Api/Feedback/feedback'                                      //发帖接口   
    }
    
    //表单验证
    var validate = {

        //基本校验是不是为空值
        checkNull : function(form){
            return $(form).val().trim() != '';
        },

        //校验邮箱
        checkEmail : function(form){
          if(this.checkNull(form)){
              var email = $(form).val().trim();
              var flag = /^[A-Za-zd]+([-_.][A-Za-zd]+)*@([A-Za-zd]+[-.])+[A-Za-zd]{2,5}$/.test(email);
              if(!flag){
                  this.showError('邮箱格式错误', form);
              }
              return flag;
          }else{
            return true;
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

        //校验内容
        checkContent : function(form) {
            if(this.checkNull(form)){
              return true;
            }
            this.showError('反馈内容不能为空', form);   
            return false;                    
        },

        //错误提示
        showError : function(message, form){
            $(form).focus();
            tourpal.alert.show(message);
        },

        flag : true
    }

    core.onrender('feedback',function(dom){

        var $form = $('#feedback_form');

        var init = function(){
            $(dom).find('.alert-bar').hide();
            var $btn = $(dom).find('.btn-save');
             //清空表单
            $btn.removeClass('disabled');
            $form[0].reset()
            //初始化用户信息
            tourpal.getUserInfo(function(data){
                $form.find('[name=qq]').val(data.qq)
                $form.find('[name=phone]').val(data.phone)
            });
       }
         
        //提交反馈信息
        $(dom).find('.btn-save').on('click', function(){
           var $btn = $(this);
           if($btn.hasClass('disabled')){
              return false;
           }
           
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

           //通过校验提交表单
           tourpal.alert.hide();
           var data = $form.serialize();
           $btn.addClass('disabled');
           $.ajax({
              url : path.feedback,
              data : data,
              dataType : 'json',
              type : 'POST',
              success: function(data){
                 if(data.code == 0){
                    $btn.removeClass('disabled');
                    var params = tourpal.getArgs();
                    var redirect = params['redirect'];
                    if(redirect){
                      delete params.redirect;
                      params = $.param(params);
                      core.addPager({
                          id: redirect,
                          url: params ? redirect + '?' + params : redirect,
                          active:true
                      });
                    }else{
                      tourpal.alert.show('提交成功');
                      history.back();
                    }
                    
                 }else{
                    $btn.removeClass('disabled');
                    tourpal.alert.show('重复提交');
                 }
              }
           })
        })
         $(dom).on("beforeshow", function(eve) {
            if (eve.detail === 'feedback') {
              init();
            }
        });

        init();
    });
});