define(['lib/zepto','src/web/main','lib/zepto.history','src/js/pageStorage'],function(zepto,blend,his){
    
    // 设计思路
    // 1. 使用
    // 2. 使用history.js 兼容h5和低端浏览器 // 低端浏览器不执行history.js 还是直接跳转，这是一个问题。

    // requirejs 单例
    if (typeof slark !== 'undefined') return slark;
    

    var core = {};
    core.isLowDevice = (function(){
        var ua = navigator.userAgent.toLowerCase();
        //(screen.width < 720) || (screen.height < 720) ||
        //android低端机
        if( ua.indexOf('iemobile') !== -1  || ((ua.indexOf('android') !== -1) && 
                    ((/ucbrowser\/[2-9]\./.test(ua)) ||  (/android [1-2]\./.test(ua))))){
            return true;
        }

        return false;
    })();
    
    var router = function(){
        this.routers = {};
    };
   
    router.prototype.add = function(config){
        for(var i in config){
            this.routers[i] = config[i];
        }
    };

    router.prototype.getInfoFromUrl = function(url) {
        // ifgetIdFromUrl
        var matches;
        for(var i in this.routers) {
            if (url.match(this.routers[i].url)) {
                if (matches) {
                    if (matches.url.length < this.routers[i].url.length ){
                        matches = this.routers[i];
                    }
                }else{
                    matches = this.routers[i];
                }
            }
        }
        return matches;
    };
    router.prototype.getidFromUrl = function(url) {
        // ifgetIdFromUrl
        var info = this.getInfoFromUrl(url);
        return info && info.tpl;
    };
    router.prototype.getUrlFromTpl = function(tpl) {
        return this.routers[tpl] && this.routers[tpl].url ||"";
     
    };

    router.prototype.cleanUrl = function(url,tpl) {
        if (typeof tpl !== 'string') {
            tpl = this.getidFromUrl(url);
        }

        var tplhtml = this.getUrlFromTpl(tpl);
        return url.substring(url.lastIndexOf(tplhtml));
    };

    core.onrender = function(id,callback) {
        if (typeof id === 'function') {
            $(document).on("onrender",function(){
                id();
            });
        }else{
            blend.layerInit(id,callback);
        }
        
    };

    core.onreload = function(){
        
    }
    

    core.router = new router();
   
    core.addPager = function(options) {
        var layerid;
        var shouldredirect = core.isLowDevice?true:false;

        if (options.id ){
            layerid = options.id;
        }else {
            var info = core.router.getInfoFromUrl(options.url);
            if (info ) {
                layerid = options.id = info.tpl; // tpl is id
                options.lindex = info.lindex;
            }else{
                console.log("no info... shouldredirect to true");
                shouldredirect = true;
                // return ;
                // location.href = options.url;
                // return false;
            }
        }

        if( shouldredirect ){
            if(!options.main){
                location.href = options.url;
                return false;
            }
        }

        //clean url 
        //options.url = core.router.cleanUrl(options.url);

        if (layerid && core.get(layerid) ){
            core.get(layerid)["in"](options);
        }else{
            return new blend.Layer(options);
        }
        
    };

    core.addGroup = function(options) {
        return new blend.LayerGroup(options);
    };
    core.get = function(id) {
        return blend.get(id);
    };

    core.canGoBack = function() {
        return blend.canGoBack();
    };

    core.getActiveId = function(){
        return blend.activeLayer.attr("data-blend-id");
    };

    core.getActiveLayer = function(){
        return blend.activeLayer;
    };

    core.moveWidget = function(widget, from, to){
        //animation don't support android 2.3, so use transition
        if (core.isLowDevice){
            widget.addClass("page-on-" + to);
            widget.removeClass("page-on-" + from);
        }else{
            widget.bind("webkitAnimationEnd OAnimationEnd MSAnimationEnd animationend", function(){
                widget.addClass("page-on-" + to);
                widget.removeClass("page-on-" + from);
                widget.removeClass("page-from-" + from + "-to-" + to);
                widget.unbind("webkitAnimationEnd OAnimationEnd MSAnimationEnd animationend");
            });

            widget.removeClass("page-on-"+from).addClass("page-from-" + from + "-to-" + to);
        }
        
    }

    core.transitionEnd = (function(){
        var t;
        var el = document.createElement('element');
        var transitions = {
            'WebkitTransition': 'webkitTransitionEnd',
            'OTransition': 'oTransitionEnd',
            'MozTransition': 'transitionend',
            'MsTransition': 'msTransitionEnd',
            'transition': 'transitionend'
        }
        for (t in transitions) {
            if (el.style[t] !== undefined) {
                return transitions[t];
            }
        }
    })();

    core.init = function(){
        //首先判断给本layer一个独立页面
        if ($(".pages>.page").length === 1) { //符合web blendui 规范
            var pager = $(".pages>.page");
            if ( !pager.attr("data-blend") ){
                var url = location.pathname;
                // url = url[url.length-1];
                // pager.attr("data-url",url);
                pager.addClass("page-on-center");

                // var layerid = core.router.getidFromUrl(url);

                var p = new core.addPager({
                    // id:layerid,
                    url:url,
                    main:pager[0],
                    active:true
                });
                
            }
        }
    };

    core.ui = blend;



    window.slark = core;
    return core;

});