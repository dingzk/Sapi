<?php
namespace Admin\Model;

use Think\Model;

class PostImgModel extends Model {

    //根据图片的id去删除图片
    public function delImgById($id){

        if(is_array($id)){
            $map['id']  = array('in',$id);
        }else{
            $map['id']  = $id;
        }

        return $this->where($map)->delete();
    }

    //根据帖子的id获取图片列表
    public function getImgListByPost($postId){

        $imgIds         = array();
        $imaglist       = $this->where('post_id='.$postId)->field('id')->select();

        foreach ($imaglist as $val) {
            $imgIds[]   = $val['id'];
        }

        return $imgIds;
    }
}
?>