/*! zuboke 2015-01-26 */
function toTabed(a){null==a.attr("tabindex")&&a.attr("tabindex","-1")}function getIframeHeight(a){var b=a[0].contentWindow.document;return b.body.scrollHeight&&b.documentElement.scrollHeight?Math.min(b.body.scrollHeight,b.documentElement.scrollHeight):b.documentElement.scrollHeight?b.documentElement.scrollHeight:b.body.scrollHeight?b.body.scrollHeight:void 0}function isCrossDomainIframe(a){var b=!1;try{a[0].contentWindow.document}catch(c){b=!0}return b}var $=require("jquery"),Overlay=require("overlay"),mask=Overlay.Mask,Events=require("events"),Templatable=require("templatable"),Messenger=require("messenger"),Dialog=Overlay.extend({Implements:Templatable,attrs:{template:require("./dialog.handlebars"),trigger:{value:null,getter:function(a){return $(a)}},classPrefix:"ui-dialog",content:{value:null,setter:function(a){return/^(https?:\/\/|\/|\.\/|\.\.\/)/.test(a)&&(this._type="iframe",(a.indexOf("?ajax")>0||a.indexOf("&ajax")>0)&&(this._ajax=!0)),a}},hasMask:!0,closeTpl:"×",width:500,height:null,initialHeight:300,effect:"none",zIndex:999,autoFit:!0,align:{value:{selfXY:["50%","50%"],baseXY:["50%","42%"]},getter:function(a){return this.element.height()>.84*$(window).height()?{selfXY:["50%","0"],baseXY:["50%","0"]}:a}}},parseElement:function(){this.set("model",{classPrefix:this.get("classPrefix")}),Dialog.superclass.parseElement.call(this),this.contentElement=this.$("[data-role=content]"),this.contentElement.css({height:"100%",zoom:1}),this.$("[data-role=close]").hide()},events:{"click [data-role=close]":function(a){a.preventDefault(),this.hide()}},show:function(){return"iframe"===this._type&&(this._ajax?this._ajaxHtml():(!this.get("height")&&this.contentElement.css("height",this.get("initialHeight")),this._showIframe())),Dialog.superclass.show.call(this),this},hide:function(){return"iframe"===this._type&&this.iframe&&(this._isCrossDomainIframe||this.iframe.attr({src:"javascript:'';"}),this.iframe.remove(),this.iframe=null),Dialog.superclass.hide.call(this),clearInterval(this._interval),delete this._interval,this},destroy:function(){return this.element.remove(),this._hideMask(),clearInterval(this._interval),Dialog.superclass.destroy.call(this)},setup:function(){Dialog.superclass.setup.call(this),this._setupTrigger(),this._setupMask(),this._setupKeyEvents(),this._setupFocus(),toTabed(this.element),toTabed(this.get("trigger")),this.activeTrigger=this.get("trigger").eq(0)},_onRenderContent:function(a){if("iframe"!==this._type){var b;try{b=$(a)}catch(c){b=[]}b[0]?this.contentElement.empty().append(b):this.contentElement.empty().html(a),this._setPosition()}},_onRenderCloseTpl:function(a){""===a?this.$("[data-role=close]").html(a).hide():this.$("[data-role=close]").html(a).show()},_onRenderVisible:function(a){a?"fade"===this.get("effect")?this.element.fadeIn(300):this.element.show():this.element.hide()},_setupTrigger:function(){this.delegateEvents(this.get("trigger"),"click",function(a){a.preventDefault(),this.activeTrigger=$(a.currentTarget),this.show()})},_setupMask:function(){var a=this;mask._dialogs=mask._dialogs||[],this.after("show",function(){if(this.get("hasMask")){mask.set("zIndex",a.get("zIndex")).show(),mask.element.insertBefore(a.element);for(var b,c=0;c<mask._dialogs.length;c++)mask._dialogs[c]===a&&(b=mask._dialogs[c]);b?(mask._dialogs.splice(mask._dialogs.indexOf(b),1),mask._dialogs.push(b)):mask._dialogs.push(a)}}),this.after("hide",this._hideMask)},_hideMask:function(){if(this.get("hasMask"))for(var a=mask._dialogs.length,b=0;a>b;b++)if(mask._dialogs[b]===this)if(mask._dialogs.splice(mask._dialogs.indexOf(this),1),0===mask._dialogs.length)mask.hide();else if(b===a-1){var c=mask._dialogs[mask._dialogs.length-1];mask.set("zIndex",c.get("zIndex")),mask.element.insertBefore(c.element)}},_setupFocus:function(){this.after("show",function(){this.element.focus()}),this.after("hide",function(){this.activeTrigger&&this.activeTrigger.focus()})},_setupKeyEvents:function(){this.delegateEvents($(document),"keyup.esc",function(a){27===a.keyCode&&this.get("visible")&&this.hide()})},_showIframe:function(){var a=this;this.iframe||this._createIframe(),this.iframe.attr({src:this._fixUrl(),name:"dialog-iframe"+(new Date).getTime()}),this.iframe.one("load",function(){a.get("visible")&&(a._isCrossDomainIframe=isCrossDomainIframe(a.iframe),a._isCrossDomainIframe||(a.get("autoFit")&&(clearInterval(a._interval),a._interval=setInterval(function(){a._syncHeight()},300)),a._syncHeight()),a._setPosition(),a.trigger("complete:show"))})},_fixUrl:function(){var a=this.get("content").match(/([^?#]*)(\?[^#]*)?(#.*)?/);return a.shift(),a[1]=(a[1]&&"?"!==a[1]?a[1]+"&":"?")+"t="+(new Date).getTime(),a.join("")},_createIframe:function(){var a=this;this.iframe=$("<iframe>",{src:"javascript:'';",scrolling:"no",frameborder:"no",allowTransparency:"true",css:{border:"none",width:"100%",display:"block",height:"100%",overflow:"hidden"}}).appendTo(this.contentElement),Events.mixTo(this.iframe[0]),this.iframe[0].on("close",function(){a.hide()});var b=new Messenger("parent","arale-dialog");b.addTarget(this.iframe[0].contentWindow,"iframe1"),b.listen(function(b){switch(b=JSON.parse(b),b.event){case"close":a.hide();break;case"syncHeight":a._setHeight("px"===b.height.toString().slice(-2)?b.height:b.height+"px")}})},_setHeight:function(a){this.contentElement.css("height",a),this.element[0].className=this.element[0].className},_syncHeight:function(){var a;if(this.get("height"))clearInterval(this._interval),delete this._interval;else{try{this._errCount=0,a=getIframeHeight(this.iframe)+"px"}catch(b){this._errCount=(this._errCount||0)+1,this._errCount>=6&&(a=this.get("initialHeight"),clearInterval(this._interval),delete this._interval)}this._setHeight(a)}},_ajaxHtml:function(){var a=this;this.contentElement.css("height",this.get("initialHeight")),this.contentElement.load(this.get("content"),function(){a._setPosition(),a.contentElement.css("height",""),a.trigger("complete:show")})}});module.exports=Dialog;