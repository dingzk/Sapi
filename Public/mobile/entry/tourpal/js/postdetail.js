/**
 *@overfileView 目的地页
 *author Yoocky <mengyanzhou@gmail.com>
 */

define(['src/js/core', 'src/js/dialog', 'entry/tourpal/js/tourpal', 'entry/tourpal/js/picview', 'lib/artTemplate'], function(core, dialog, tourpal, picview, template){
   
    //路径配置
    var path = {
        'postDetail' : '/index.php/Api/Posts/postDetail',                   //获取帖子详情 
        'delPost'  : '/index.php/Api/Posts/delPostById',                    //删除我的发帖
        'closePost': '/index.php/Api/Posts/closePostById',                  //关闭帖子
        'like': '/index.php/Api/Liked/like',                                //求同行
        'report' : '/index.php/Api/Report/addReport'                        //举报
    }

    core.onrender('postdetail',function(dom){
        
        var postId = tourpal.getArgs()['post_id'];
        var shareInfo = {};
        var $footer = $(dom).find('footer');
        var $popover = $(dom).find('.popover');
        var $postDetail = $(dom).find('.post-detail-wrap');
        var accessWx = {
            debug: false, 
            jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage'] 
        };

        //获取帖子详情
        var getPostDetail = function(){
            $.ajax({
                url : path.postDetail,
                data : {post_id : postId , shareUrl : location.href.split('#')[0]},
                dataType : 'json',
                type : 'GET',
                success : function(data){
                    if(data.code == 0){
                        if(data.data.postInfo){
                            var detail = template('post_detail_tpl', data.data);
                            var menu = template('post_detail_menu_tpl', data.data);
                            var footer = template('post_detail_footer_tpl', data.data);
                            $('.post-detail-wrap').html(detail);
                            $(dom).find('.popover').html(menu);
                            $(dom).find('footer').html(footer);
                            shareInfo = data.data.shareInfo;
                            if(!accessWx.signature){
                                accessWx = $.extend(accessWx, data.data.shareInfo.accessWx);
                                wx.config(accessWx);
                            }
                        }else{
                            core.addPager({
                              id:'hotcity',
                              url:'hotcity',
                              active:true
                            });
                        }
                    }
                }
            });
        }

        //删除自己的发帖
        $popover.on('click', '.del', function(){
            dialog.confirm({
                content : '确定删除吗？',
                success : function(){
                    var params = { post_id : postId}
                    $.ajax({
                        url : path.delPost,
                        data : params,
                        dataType : 'json',
                        type : 'GET',
                        success : function(data){
                            if(data.code == 0){
                                if(data.data){
                                   History.back();
                                }
                            }
                        }
                    });
                }
            })
        });

        //关闭帖子
        $popover.on('click', '.close', function(){
            dialog.confirm({
                content : '确定关闭帖子吗？',
                success : function(){
                    var params = { post_id : postId}
                    $.ajax({
                        url : path.closePost,
                        data : params,
                        dataType : 'json',
                        type : 'GET',
                        success : function(data){
                            if(data.code == 0){
                                if(data.data){
                                    getPostDetail();
                                }
                            }
                        }
                    });
                }
            })
        });

        //举报帖子
        $popover.on('click', '.report', function(){
             var params = { post_id : postId}
             $.ajax({
                url : path.report,
                data : params,
                dataType : 'json',
                type : 'GET',
                success : function(data){
                    if(data.code == 0){
                        if(data.data){
                          tourpal.alert.show('举报已提交，等待审核');
                          setTimeout(function(){
                            tourpal.alert.hide();
                          }, 2000)
                        }
                    }
                }
            });
        });

        //求同行
        $footer.on('click', '.join', function(){
            if($(this).hasClass('disabled')){
                return false;
            }
            //state : 1-求同行 0-取消同行
            var together = function(state){
                var params = { post_id : postId, state : state }
                $.ajax({
                    url : path.like,
                    data : params,
                    dataType : 'json',
                    type : 'GET',
                    success : function(data){
                        if(data.code == 0){
                            if(data.data){
                                $(dom).find('.join-count em').text(data.data.likedNum);
                                if(data.data.state == 1){
                                    $(dom).find('.join .ico').addClass('active');
                                    $(dom).find('.join .text').html('已约行');
                                }else{
                                    $(dom).find('.join .ico').removeClass('active');
                                    $(dom).find('.join .text').html('求同行');
                                }
                                getPostDetail();
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
            
        });
        
        //分享
        $footer.on('click', '.share', function(){
             $('#touchStyleWeixinShare').show();
        })
        $('#touchStyleWeixinShare').on('click',function(){
            $(this).hide();
        })
        wx.ready(function(){
            // 获取“分享到朋友圈”按钮点击状态及自定义分享内容接口
            wx.onMenuShareTimeline({
                title: shareInfo.title,
                link: shareInfo.link,
                imgUrl: shareInfo.img_url
            });
            // 获取“分享给朋友”按钮点击状态及自定义分享内容接口
            wx.onMenuShareAppMessage({
                title: shareInfo.title,
                desc:  shareInfo.desc, 
                link:  shareInfo.link,
                imgUrl: shareInfo.img_url, 
                type: 'link'
            });
        });

        //图片预览
        $postDetail.on('click', 'ul img', function(){
            var url = $(this).attr('preview');
            picview.show({
                url: url
            })
        });

        //点击求同行小组提示求同行后可见
        $postDetail.on('click', '.peer-group a', function(){
            if(!$(this).attr('data-rel')){
                tourpal.alert.show('同行小组成员可见');
                setTimeout(function(){
                    tourpal.alert.hide();
                }, 2000);
            }
        })

        getPostDetail();
    });
});