/*! zuboke 2015-01-26 */
function uniqueCid(){return"widget-"+cidCounter++}function isString(a){return"[object String]"===toString.call(a)}function isFunction(a){return"[object Function]"===toString.call(a)}function isInDocument(a){return contains(document.documentElement,a)}function ucfirst(a){return a.charAt(0).toUpperCase()+a.substring(1)}function getEvents(a){return isFunction(a.events)&&(a.events=a.events()),a.events}function parseEventKey(a,b){var c=a.match(EVENT_KEY_SPLITTER),d=c[1]+DELEGATE_EVENT_NS+b.cid,e=c[2]||void 0;return e&&e.indexOf("{{")>-1&&(e=parseExpressionInEventKey(e,b)),{type:d,selector:e}}function parseExpressionInEventKey(a,b){return a.replace(EXPRESSION_FLAG,function(a,c){for(var d,e=c.split("."),f=b;d=e.shift();)f=f===b.attrs?b.get(d):f[d];return isString(f)?f:INVALID_SELECTOR})}function isEmptyAttrValue(a){return null==a||void 0===a}function trimRightUndefine(a){for(var b=a.length-1;b>=0&&void 0===a[b];b--)a.pop();return a}var Base=require("arale-base"),$=require("jquery"),DAParser=require("./daparser"),AutoRender=require("./auto-render"),DELEGATE_EVENT_NS=".delegate-events-",ON_RENDER="_onRender",DATA_WIDGET_CID="data-widget-cid",cachedInstances={},Widget=Base.extend({propsInAttrs:["initElement","element","events"],element:null,events:null,attrs:{id:null,className:null,style:null,template:"<div></div>",model:null,parentNode:document.body},initialize:function(a){this.cid=uniqueCid();var b=this._parseDataAttrsConfig(a);Widget.superclass.initialize.call(this,a?$.extend(b,a):b),this.parseElement(),this.initProps(),this.delegateEvents(),this.setup(),this._stamp(),this._isTemplate=!(a&&a.element)},_parseDataAttrsConfig:function(a){var b,c;return a&&(b=$(a.initElement?a.initElement:a.element)),b&&b[0]&&!AutoRender.isDataApiOff(b)&&(c=DAParser.parseElement(b)),c},parseElement:function(){var a=this.element;if(a?this.element=$(a):this.get("template")&&this.parseElementFromTemplate(),!this.element||!this.element[0])throw new Error("element is invalid")},parseElementFromTemplate:function(){this.element=$(this.get("template"))},initProps:function(){},delegateEvents:function(a,b,c){var d=trimRightUndefine(Array.prototype.slice.call(arguments));if(0===d.length?(b=getEvents(this),a=this.element):1===d.length?(b=a,a=this.element):2===d.length?(c=b,b=a,a=this.element):(a||(a=this.element),this._delegateElements||(this._delegateElements=[]),this._delegateElements.push($(a))),isString(b)&&isFunction(c)){var e={};e[b]=c,b=e}for(var f in b)if(b.hasOwnProperty(f)){var g=parseEventKey(f,this),h=g.type,i=g.selector;!function(b,c){var d=function(a){isFunction(b)?b.call(c,a):c[b](a)};i?$(a).on(h,i,d):$(a).on(h,d)}(b[f],this)}return this},undelegateEvents:function(a,b){var c=trimRightUndefine(Array.prototype.slice.call(arguments));if(b||(b=a,a=null),0===c.length){var d=DELEGATE_EVENT_NS+this.cid;if(this.element&&this.element.off(d),this._delegateElements)for(var e in this._delegateElements)this._delegateElements.hasOwnProperty(e)&&this._delegateElements[e].off(d)}else{var f=parseEventKey(b,this);a?$(a).off(f.type,f.selector):this.element&&this.element.off(f.type,f.selector)}return this},setup:function(){},render:function(){this.rendered||(this._renderAndBindAttrs(),this.rendered=!0);var a=this.get("parentNode");if(a&&!isInDocument(this.element[0])){var b=this.constructor.outerBoxClass;if(b){var c=this._outerBox=$("<div></div>").addClass(b);c.append(this.element).appendTo(a)}else this.element.appendTo(a)}return this},_renderAndBindAttrs:function(){var a=this,b=a.attrs;for(var c in b)if(b.hasOwnProperty(c)){var d=ON_RENDER+ucfirst(c);if(this[d]){var e=this.get(c);isEmptyAttrValue(e)||this[d](e,void 0,c),function(b){a.on("change:"+c,function(c,d,e){a[b](c,d,e)})}(d)}}},_onRenderId:function(a){this.element.attr("id",a)},_onRenderClassName:function(a){this.element.addClass(a)},_onRenderStyle:function(a){this.element.css(a)},_stamp:function(){var a=this.cid;(this.initElement||this.element).attr(DATA_WIDGET_CID,a),cachedInstances[a]=this},$:function(a){return this.element.find(a)},destroy:function(){this.undelegateEvents(),delete cachedInstances[this.cid],this.element&&this._isTemplate&&(this.element.off(),this._outerBox?this._outerBox.remove():this.element.remove()),this.element=null,Widget.superclass.destroy.call(this)}});$(window).unload(function(){for(var a in cachedInstances)cachedInstances[a].destroy()}),Widget.query=function(a){var b,c=$(a).eq(0);return c&&(b=c.attr(DATA_WIDGET_CID)),cachedInstances[b]},Widget.autoRender=AutoRender.autoRender,Widget.autoRenderAll=AutoRender.autoRenderAll,Widget.StaticsWhiteList=["autoRender"],module.exports=Widget;var toString=Object.prototype.toString,cidCounter=0,contains=$.contains||function(a,b){return!!(16&a.compareDocumentPosition(b))},EVENT_KEY_SPLITTER=/^(\S+)\s*(.*)$/,EXPRESSION_FLAG=/{{([^}]+)}}/g,INVALID_SELECTOR="INVALID_SELECTOR";