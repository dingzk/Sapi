<?php
namespace Admin\Model;
use Think\Model;

class ReportModel extends Model {

    //根据帖子的id删除举报记录
	public function delReport($postId) {

        $res['Posts'] 	    = $this->where('post_id='.$postId)->delete();
        return $res;
	}
}