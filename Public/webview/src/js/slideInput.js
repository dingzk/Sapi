define(['src/js/core'],function(core) {
	$.extend($.fn, {
		slideInput : function(){
			if (!this.length) return false;
			var sourceElem = this[0];
			var sourceInput = sourceElem.outerHTML;
			var slideInput = {
				TEMPLATE : '<div class="slide-input page-plugin"><div class="bar bar-nav"><div class="input-row button-line">${input}<div class="triangle-right-buttom"></div></div><span class="btn confirm pull-right">确定</span></div><div class="mask-layer"></div><div class="local-history"><ul></ul></div></div>',
				page : null,
				elem : sourceElem,
				localData : null,
				option : {
					showType : "transition", 
					transitionClass : "input-active"
				},
				callback : function(opt){},
				init : function(){
					var html = this.TEMPLATE.replace('${input}', sourceInput);
					var page = $(html);
					var _setValue = this.setValue(this);

					if (core.getActiveLayer()){
		                page.appendTo(core.getActiveLayer());
		            }else{
		                page.appendTo("body");
		            }

		            this.page = page;

					$(".confirm", page).on("click", _setValue);
				},
				beforeShow : function(value){
					var input = this.page.find("input");

					input.val(value);
					setTimeout(function(){
						input.focus();
					}, 500);
				},
				setValue : function(context){
					return function(){
						context.hide();
						$(context.elem).val(context.page.find("input").val());
					}
				}
			};

			$(this).on('click focus', function(){
				slideInput.show(this.value);
			})

			return slideInput;
		}
	});
});
