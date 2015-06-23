/**
 *@overfileView 个人资料页
 *author Yoocky <mengyanzhou@gmail.com>
 */

define(['src/js/core', 'entry/tourpal/js/tourpal'], function(core, tourpal){
  
    //路径配置
    var path = {
        'userSave' : '/index.php/Api/User/userSave'                                      //发帖接口   
    }
    
    //表单验证
    var validate = {

        //基本校验是不是为空值
        checkNull : function(form){
            return $(form).val().trim() != '';
        },
        //校验昵称
        checkNickname : function(form) {
              if(this.checkNull(form)){
                  return true;
              }else{
                  this.showError('昵称不能为空', form);
                  return false;
              }               
        },
         //校验年龄
        checkAge : function(form) {
            if(this.checkNull(form)){
              var number = $(form).val().trim();
              number = number.replace(/^0*/g, '');
              $(form).val(number);
              if(number){
                  return true;
              }
              this.showError('请输入有效的年龄', form); 
              return false;            
            }else{
              this.showError('年龄不能为空', form);
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

        //错误提示
        showError : function(message, form){
            $(form).focus();
            tourpal.alert.show(message);
        },

        flag : true
    }

    core.onrender('mycard',function(dom){
        var $form = $('#mycard_form');

         //初始化用户资料
         tourpal.getUserInfo(function(data){
            $form.find('[name=nick_name]').val(data.nick_name)
            $form.find('[name=sex]').val(data.sex)
            $form.find('[name=age]').val(data.age)
            $form.find('[name=weixin]').val(data.weixin)
            $form.find('[name=qq]').val(data.qq)
            $form.find('[name=phone]').val(data.phone)
         })
        
        //更新个人资料
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
           $btn.addClass('disabled');
           $.ajax({
              url : path.userSave,
              data : data,
              dataType : 'json',
              type : 'POST',
              success: function(data){
                 if(data.code == 0){
                    $btn.removeClass('disabled');
                    History.back();
                 }
              }
           })
        })
    });
});