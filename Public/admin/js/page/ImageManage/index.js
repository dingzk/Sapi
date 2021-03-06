/**
 *@overfileView 运营后台图片管理
 *author Yoocky <mengyanzhou@gmail.com>
 */

define(['jquery', 'template', 'paginator','bootstrap'],function($, template){
    window.$ = $;

    //接口路径
    var path = {
        getPost : '/index.php/Admin/ImageManage/getImageByQuery',
        delPost : '/index.php/Admin/ImageManage/delImageById'
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
            //var l = $('table th').length;
            html = '<div class="row">暂无相关图片信息</div>';
        }
        $('#post_list').html(html);
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

        $('body').on('show.bs.modal', function(e){
            var id = $(e.relatedTarget).attr('id');
            var postId = $(e.relatedTarget).attr('postid');
            $('#confirm_del').attr('imgid',id);
            $('#confirm_del').attr('postid',postId);
        })

        $('#confirm_del').on('click', function(){
            var id = $(this).attr('imgid');
            var postId = $(this).attr('postid');
            $.ajax({
                url : path.delPost,
                data : {id : id,postId : postId},
                dataType : 'json',
                type : 'get',
                success : function(data){
                    if(data.PostImg){
                        for(var i=0;i<data.Imgids.length ;i++){
                            $('#post_list div[imageid=' + data.Imgids[i] + ']').fadeOut();
                        }
                    }
                }
            })
        })
    })
})