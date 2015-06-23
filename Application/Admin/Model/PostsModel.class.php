<?php
namespace Admin\Model;
use Think\Model\RelationModel;

class PostsModel extends RelationModel {
	protected $_link = array(
        
		'User' => array(
		    'mapping_type'   => self::BELONGS_TO,
		    'class_name'     => 'User',
		    'foreign_key'    => 'uid',
		    'mapping_name'   => 'user'
		),
		'PostImg' => array(
		    'mapping_type'   => self::HAS_MANY,
		    'class_name'     => 'PostImg',
		    'foreign_key'    => 'post_id',
		    'mapping_fields' => 'img',
		    'mapping_name'   => 'img'
		),
		'DestV2' => array(
		    'mapping_type'         => self::MANY_TO_MANY,
		    'class_name'           => 'DestV2',
		    'foreign_key'          => 'post_id',
		    'relation_foreign_key' => 'dest_id',
		    'relation_table'       => 'post_dest_v2',
		    'mapping_fields'       => 'place',
		    'mapping_name'         => 'dest'
		),
        'Report' => array(
            'mapping_type'   => self::HAS_MANY,
            'foreign_key'    => 'post_id',
            'mapping_fields' => 'post_id',
            'mapping_name'   => 'post_id'
        ),
    );
    //根据帖子的id删除帖子（应该有关联模型可以一次性删除）
    public function delPostsById($postId){

        $res                = array();

        $data['is_delete'] 	= 1;                                                           # 删掉posts
        $res['Posts'] 	    = $this->where('id='.$postId)->save($data);

        $postImgModel       = new PostImgModel();
        $imgIds             = $postImgModel->getImgListByPost($postId);                    # 获取图片列表
        $res['Imgids']      = $imgIds;                                                     # 删掉post_img
        $res['PostImg']     = $postImgModel->where('post_id='.$postId)->delete();

        $postDestModel 	    = M('PostDestV2');						                       # 删掉post_dest
        $res['PostDest']    = $postDestModel->where('post_id='.$postId)->delete();

        $likedModel 	    = M('Liked');							                       # 删掉liked
        $res['Liked']       = $likedModel->where('post_id='.$postId)->delete();

        $postTagModel 	    = M('PostTag');						                           # 删掉post_tag
        $res['PostTag']     = $postTagModel->where('post_id='.$postId)->delete();

        return $res;
    }
}
?>