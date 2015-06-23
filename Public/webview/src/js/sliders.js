/**
 * @fileoverview slider组件
 * 依赖 lib/zeptov1.0.js
 * 用法 : new $.touchSlider(".filt-popc", { wrap: ".filt-popc-cont",trigger: ".filt-popc-nav",duration: 500,len : 4});
 * 支持translate3d
*/
define(['src/js/core'], function(core){
	/*
	从Modernizr.js中移植出来
	*/
	var css3 = {},
	docElement = document.documentElement,
	mod = 'modernizr',
	injectElementWithStyles = function( rule, callback, nodes, testnames ) {
		var style, ret, node,
		div = document.createElement('div'),
		  // After page load injecting a fake body doesn't work so check if body exists
		body = document.body,
		  // IE6 and 7 won't return offsetWidth or offsetHeight unless it's in the body element, so we fake it.
		fakeBody = body ? body : document.createElement('body');
		
		if ( parseInt(nodes, 10) ) {
		  // In order not to give false positives we create a node for each test
		  // This also allows the method to scale for unspecified uses
		  while ( nodes-- ) {
			  node = document.createElement('div');
			  node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
			  div.appendChild(node);
		  }
		}
		
		// <style> elements in IE6-9 are considered 'NoScope' elements and therefore will be removed
		// when injected with innerHTML. To get around this you need to prepend the 'NoScope' element
		// with a 'scoped' element, in our case the soft-hyphen entity as it won't mess with our measurements.
		// msdn.microsoft.com/en-us/library/ms533897%28VS.85%29.aspx
		// Documents served as xml will throw if using &shy; so use xml friendly encoded version. See issue #277
		style = ['&#173;','<style id="s', mod, '">', rule, '</style>'].join('');
		div.id = mod;
		// IE6 will false positive on some tests due to the style element inside the test div somehow interfering offsetHeight, so insert it into body or fakebody.
		// Opera will act all quirky when injecting elements in documentElement when page is served as xml, needs fakebody too. #270
		(body ? div : fakeBody).innerHTML += style;
		fakeBody.appendChild(div);
		if ( !body ) {
		  //avoid crashing IE8, if background image is used
		  fakeBody.style.background = "";
		  docElement.appendChild(fakeBody);
		}
		
		ret = callback(div, rule);
		// If this is done after page load we don't want to remove the body so check if body exists
		!body ? fakeBody.parentNode.removeChild(fakeBody) : div.parentNode.removeChild(div);
		return !!ret;
	}
	var cssomPrefixes = 'Webkit Moz O ms'.split(' '),
	mStyle = docElement.style;
	function is( obj, type ) {
		return typeof obj === type;
	}
	function testProps( props, prefixed ) {
		for ( var i in props ) {
			if ( mStyle[ props[i] ] !== undefined ) {
				return prefixed == 'pfx' ? props[i] : true;
			}
		}
		return false;
	}
	function testPropsAll( prop, prefixed, elem ) {
		var ucProp = prop.charAt(0).toUpperCase() + prop.substr(1),
			props = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

		// did they call .prefixed('boxSizing') or are we just testing a prop?
		if(is(prefixed, "string") || is(prefixed, "undefined")) {
		  return testProps(props, prefixed);

		// otherwise, they called .prefixed('requestAnimationFrame', window[, elem])
		} else {
		  //props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' ');
		  //return testDOMProps(props, prefixed, elem);
		}
	}
	css3['hasTransform'] = function() {
        return !!testPropsAll('transform');
    };
	css3['has3d'] = function(){
		var ret = !!testPropsAll('perspective');
		// Webkit's 3D transforms are passed off to the browser's own graphics renderer.
		// It works fine in Safari on Leopard and Snow Leopard, but not in Chrome in
		// some conditions. As a result, Webkit typically recognizes the syntax but
		// will sometimes throw a false positive, thus we must do a more thorough check:
		if ( ret && 'webkitPerspective' in docElement.style ) {
		  // Webkit allows this media query to succeed only if the feature is enabled.
		  // `@media (transform-3d),(-webkit-transform-3d){ ... }`
		  injectElementWithStyles('@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}', function( node, rule ) {
			ret = node.offsetLeft === 9 && node.offsetHeight === 3;
		  });
		}
		return ret;
	}
	var isAndroid = (/android/gi).test(navigator.appVersion),
	has3d = css3.has3d(),
	hasTransform = css3.hasTransform(),
	gv1 = has3d ? 'translate3d(' : 'translate(',
	gv2 = has3d ? ',0)' : ')';
	$.touchSlider = function(container,options){
		if(!container) {
			return null;
		}
		if(options) {
			options.container = container;//container会覆盖options内的container
		}else {
			options = typeof container == "string" ? {"container" : container} : container;
		}
		$.extend(this,{
			container    : ".slider",  	//大容器，包含面板元素、触发元素、上下页等
			wrap 	     : null,  		//滑动显示区域，默认为container的第一个子元素。（该元素固定宽高overflow为hidden，否则无法滑动）
			panel 	     : null,  		//面板元素，默认为wrap的第一个子元素
			trigger 	 : null,   		//触发元素，也可理解为状态元素
			activeTriggerCls : "sel",   //触发元素内子元素的激活样式
			hasTrigger   : true,  		//是否需要触发事件，例tab页签就需要click触发
			hasTouch 	 : true,  		//是否需要触摸事件，例tab页签就需要touch触发
			steps 		 : 0,  			//步长，每次滑动的距离
			autoResize   : 1,			//处理窗口变化
			left 		 : 0,  			//panel初始的x坐标
			reduce 		 : 0,			//需要剔除的额外距离
			visible 	 : 1,  			//每次滑动几个panels，默认1
			margin 		 : 0,  			//面板元素内子元素间的间距
			curIndex 	 : 0,  			//初始化在哪个panels上，默认0为第一个
			len 		 : 3,			//子元素的个数
			duration 	 : 500,  		//动画持续时间
			loop 		 : false,  		//动画循环
			play 		 : false,  		//动画自动播放
			repeat 		 : -1,			//需要去重索引值
			interval 	 : 5000,  		//播放间隔时间，play为true时才有效
			useTransform : !isAndroid,  //以translate方式动画
			isEvent  	 : true,		//如果单个Tab，禁止绑定事件
			callback 	 : null, 		//动画结束后触发
			prev 		 : null,  		//上一页
			next 		 : null,  		//下一页
			activePnCls  : "none"  		//prev和next在头尾时的样式
		},options);
		this.initialize();
	}
	$.extend($.touchSlider.prototype,{
		initialize : function(){
			this.findEl() && this.init();
			this.isEvent && this.initEvent();
		},
		reset : function(options){
			$.extend(this,options || {});
			this.init();
			if(!this.isEvent){
				this.destroy();
			}else{
				this.initEvent();
			}
		},
		resetItemWidth: function(a) {
            var b = this,c = this.panel.find("li");
            this.wrap.css({
                height   : (this.ratio || .2708) * a + "px",
                width    : a + "px",
                overflow : "hidden"
            });
            this.itemWidth = a;
            this.steps = this.itemWidth;
            this.panel.css("width", this.itemWidth * c.length);
            this.panel.find("img").css("width","100%");
            c.css("width", this.itemWidth);
            c.eq(c.length - 1).css("left", -b.steps * c.length);
            this.slideTo(this.curIndex);
        },
		findEl : function(){
			var container = this.container = $(this.container);
			if(!container.length){
				return null;
			}
			this.wrap = this.wrap && container.find(this.wrap) || container.children().first();
			if(!this.wrap.length){
				return null;
			}
			this.panel = this.panel && container.find(this.panel) || this.wrap.children().first();
			if(!this.panel.length){
			  return null;
			}
			this.panels = this.panel.children();
			if(!this.panels.length){  	  	 //对于没有图片的元素，直接隐藏
				this.container.hide();
				return null;
			}
			this.trigger = this.trigger && container.find(this.trigger);
			this.prev = this.prev && container.find(this.prev);
			this.next = this.next && container.find(this.next);
			return this;
		},
		init : function(){
			var wrap  = this.wrap,
			panel     = this.panel,
			container = this.container,
			panels    = this.panels,
			trigger   = this.trigger,
			len = this.len || panels.length,  //子元素的个数
			margin = this.margin,
			allWidth = 0,  					  //滑动容器的宽度
			status = this.visible,  		  //每次切换多少个panels
			useTransform = this.useTransform = hasTransform ? this.useTransform : false;  //不支持直接false,android默认false
			var fact = (this.fact ? this.fact.width() : wrap.width()) - this.reduce;
			this.steps = fact;  	  		  //滑动步长，默认wrap的宽度
			var alls = this.steps;
			panels.each(function(n,item){
				$(item).css("width",alls);
				allWidth += alls;
			});
			if(margin && typeof margin == "number"){
				allWidth += (len - 1) * margin;//总宽度增加
				this.steps += margin;  		   //步长增加margin
			}
			if(status > 1){					   //如果一页显示的子元素超出1个，或设置了步长，则不支持循环；若自动播放，则只支持一次
				this.loop = false;
			}  
			//初始位置
			var initLeft = this.left;
			initLeft -= this.curIndex * this.steps;
			this.setCoord(panel,initLeft);
			if(useTransform){
				wrap.css({"-webkit-transform":"translate3d(0,0,0)"});  //防止ios6下滑动会有顿感
				panel.css({"-webkit-backface-visibility":"hidden"});
				panels.css({"-webkit-transform":gv1 + "0,0" + gv2});
			}
			var pages = this._pages = Math.ceil(len/status);  //总页数
			//初始坐标参数
			this._minpage = 0;  			  //最小页
			this._maxpage = this._pages - 1; //最大页
			if(pages <= 1){ 				  //如果没超出一页，则不需要滑动
			    trigger && trigger.hide();
				return null;
			}
			if(this.loop){ 				  //复制首尾以便循环
				panel.append(panels[0].cloneNode(true));
				var lastp = panels[len - 1].cloneNode(true);
				panel.append(lastp);
				lastp.style.cssText += "position:relative;left:" + (-this.steps * (len + 2)) + "px;";
				allWidth += panels[0].offsetWidth;
				allWidth += panels[len - 1].offsetWidth;
			}
			panel.css("width",allWidth);
			if(trigger && trigger.length){    //如果触发容器存在，触发容器无子元素则添加子元素
				var temp = "",
				childstu = trigger.children();
				if(!childstu.length){
					for(var i = 0;i < pages;i++){
						temp += "<span" + (i == this.curIndex ? " class=" + this.activeTriggerCls + "" : "") + "></span>";
					}
					trigger.html(temp);
				}
				this.triggers = trigger.children();
				this.triggerSel = this.triggers[this.curIndex];  //当前状态元素
			}
			else{
				this.hasTrigger = false;
			}
			this.update();
			return this;
		},
		initEvent : function(){
			var that = this,
			_panel   = that.wrap[0],  //外层容器
			prev     = that.prev,
			next     = that.next,
			triggers = that.triggers;
			if(_panel.addEventListener){
				if(that.hasTouch){
					_panel.addEventListener("touchstart", that, false);
					_panel.addEventListener("touchmove", that, false);
					_panel.addEventListener("touchend", that, false);
					_panel.addEventListener("webkitTransitionEnd", that, false);
				}
			}
			if(that.play){
				that.begin();
			}
			if(prev && prev.length){
				prev.on("click", function(e){
					that.backward.call(that,e)
				});
			}
			if(next && next.length){
				next.on("click", function(e){
					that.forward.call(that,e)
				});
			}
			if(that.hasTrigger && triggers){
				triggers.each(function(n,item){
					$(item).on("click",function(){
						that.slideTo(n);
					});
				});
			}
			that.isEvent = 1;
			if(that.autoResize){
			  // 转屏事件检测
			  $(window).on('ortchange', function() {
				  that.init();
			  });
			  // 屏幕窗口变化事件检测
			  $(window).on('resize', function() {
				  that.init();
			  });
			}
		},
		handleEvent : function(e){
			switch(e.type){
				case 'touchstart':
					this.start(e);
				  break;
				case 'touchmove':
					this.move(e);
				  break;
				case 'touchend':
				case 'touchcancel':
					this.end(e);
				  break;
				case 'webkitTransitionEnd':
					this.transitionEnd(e); 
				  break;
			}
		},
		start : function(e){  											//触摸开始
			var et = e.touches[0];
			this._movestart = undefined;
			this._disX = 0;
			this._coord = {
				x : et.pageX , 
				y : et.pageY
			};
		},
		move : function(e){
			if(e.touches.length > 1 || e.scale && e.scale !== 1) return;
			var et = e.touches[0],
			disX = this._disX = et.pageX - this._coord.x,
			initLeft = this.left,
			tmleft;
			if(typeof this._movestart == 'undefined'){  				//第一次执行touchmove
				this._movestart = !!(this._movestart || Math.abs(disX) < Math.abs(et.pageY - this._coord.y));
			}
			
			if(!this._movestart){ 										//不是上下
				e.preventDefault();
				this.stop();
				if(!this.loop){  //不循环
					disX = disX / ( (!this.curIndex && disX > 0 || this.curIndex == this._maxpage && disX < 0 ) ? ( Math.abs(disX) / this.steps + 1 ) : 1 );  //增加阻力
				}
				tmleft = initLeft - this.curIndex * this.steps + disX;
				this.setCoord(this.panel , tmleft);
				this._disX = disX;
			}
		},
		end : function(e){
			if(!this._movestart){ 											 //如果执行了move
				var distance = this._disX;
				if(distance < -10){
					e.preventDefault();
					this.forward();
				}else if(distance > 10){
					e.preventDefault();
					this.backward();
				}
			}
		},
		backward : function(e){
			if(e && e.preventDefault){
			   e.preventDefault();
		    }
			var cur  = this.curIndex;
			var minp = this._minpage;
			cur -= 1;
			if(this.repeat >= 0 && cur == this.repeat){
			   cur -= 1;
			}
			if(cur < minp){
				if(!this.loop){
					cur = minp;
				}else{
					cur = minp - 1;
				}
			}
			this.slideTo(cur);
		},
		forward : function(e){
			if(e && e.preventDefault){
				e.preventDefault();
			}
			var cur  = this.curIndex;
			var maxp = this._maxpage;
			cur += 1;
			if(this.repeat >= 0 && cur == this.repeat){
			   cur += 1;	
			}
			if(cur > maxp){
				if(!this.loop){
					cur = maxp;
				}else{
					cur = maxp + 1;
				}
			}
			this.slideTo(cur);
		},
		setCoord : function(obj,x){
			this.useTransform && obj.css("-webkit-transform",gv1 + x + "px,0" + gv2) || obj.css("left",x);
		},
		slideTo : function(cur,duration){
			cur = cur || 0;
			this.curIndex = cur; 					 //保存当前屏数
			var panel = this.panel,
			style   = panel[0].style,
			scrollx = this.left - cur * this.steps;
			style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration = style.OTransitionDuration = style.transitionDuration = (duration || this.duration) + 'ms';
			this.setCoord(panel,scrollx);
			this.update();
			!this.hasTouch && this.callback && this.callback();
		},
		transitionEnd : function(){
			var panel = this.panel,
			style = panel[0].style,
			loop = this.loop,
			cur = this.curIndex;
			if(loop){  								  //把curIndex和坐标重置
				if(cur > this._maxpage){
					this.curIndex = 0;
				}else if(cur < this._minpage){
					this.curIndex = this._maxpage;
				}
				this.setCoord(panel,this.left - this.curIndex * this.steps);
			}
			if(!loop && cur == this._maxpage){  	//不循环的，只播放一次
				this.stop();
				this.play = false;
			}
			else{
				this.begin();
			}
			this.update();
			style.webkitTransitionDuration = style.transitionDuration = 0;
			this.updateArrow();
			this.hasTouch && this.callback && this.callback();
		},
		update : function(){
			var triggers  = this.triggers;
			var cls 	  = this.activeTriggerCls;
			var curIndex  = this.curIndex;
			if(triggers && triggers[curIndex]){
				this.triggerSel && (this.triggerSel.className = "");
				triggers.removeClass(cls);
				triggers[curIndex].className = cls;
				this.triggerSel = triggers[curIndex];
			}
		},
		//左右箭头状态
		updateArrow : function(){ 			 	  
			var prev = this.prev;
			var next = this.next;
			if(!prev || !prev.length || !next || !next.length) {
				return;
			}
			//循环不需要隐藏
			if(this.loop) {
				return;  			  
			}
			var cur    = this.curIndex;
			var cls    = this.activePnCls;
			var max    = this._maxpage ;
			var repeat = this.repeat;
			if(cur <= 0){
			   prev.addClass(cls);	
			}else{
			   prev.removeClass(cls);	
			}
			if(cur >= max){
			   next.addClass(cls);	
			}else{
			   next.removeClass(cls);	
			}
			//需要去重索引
			if(repeat > -1){
			   //如果去重索引为0，则cur判断1	
			   if(cur == 1 && repeat == 0)	{
				  prev.addClass(cls);	 
			   }
			   //如果去重索引为max，则cur判断 max - 1
			   if(cur == max - 1 && repeat == max){
				  next.addClass(cls);	 
			   }
			}
		},
		begin : function(){
			var that = this;
			if(that.play && !that._playTimer){   //自动播放
				that.stop();
				that._playTimer = setInterval(function(){
					that.forward();
				},that.interval);
			}
		},
		stop : function(){
			var that = this;
			if(that.play && that._playTimer){
				clearInterval(that._playTimer);
				that._playTimer = null;
			}
		},
		destroy : function(){
			var that = this,
			_panel = that.wrap[0],
			prev = that.prev,
			next = that.next,
			triggers = that.triggers;
			if(_panel.removeEventListener){
				if(that.hasTouch){
					_panel.removeEventListener('touchstart', that, false);
					_panel.removeEventListener('touchmove', that, false);
					_panel.removeEventListener('touchend', that, false);
					_panel.removeEventListener('webkitTransitionEnd', that, false);
				}
			}
			if(prev && prev.length) prev.off('click');
			if(next && next.length) next.off('click');
			if(that.hasTrigger && triggers){
				triggers.each(function(n,item){
					$(item).off('click');
				});
			}
			that.isEvent = 0;	//事件不存在
		}
	});
	$.touchSlider.cache = [];
    $.fn.slider = function(options){
        return this.each(function(n,item){
            if(!item.getAttribute('l')){
                item.setAttribute('l',true);
                $.touchSlider.cache.push(new $.touchSlider(item,options));
            }
        });
    }
    $.touchSlider.destroy = function(){
        var cache = $.touchSlider.cache,
            len = cache.length;
        if(len < 1){return;}
        for(var i=0;i<len;i++){
            cache[i].destroy();
        }
        $.touchSlider.cache = [];
    }
})