<?php

namespace Admin\Controller;

use Admin\Model\HomePageModel;

class HomePageController extends CommonController {

    public function _initialize() {
        parent::_initialize();
        $this->needLogin();
    }

    public function index(){
        $this->display();
    }

    # 根据传递的条件获取展示列表
	public function getHomePage() {

        $result         = array();
        $map            = array();
        $map['status']  = 1;
        $map['type']    = $_REQUEST['type']?$_REQUEST['type']:1;

        $homeModel      = new HomePageModel();                       # 获取主页已发布的数据列表
        $result['list'] = $homeModel->getHomePage($map);

        switch(intval($map['type'])){
            case 1:                                                 # 广告位展示
                $result['type']   = 'ad';
                break;
            case 2:                                                 # 热门城市展示
                $result['type']   = 'city';
                break;
            case 3:                                                 # 标签展示
                $result['type']   = 'tag';
                break;
        }

        $this->ajaxReturn($result, 'json');
    }

    # 保存操作-数据入库
    public function addHomePage(){

        $res   = array();
        $data  = array();
        $type  = intval($_GET['type']);
        $list  = $_POST;

        foreach($list as $key=>$val){                              # 数据拼装
            foreach($val as $k=>$value){
                if(!empty($value)){
                    $data[$k][$key]         =$value;
                    $data[$k]['type']       =$type;
                    $data[$k]['created_at'] =date('Y-m-d H:i:s',time());
                }
            }
        }

        $homeModel          = new HomePageModel();                     # 添加数据home_page
        $res['result']      = $homeModel->addHomePage($data);
        if($res['result']){
            $res['status']  = 'success';
            $res['msg']     = '保存成功';
        }else{
            $res['status']  = 'failed';
            $res['msg']     = '保存失败';
        }

        $this->ajaxReturn($res, 'json');
    }

    # 发布操作-更改数据状态
    public function publishHomePage(){

        $res           =array();
        $type          = intval($_REQUEST['type']?$_REQUEST['type']:1);

        $homeModel     = new HomePageModel();                      # 更改数据home_page
        $res['result'] = $homeModel->updateByType($type);

        if($res['result']){
            $res['status']  = 'success';
            $res['msg']     = '发布成功';
        }else{
            $res['status']  = 'failed';
            $res['msg']     = '发布失败';
        }
        $this->ajaxReturn($res, 'json');
    }

    # 预览操作
    public function previewHomePage(){

    }
}
