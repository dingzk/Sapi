define(['src/js/core'], function(core){

	/*继承方法，同名属性若同为对象则递归继承该对象，否则重写*/
	function inheritObject(extend, base){
		for(var i in base){
			if(!extend[i]){
				extend[i] = base[i];
			} else {
				//同名属性同为对象，递归继承该对象
				if(typeof extend[i] == "object" && typeof base[i] == "object"){
					inheritObject(extend[i], base[i]);
				}
			}
		}
	}

	(function(){
		if(location.href.indexOf('&!_PLU_') > 0){
			var activeId = core.getActiveId();

			History.replaceState(activeId, document.title, location.href.split('&!_PLU_')[0]);
		}
	})();

	PluginManager = {
		plugins : {},
		isHashChangeByPlugin : false,
		lastUrl : location.href,
		/*-----------插件基础对象base start-----------*/
		base : {
			id : null,
			option : {
				showType : "animation", //类型：animation/transition, transition需搭配class选项
				transitionClass : "" //showType为transition时搭配使用的class
			},
			init : function(){

			},
			page : null,
			beforeShow : function(){
				return false;
			},
			//上一次执行show方法时传入的参数
			lastShowArguments : null,
			show : function(){
				//若beforeShow返回为true，则不执行后面的流程
				if(!!this.beforeShow.apply(this, arguments)) return; 

				if(this.option.showType == "animation"){
					core.moveWidget(this.page, "right", "center");
				} else {
					this.page.addClass(this.option.transitionClass);
				}

				this.afterShow.apply(this, arguments);
				this.lastShowArguments = arguments;
				//如果非hashchange触发，hash中增加当前插件的标识
				if(location.href.indexOf("&!_PLU_" + this.id) < 0){
					var activeId = core.getActiveId();
					var url = location.href + (location.search === "" ? "?_=1" : "") +　"&!_PLU_" + this.id;

					PluginManager.isHashChangeByPlugin = true;
					History.pushState(activeId, document.title, url);
				}
			},
			afterShow : function(){

			},
			beforeHide : function(){

			},
			hide : function(){
				if(this.beforeHide()) return;

				if(this.option.showType == "animation"){
					core.moveWidget(this.page, "center", "right");
				} else {
					this.page.removeClass(this.option.transitionClass);
				}

				//如果非hashchange触发，取消hash中该插件的标识
				if(location.href.indexOf("&!_PLU_" + this.id) > 0){
					PluginManager.isHashChangeByPlugin = true;
					History.back();
				}

				this.afterHide();
			},
			afterHide : function(){

			},
			//将插件节点从dom树上移除
			destroy : function(){
				this.page.remove();
			},
			//恢复之前被删除的插件节点
			restore : function(activeId){
				this.page.appendTo(core.get(activeId).main);
			}
		},
		/*-----------插件基础对象base end-----------*/

		//添加插件并继承base对象的方法
		add : function(id, plugin){
			var currentPagePlugins = this.getCurrentPagePlugins();

			if(!currentPagePlugins) {
				currentPagePlugins = {};
				this.setCurrentPagePlugins(currentPagePlugins);
			}

			var _this = this;

			inheritObject(plugin, this.base);
			plugin.id = id;
			plugin.init();
			plugin.destroy();
			plugin.restore(core.getActiveId());
			currentPagePlugins[id] = plugin;
		},
		//获得当前页面的插件
		getCurrentPagePlugins : function(){
			return this.plugins[core.getActiveId()];
		},
		//设置当前页面的插件
		setCurrentPagePlugins : function(currentPagePlugins){
			this.plugins[core.getActiveId()] = currentPagePlugins;
		},
		//获取当前页面对应id的插件
		getItem : function(id){
			var currentPagePlugins = this.getCurrentPagePlugins();

			return !!currentPagePlugins ? currentPagePlugins[id] : null;
		},
		//移除当前页面对应id的插件
		remove : function(id){
			var currentPagePlugins = this.getCurrentPagePlugins();

			currentPagePlugins[id].destroy();
			delete currentPagePlugins[id];
		},
		//页面隐藏后移除该页面所有的插件节点
		removePluginBeforePageHide : function(activeId){
			var currentPagePlugins = this.plugins[activeId];

			if(!currentPagePlugins) return;

			for(var i in currentPagePlugins){
				currentPagePlugins[i].destroy();
			}
		},
		//进入页面后恢复之前删除的插件节点
		restorePluginBeforePageShow : function(activeId){
			var currentPagePlugins = this.plugins[activeId];

			if(!currentPagePlugins) return;

			for(var i in currentPagePlugins){
				currentPagePlugins[i].restore(activeId);
			}
		}
	};

	//页面移出时移除所有dom节点，移入时再恢复
	var _beforeshow = function(e){
		PluginManager.restorePluginBeforePageShow(e.detail);
	};

	var _beforehide = function(e){
		PluginManager.removePluginBeforePageHide(e.detail);
	};

	$(document).on("beforehide", _beforehide);

	$(document).on("onshow", _beforeshow);

	//通过监听onhashchange事件控制前进后退时插件的隐藏显示
	History.Adapter.bind(window, 'statechange', function(e){
		var newURL = location.href;
		var oldURL = PluginManager.lastUrl;

		PluginManager.lastUrl = location.href;

		if(PluginManager.isHashChangeByPlugin){
			PluginManager.isHashChangeByPlugin = false;
			return;
		} else {
			var tmp = null;
			var plugin = null;

			if(newURL.length > oldURL.length){
				tmp = newURL.split("&!_PLU_");
				plugin = PluginManager.getItem(tmp[tmp.length - 1]);

				if(!plugin) return;

				if(!!plugin.lastShowArguments){
					plugin.show.apply(plugin, plugin.lastShowArguments);
				} else {
					plugin.show();
				}
			} else {
				tmp = oldURL.split("&!_PLU_");
				plugin = PluginManager.getItem(tmp[tmp.length - 1]);

				!!plugin? plugin.hide() : null;
			}
		}
	});

	return PluginManager;
});