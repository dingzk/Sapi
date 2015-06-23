define( function(ddd,core) {
	// j.js

	var baseUrl = 'http://tj.elongstatic.com/t.gif?';
	var commonObj = {
		g:Math.floor(Math.random()*99999),
		cid:'',
		sid:'',
		rf:'',
		bs:screen?screen.width+'*'+screen.height:''
	};
	if (document.cookie.match(/SessionGuid=([\w-]*)/)){
		commonObj.sid = document.cookie.match(/SessionGuid=([\w-]*)/)[1];
	}
	if (document.cookie.match(/CookieGuid=([\w-]*)/)){
		commonObj.cid = document.cookie.match(/CookieGuid=([\w-]*)/)[1];
	}

	(function(){
		var t = [];
		for (var i in commonObj) {
			 t.push(i+'='+commonObj[i]);
		}
		baseUrl += t.join("&")
	})();
	

	var tj_jsStartTime = Date.now();
	var parmsTJ = {
        channel: "ch",
        pagetype: "pt",
        //orderfrom: "p1",
        //cdnIp: "p85",
        //Html5 Performance.timing属性
        fetchStart: "p88",
        domainLookupStart: "p89",
        domainLookupEnd: "p90",
        connectStart: "p91",
        connectEnd: "p92",
        requestStart: "p93",
        responseStart: "p94",
        responseEnd: "p95",
        domLoading: "p96",
        domContentLoadedEventEnd: "p97",
        tj_jsStartTime: "p98",
        loadEventStart: "p99",
        //browserInfoStr: "p100"
    };
	var tjObj= {},a={};
	tjObj.channel = 'tourpal';
	tjObj.pagetype = 'FEframework';
	// tjObj.ch;
    if ((window.performance) && (window.performance.timing)) {
        tjObj.fetchStart = window.performance.timing.fetchStart;
        tjObj.domainLookupStart = window.performance.timing.domainLookupStart;
        tjObj.domainLookupEnd = window.performance.timing.domainLookupEnd;
        tjObj.connectStart = window.performance.timing.connectStart;
        tjObj.connectEnd = window.performance.timing.connectEnd;
        tjObj.requestStart = window.performance.timing.requestStart;
        tjObj.responseStart = window.performance.timing.responseStart;
        tjObj.responseEnd = window.performance.timing.responseEnd;
        tjObj.domLoading = window.performance.timing.domLoading;
        tjObj.domContentLoadedEventEnd = window.performance.timing.domContentLoadedEventEnd;
        tjObj.tj_jsStartTime = tj_jsStartTime;
        tjObj.loadEventStart = window.performance.timing.loadEventStart;
        //tjObj.browserInfoStr = es();
        for (var c in tjObj) {
	        var d = parmsTJ[c];
	        if (d) {
	            a[d] = tjObj[c];
	        } else {
	            if (c.toString().substr(0, 1) == "m") {
	                a[c] = tjObj[c];
	            } else {
	                // if ($.browser.mozilla) {
	                    // window.console.warn("Elong行为统计警告：页面统计参数"+c+"未注册！");
	                // }
	            }
	        }
	    }
    }

    var __sendObj = function(obj){
    	var params = '';
    	for (var i in obj) {
    		params =params + '&' + i+'='+obj[i];
    	}
    	new Image().src = baseUrl + params;
    };

    

	//g=58472&cid=0d0b2b13-5ece-463a-a7c1-046258363674&sid=145deca2-9a70-4ca5-ad54-2d9cce6f0ba1&rf=&bs=1440*900
	//common
    window.onerror = function(msg,url,line){
    	__sendObj({
    		ev:'webjserror',//jianmei, qiuliang
    		ch:tjObj.channel,
    		pagetype:tjObj.pagetype,
    		e1:location.host,
    		e2:line,
    		e3:url,
    		e4:msg,
    		e5:navigator.userAgent
    	});
    };

    if (document.readyState === 'complete') {
    	__sendObj(a);
    }else{
    	window.onload = function(){
    		__sendObj(a);
    	};
    }

//http://tj.elongstatic.com/t.gif?g=81946&cid=0d0b2b13-5ece-463a-a7c1-046258363674&sid=145deca2-9a70-4ca5-ad54-2d9cce6f0ba1&rf=&bs=1440*900&ch=home&pt=ElongIndexPage&p1=50&p88=1420619358227&p89=1420619358231&p90=1420619358238&p91=1420619358238&p92=1420619358240&p93=1420619358241&p94=1420619358279&p95=1420619358306&p96=1420619358299&p97=1420619359088&p98=1420619358387&p99=1420619359461&p100=0001f147c4568f00b204ffffffffe81b52df23a4a9bfb8c1af6dffffffff496561b18f00b204dcbc1aaa193594686f436287
//http://tj.elongstatic.com/t.gif?g=58472&cid=0d0b2b13-5ece-463a-a7c1-046258363674&sid=145deca2-9a70-4ca5-ad54-2d9cce6f0ba1&rf=&bs=1440*900&ev=webjserror&e1=www.elong.com&e2=1&e3=2&e4=3&e5=Mozilla/5.0%20(Macintosh;%20Intel%20Mac%20OS%20X%2010_10_1)%20AppleWebKit/537.36%20(KHTML,%20like%20Gecko)%20Chrome/39.0.2171.95%20Safari/537.36
// console.log(tjObj.join("&"));

});