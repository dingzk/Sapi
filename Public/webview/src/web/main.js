define(['src/web/blend','src/web/Layer','src/web/LayerGroup'], function (blend, layer,layergroup) {
    "use strict";

    blend = blend||{};
    
	//layer
    blend.Layer = layer;
    blend.LayerGroup = layergroup;
    
    // window.Blend = blend;
    window.Blend = window.Blend || {};//初始化window的blend 对象 ， 将 blend 作为模块 绑定到 Blend.ui 上
    window.Blend.ui = blend;

    return blend;
    
});