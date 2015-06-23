/**
 *@overfileView 滚动加载
 *author Yoocky <mengyanzhou@gmail.com>
 */

define(['lib/artTemplate'], function(template) {

    //扩展template方法  输出性别
    template.helper('sex', 
    function(number) {
        number = number * 1 || 1;
        var sex = ['male', 'female']
        return sex[number - 1];

    });

    
    //扩展template方法  格式化输出日期
    template.helper('dateFormat', 
    function(number, format) {
        return new Date(number*1000).format(format);
    });

    function ScrollLoad(settings) {
        settings = settings || {};
        var defaults = {
            scrollWrapSel: '',                      //滚动容器
            listContentSel: '.list-content-wrap',   //内容区块
            templateId: '',                         //模板ID
            perNum: 10,                             //每页显示多少个
            url: '',                                //接口地址
            data: {},                               //附加参数
            noDataText: '暂无结果',                   //数据为空时的提示文案
            callback: function() {}                 //分页数据获取成功后回调
        };
        $.extend(this, defaults, settings);

        this._$scroll = $(this.scrollWrapSel);
        this._$list = this._$scroll.find(this.listContentSel);
        this._init();


    }

    ScrollLoad.prototype = {
        // 初始化
        _init: function() {
            var that = this;
            this._$scroll.append('<div class="spinner none"> <div class="rect1"></div> <div class="rect2"></div> <div class="rect3"></div> <div class="rect4"></div> <div class="rect5"></div> </div>');
            this.getContent();
            //事件监听
            this._$scroll.on('scroll', 
            function(e) {
                //可见高度
                var viewH = $(this).height();
                //内容高度
                var contentH = $(this).get(0).scrollHeight;
                //滚动高度
                var scrollTop = $(this).scrollTop();
                if (contentH - viewH == scrollTop && that._$list.attr('loading') != 'true' && that._$list.attr('hasRest') == 1) {
                    that.getContent();
                }

            })

        },

        //获取分页内容
        getContent: function() {
            var that = this;
            var offset = this._$list.attr('offset') || 0;
            var params = {
                perNum: this.perNum,
                offset: offset
            }
            params = $.extend(params, that.data);
            that._$list.attr('loading', 'true');
            $.ajax({
                url: this.url,
                data: params,
                dataType: 'json',
                type: 'GET',
                success: function(data) {
                    that.callback(data.data, offset);
                    if (data.code == 0) {
                        that._$list.attr('loading', 'false');
                        if (data.data.offset == 0) {
                            that._$list.html('<p class="error-tip">' + that.noDataText + '</p>');
                            return false;
                        }else{
                            that._$list.find('.error-tip').remove();
                            var html = template(that.templateId, data.data);
                            that._$list.append(html);
                            that._$list.attr('offset', data.data.offset);
                            that._$list.attr('hasRest', data.data.has_rest);
                        }
                        //是否显示加载更多
                        if (data.data.has_rest == 0) {
                            that._$scroll.find('.spinner').hide();

                        } else {
                            that._$scroll.find('.spinner').show();

                        }
                    }

                },
                error: function() {
                    that._$list.attr('loading', 'false');

                }

            })
        },

        //重新载入
        reload: function() {
            this._$list.html('');
            this._$scroll.find('.spinner').hide();
            this._$list.attr('offset', 0);
            this._$list.attr('has_rest', 0);
            this.getContent();

        }

    }

    return ScrollLoad;

});