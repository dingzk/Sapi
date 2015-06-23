/**
 *@overfileView 找驴友入口文件
 *author Yoocky <mengyanzhou@gmail.com>
 */
requirejs.config({
	baseUrl : '/Public/webview/',
	waitSeconds: 10
});

require(
    [
        'src/js/core', 
         'entry/tourpal/js/tourpal', 
         'src/js/common', 
         'entry/tourpal/js/route', 
         'entry/tourpal/js/hotcity', 
         'entry/tourpal/js/postlist', 
         'entry/tourpal/js/mypost', 
         'entry/tourpal/js/post', 
         'entry/tourpal/js/joylist', 
         'entry/tourpal/js/mycard',
         'entry/tourpal/js/card', 
         'entry/tourpal/js/message', 
         'entry/tourpal/js/myjoy',
         'entry/tourpal/js/feedback',
         'entry/tourpal/js/postdetail',
         'entry/tourpal/js/setting'
    ], function(core, tourpal) {
    
    core.init(); //立刻onrender 当前页面

    //种入用户token
    //tourpal.setToken();

    //通用url跳转
    $(document).on("click", "[data-rel=link]", function(e){
        var page = $(this).parents(".page");
        var id = page.attr("data-blend-id");
        var layerid = core.router.getidFromUrl($(this).attr("href"));
        var url = $(this).attr("href");
        
        var open = function(){    
            core.addPager({
                id:layerid,
                url: url,
                active:true
            });
        }

        if($(this).attr('needlogin')){
            if(!tourpal.isLogin()){
                tourpal.login(function(){
                    open();
                });
                return false;
            }
        } 
        open()
        
        return false;
    });
    //menu 浮层隐藏展示
    $(document).on("click", ".icon-more", function(){
        var $layer = $(core.getActiveLayer());
        $popover = $layer.find('.popover');
        $popover.toggleClass('active');
        $popover.on('click', 'li', function(){
            $popover.removeClass('active');
        })
    });

    //轮训获取新消息
    setInterval(function(){
        tourpal.getMessage();
    }, 300000)
});
