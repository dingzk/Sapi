/**
 *@overfileView 向我求同行的人
 *author Yoocky <mengyanzhou@gmail.com>
 */

define(['src/js/core', 'entry/tourpal/js/tourpal', 'entry/tourpal/js/scrollLoad'], function(core, tourpal, ScrollLoad){
     //路径配置
    var path = {
        'getNewsList'  : '/index.php/Api/Liked/getNewsList'                //获取点赞列表
    }

    core.onrender('myjoy',function(dom){

        var $list = $(dom).find('.page-myjoy');
        
        //滚动分页
        var sl = new ScrollLoad({
             scrollWrapSel : '.page-myjoy',
             templateId : 'my_joy_tpl',
             url : path.getNewsList,
             noDataText : '暂未收到请求同行的消息'
        })  

        //页面显示后初始化
        $(dom).on("beforeshow", function(eve) {
            if (eve.detail === 'myjoy') {
                sl.reload();
            }
        });
    });
});