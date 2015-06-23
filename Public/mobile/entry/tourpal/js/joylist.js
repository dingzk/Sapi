/**
 *@overfileView 求同行的人
 *author Yoocky <mengyanzhou@gmail.com>
 */

define(['src/js/core', 'entry/tourpal/js/tourpal', 'entry/tourpal/js/scrollLoad'], function(core,  tourpal, ScrollLoad){
     //路径配置
    var path = {
        'getLiked'  : '/index.php/Api/Liked/getLikedInfoByPostId'                //获取点赞列表
    }

    core.onrender('joylist',function(dom){

        var $list = $(dom).find('.page-joylist');
        var postId = tourpal.getArgs()['post_id'];

        //滚动分页
        var sl = new ScrollLoad({
             scrollWrapSel : '.page-joylist',
             templateId : 'joy_list_tpl',
             url : path.getLiked,
             data : {post_id : postId},
             noDataText : '暂未收到请求同行的消息',
             callback : function(data, offset){
                if(offset == 0){
                     tourpal.alert.show('<a data-rel="link" href="postdetail?post_id=' + postId + '">同行目的地：' + data.dest + '</a>', 'joylist-bar');
                }    
             }      
        })
        $(dom).on("beforeshow", function(eve) {
            if (eve.detail === 'joylist') {
              sl.reload();
            }
        });  
    });
});