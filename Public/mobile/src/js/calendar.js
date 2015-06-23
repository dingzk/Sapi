define(['src/js/dateextend','src/js/core'], function(ddd,core) {
	$.extend($.fn, {
		calendar: function(options) {
			options = $.extend({
				mindate: new Date(1970, 0, 1),
				maxdate: new Date(2050, 12, 31),
				tag: {
					week: ["日", "一", "二", "三", "四", "五", "六"]
				},
				eventCallBack: function(n) {
					console.log('this is callBack!');
					console.log(n);
				},
				festivaltag: {
					"1-1": ["元旦"],
					"2-14": ["情人节"],
					"3-8": ["妇女节"],
					"5-1": ["劳动节"],
					"6-1": ["儿童节"],
					"10-1": ["国庆"],
					"11-11": ["双十一"],
					"12-24": ["平安夜"],
					"12-25": ["圣诞"]
				},
				cnfestivaltag: {
					"2014-1-30": ["除夕"],
					"2014-1-31": ["春节"],
					"2014-2-14": ["元宵节"],
					"2014-4-5": ["清明"],
					"2014-6-2": ["端午节"],
					"2014-8-2": ["七夕"],
					"2014-9-8": ["中秋节"],

					"2015-2-18": ["除夕"],
					"2015-2-19": ["春节"],
					"2015-3-5": ["元宵节"],
					"2015-4-5": ["清明"],
					"2015-6-20": ["端午节"],
					"2015-8-20": ["七夕"],
					"2015-9-27": ["中秋节"],
				}


			}, options);

			var _this = this,
				_ui,
				pageWrap,
				_tag = {
					el: '',
					data: ''
				},
				_activeEls = {
					el: '',
					data: ''
				},
				_oldDay = true,
				_cln = null;

			var _buildUi = function() {
				var _count = options.maxdate.diff(options.mindate, 2);
				// console.log("_count........"+_count);
				var _pages = [];

				//用于管理tapBar
				var pageCtrl = {
					header: '',
					left: '',
					right: ''
				};
				pageWrap = $('<div>').addClass('cld page');//
				if (core.getActiveLayer()){
	                pageWrap.appendTo(core.getActiveLayer());
	            }else{
	                // pageWrap.appendTo("body");
	                document.body.appendChild(pageWrap[0])
	            }
				// .appendTo('body');
				pageCtrl.header = $('<header class="bar bar-nav"><nav><span class="icon icon-left-nav pull-left hide-cln"></span><span class="title">出发日期</span></nav></header>').appendTo(pageWrap);
				pageCtrl.left = pageCtrl.header.find('.hide-cln');
				var _title = $('<ul>').appendTo(pageWrap).addClass('cld-title');
				
				_ui = $('<div>').addClass('page-content').appendTo(pageWrap);
				pageCtrl.left.bind("click", function() {
					_cln.hide();
				});

				_bindEventFn();//绑定事件

				
				for (var j = 0; j < options.tag.week.length; j++) {
					var _item = $('<li>').text(options.tag.week[j]);
					_item.appendTo(_title);
				}
				// alert(options.mindate.format('yyyy-MM'));
				for (var i = 0; i <= _count; i++) {//fix 如果日期差2个月，则显示3个月
					//当前日历页签的日期
					//这里有可能会加多月份,切换到1号避免此问题
					var _monthDate = new Date(options.mindate.format('yyyy-MM')+"-01");

					var _firstDay = _monthDate.add(i, 2);
					// var _firstDay = new Date(_thisDate.format('yyyy-MM'));
					var _firstDayNum = _firstDay.getDay();
					var _monthNum = _firstDay.daysInMonth();
					var _dayTag = 0;

					// console.log(_firstDay);
					//每一个月的page
					var _page = {};
					_page.wrap = $("<section>").addClass('cld-item');
					_page.date = $("<h1>").appendTo(_page.wrap).text(_firstDay.format('MM') + "月").addClass('cld-titleDate');
					_page.days = $('<ul>').appendTo(_page.wrap).addClass('cld-day');

					for (var d = 0; d < 42; d++) {//6 * 7 最多6行，极端情况跨越6周
						if (d >= _firstDayNum && _dayTag < _monthNum) {
							var _thisDay = _firstDay.add(_dayTag, 3);
							_dayTag++;

							var _thisEl = $('<li>').text(_dayTag).attr('data-day', _thisDay.format()).appendTo(_page.days);

							_bindFestivalTagFn(_thisEl, _thisDay, _dayTag);

							if (_oldDay) {
								_thisEl.addClass("disabled");
							}
							
						} else{
							if (d >= 28 && d % 7 === 0) {
								break;
							}
							$('<li>').text('').appendTo(_page.days);
						}
						
					}
					_pages.push(_page);
				}

				for (i = 0; i < _pages.length; i++){
					_pages[i].wrap.appendTo(_ui);
				}
			
			}


			var _bindFestivalTagFn = function(el, date, n, cb) {
				var _today = new Date();
				//固定节日信息
				var _ftag = options.festivaltag[[date.getMonth() + 1, date.getDate()].join("-")];
				//中国节日信息
				var _cnftag = options.cnfestivaltag[[date.getFullYear(), date.getMonth() + 1, date.getDate()].join("-")];

				if (date.equal(_today, 3)) {
					el.text("今天");
				}
				if (date.equal(options.mindate, 3)){//比最小日期小的不绑定事件
					_oldDay = false;
				}else if (date.equal(options.maxdate.add(1, 3), 3)){
					_oldDay = true;
				}

				if (_ftag || _cnftag) {
					var _tagtext;

					if (_ftag)
						_tagtext = _ftag;

					if (_cnftag)
						_tagtext = _cnftag;

					el.html('<div><span class="festival">' + n + '</span><span class="festivalText">' + _tagtext + '</span></div>');
				}

				if (typeof cb == "function")
					cb();

			}

			var _bindEventFn = function() {
				if (typeof options.eventCallBack === 'function') {
					_ui.on("click",".cld-day li",function(){
						if ($(this).hasClass("disabled")) {
							return false;
						}
						var _data = $(this).attr('data-day');
						
						_activeFn($(this), new Date(_data).getDate());
						_tag.el = $(this);
						_tag.data = _data;
						_cln.hide();
						options.eventCallBack(_data);
					});
				}

				// new IScroll(pageWrap[0], { mouseWheel: true });
				 
				// if (el && fn && typeof fn == "function") {
				// 	el.bind("click", function() {
				// 		var _data = $(this).attr('data-day');
				// 		fn(_data);
				// 		_activeFn($(this), new Date(_data).getDate());
				// 		_tag.el = $(this);
				// 		_tag.data = _data;
				// 		hideCln();
				// 	});
				// }

				$(_this).on("click", function(){
					_cln.show();
				});
			};

			var _activeFn = function(el, n) {

				if (_activeEls.el !== '') {
					_activeEls.el.hide();
					_activeEls.el.parent().html(_activeEls.data)
					_activeEls.el.remove();
				}

				var _wrap = $('<div>');

				$('<span>').addClass('active').text(n).appendTo(_wrap);
				$('<span>').text('出发').addClass('activeText').appendTo(_wrap);
				_activeEls.data = $(el).html();
				_activeEls.el = _wrap;
				el.html('');
				_wrap.appendTo(el);

			}

			var hideCln = function() {
				if (core.isLowDevice) {
					pageWrap.siblings(".page-content").show();
				}
				if (core.transitionEnd) {
					_ui.parent().addClass("page-transitioning").on(core.transitionEnd,function(){
						$(this).removeClass("page-transitioning");
					});
				}
			}

			var showCln = function() {
				if (typeof options.selectDate === 'function') {//更新show btn的方法
					var activeDate = options.selectDate();
					var li = _ui.find("[data-day='"+activeDate+"']");
					var shownum = parseInt(activeDate.substr(-2));
					li.length && _activeFn(li,shownum);
				}
				if (core.isLowDevice) {
					pageWrap.siblings(".page-content").hide();
					$("body").scrollTop(0)
				}
				if (core.transitionEnd) {
					_ui.parent().addClass("page-transitioning").on(core.transitionEnd,function(){
						$(this).removeClass("page-transitioning");
					});
				}
			}

			_buildUi();

			_cln = {
				page: _ui.parent(),
				option : {
					showType : "transition",
					transitionClass : "cld-active"
				},
				beforeShow: showCln,
				afterHide: hideCln
			};

			return _cln;
		}
	});

});