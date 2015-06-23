/**
 *@overfileView 目的地页
 *author Yoocky <mengyanzhou@gmail.com>
 */

define(['src/js/core', 'src/js/dialog', 'entry/tourpal/js/tourpal', 'entry/tourpal/js/scrollLoad', 'entry/tourpal/js/picview'], function(core, dialog, tourpal, ScrollLoad, picview){
   
    //路径配置
    var path = {
        'postList' : '/index.php/Api/Dest/getPostsByPlace',                 //获取帖子列表 
        'delPost'  : '/index.php/Api/Posts/delPostById',                    //删除我的发帖
        'like': '/index.php/Api/Liked/like'                      //求同行
    }

    core.onrender('postlist',function(dom){
        
        var city = tourpal.getArgs()['city'];
        var $postlist = $(dom).find('.page-postlist');
        $(dom).find('.title').text(city);

        
        //滚动分页
        var sl = new ScrollLoad({
             scrollWrapSel : '.page-postlist',
             templateId : 'post_list_tpl',
             url : path.postList,
             data : {dest : city},
             noDataText : '该城市暂无发帖，<br/>点击发帖寻找同行的旅伴'      
        })  
    
        //求同行
        $postlist.on('click', '.join', function(){
            var that = this;
            //state : 1-求同行 0-取消同行
            var together = function(state){
                var $curPost = $(that).parents('.post-list');
                var params = { post_id : $curPost.attr('postid'), state : state }
                $.ajax({
                    url : path.like,
                    data : params,
                    dataType : 'json',
                    type : 'GET',
                    success : function(data){
                        if(data.code == 0){
                            if(data.data){
                                $curPost.find('.join-count em').text(data.data.likedNum);
                                if(data.data.state == 1){
                                    $curPost.find('.join .ico').addClass('active');
                                    $curPost.find('.join .text').html('已约行');
                                }else{
                                    $curPost.find('.join .ico').removeClass('active');
                                    $curPost.find('.join .text').html('求同行');
                                }
                            }
                        }else if(data.code == 2){
                            dialog.confirm({
                                content : '求同行前请完善用户信息！',
                                success : function(){
                                    core.addPager({
                                      id:'mycard',
                                      url:'mycard',
                                      active:true
                                    });
                                }
                            })
                        }
                    }
                });
            }   
            //检测是否登录
            if(!tourpal.isLogin()){
                tourpal.login();
                return false;
            } 
            //同行或取消同行
            if($(this).find('.active').length){
                dialog.confirm({
                    content : '真的不想一起同行了吗？',
                    success : function(){
                        together(0);
                    }
                })
            }else{
                if(localStorage.getItem('showSetting')){
                    together(1);
                }else{
                    localStorage.setItem('showSetting', 'hasShow');
                    var confirmOpt = {
                        content: '你的联系方式会展示给求同行的人',
                        btnArr: [
                        {
                            text: "确认",
                            color: "#E65749",
                            type: "button",
                            click: function(){
                                together(1);
                            }
                        },
                        {
                            text: "修改",
                            color: "#757575",
                            type: "button",
                            click: function(){
                                core.addPager({
                                  id:'setting',
                                  url:'setting',
                                  active:true
                                });
                            }
                        }]
                    }
                    dialog.show(confirmOpt);
                }
            }
            return false;
            
        });

        //点击发帖
        $(dom).find('.post-btn').on('click', function(){
            if(!tourpal.isLogin()){
                tourpal.login();
                return false;
            }  
            tourpal.post();
        })

        //图片预览
        $(dom).on('click', 'ul img', function(){
            var url = $(this).attr('preview');
            picview.show({
                url: url
            })
            return false;
        });
        
        //引导发帖
        var showTips = function(){
            //tips提示发帖
            var lastTime = localStorage.getItem('adLastCloseTime');
            if(!lastTime || new Date().getTime() - lastTime > 604800000){
                tourpal.alert.show('发个帖子试试，更容易找到驴友哦', 'alert-bar-shadow', true, function(){
                    localStorage.setItem('adLastCloseTime', new Date().getTime());
                });
            }
        }

        $(dom).on("beforeshow", function(eve) {
            if (eve.detail === 'postlist') {
               sl.reload();
            }
        });

        showTips();
    });
});