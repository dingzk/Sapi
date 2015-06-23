/**
 *@overfileView 我的发帖
 *author Yoocky <mengyanzhou@gmail.com>
 */

define(['src/js/core', 'src/js/dialog', 'entry/tourpal/js/tourpal', 'entry/tourpal/js/scrollLoad', 'entry/tourpal/js/picview'], function(core, dialog, tourpal, ScrollLoad, picview){
     //路径配置
    var path = {
        'thumbnail' : 'http://192.168.14.132:8080/i/tourpal_184x184/',      //缩略图图床路径
        'delPost'  : '/index.php/Api/Posts/delPostById',                    //删除我的发帖
        'myPosts' : '/index.php/Api/Posts/myPosts'                        //获取我的发帖 
    }

    core.onrender('mypost',function(dom){

        var $postlist = $(dom).find('.page-mypost');
        
        //滚动分页
        var sl = new ScrollLoad({
             scrollWrapSel : '.page-mypost',
             templateId : 'my_post_tpl',
             url : path.myPosts,
             noDataText : '你还没有发过帖子'      
        })  

        //图片预览
        $(dom).on('click', 'ul img', function(){
            var url = $(this).attr('preview');
            picview.show({
                url: url
            })
            return false;
        });

        $(dom).on("beforeshow", function(eve) {
            if (eve.detail === 'mypost') {
                sl.reload();
            }
        });
    });
});