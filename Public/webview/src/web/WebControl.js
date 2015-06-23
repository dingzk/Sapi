define(


        function(require) {
            var blend = require('src/web/blend');
            var lib = require('src/common/lib');
            var Control = require('src/web/Control');
            var events = require('src/web/events');


        /**
         * todo:这个WebControl不能合并到Control中么？
         * @class blend.webControl
         * @extends Control
         * @static
         */

        function WebControl(options) {

            Control.apply(this, arguments);
        }


        //重新实现

        WebControl.prototype.type = 'layout';

        // var myevents = [];

        //覆盖control的方法
        //js事件
        //处理内部事宜,也可用来指定dom事件
        //@params id for runtime use,useless for web
        WebControl.prototype.on = events.on;
        
        //监听一次
        WebControl.prototype.once = events.once;
        
        //@params id for runtime use,useless for web
        WebControl.prototype.off = events.off;
        

        WebControl.prototype.fire = events.fire;
        
        WebControl.prototype.isRender = function(boolrender){
            if (typeof boolrender !== 'undefined') {
                this.isRendered = boolrender;
            }else{
                return this.isRendered?this.isRendered:false;
            }
        };

        WebControl.prototype.animationEnd = function(callback) {
            var events = ['webkitAnimationEnd', 'OAnimationEnd', 'MSAnimationEnd', 'animationend'],
                i, j, me = this;
            function fireCallBack(e) {
                callback(e);
                for (i = 0; i < events.length; i++) {
                    me.off(events[i], fireCallBack);
                }
            }
            if (callback) {
                for (i = 0; i < events.length; i++) {
                    me.on(events[i], fireCallBack);
                }
            }
            return this;
        };
        WebControl.prototype.transitionEnd = function(callback) {
            var events = ['webkitTransitionEnd'],
                i, j, me = this;
            function fireCallBack(e) {
                callback(e);
                for (i = 0; i < events.length; i++) {
                    me.off(events[i], fireCallBack);
                }
            }
            if (callback) {
                for (i = 0; i < events.length; i++) {
                    me.on(events[i], fireCallBack);
                }
            }
            return this;
        };

        lib.inherits(WebControl, Control);

        return WebControl;
    }
);