/**
 *@overfileView 图片预览
 *author Yoocky <mengyanzhou@gmail.com>
 */
define(['src/js/core'], function(core) {

	var _ui = $('<div>').addClass('picview');
	var _mask = $('<div>').addClass('mask-layer');


	var emptyfunc = function() {};

	var picview = {

		init: function(opt) {

			var options = $.extend({
				container: core.getActiveLayer(),
				url: "",
				btnArr: [{text : '&times', type : 'button', click : function(){}}],
				mask: true,
				clickMask: function() {}
			}, opt);

			if (_ui.parent().length === 0 || _ui.parent().attr("id") !== options.container.attr("id")) {
				_ui.appendTo(options.container);
				_mask.appendTo(options.container);
			}


			return options;

		},

		showmask: function() {
			this.init();
			_mask.show();
		},
		hidemask: function() {
			_mask.hide();
		},

		//  [{ text:"确定", color:"red", type:"button", click:function(){} },{},{}]
		show: function(opt) {

			var options = picview.init(opt);

			var btnHtml = "";
			for (var i = 0; i < options.btnArr.length; i++) {

				btnHtml += '<div class="item-btn">' + options.btnArr[i].text + '</div>';
			};

			if (options.mask) {
				_mask.show().unbind("click").bind("click", function() {
					options.clickMask();
				});
			};
			_ui.html('<div class="content"><div class="preloader-indicator-modal"><span class="preloader"></span></div><div class="image"></div></div>' + btnHtml);

			_ui.find(".item-btn").each(function(index) {
				if (options.btnArr[index].color !== "") {
					$(this).css("background", options.btnArr[index].color);
				};
				if (options.btnArr[index].type == "button") {
					$(this).on("click", function() {
						options.btnArr[index].click();
						picview.close();
					});
				};
			});

			//载入图片
			var img = new Image();
			img.src = options.url;
			img.onload = function(){
				_ui.find('.preloader-indicator-modal').hide();
				_ui.find('.image').html(img);
			}

			_ui.addClass("picview-active");

		},

		close: function() {

			_ui.removeClass("picview-active");
			_mask.hide();

		}
	}

	return picview;

})