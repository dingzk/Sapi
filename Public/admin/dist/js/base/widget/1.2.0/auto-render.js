/*! zuboke 2015-01-26 */
var $=require("jquery"),DATA_WIDGET_AUTO_RENDERED="data-widget-auto-rendered";exports.autoRender=function(a){return new this(a).render()},exports.autoRenderAll=function(a,b){"function"==typeof a&&(b=a,a=null),a=$(a||document.body);var c=[],d=[];a.find("[data-widget]").each(function(a,b){exports.isDataApiOff(b)||(c.push(b.getAttribute("data-widget").toLowerCase()),d.push(b))}),c.length&&seajs.use(c,function(){for(var a=0;a<arguments.length;a++){var c=arguments[a],e=$(d[a]);if(!e.attr(DATA_WIDGET_AUTO_RENDERED)){var f={initElement:e,renderType:"auto"},g=e.attr("data-widget-role");f[g?g:"element"]=e,c.autoRender&&c.autoRender(f),e.attr(DATA_WIDGET_AUTO_RENDERED,"true")}}b&&b()})};var isDefaultOff="off"===$(document.body).attr("data-api");exports.isDataApiOff=function(a){var b=$(a).attr("data-api");return"off"===b||"on"!==b&&isDefaultOff};