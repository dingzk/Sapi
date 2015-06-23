/*! zuboke 2015-01-26 */
var $=require("jquery"),moment=require("moment"),BaseCalendar=require("./base-calendar"),DateColumn=require("./date-column"),template=['<div class="ui-calendar ui-double-calendar">','<div class="ui-calendar-start">','<div class="ui-calendar-wrap">','<div class="ui-calendar-pannel" data-role="pannel">','<span class="ui-calendar-control" data-role="prev-year">&lt;&lt;</span>','<span class="ui-calendar-control" data-role="prev-month">&lt;</span>','<span class="ui-calendar-control month" data-role="start-month"></span>','<span class="ui-calendar-control year" data-role="start-year"></span>',"</div>","</div>",'<div class="ui-calendar-container" data-role="container"></div>',"</div>",'<div class="ui-calendar-end">','<div class="ui-calendar-wrap">','<div class="ui-calendar-pannel" data-role="pannel">','<span class="ui-calendar-control month" data-role="end-month"></span>','<span class="ui-calendar-control year" data-role="end-year"></span>','<span class="ui-calendar-control" data-role="next-month">&gt;</span>','<span class="ui-calendar-control" data-role="next-year">&gt;&gt;</span>',"</div>","</div>",'<div class="ui-calendar-container" data-role="container"></div>',"</div>","</div>"].join(""),Calendar=BaseCalendar.extend({attrs:{template:template},events:{"click [data-role=prev-year]":function(){},"click [data-role=next-year]":function(){},"click [data-role=prev-month]":function(){},"click [data-role=next-month]":function(){}},setup:function(){Calendar.superclass.setup.call(this),this.renderPannel();var a=this.get("focus"),b={focus:a,lang:this.get("lang"),range:this.get("range"),format:this.get("format"),startDay:this.get("startDay"),process:this.get("process")};this.startDates=new DateColumn(b),b.focus=a.clone().add("months",1),this.endDates=new DateColumn(b),this.element.find(".ui-calendar-start .ui-calendar-container").append(this.startDates.element),this.element.find(".ui-calendar-end .ui-calendar-container").append(this.endDates.element)},renderPannel:function(){var a=this.get("focus"),b=this.element.find("[data-role=start-month]"),c=this.element.find("[data-role=start-year]"),d=this.element.find("[data-role=end-month]"),e=this.element.find("[data-role=end-year]"),f=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],g=this.get("lang"),h=f[a.month()];h=g[h]||h,b.text(h),c.text(a.year()),a=a.clone(),a.add("months",1),h=f[a.month()],h=g[h]||h,d.text(h),e.text(a.year())},destroy:function(){this.startDates.destroy(),this.endDates.destroy(),Calendar.superclass.destroy.call(this)}});module.exports=Calendar;