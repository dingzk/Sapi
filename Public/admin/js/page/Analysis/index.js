/**
 *@overfileView 运营后台帖子管理
 *author Yoocky <mengyanzhou@gmail.com>
 */

define(['jquery', 'template', 'highcharts', 'paginator', 'data', 'exporting'],function($, template, highcharts){
	window.$ = $;

	//接口路径
	var path = {
		getPost : '/index.php/Admin/Analysis/postStatistics',
		getPostCount : '/index.php/Admin/postManage/getPostByQuery'
	}

	//查询条件
	var getQuery = function(){
		var params = {};
		$('#query').find('[name]').each(function(){
			params[this.name] = this.value;
		})
		return params;
	}
    
    //分页容器
	var $page = $('#page');

	var initPager = function(curPage, totalPages){
		var options = {
			bootstrapMajorVersion : 3,
			currentPage: curPage,
			totalPages: totalPages,
			numberOfPages:30
		}
		$page.bootstrapPaginator(options);
	}
	
	//获取查询结果
	var getPost = function(query){
        $.ajax({
        	url : path.getPost,
        	data : query,
        	dataType : 'json',
        	type : 'get',
        	success : function(data){
        		render(data);
        		initPager(data.curPage, data.totalPages);
        		$('.total_city b').html(data.count);
        	}
        })
        $.ajax({
        	url : path.getPostCount,
        	data : query,
        	dataType : 'json',
        	type : 'get',
        	success : function(data){
        		$('#total_post b').html(data.count);
        	}
        })
	}
    
    //全局缓存查询串
    var query = getQuery();

    //渲染数据
    var render = function(data){
    	var html = template('post_list_tpl', data);
    	$('#post_list').html(html);
    	$('#charts').highcharts({
	        data: {
	            table: document.getElementById('datatable')
	        },
	        chart: {
	            type: 'column'
	        },
	        title: {
	            text: '发帖量分城市统计'
	        },
	        yAxis: {
	            allowDecimals: false,
	            title: {
	                text: '发帖数'
	            }
	        },
	        tooltip: {
	            formatter: function() {
	                return '<b>'+ this.series.name +'</b><br/>'+
	                    this.y +' '+ this.x;
	            }
	        }
	    });
    }
    
    //dom ready
 	$(function(){
		$('body').on('page-changed', function(e, lastPage, curPage){
			query.curPage = curPage;
			getPost(query);
		})

		$('#submit').on('click', function(){
			query = getQuery();
			query.curPage = 1;
			getPost(query);
			return false;
		})

		$('#submit').trigger('click');
	
 	})	
})