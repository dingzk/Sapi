/*! zuboke 2015-01-26 */
function Class(a){return this instanceof Class||!isFunction(a)?void 0:classify(a)}function implement(a){var b,c;for(b in a)c=a[b],Class.Mutators.hasOwnProperty(b)?Class.Mutators[b].call(this,c):this.prototype[b]=c}function classify(a){return a.extend=Class.extend,a.implement=implement,a}function Ctor(){}function mix(a,b,c){for(var d in b)if(b.hasOwnProperty(d)){if(c&&-1===indexOf(c,d))continue;"prototype"!==d&&(a[d]=b[d])}}module.exports=Class,Class.create=function(a,b){function c(){a.apply(this,arguments),this.constructor===c&&this.initialize&&this.initialize.apply(this,arguments)}return isFunction(a)||(b=a,a=null),b||(b={}),a||(a=b.Extends||Class),b.Extends=a,a!==Class&&mix(c,a,a.StaticsWhiteList),implement.call(c,b),classify(c)},Class.extend=function(a){return a||(a={}),a.Extends=this,Class.create(a)},Class.Mutators={Extends:function(a){var b=this.prototype,c=createProto(a.prototype);mix(c,b),c.constructor=this,this.prototype=c,this.superclass=a.prototype},Implements:function(a){isArray(a)||(a=[a]);for(var b,c=this.prototype;b=a.shift();)mix(c,b.prototype||b)},Statics:function(a){mix(this,a)}};var createProto=Object.__proto__?function(a){return{__proto__:a}}:function(a){return Ctor.prototype=a,new Ctor},toString=Object.prototype.toString,isArray=Array.isArray||function(a){return"[object Array]"===toString.call(a)},isFunction=function(a){return"[object Function]"===toString.call(a)},indexOf=Array.prototype.indexOf?function(a,b){return a.indexOf(b)}:function(a,b){for(var c=0,d=a.length;d>c;c++)if(a[c]===b)return c;return-1};