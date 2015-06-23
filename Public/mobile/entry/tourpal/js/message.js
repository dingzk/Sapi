/**
 *@overfileView 消息中心
 *author Yoocky <mengyanzhou@gmail.com>
 */

define(['src/js/core', 'entry/tourpal/js/tourpal', 'entry/tourpal/js/scrollLoad', 'lib/artTemplate'], function(core, tourpal, dragload, template){
     //路径配置
    var path = {
        'myPostsCount' : '/index.php/Api/Posts/myPostsCount'                        //获取我的发帖 
    }

    core.onrender('message',function(dom){

        //获取帖子总数
        var getPostCount = function(){
            var $postCount = $(dom).find('.post-count');
            $.ajax({
              url : path.myPostsCount,
              dataType : 'json',
              type : 'GET',
              success : function(data){
                if(data.code == 0){
                   $postCount.text(data.data)
                }else if(data.code == 1){
                   $postCount.text(0)
                }
              }
            })
        }

        var init = function(){
            getPostCount();
            tourpal.getMessage();
            $('.page-content').scrollTop(0);
            tourpal.getUserInfo(function(data){
                var html = template('user_info_tpl', data);
                $(dom).find('.user-info').html(html);
            })
        }

        $(dom).on("beforeshow", function(eve) {
            if (eve.detail === 'message') {
                init();
            }
        });

        init();
    });
});