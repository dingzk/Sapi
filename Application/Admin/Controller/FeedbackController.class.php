<?php

namespace Admin\Controller;

class FeedbackController extends CommonController {
    public function _initialize() {
        $this->needLogin();
    }

    # 反馈查询
	public function index() {
        $this->assign('endTime', date('Y-m-d'));
        $this->assign('startTime', date("Y-m-d", strtotime("1 days ago"))); 
		$this->display ();
	}
    
    # 获取查询结果
    public function getFeedbackByQuery() {

    	$startTime = I('startTime');         #开始时间
    	$endTime   = I('endTime');           #结束时间
        $curPage   = I('curPage', 1);        #当前页
        $perNum    = I('perNum', 10);        #分页大小

        $Feedback = M('feedback');
        #反馈时间区间条件
        if($startTime && $endTime){
            $map['created_at'] = array('between', array("$startTime 00:00:00", "$endTime 23:59:59"));
        }elseif($startTime){
            $map['created_at'] = array('egt', "$startTime 00:00:00");
        }elseif($endTime){
            $map['created_at'] = array('elt', "$endTime 23:59:59");
        }
        #查询满足要求的总记录数
        $count    = $Feedback->where($map)->count();  
        #实例化分页类 传入总记录数   
        $Page     = new \Think\Page($count);      
        $nowPage  =  $curPage;
        $list     = $Feedback->where($map)->order('created_at')->page($nowPage.','.$Page->listRows)->select();
        $Page->show();
        #分页数据输出
        $res['count']         = $count;
        $res['curPage']       = $nowPage;  
        $res['totalPages']    = $Page->totalPages;
        $res['list']          = $list;
        $this->ajaxReturn($res, 'json');
    } 
}