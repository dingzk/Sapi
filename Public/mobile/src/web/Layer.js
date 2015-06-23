define(

    /**
     * Layer类，内含一个web容器，可以放置在手机屏幕的任何位置，动画可自定义
     * @class Layer
     * @extends WebControl
     * @static
     * @inheritable
     */

    function (require) {


        var lib = require('src/common/lib');
        var Control = require('src/web/WebControl');
        var blend = require('src/web/blend');
        
        var layerApi = require('src/web/layer/layerapi');

        var lowerAnimate = false;//$("html").hasClass("android");

        var loader = require('src/common/loader');

        /**
         * @constructor
         *
         * Layer 初始化参数;
         * @param {Object} options 有创建独立layer所需要的条件
         *
         * @param {String} options.url 页面url
         * @param {String} [options.id] layer实例id
         * @param {String} [options.top=0] layer距离屏幕top的坐标
         * @param {String} [options.left=0] layer距离屏幕left的坐标
         * @param {String} [options.width] layer像素宽度，默认全屏
         * @param {String} [options.height] layer像素高度，默认全屏
         * @param {boolean} [options.active] 是否立即激活
         * @param {boolean} [options.autoload] 是否预加载
         *
         * @param {boolean} [options.reverse] =true 动画是否反向
         * @param {String} [options.fx] ="none" 无动画
         * @param {String} [options.fx] ="slide" 默认从右往左，出场从左往右
         * @param {String} [options.fx] ="pop" 弹出
         * @param {String} [options.fx] ="fade" 透明度渐显
         * @param {number} [options.duration] 动画持续时间s
         * @param {String} [options.timingFn] 动画时间线函数@todo
         * @param {String} [options.cover] 是否覆盖效果，默认是推拉效果@todo

         *
         * @param {Function} [options.onrender] webview容器render成功的回调
         * @param {Function} [options.onload] webview页面onload的回调
         * @param {Function} [options.changeUrl] webview url改变的回调
         *
         * @param {Function} [options.onshow] layer被唤起时会触发此事件
         * @param {Function} [options.onhide] layer被隐藏时会触发此事件
         *
         * @param {boolean} options.pullToRefresh 是否支持下拉刷新
         * @param {String} options.pullText 下拉刷新默认文字。
         * @param {String} options.loadingText 下拉刷新加载中的文案。
         * @param {String} options.releaseText 下拉刷新释放刷新文字。

         * @param {String} options.ptrColor 文字颜色@todo
         * @param {Function} options.ptrFn 下拉刷新回调

         * @param {number} lindex 判断layer是前进操作还是后退操作，默认是前进
         
         * @returns this
         */
        var Layer = function (options) {
            
            Control.call(this, options);
            
            this._init(options);
            return this;
        };
        
        //继承control类;
        lib.inherits(Layer,Control);

        //初始化空函数
        Layer.prototype.onload = Layer.prototype.beforeshow = Layer.prototype.beforehide = lib.noop;

        Layer.prototype.constructor = Layer;

        Layer.prototype.top = 0;
        Layer.prototype.bottom = 0;
        Layer.prototype.left = 0;
        Layer.prototype.right = 0;

        Layer.prototype.pullText = "下拉刷新...";
        Layer.prototype.loadingText = "加载中...";
        Layer.prototype.releaseText = "释放刷新...";
       
        // "pullText":"下拉可以刷新⊙０⊙",
        // "loadingText":"更新中，请等待...",
        // "releaseText":"释放更新吧`(*∩_∩*)′",

        /**
         * @private
         * 实例初始化,根据传参数自动化实例方法调用, 私有方法;
         * @param {Object} options 创建layer的初始化参数
         */
        Layer.prototype._init = function(options){
            //处理options值;
            
            //before that , append dom in
            //更新逻辑，首先 new过的layer都会append到container上，但是，渲染模板的时候，会根据是否当前有动画，
            //如果没有正在动画，则直接渲染，有，则等待动画完成后渲染，防止动画过程中渲染页面(涉及到ajax取模板和数据的流程)
            var me = this;

            $(this.main).addClass('page');

            if (!this.myGroup && this.main.innerHTML==='') {
                this.main.innerHTML = '';
            }

            layerApi.resume(this);

            // if (!$('#'+ this.main.id).length) {
            //     if ( this.myGroup ) {//获取当前layer的
            //         console.log("layer group index..." + this.myGroup.index);
            //         container = $(this.myGroup.main) ;
            //     }else{
            //         container = $(".pages");
            //     }
            //     $(this.main).appendTo(container);
            // }

            if (options.main) {//本页已经render
                this.addState("got");
                options.main.setAttribute("data-title",document.title);
                blend.ready(function(){
                    me.fire('onrender');
                });
                
            }
            
            //监听事件
            this._initEvent();
            // var me = this;
            
            if (!this.url) {
                console.log("###No url for render###");
                // return false;
            }else{
                if ( this.autoload ) {
                    this.render();
                }
            }
            

            this.once("onrender",function(){
                //pull to refresh
                if (me.ptrFn) me.pullToRefresh = true;
                if ( me.pullToRefresh ) {
                    me.on('layerPullDown',function(event){
                        me.ptrFn && me.ptrFn(event);
                    });
                    layerApi.startPullRefresh(me);
                }
                
            });
            options.active && me["in"]();
            // console.log("options...",options.index)
            if (typeof options.index !== 'undefined'){
                this.main.setAttribute('data-blend-index', options.index);
            }
            //这里可以提示用户 doing render

            return this;
        };

        Layer.prototype._initEvent = function  () {
            var me = this;
            // var cancelTime = null;

            if ( this.layerAnimate === 'none') {
                lowerAnimate = true;
            }else if (this.layerAnimate){
                $(this.main).addClass(this.layerAnimate);
            }

            
            //native 下 layer 的载入和载出会触发in 和 out 事件 
            //web 下 layer的载入和 载出 均是 触发 自定义事件，自定义事件的this 是 Layer实例 （事件名相同： in out）
            // me.on('in',me.beforeshow);

            me.on('out',me.beforehide);

            //onload 与hybird 事件名保持一致
            // me.on('onload',me.onload);

            // me.on('beforeshow',me.beforeshow);
            // me.on('beforehide',me.beforehide);
            
            // me.on('onhide',function(event){
            //     me.onhide && me.onhide(event);
                
            // });
            me.on('onrender',function(event){
                var id = event['detail'];
                var dom = Blend.ui.get(id).main;
                loader.runScript(dom);

                me.stopLoading();
                me.removeState("get");
                me.addState("got");
            });

            me.on("renderfailed",function(event){
                me.stopLoading();
                me.removeState("get");
            });

            // me.onshow2 = me.onshow;
            me.on('onshow',function(event){

                //check if the layer is loaded
                me.render();
                

                //这里的逻辑可能比较难以理解
                //其实非常简单，当是layergroup的时候，layer.in，【不会】不会在layerStack中存储，而是替换，保持layergroup仅有一个layer在stack中
                // if (!me.myGroup || !me.myGroup.isActive()){//普通layer
                if ( !me.myGroup ){//普通layer
                }else{
                    blend.layerStack.pop();
                }
                
                if (me.myGroup) {
                    me.myGroup.activeId = event.detail;
                }else{
                    blend.layerStack.push(blend.activeLayer);
                }

            });

            //!FIXME SHOULD BE destroy
            me.on('beforedestroy',function(event){
                if (me.pullToRefresh ) {
                    layerApi.stopPullRefresh(me);
                    me.on('layerPullDown',me.ptrFn);
                }
                
            });
        };


        //默认属性
        Layer.prototype.type = "layer";
        // Layer.prototype.type = 'Pager';

        /**
         * loading状态出现的时间
         *
         * @cfg {Number} loadingTime 毫秒ms;
         */
        Layer.prototype.loadingTime = 500;
        

        /**
         * 创建渲染页面
         * @returns this 当前实例
         */
        Layer.prototype.paint = function(){
            var me = this;
            
            
            //1. load url
            layerApi.prepare(me.id,{
                url: me.url,
                top:me.top,
                left:me.left,
                bottom: me.bottom,
                right: me.right,
                tpl: me.tpl,
                // onsuccess:cb,//ADDED 
                // onfail:fail,
                pullToRefresh: me.pullToRefresh
            },me);
            
            //3. set pullToRefresh
            
            //4. set  position before animate.
            // $(this.main).addClass('page page-on-right');

            return this;
        };

        // var parentlayer = $(".page");

        /**
         * 激活页面

            options.reverse: me.reverse support
            options.fx: me.fx,
            options.duration: me.duration,
            options.timingFn: me.timingFn
            
         * @returns this 当前实例
         */
        Layer.prototype["in"] = function(options){
            

            //有一种情况不需要入场动画，比如：自己转自己
            if ( this.isActive() ) {
                console.log('layer is already activity ');
                return ;
            }

            if ( this.hasState("slidein") ) {
                console.log("this layer is sliding in.");
                this.removeState("slidein");
                return ;
            }

            if (options && options.url && decodeURI(options.url) !== decodeURI(this.url)) {
                console.log("layer url changed to..." + options.url);
                this.setUrl(options.url);// = options.url;
                this.removeState("got");
            }

            this.render();//auto has get state
            
            var me = this;
            
            this.addState("slidein");

            //动画的方向要判断
            var translationReverse = false;
            if (this.myGroup && this.myGroup.isActive() ) {//layer group 判断方向
                if ( this.myGroup.idtoindex(this.myGroup.activeId) > this.index ) {
                    translationReverse = true;
                }
            }



            var layerin;
            var layerinContext;
            var layerout;// = blend.activeLayer;
            var layeroutContext;// = blend.get(layerout.attr("data-blend-id"));

            layerin = $(this.main);
            layerinContext = this;


            if ( this.myGroup ) {
                var group = this.myGroup;
                if (!this.myGroup.isActive()){
                    layerin = $(group.main);
                    layerinContext = group;
                }
                //当 id layerout === layerin 的时侯，不转
                if ( group.activeId === layerinContext.id ) {
                    console.log('group.activeId is already activity,no need to slide out '+group.activeId);
                    // return;
                    layerout = $();
                }else{
                    layerout = $(group.__layers[group.activeId].main);
                    layeroutContext = group.__layers[group.activeId];
                }
                
            }else{
                layerout = blend.activeLayer;
                layeroutContext = blend.get(layerout.attr("data-blend-id"));
            }

            // var me = this;
            if (!this.myGroup || this.myGroup.isActive()){
                // layerin = $(this.main);
                // layerinContext = this;

                

            }else{//存在mygroup 并且 mygroup不是active的
                layerin = $(this.myGroup.main);
                layerinContext = this.myGroup;//SEE IT
                if (layerinContext.activeId !== this.id) {//layergoup的activeid 需要变化
                    //管理 activeid 放在了layer group里面
                    $(layerinContext.__layers[layerinContext.activeId].main).addClass("page-on-right").removeClass('page-on-center');
                    $(layerinContext.__layers[this.id].main).removeClass("page-on-right").addClass('page-on-center');
                   
                }
            }

            if ( options && options.reverse ) {
                translationReverse = !translationReverse;
            }else if (this.lindex) { //当前layer有lindex，则判断转出的是否具有，如果都具有进行lindex大小比较
                // 如果转出的lindex较大，则方向变换
                if (this.lindex && layeroutContext.lindex && layeroutContext.lindex > this.lindex) {
                    translationReverse = !translationReverse;
                }
            }

            
            if (!this.myGroup || !layerout.parent().hasClass("layerGroup")) {// 普通layer不需要转出操作
                // 特别的，添加是否子layer支持
                // 当子layer时，不需要转出，其他情况还是需要转出
                if ( this.isSubLayer() ) {
                    layerout = $();
                }
                
            }
            //优化逻辑
            var layerOutPosition,layerInPosition;
            if ( translationReverse ) {
                layerOutPosition = "right";
                layerInPosition = "left";
            }else{
                layerOutPosition = "left";
                layerInPosition = "right";
            }
            //标准的页面进入流程
            if ( lowerAnimate ) {
                
                layerin.removeClass('page-on-left page-on-right').addClass('page-on-center');
                layerout.removeClass("page-on-center").addClass("page-on-"+ layerOutPosition);
                
            }else{
                //1. 找到当前page，然后动画走掉
                layerout.removeClass("page-on-center").addClass("page-from-center-to-"+layerOutPosition);
                //2. 滑入新page
                // layerin.removeClass('page-on-'+layerOutPosition).addClass('page-on-'+layerInPosition).addClass('page-from-'+layerInPosition+'-to-center');
                layerin.removeClass('page-on-right').removeClass('page-on-left').addClass('page-from-'+layerInPosition+'-to-center');
            
            }
            
            me.fire("beforeshow");
            layeroutContext && layeroutContext.fire("beforehide");

            var afteranimate = function(){
                    me.removeState("slidein");
                    me.fire("onshow");
                    layeroutContext && layeroutContext.fire("onhide");
            };
            //入场动画结束
            if (!lowerAnimate){
                layerinContext.animationEnd(function(){

                    //执行靠边操作
                    layerout.removeClass(function(index,css){
                        return (css.match (/\bpage-from\S+/g) || []).join(' ');
                    });
                    //执行居中操作
                    layerin.removeClass(function(index,css){
                        return (css.match (/\bpage-from\S+/g) || []).join(' ');
                    });

                    var checkActive;
                    if ( me.myGroup ) {//重新获取一次，因为动画期间可能发生很多事情
                        checkActive = $(me.myGroup.__layers[me.myGroup.activeId].main);
                    }else{
                        checkActive = blend.activeLayer;
                    }
                    
                    if ( checkActive.attr("data-blend-id") !== layerout.attr("data-blend-id") ){
                        layerout.addClass("page-on-"+layerOutPosition);
                    }
                    
                    if ( checkActive.attr("data-blend-id") === layerin.attr("data-blend-id") ){
                        layerin.addClass('page-on-center');
                    }
                    
                    afteranimate();
                    
                });
            }else{
                afteranimate();//无动画
            }

            //更新active page , 在 swipe api中，同样需要更新
            if (!this.myGroup) {
                blend.activeLayer = $(me.main);
            }else{
                me.myGroup.activeId = this.id;
            }
            

            return this;
        };

        /**
         * 当前layer退场，返回上一个Layer
         * @returns this 当前实例
         */
        Layer.prototype.out = function( options ){
            //go back
            var me = this;

            if ( !this.isActive() ) {
                console.log('layer is already inactivity ');
                return ;
            }

            if (this.isRefreshing()){
                this.endPullRefresh();
            }

            
            var parentlayer = blend.layerStack.length>1?blend.layerStack[blend.layerStack.length-2]:$(".page-on-left");//FIXME should be better to select only one!

            // if (!this.myGroup ) {// 普通layer的转出 不需要其他layer配合。
            //     parentlayer = $();
            // }
            var layerout = $(me.main);
            var layerin = parentlayer;
            var layerinContext = blend.get(layerin.attr("data-blend-id"));

            var inobj = Blend.ui.get(layerin.attr("data-blend-id"));
            inobj && inobj.addState("slidein");

            if (!this.myGroup || !layerout.parent().hasClass("layerGroup")) {// 普通layer不需要转出操作
                // parentlayer = $();
                // layerin = $();
                if ( this.isSubLayer() ) {
                    layerin = $();
                }
            }

            if ( lowerAnimate ) {
                layerin.removeClass("page-on-left").addClass("page-on-center");
                layerout.removeClass("page-on-center").addClass('page-on-right');
            }else{
                layerin.removeClass("page-on-left").addClass("page-from-left-to-center");
                layerout.removeClass("page-on-center").addClass('page-from-center-to-right');
            }
            
            
            me.fire("beforehide");
            
            layerinContext && layerinContext.fire("beforeshow");
            
            var afteranimate = function(){
                
                me.fire("onhide");

                layerinContext && layerinContext.fire("onshow");
                
                blend.activeLayer = parentlayer;
                inobj && inobj.removeState("slidein");
                // me.dispose();
            };
            if ( !me.myGroup ) {
                blend.layerStack.pop();//pop立即更新，push 则要等待animate完成后更新， 原因是要确保in和out的次序不会错误
            }
            
            //出场动画结束
            if (lowerAnimate) {
                afteranimate();
            }else{
                this.animationEnd(function(){
                    afteranimate();
                    parentlayer.removeClass("page-from-left-to-center").addClass("page-on-center");
                    layerout.removeClass('page-from-center-to-right').addClass("page-on-right");
                });
            }
            

            return this;
        };

        /**
         * 重新刷新页面
         *
         * @param {String} url 刷新页面时所用的url
         * @returns this
         */
        Layer.prototype.reload = function(url,callback){
            //reload
            //1. destroy
            // this.destroy();
            //2. got items
            var obj = {
                url :url,
                onsuccess:this.onsuccess,
                onfail:this.onfail,
                top:this.top,
                left:this.left,
                right:this.right,
                bottom:this.bottom
            };
            //TODO IT 
            // this.fire("changeUrl");

            this.isRender(false);
                    
            layerApi.prepare(this.id , obj, this);

            if (typeof callback === 'function') {
                this.once("onrender",callback);
            }
      
            return this;
        };

        Layer.prototype.isSubLayer = function(){
            return (this.sublayer || this.myGroup)?true:false;
        };

        /**
         * 检测 layer拉动刷新状态
         *
         * returns bool
         */
        Layer.prototype.isRefreshing = function(context){
             return layerApi.isRefreshing(context || this);
        };

        /**
         * 停止layer拉动刷新状态
         *
         * returns this
         */
        Layer.prototype.stopPullRefresh = function(context){
            //set pull to refresh
            layerApi.stopPullRefresh(context|| this);
            return this;
        };
        Layer.prototype.endPullRefresh = function(context){
            //end pull to refresh loading status
            layerApi.endPullRefresh(context|| this);
            return this;
        };

        /**
         * 销毁此layer
         * @returns this
         */
        Layer.prototype.destroy = function(){
            Control.prototype.destroy.apply(this, arguments);
        };

        

        /**
         * url 替换
         *
         * @param {String} url 刷新页面时所用的url
         * @returns this
         */
        Layer.prototype.replace = function(url){
            me.url = url;
            // layerApi.replaceUrl(this.id,url);
            return this;
        };

        /**
         * 开始loading状态
         * @returns this
         */
        Layer.prototype.startLoading = function(){
            if (!$('.preloader-indicator-overlay').length)
                $(this.main).append('<div class="preloader-indicator-overlay"></div><div class="preloader-indicator-modal"><span class="preloader"></span></div>');
            return this;
        };
        /**
         * 停止loading状态
         * @returns this
         */
        Layer.prototype.stopLoading = function(){
            $('.preloader-indicator-overlay').remove();
            return this;
        };
        
        /**
         * 获取layer的当前url
         * @returns 
         */
        Layer.prototype.getUrl = function(){
            return this.url;
        };
        
        /**
         * 获取layer是否可以history go
         * @returns boolean
         */
        Layer.prototype.canGoBack = function(){

            return blend.canGoBack();
        };

        /**
         * 清除history堆栈,web 做不到
         * @returns boolean
         */
        Layer.prototype.clearHistory = function(){
            console.error("web cant clearHistory");
        };

        /**
         * layer是否是激活状态
         * @returns boolean
         */
        Layer.prototype.isActive = function(){
            return $(this.main).hasClass("page-on-center");//blend.activeLayer.attr("id") === this.main.id;
        };


        return Layer;
    }
);