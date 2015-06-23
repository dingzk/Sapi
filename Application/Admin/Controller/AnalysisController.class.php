<?php

namespace Admin\Controller;

class AnalysisController extends CommonController {
    public function _initialize() {
        $this->needLogin();
    }
    # 统计分析
	public function index() {
		$this->assign('endTime', date('Y-m-d'));
        $this->assign('startTime', date("Y-m-d", strtotime("1 days ago"))); 
		$this->display ();
	}

	#发帖目的地统计
	public function postStatistics(){
		$curPage   = I('curPage', 1);                                               #当前页
        $perNum    = I('perNum', 30);                                                #分页大小
    	$startTime = I('startTime', date("Y-m-d", strtotime("1 days ago")));         #开始时间
    	$endTime   = I('endTime',  date('Y-m-d'));                                   #结束时间

		$T         = M();
		$sql       = "select a.dest_id,count(a.dest_id) as num,b.place,a.post_id from post_dest_v2 as a left join dest_v2 as b on b.id=a.dest_id  left join posts as c on a.post_id =c.id where c.is_delete=0 and c.created_at between '$startTime 00:00:00' and '$endTime 23:59:59'  group by a.dest_id order by num desc";
		#查询满足要求的总记录数
		$list       = $T->query($sql);
        $count      = count($list);
        $totalPages = ceil($count / $perNum);
        $list       = array_slice($list, $perNum * ($curPage - 1), $perNum);
        $res['count']         = $count;
        $res['curPage']       = $curPage;  
        $res['totalPages']    = $totalPages;
        $res['list']          = $list;
        $this->ajaxReturn($res, 'json');
	}
}