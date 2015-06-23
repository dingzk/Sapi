/**
 *@overfileView 运营后台帖子管理
 *author Yoocky <mengyanzhou@gmail.com>
 */

define(['jquery', 'template', 'paginator', 'bootstrap'],function($, template){
	window.$ = $;

    //扩展template方法  输出性别
    template.helper('sex', 
    function(number) {
        number = number * 1 || 1;
        var sex = ['男', '女']
        return sex[number - 1];

    });

	//接口路径
	var path = {
		getPost   : '/index.php/Admin/postManage/getPostByQuery',
		delPost   : '/index.php/Admin/postManage/delPostById',
        delReport : '/index.php/Admin/reportManage/delReport'
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
			numberOfPages:10
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
        		$('#total b').html(data.count);
        	}
        })

	}
    
    //全局缓存查询串
    var query = getQuery();

    //渲染数据
    var render = function(data){
    	var html;
    	if(data.list){
    		html = template('post_list_tpl', data);
    	}else{
    		var l = $('table th').length;
    		html = '<td colspan="' + l + '" class="error">暂无相关信息</td>';
    	}
    	$('#post_list').html(html);
    }
    
    //dom ready
 	$(function(){
 		//更改复选框value
 		$('#query').find('[type=checkbox]').on('change', function(){
 			$(this).val($(this).prop('checked')*1);
 		})

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

		$('.confirm-del').on('show.bs.modal', function(e){
			var id = $(e.relatedTarget).attr('postid');
			$('#confirm_del').attr('postid', id);
		})

		$('#confirm_del').on('click', function(){
			var id = $(this).attr('postid');
			$.ajax({
	        	url : path.delPost,
	        	data : {id : id},
	        	dataType : 'json',
	        	type : 'get',
	        	success : function(data){
	        		if(data.Posts){
	        			$('#post_list tr[postid=' + id + ']').fadeOut();
                        var total=parseInt($("#total b").html())-1;
                        $('#total b').html(total);
	        		}
	        	}
        	})
		})

        $('.report_ignore').on('show.bs.modal', function(e){
            var id = $(e.relatedTarget).attr('postid');
            $('#report_ignore').attr('postid', id);
        })

        $('#report_ignore').on('click', function(){
            var id = $(this).attr('postid');
            $.ajax({
                url : path.delReport,
                data : {id : id},
                dataType : 'json',
                type : 'get',
                success : function(data){
                    if(data.Posts){
                        $('#post_list tr[postid=' + id + ']').fadeOut();
                        var total=parseInt($("#total b").html())-1;
                        $('#total b').html(total);
                    }
                }
            })
        })
 	})	
})