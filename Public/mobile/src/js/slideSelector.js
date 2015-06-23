define(['src/js/core'],function(core) {
	$.extend($.fn, {
		slideSelector : function(option){
			var slideSelector = {
				TEMPLATE : {
					ITEM : '<li class="table-view-cell" value="${value}">${text}</li>',
					CONTAINERHEAD : '<div class="slide-selector page-on-right"><header class="bar bar-nav"><h1 class="title">${title}</h1></header><ul class="table-view">',
					CONTAINERFOOT : '</ul></div>'
				},
				page : null,
				config : option,
				callback : function(){},
				init : function(){
					var opt = this.config;

					if(!opt.data || opt.data.length === 0){
						return;
					}

					if(!!opt.callback){
						this.callback = opt.callback;
					}

					var html = this.TEMPLATE.CONTAINERHEAD.replace('${title}', opt.title);

					for(var i = 0; i < opt.data.length; i ++){
						var optItem = this.TEMPLATE.ITEM;
						var dataItem = opt.data[i];

						optItem = optItem.replace('${value}', dataItem.value);
						optItem = optItem.replace('${text}', dataItem.text);

						html += optItem;
					}

					html += this.TEMPLATE.CONTAINERFOOT;

					var page = $(html);
					var _setValue = this.setValue(this);

					if (core.getActiveLayer()){
		                page.appendTo(core.getActiveLayer());
		            }else{
		                page.appendTo("body");
		            }

					if(!!opt.initValue){
						page.find('li[value="' + opt.initValue.value + '"]').addClass('selected');

						if(!!this.callback){
							this.callback(opt.initValue);
						}
					}

		            this.page = page;

					$("ul li", page).on("click", _setValue);
				},
				selectValue : function(value){
					this.page.find("li").removeClass('selected');
					this.page.find("li[value='" + value + "']").addClass('selected');
				},
				setValue : function(context){
					return function(){
						var data = {
							text : $(this).text().trim(),
							value : $(this).attr('value')
						};

						$(this).siblings().removeClass("selected");
						$(this).addClass("selected");
						context.hide();
						if(!!context.callback){
							context.callback(data);
						}
					}
				}
			};

			$(this).on("click", function(){
				slideSelector.show();
			})

			return slideSelector;
		}
	});
});
