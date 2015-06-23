<?php
namespace Admin\Model;

use Think\Model;

class HomePageModel extends Model {

    # 根据条件获取图片列表
    public function getHomePage($where){

        if(empty($where)){
            $res  = $this->select();
        }else{
            $res  = $this->where($where)->select();
        }

        return $res;
    }

    # 主页数据批量入库操作
    public function addHomePage($data){

        $res   = $this->addAll($data);                                 # 批量入库

        return $res;
    }

    # 数据发布
    public function updateByType($type){

        $map               = array();
        $map['type']       = $type?$type:1;
        $map['status']     = 1;

        $this->startTrans();                                        # 开启事务,删除上期发布的信息
        $delres             =$this->where($map)->delete();          # 删除上期发布的信息

        $data               = array();                              # 发布当前信息
        $data['status']     = 1;
        $saveres            = $this->where('type='.$type)->save($data);

        if(($delres !== false)&&($saveres !== false)){
            $this->commit();                                        # 提交事务
            return true;
        }else{
            $this->rollback();                                      # 事务回滚
            return false;
        }
    }
}
?>