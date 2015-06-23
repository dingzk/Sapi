/**
 *@overfileView 找驴友入口文件
 *author Yoocky <mengyanzhou@gmail.com>
 */
requirejs.config({
	baseUrl : '/Public/webview/',
	waitSeconds: 10
});

require(['src/js/core'], function(core) {
    
	window.successPhoto = function(data){
		$("textarea").val('success:' + data);
	}

	$('.page-content .btn').on('click', function(){
		ElongApp.showPhoto('successPhoto')
	})


})