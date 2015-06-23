<?php

namespace Admin\Controller;
use Admin\Model\PostsModel;

class PostManageController extends CommonController {
    public function _initialize() {
        parent::_initialize();
        $this->needLogin();
    }
    # 帖子管理
	public function index() {
        $this->assign('endTime', date('Y-m-d'));
        $this->assign('startTime', date("Y-m-d", strtotime("1 days ago"))); 
		$this->display ();
	}
    
    # 获取查询结果
    public function getPostByQuery() {

    	$id        = I('id');                #帖子ID
    	$userId    = I('uid');               #用户ID
        $dest      = I('dest');              #目的城市
    	$startTime = I('startTime');         #开始时间
    	$endTime   = I('endTime');           #结束时间
        $curPage   = I('curPage', 1);        #当前页
        $perNum    = I('perNum', 10);        #分页大小
        $isDelete  = I('isDelete', 0);       #是否显示删除
        $isReport  = I('isReport', 0);       #是否显示举报

        $Posts = D('Posts');
        if(empty($isDelete)){
            $map['is_delete'] = array('NEQ', 1);
        }else{
            $map['is_delete'] = array('EQ', 1);
        }
        if($id){
            $map['id'] = $id;
        } else{
            $userId    && $map['uid']        = $userId;
            #发帖时间区间条件
            if($startTime && $endTime){
                $map['created_at'] = array('between', array("$startTime 00:00:00", "$endTime 23:59:59"));
            }elseif($startTime){
                $map['created_at'] = array('egt', "$startTime 00:00:00");
            }elseif($endTime){
                $map['created_at'] = array('elt', "$endTime 23:59:59");
            }
        }
        if($dest||$isReport){
            if($isReport){
                //获取投诉的帖子列表
                $reportModel  = M('Report');
                $postIds_tmp  = $reportModel->Distinct(true)->field('post_id')->select();
                if($postIds_tmp){
                    foreach($postIds_tmp as $key=>$val){
                        $postIds[] = $val['post_id'];
                    }
                    $map['id']         = array('in',$postIds);
                }
                if($isDelete){
                    $map['is_delete'] = array('EQ', 1);
                }else{
                    unset($map['is_delete']);
                }
            }
            $list_tmp = $Posts->relation(true)->where($map)->order('created_at')->select();
            if($dest){
                $list = array();
                foreach ($list_tmp as $item){
                    foreach ($item['dest'] as $city) {
                        if($city['place'] == $dest){
                            array_push($list, $item);
                        }
                    }
                }
            }else{
                $list = $list_tmp;
            }
            //print_r($map);
            $count      = count($list);
            $totalPages =  ceil($count / $perNum)>=1?ceil($count / $perNum):1;
            $list       = array_slice($list, $perNum * ($curPage - 1), $perNum);
        }else{
            #查询满足要求的总记录数
            $count      = $Posts->where($map)->count();  
            #实例化分页类 传入总记录数   
            $Page       = new \Think\Page($count);      
            $list       = $Posts->relation(true)->where($map)->order('created_at')->page($curPage.','.$Page->listRows)->select();
            $Page->show();
            $totalPages = $Page->totalPages;
        }
        //print_r($map);
        #分页数据输出
        $res['count']       = $count;
        $res['curPage']       = $curPage;  
        $res['totalPages']    = $totalPages;
        $res['list']          = $list;
        //print_r($res);
        $this->ajaxReturn($res, 'json');
    } 

    # 删除指定ID对应的帖子
    public function delPostById(){

        $id    = I('id');                                                      # 帖子ID
        if($id){
            $postsModel=    new PostsModel();
            $res=$postsModel->delPostsById($id);                               # 根据帖子的id删除帖子
            $this->ajaxReturn($res, 'json');
            /*#更新post标示
            $Posts = M("Posts");       
            $data['updated_at'] = date('Y-m-d H:i:s', time());
            $data['is_delete']  = 1;
            $res['Posts']       = $Posts->where("id=$id")->save($data); 

            #删除PostDest对应行
            $PostDest           = M('PostDestV2');
            $res['PostDest']    = $PostDest->where("post_id=$id")->delete();

            #删除PostImg对应行
            $PostImg            = M('PostImg');
            $res['PostImg']     = $PostImg->where("post_id=$id")->delete();

            $this->ajaxReturn($res, 'json');*/
        }
        
    }
}
