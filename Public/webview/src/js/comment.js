define(['src/js/core'],function(core) {
	var comment = {
		TEMPLATE : '<div class="slide-input page-plugin"><div class="bar bar-nav"><div class="input-row button-line" ><input type="text" placeholder="请输入评论内容" /><div class="triangle-right-buttom"></div></div><span class="btn confirm pull-right" >发表</span></div><div class="mask-layer"></div><div class="local-history"><ul></ul></div></div>',
		page : null,
		localData : null,
		option : {
			showType : "transition", 
			transitionClass : "input-active"
		},
		callback : function(opt){},
		init : function(){
			var html = this.TEMPLATE;
			var page = $(html);

			if (core.getActiveLayer()){
                page.appendTo(core.getActiveLayer());
            }else{
                page.appendTo("body");
            }

            this.page = page;
            var that = this; 
			$(".confirm", page).on("click", function(){
				var content = page.find("input").val();
				if($.trim(content)){
					that.postComment(content);
				}
			});
		},
		beforeShow : function(){
			var input = this.page.find("input");
			input.attr('placeholder', this.placeholder || '').val('');
			setTimeout(function(){
				input.focus();
			}, 500);
		},
		postComment : function(content){
			this.hide();
			this.callback(content);
		}
	};
	return comment;
});
