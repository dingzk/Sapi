/**
 *@overfileView 个人资料页
 *author Yoocky <mengyanzhou@gmail.com>
 */

define(['src/js/core', 'entry/tourpal/js/tourpal'], function(core, tourpal){
  
    core.onrender('card', function(dom){
        var $form = $('#card_form');
        var uid = tourpal.getArgs()['uid'];
         //初始化用户资料
         tourpal.getUserInfo(function(data){
            $form.find('[name=nick_name]').val(data.nick_name)
            $form.find('[name=sex]').val(data.sex)
            $form.find('[name=age]').val(data.age)
            $form.find('[name=weixin]').val(data.weixin || '未填写')
            $form.find('[name=qq]').val(data.qq || '未填写')
            $form.find('[name=phone]').val(data.phone || '未填写')
         }, uid)
    });
});