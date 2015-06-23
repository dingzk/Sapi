/**
 *@overfileView 首页-热门城市
 *author Yoocky <mengyanzhou@gmail.com>
 */

define(['src/js/core', 'lib/artTemplate', 'src/js/city', 'src/js/PluginManager', 'entry/tourpal/js/tourpal', 'src/js/sliders'], function(core, template, city, PluginManager, tourpal){
    //路径配置
    var path = {
        'hotCity' : '/index.php/Api/Dest/getHotCity'                                      //热门城市   
    }

    core.onrender('hotcity',function(dom){

        //载入热门城市
        $.getJSON(path.hotCity, function(data){
          if(data.code == 0){
            var html = template('hot_city_tpl', data);
            $('.hot-city-list').html(html);
          }
        })

        //城市选择
        $("#city_selector").on("click", function(){
              pluginCity.show(function(data) {
                  if(data[0].trim() == ''){
                    return false;
                  }
                  setTimeout(function(){
                    openPostList(data[0]);
                  }, 500)
              });
        });
        
        //轮播图
        new $.touchSlider('#slider', {
                trigger: '.indicator',
                loop : false,     //动画循环
                play : true,
                len  : 6
            });
        $('#slider .wait').removeClass('wait');

        //打开目的地页
        var openPostList = function(city) {
            var params = $.param({'city': city, 'random' : new Date().getTime()});
            tourpal.alert.hide();
            core.addPager({
                id:'postlist',
                url:'postlist?' + params,
                active:true
            });
        }

        //载入城市选择插件
        PluginManager.add("city", city);
        var pluginCity = PluginManager.getItem('city');
        
        //点击发帖
        $(dom).find('.post-btn').on('click', function(){
            if(!tourpal.isLogin()){
                tourpal.login(function(){
                    tourpal.post();
                });
                return false;
            }  
            tourpal.post();
        })

        var init = function(){
           tourpal.getMessage();
        }
        
        $(dom).on("beforeshow", function(eve) {
            if (eve.detail === 'hotcity') {
                init();
            }
        });

        init();
    });
});