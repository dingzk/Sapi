define(['src/js/core'], function(core) {

	var _ui = $('<div>').addClass('dialog');
	var _mask = $('<div>').addClass('mask-layer');


	var emptyfunc = function() {};

	var dialog = {

		init: function(opt) {

			var options = $.extend({
				container: core.getActiveLayer(),
				content: "请选择相应的操作",
				btnArr: [{}],
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

			var options = dialog.init(opt);

			var btnHtml = "";
			for (var i = 0; i < options.btnArr.length; i++) {

				btnHtml += '<div class="item-btn">' + options.btnArr[i].text + '</div>';
			};

			if (options.mask) {
				_mask.show().unbind("click").bind("click", function() {
					options.clickMask();
				});
			};
			_ui.html('<div class="content">' + options.content + '</div>' + btnHtml);

			_ui.find(".item-btn").each(function(index) {
				if (options.btnArr[index].color !== "") {
					$(this).css("background", options.btnArr[index].color);
				};
				if (options.btnArr[index].type == "button") {
					$(this).on("click", function() {
						options.btnArr[index].click();
						dialog.close();
					});
				};
			});



			_ui.addClass("dialog-active");

		},

		close: function() {

			_ui.removeClass("dialog-active");
			_mask.hide();

		},

		alert: function(msg, callback) {

			if (typeof msg === 'object') { //兼容下
				opt = msg;
				msg = opt.content;
				callback = opt.click;
			}

			var alertOpt = {
				//container: opt.container,
				content: msg,
				btnArr: [{
					text: "确 定",
					color: "#E65749",
					type: "button",
					click: (callback || emptyfunc)
				}]
			}

			dialog.show(alertOpt);

		},

		newAlert: function(opt) {

			var options = $.extend({
				container: null,
				msg: "请选择相应的操作",
				btnText: "确 定",
				callback: function() {}
			}, opt);



			var alertOpt = {
				container: options.cont,
				content: options.msg,
				btnArr: [{
					text: options.btnText,
					color: "#E65749",
					type: "button",
					click: options.callback
				}]
			}

			dialog.show(alertOpt);
		},

		confirm: function(opt) {
			if (!opt.success) {
				opt.success = function() {};
			};
			if (!opt.cancel) {
				opt.cancel = function() {};
			};
			var confirmOpt = {
				container: opt.container,
				content: opt.content,
				btnArr: [{
					text: "确 定",
					color: "#E65749",
					type: "button",
					click: opt.success
				}, {
					text: "取 消",
					color: "#757575",
					type: "button",
					click: opt.cancel
				}]
			}

			dialog.show(confirmOpt);

		},
		superconfirm: function(opt) {

			if (!opt.cancel) {
				opt.cancel = function() {};
			};

			var confirmOpt = {
				content: opt.content,
				btnArr: [{
					text: "取 消",
					color: "#757575",
					type: "button",
					click: opt.cancel
				}]
			}

			if (opt && opt.btnArr) {
				for (var i = opt.btnArr.length-1; i >=0; i--) {
					var _b = opt.btnArr[i];

					confirmOpt.btnArr.unshift({
						text: _b.name,
						color: "#E65749",
						type: "button",
						click: _b.event
					});
				};

			}

			dialog.show(confirmOpt);

		}

	}

	return dialog;

})