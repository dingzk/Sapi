define(
    function(require) {

        var api = {};
        var noop = function(){};

        api.layerStopRefresh = function(id){
            if (!id) {//默认使用active layer的id
                id = Blend.ui.activeLayer.attr("data-blend-id") || '0';
            }
            Blend.ui.get(id).endPullRefresh();
            // layerapi.endPullRefresh(Blend.ui.get(id));
        };

        api.layerBack = function(id){
            if (!id) {//默认使用active layer的id
                id = Blend.ui.activeLayer.attr("data-blend-id") || '0';
            }
            // layerapi.endPullRefresh(Blend.ui.get(id));

            Blend.ui.get(id).out();
        };

        api.removeSplashScreen = noop;

        return api;

    }
);