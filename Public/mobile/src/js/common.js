define(['src/js/core', 'lib/fastclick'],function(core,FastClick){

// (function(){
    // 'use strict';//最好放在外边

    FastClick.attach(document.body);//attach fastclick

    //android 卡顿解决
    if ($("html").hasClass("android")) {
        $(".pages").addClass("page-fade");
    }

    if( core.isLowDevice ){
        $('html').addClass('low-device');
    }

// switch
    $(document).on("click", ".label-switch", function(e){

        var ele = $(this).find(".checkbox");

        if (ele.hasClass("active")) {
            ele.removeClass("active").attr("data-checkbox", "false");
        } else{
            ele.addClass("active").attr("data-checkbox", "true");
        }
        return false;
    });

// checkbox
    $(document).on("click", ".label-checkbox", function(e){

        var ele = $(this).find(".checkbox");

        if (ele.hasClass("checked")) {
            ele.removeClass("checked");
        } else{
            ele.addClass("checked");
        }
        return false;
    });


    //通用的后退按钮

    $(document).on("click", "[data-rel=back]", function(e){

        if( core.isLowDevice ){
            History.back();
        }else if (core.canGoBack()){//有id，则是其他页面转过来的
            History.back();
        }else if ($(this).attr("href")){

            var page = $(this).parents(".page");
            var id = page.attr("data-blend-id");
            var layerid = core.router.getidFromUrl($(this).attr("href"));
            core.addPager({
                // id:layerid,
                url:$(this).attr("href"),
                active:true,
                reverse:true
            });
        }else{
            location.href= "http://ly.elong.com/Mobile/Index/hotcity";
        }
        return false;
    });
    
    $(document).on("click", "a[href='#']", function(e){
        return false;
    });

    //1. 页面加载后，url变化
    var historyState = {};//在url变化时，控制是否进行js layer的创建

    $(document).on("beforeshow",function(ev){
        var layer = $(ev.srcElement || ev.target);
        if (layer.attr("data-blend") === 'layer') {//这里有url链接
            
            if ( layer.parent().attr("data-blend") === 'layerGroup' ){//layergroup 也是完整的页面
                if ( layer.parent().attr("data-routing") === 'false' ) {

                }else{
                    //routing === true , the url should replaced
                    // core.getActiveLayer().url = layer.attr("data-url");
                    (core.get(core.getActiveId())).url = layer.attr("data-url");
                    core.getActiveLayer().attr("data-url",layer.attr("data-url"));
                    // layer.parent().parent().attr("data-url",layer.attr("data-url"));//update parent layer url
                    History.replaceState({blendid:layer.attr("data-blend-id")},document.title,layer.attr("data-url"));
                }
                
            }else{
                // console.log("111111111",historyState[ev.detail]);
                if (!historyState[ev.detail]){//如果存在，说明是从前进后退导航来的，所以不需要pushState
                    historyState[ev.detail] = true;
                    History.pushState({blendid:layer.attr("data-blend-id")},layer.attr("data-blend-id"),layer.attr("data-url"));
                }
            }
            
        }
    });
    var titleControl = {};
    $(document).on("beforeshow",function(ev){
        var layer = $(ev.srcElement);
        if (layer.attr("data-title")) {//hit cache
            document.title = layer.attr("data-title");
            // titleControl[layer.attr("data-blend-id")] = true;
        }else{
            titleControl[layer.attr("data-blend-id")] = false;
        }
    });
    $(document).on("onrender",function(ev){
        var layer = $(ev.srcElement);
        if ( titleControl[layer.attr("data-blend-id")] === false ) {
            document.title = layer.attr("data-title");
        }
        if (layer.attr("data-title")) {
            titleControl[layer.attr("data-blend-id")] = layer.attr("data-title");
        }
    });
    $(document).on("onshow",function(ev){
        var layer = $(ev.srcElement);
        if (layer.attr("data-blend") === 'layer') {//这里有url链接
            historyState[ev.detail] = false;
            
        }
        // if (layer.parent().attr("data-blend") === 'layerGroup'){
        //     historyState[layer.parent().attr("data-blend-id")] = false;
        // }

    });
    //2. url变化后
    History.Adapter.bind(window,'statechange',function(){

        var state =History.getState();
        
        // var currenturl = Blend.ui.activeLayer.attr("data-url");
        //目的： 发现是否确定是浏览器行为，还是history行为
        // 浏览器行为，则进行页面跳转，js行为，则不变
        var layerid = core.router.getidFromUrl(state.url);

        if (!core.getActiveId() || (core.getActiveId() && layerid === core.getActiveId())) {
            console.log("active id === state layerid, return;");
            return ;
        }
        
        var dataurl = core.router.cleanUrl(state.url,layerid);

        if (!!titleControl[layerid] && titleControl[layerid] != document.title) {
            document.title = titleControl[layerid];
        }
        
        if (layerid && historyState[layerid] !== true && core.getActiveId() !== layerid ) {
        // alert($(core.get(layerid).main).css("transform"))
        // if (core.get(layerid)){
        //     console.log("statechange layerid: "+layerid+core.get(layerid).main.className);
        
        //     console.log("statechange activeId: "+core.getActiveId()+core.get(core.getActiveId()).main.className);
        // }
        
        // console.log("history js calling.... create layer...",layerid);
            //判断是否存在
            if ( core.get(layerid) ){
                if (! core.get(layerid).myGroup) {
                    historyState[layerid] = true;
                }
                
                core.get(layerid)["in"]({url:dataurl});
            }else{
                core.addPager({
                    // id: layerid,
                    url:state.url,
                    active:true,
                });
            }
            
        }
        
    });

});