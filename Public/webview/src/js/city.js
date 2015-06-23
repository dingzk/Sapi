define(['src/js/core'],function(core) {
    
    var city = {
        TEMPLATE : {
            BODY : '<div class="city-sel page-on-right"><header class="bar bar-nav"><nav><h1 class="title">城市选择</h1></nav></header><div class="input-block"><div class="search-icon"></div><div class="search-box"><input placeholder=" 请输入目的地如 ：北京"></div><div class="input-base-line"></div><button>取消</button><ul class="match-list" class="table-view"></ul></div><div class="all-list page-content"><ul id="recent-list" class="table-view"><li class="table-view-divider">上次搜索</li></ul><ul id="hot-city-list" class="table-view"><li class="table-view-divider">热门</li></ul></div></div>',
            CITYGROUP : {
                HEAD : '<ul id="${id}" class="table-view">',
                FOOT : '</ul>'
            },
            LISTHEAD : '<li class="table-view-divider">${letter}</li>',
            LISTITEM : '<li class="table-view-cell${class}" place="${place}" dest="${dest}" pid="${id}">${text}</li>'
        },
        orderCityList : [],
        recentList : [],
        hotList : [["成都", 286],["拉萨", 332], ["北京", 50], ["杭州", 136], ["厦门", 165], ["南京", 123]],
        suggestApi :'/Api/Dest/suggest',
        handler : null,
        page : null,
        searchTimeout : 0,
        isWaitingToSearch : false,
        beforeShow : function(callback, value){
            var _this = this;

            if(this.page === null){
                this.init();
            }
            value = $.trim(value);
            this.handler = callback;

            if(value){
                var input = this.page.find(".search-box input");

                input.val(value);
                this._renderMatchList(value);
                this.page.find(".match-list").hide();
                $('.all-list').show();
            }
        },
        init : function(){
            if($(".city-sel").length === 0){
                this._render();
            }

            this._bindEvent();
        },
        _render : function(){
            var page = $(this.TEMPLATE.BODY);
            var hotContainer = page.find("#hot-city-list");
            var localRecentList = localStorage.getItem("recentCityListV1");
            var hotCityList = [];

            if(!!localRecentList){
                this.recentList = JSON.parse(localRecentList);
            }

            this._reRenderRecent(page);

            for(var i = 0; i < this.hotList.length; i ++){
                hotCityList.push(this.TEMPLATE.LISTITEM
                    .replace('${text}', this.hotList[i][0])
                    .replace('${id}', this.hotList[i][1])
                    .replace('${dest}', this.hotList[i][0])
                    .replace('${place}', this.hotList[i][0])
                    .replace('${class}', ''));
            }

            hotContainer.html(hotContainer.html() + hotCityList.join(''));

            if (core.getActiveLayer()){
                page.appendTo(core.getActiveLayer());
            }else{
                page.appendTo("body");
            }
            
            this.page = page;
        },
        _reRenderRecent : function(page){
            var recentContainer = page.find("#recent-list");
            var recentCityList = [];

            if(this.recentList.length === 0){
                recentContainer.hide();
                return;
            }

            recentContainer.show();
            recentContainer.find(".table-view-cell").remove();

            for(var i = 0; i < this.recentList.length; i ++){
                recentCityList.push(this.TEMPLATE.LISTITEM
                    .replace('${place}', this.recentList[i][0])
                    .replace('${dest}', this.recentList[i][1])
                    .replace('${text}', this.recentList[i][2])
                    .replace('${id}', this.recentList[i][3])
                    .replace('${class}', ''));
            }

            recentContainer.html(recentContainer.html() + recentCityList.join(''));
        },
        _doReturn : function(city){
            this._updateRecentList(city);
            this._reRenderRecent(this.page);
            this.page.find(".match-list").hide();
            this.page.find(".all-list").show();
            this.hide();
            if(!!this.handler){
                this.handler(city);
            }
        },
        _bindEvent : function(){
            var _this = this;

            this.page.find(".icon-left-nav").click(function(){
                _this.hide();
                return false;
            });
            this.page.on('click', "li.table-view-cell", function(){
                var city = [$(this).attr('place'), $(this).attr('dest'), $(this).html(), $(this).attr('pid')];
                _this.page.find(".search-box input").val('');
                _this._doReturn(city);
            });

            this.page.find(".input-block button").on("click", function(){
                _this.hide();
            });
            
            this.page.find(".search-box input").bind("input propertychange touchend", function(){
                var input = this;

                if(!_this.isWaitingToSearch){
                    _this.isWaitingToSearch = true;

                    setTimeout(function(){
                        _this.isWaitingToSearch = false;
                        _this._renderMatchList($(input).val());
                    }, 200);
                }
            });
        },
        _renderMatchList : function(keyword){
            var matchContainer = this.page.find(".match-list");
            if(keyword === ""){
                matchContainer.hide();
                matchContainer.find(".table-view-cell").remove();
                return;
            }

            $.getJSON(this.suggestApi, {dest: keyword}, function(data){
                var matchList = data.data.list;
                if(matchList.length > 0){
                    var  matchCityList = [];

                    for( i = 0; i < matchList.length; i ++){
                        var desc = matchList[i]['desc'].split(' ');
                        if(desc.length > 1){
                            desc = desc[0] + '<span class="gray"> ' + desc[1] + '</span>';
                        }else{
                            desc = desc[0];
                        }
                        matchCityList.push(this.TEMPLATE.LISTITEM
                            .replace('${text}', desc)
                            .replace('${id}', matchList[i]['id'])
                            .replace('${place}', matchList[i]['place'])
                            .replace('${dest}', matchList[i]['dest'])
                            .replace('${class}', matchList[i]['desc'] == keyword ? ' full-match' : ''));
                    }

                    matchContainer.html(matchCityList.join(''));

                    matchContainer.show();
                } else {
                    matchContainer.hide();
                    matchContainer.find(".table-view-cell").remove();
                }
            }.bind(this));
        },
        _updateRecentList : function(city){
            if(city[0] === "") return;

            var recentList = this.recentList;
            var orIndex = this._isCityInRecent(city);

            if(orIndex >= 0){
                recentList.splice(orIndex, 1);
            } else if(recentList.length == 3){
                recentList.splice(2, 1);
            }

            recentList.splice(0, 0, city);
            localStorage.setItem("recentCityListV1", JSON.stringify(recentList));
        },
        _isCityInRecent : function(city){
            for(var i = 0; i < this.recentList.length; i ++){
                if(city[0] == this.recentList[i][0]){
                    return i;
                }
            }

            return -1;
        },
        _matchKeyword : function(keyword, city){
            return city[0].indexOf(keyword) === 0 || city[1].indexOf(keyword) === 0 || city[2].indexOf(keyword) === 0;
        }
    };

    return city;
});