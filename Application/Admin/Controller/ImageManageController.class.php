<?php
namespace Admin\Controller;

use Admin\Model\PostImgModel;
use Admin\Model\PostsModel;
use Router\Router\Router;
class ImageManageController extends CommonController {
    public function _initialize() {
        parent::_initialize();
        $this->needLogin();
    }
    # 图片管理
	public function index() {
        $this->assign('endTime', date('Y-m-d'));
        $this->assign('startTime', date("Y-m-d", strtotime("1 days ago"))); 
		$this->display ();
	}
    
    # 获取查询结果
    public function getImageByQuery() {

    	$startTime             = $_REQUEST['startTime'];                                    #开始时间
    	$endTime               = $_REQUEST['endTime'];                                      #结束时间
        $curPage               = isset($_REQUEST['curPage'])?$_REQUEST['curPage']:1;        #当前页


        $Imags                 = new PostImgModel();
        if($startTime && $endTime){
            $map['created_at'] = array('between', array("$startTime 00:00:00", "$endTime 23:59:59"));
        }elseif($startTime){
            $map['created_at'] = array('egt', "$startTime 00:00:00");
        }elseif($endTime){
            $map['created_at'] = array('elt', "$endTime 23:59:59");
        }
        $map['img']            = array('NEQ','');                                            #字段img不为空

        $count                 = $Imags->where($map)->count();                              # 查询满足要求的总记录数

        $Page                  = new \Think\Page($count);                                   # 实例化分页类 传入总记录数
        $list                  = $Imags->where($map)->order('created_at')->page($curPage.','.$Page->listRows)->field('id,post_id,img')->select();
        $Page->show();
        $totalPages            = $Page->totalPages;                                         # 分页数据输出

        $res['count']          = $count;
        $res['curPage']        = $curPage;
        $res['totalPages']     = $totalPages;
        $res['list']           = $list;

        $this->ajaxReturn($res, 'json');
    } 

    # 删除指定ID对应的图片
    public function delImageById(){

        $id                  = $_REQUEST['id'];                                                  # 图片ID,其实已经没必要传过来了
        $postId              = $_REQUEST['postId'];                                              # 帖子ID

        if($id){
            $postsModel      = new PostsModel();
            $res             = $postsModel->delPostsById($postId);                               # 根据帖子的id删除帖子
        }else{
            $res['PostImg']  = 0;
        }

        $this->ajaxReturn($res, 'json');
    }

    # 上传图片接口
    public function uploadImg() {

        $result['result'] 	 = Router::exec('Images','upload');

        $this->ajaxReturn($result, 'json');

    }
}