/**
 *@overfileView 运营后台帖子管理
 *author Yoocky <mengyanzhou@gmail.com>
 */

define(['jquery', 'template', 'form', 'bootstrap'],function($, template){
	window.$ = $;

	// 接口路径
	var path = {
		getHomePage   : '/index.php/Admin/HomePage/getHomePage',
        publishHomePage   : '/index.php/Admin/HomePage/publishHomePage',
        addHomePage   : '/index.php/Admin/HomePage/addHomePage',
        previewHomePage : '/index.php/Admin/HomePage/previewHomePage',
        upload   : '/index.php/Admin/ImageManage/uploadImg'
	}

    // 获取查询结果
    var getHomePage = function(query,type){
        $.ajax({
            url : path.getHomePage,
            data : { type : type},
            dataType : 'json',
            type : 'get',
            success : function(data){
                render(data,data.type);
            }
        })
    }

    // 渲染数据
    var render = function(data,type){
        var html;
        if(data.list){
            html = template(type+'list_tpl', data);
        }
        $('#'+type+'list').html(html);
    }

    // 淡入淡出效果提示框
    var tooltip = function(data){
        $('#tooltip span').html(data.msg);
        $('#tooltip').addClass('alert-'+data.status).fadeIn(300).delay(2000).fadeOut(400);
    }
    //dom ready
 	$(function(){

        // 获取数据
        $('.getdata').on('click',function(){
            var type=$(this).index()+1;
            $.ajax({
                type: "POST",
                url: path.getHomePage+'?type='+type,
                data: '',
                success: function(data){
                    render(data,data.type);
                }
            });
        });

        // 默认触发第一个
        $('.getdata').eq(0).trigger('click');

        // 保存按钮
        $('.save').on('click', function(){
            var formobj=$(this).parents('form');
            var type=formobj.find('[name=type]').val();
            $.ajax({
                type: "POST",
                url: path.addHomePage+'?type='+type,
                data: formobj.serialize(),
                success: function(msg){
                    if(msg.result){
                        tooltip(msg);
                    }
                }
            });
        });

        // 发布按钮
        $('.publish').on('click', function(){
            var formobj=$(this).parents('form');
            var type=formobj.find('[name=type]').val();
            $.ajax({
                type: "POST",
                url: path.publishHomePage+'?type='+type,
                data: formobj.serialize(),
                success: function(msg){
                    if(msg.result){
                        tooltip(msg);
                    }
                }
            });
        });

        // 上传按钮
        $('.upload').on('click', function(){
            $("#formImg").ajaxSubmit({
                type:'post',
                url:path.upload,
                success:function(data){
                    var obj=$('#imgtip');
                    obj.show();
                    obj.find('span').html(data.result);
                }
            });
        });

        // 新增按钮
        $('.addrow').on('click', function(){
            var id=$(this).attr('title');
            var htm=$('#'+id+'hide').html();
            $('#'+id+'list').append(htm);
        });

        // 删除按钮
        $('body').on('click','.delbtn', function(){
            $(this).parent().parent('.row').remove();
        });

 	})

})