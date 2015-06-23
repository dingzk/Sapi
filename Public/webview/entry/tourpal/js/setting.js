/**
 *@overfileView 隐私设置页面
 *author Yoocky <mengyanzhou@gmail.com>
 */

define(['src/js/core', 'entry/tourpal/js/tourpal'], function(core, tourpal){
    //路径配置
    var path = {
        'editPrivacy'  : '/index.php/Api/User/editPrivacy',                    //隐私设置
    }
  
    core.onrender('setting', function(dom){
        var $form = $('#setting_form');
        
        $(dom).on('click', '.toggle', function(){
            $(this).toggleClass('active');
        });

         //初始化用户设置
         tourpal.getUserInfo(function(data){
            $form.find('.single-setting .toggle').each(function(){
                    var value = $(this).attr('data-value') & data.visible_item;
                    if(value){
                        $(this).addClass('active');
                    }else{
                        $(this).removeClass('active');
                    }
            })
            $groupSetting = $form.find('.group-setting .toggle');
            if(data.group_visible == 1){
                $groupSetting.addClass('active');
            }else{
                $groupSetting.removeClass('active');
            }
         })

         //保存设置
         $(dom).find('.btn-save').on('click', function(){
            var $btn = $(this);
            if($btn.hasClass('disabled')){
              return false;
            }
            var params = {
                visible_item : 0,
                group_visible : null,
            };
            $form.find('.single-setting .active').each(function(){
                params.visible_item += $(this).attr('data-value') * 1;
            });
            params.group_visible = $form.find('.group-setting .toggle').hasClass('active') * 1;
            $btn.addClass('disabled');
            $.ajax({
                    url : path.editPrivacy,
                    data : params,
                    dataType : 'json',
                    type : 'GET',
                    success : function(data){
                        if(data.code == 0){
                            $btn.removeClass('disabled');
                            History.back();
                         }
                    }
                });
         })
    });
});