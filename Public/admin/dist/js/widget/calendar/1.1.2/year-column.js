/*! zuboke 2015-01-26 */
function createYearModel(a,b,c){for(var d=a.year(),e=[process({value:d-10,label:". . .",available:!0,role:"previous-10-year"},c)],f=d-6;d+4>f;f++)e.push(process({value:f,label:f,available:isInRange(f,b),role:"year"},c));e.push(process({value:d+10,label:". . .",available:!0,role:"next-10-year"},c));var g=[];for(f=0;f<e.length/3;f++)g.push(e.slice(3*f,3*f+3));var h={value:d,label:d};return{current:h,items:g}}function process(a,b){return b?(a.type="year",b(a)):a}function isInRange(a,b){if(null==b)return!0;if($.isArray(b)){var c=b[0];c&&c.year&&(c=c.year());var d=b[1];d&&d.year&&(d=d.year());var e=!0;return c&&(e=e&&a>=c),d&&(e=e&&d>=a),e}return $.isFunction(b)?b(a):!0}function template(a,b){var c=b.helpers._,d='<table class="ui-calendar-year" data-role="year-column">';return $.each(a.items,function(a,b){d+='<tr class="ui-calendar-year-column">',$.each(b,function(a,b){d+='<td data-role="'+b.role+'"',b.available||(d+=' class="disabled-element"'),d+='data-value="'+b.value+'">',d+=c(b.label)+"</td>"}),d+="</tr>"}),d+="</table>"}var $=require("jquery"),BaseColumn=require("./base-column"),YearColumn=BaseColumn.extend({attrs:{process:null,template:template,model:{getter:function(){return createYearModel(this.get("focus"),this.get("range"),this.get("process"))}}},events:{"click [data-role=year],[data-role=previous-10-year],[data-role=next-10-year]":function(a){var b=$(a.target),c=b.data("value");this.select(c,b)}},setup:function(){YearColumn.superclass.setup.call(this),this.on("change:range",function(){this.element.html($(this.compileTemplate()).html())})},prev:function(){var a=this.get("focus").add("years",-1);return this._sync(a)},next:function(){var a=this.get("focus").add("years",1);return this._sync(a)},select:function(a,b){if(b&&b.hasClass("disabled-element"))return this.trigger("selectDisable",a,b),a;var c;return c=a.year?a:this.get("focus").year(a),this._sync(c,b)},focus:function(a){a=a||this.get("focus");var b='[data-value="'+a.year()+'"]';this.element.find(".focused-element").removeClass("focused-element"),this.element.find(b).addClass("focused-element")},refresh:function(){var a=this.get("focus").year(),b=this.element.find("[data-role=year]");(a<b.first().data("value")||a>b.last().data("value"))&&this.element.html($(this.compileTemplate()).html())},inRange:function(a){return isInRange(a,this.get("range"))},_sync:function(a,b){return this.set("focus",a),this.refresh(),this.focus(a),null!==b&&this.trigger("select",a.year(),b),a}});module.exports=YearColumn;