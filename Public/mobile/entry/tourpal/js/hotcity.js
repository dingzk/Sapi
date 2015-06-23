/**
 *@overfileView 首页-热门城市
 *author Yoocky <mengyanzhou@gmail.com>
 */

define(['src/js/core', 'lib/artTemplate', 'src/js/city', 'src/js/PluginManager', 'entry/tourpal/js/tourpal'], function(core, template, city, PluginManager, tourpal){
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
              var ele = $(this);
              pluginCity.show(function(data) {
                  if(data[0].trim() == ''){
                    return false;
                  }
                  ele.val(data[0]);
                  setTimeout(function(){
                    openPostList();
                  }, 500)
              });
        });
        
        //打开目的地页
        var openPostList = function() {
            var params = $.param({'city': $("#city_selector").val(), 'random' : new Date().getTime()});
            tourpal.alert.hide();
            core.addPager({
                id:'postlist',
                url:'postlist?' + params,
                active:true
            });
        }

        //载入城市选择插件
        PluginManager.add("city", city);
        pluginCity = PluginManager.getItem('city');

        $('#btn_search').on('click', function(){
              if($("#city_selector").val().trim() == ''){
                 tourpal.alert.show('请输入城市名称');
                 return false;
              }
              openPostList();
        })

        //点击发帖
        $(dom).find('.post-btn').on('click', function(){
            if(!tourpal.isLogin()){
                tourpal.login(location.href+'#callback');
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

        //页面跳转回调
        if(location.hash.indexOf('callback') > 0){
            $(dom).find('.post-btn').trigger('click');
        }
    });
});