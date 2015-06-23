<?php
namespace Service\Model;

class UserModel extends BaseModel {
	
	const MAX_VISIBLE_ITEM = 7;	# 默认权限设置
	
	#根据用户ids获取用户信息
	public function getUserInfoByIds(array $uids) {
		$userInfos 		= array();
		if (!empty($uids)) {
			$map['id'] 	= array("in", $uids);
			$userInfos 	= $this->where($map)->select();
			$userInfos 	= $this->setKeyByField($userInfos, "id");
			if (!empty($userInfos)) {
				foreach ($userInfos as $id => &$info) {
					$imgId 				 = $info['head_img'];
					$imgFull 			 = $this->wrapHeadImg($imgId);
					$info['head_img'] 	 = $imgFull['thumb'];
					$info['head_origin'] = $imgFull['origin'];
					unset($info['_timestamp']);
				}
			}
		}
		
		return $userInfos;
	}
	
	# 根据用户id获取用户信息
	public function getUserInfoById($uid) {
		$userInfo 				= array();
		if (!empty($uid)) {
			$userInfo 			= $this->find($uid);
			if (!empty($userInfo)) {
				$imgId 					 = $userInfo['head_img'];
				$imgFull 				 = $this->wrapHeadImg($imgId);
				$userInfo['head_img'] 	 = $imgFull['thumb'];
				$userInfo['head_origin'] = $imgFull['origin'];
				$userPreferModel 		 = new UserPreferModel();					# 获取用户的旅行标签
				$userInfo['preferList']  = $userPreferModel->getPreferByUid($uid);
				unset($userInfo['_timestamp']);
			}
		}
		
		return $userInfo;
	}
	
	# 修改用户信息
	public function userSave($uid, $fields) {
		$status             = false;
		if(!empty($uid) && !empty($fields['nick_name']) && !empty($fields['sex']) && (!empty($fields['weixin']) || !empty($fields['qq']) || !empty($fields['phone']))) {
			$data     				= array();
			$data['id'] 			= $uid;
			$data['nick_name'] 		= isset($fields['nick_name']) ? $fields['nick_name'] : '';
			$data['age'] 			= isset($fields['age']) ? $fields['age'] : '';
			$data['sex'] 			= isset($fields['sex']) ? $fields['sex'] : 1;						# 默认是男的
			$data['weixin'] 		= isset($fields['weixin']) ? $fields['weixin'] : '';
			$data['qq'] 			= isset($fields['qq']) ? $fields['qq'] : '';
			$data['phone'] 			= isset($fields['phone']) ? $fields['phone'] : '';
			
			$data['sign'] 			= isset($fields['sign']) ? $fields['sign'] : '';
			$data['dest_wanted'] 	= isset($fields['dest_wanted']) ? $fields['dest_wanted'] : '';
			$data['dest_gone'] 		= isset($fields['dest_gone']) ? $fields['dest_gone'] : '';
			$data['residence'] 		= isset($fields['residence']) ? $fields['residence'] : '';			# 常驻地id
			if ($fields['preferList']) {																# 添加旅行偏好
				$userPreferModel = new UserPreferModel();
				$userPreferModel->addPreferByNames($uid, $fields['preferList']);
			}
			
			if ($fields['group_visible'] !== null) {
				$data['group_visible'] 	= $fields['group_visible'] == 1 ? 1 : 0;
			}
			if ($fields['visible_item'] !== null) {		# 这里不做校验了
				$data['visible_item']   = $fields['visible_item'] <= self::MAX_VISIBLE_ITEM ? $fields['visible_item'] : self::MAX_VISIBLE_ITEM;
			}
			$data['updated_at'] 	= date("Y-m-d  H:i:s", time());
			
			$status 				= $this->save($data);
		}
		
		return $status===false ? false : true;
	}

	# 编辑隐私项目
	public function editPrivacy($uid, $privacyFields) {
		$data 			= array();
		$data['id'] 	= $uid;
		if (!empty($privacyFields)) {
			if ($privacyFields['group_visible'] !== null) {
				$data['group_visible'] 	= $privacyFields['group_visible'] == 1 ? 1 : 0;
			}
			if ($privacyFields['visible_item'] !== null) {
				$data['visible_item']   = $privacyFields['visible_item'] <= self::MAX_VISIBLE_ITEM ? $privacyFields['visible_item'] : self::MAX_VISIBLE_ITEM;
			}
			$data['updated_at'] 	= date("Y-m-d  H:i:s", time());
		}
		$status = $this->save($data);
		
		return $status===false ? false : true;
	}
	
	# 获取用户的联系信息
	private function getContactInfoById($uid) {
		$userInfo 		= $this->find($uid);
		$contactInfo 	= array();
		if (!empty($userInfo)) {
			$contactInfo['weixin'] 	= $userInfo['weixin'];
			$contactInfo['qq'] 		= $userInfo['qq'];
			$contactInfo['phone'] 	= $userInfo['phone'];
		}
	
		return $contactInfo;
	}
	
	# 获取到的饮食设置和目前数据库中的记录取交集
	private function wrapVisibleItem($visibleItem, $contactInfo) {
		$contactDec 	= $this->trans2dec($contactInfo['weixin'], $contactInfo['qq'], $contactInfo['phone']);
		$visibleItem 	= $this->getVisibleItem($visibleItem, $contactDec);
		
		return $visibleItem;
	}
	
	# 联系方式转成10进制,注意顺序
	private function trans2dec($weixin, $qq, $phone) {
		$binStr 		= '';
		$binStr        .= empty($phone) ? 0 : 1;
		$binStr        .= empty($qq) ? 0 : 1;
		$binStr 	   .= empty($weixin) ? 0 : 1;
		$dec 			= bindec($binStr);
		
		return $dec;
	}
	
	# 取与
	private function getVisibleItem ($visibleItem, $contactDec) {
		$itemDec 		= $visibleItem & $contactDec;
		
		return $itemDec;
	}
	
	# 用户登录以后，第一次记得把用户基本信息写入user表
	public function userAdd($mid, $fields) {
		$insertId 			= 0;
		if (empty($mid)) {
			return $insertId;
		}
		$map 				= array();
		$map['mid'] 		= $mid;
		$res 				= $this->where($map)->find();
		if (!empty($res)) {
			$insertId 				= $res['id'];
		} else {
			$data     				= array();
			$data['mid'] 			= $mid;
			$data['head_img'] 		= isset($fields['head_img']) ? $fields['head_img'] : '';
			$data['nick_name'] 		= isset($fields['nick_name']) ? $fields['nick_name'] : '';
			$data['sex'] 			= isset($fields['sex']) ? $fields['sex'] : '';
			$data['weixin'] 		= isset($fields['weixin']) ? $fields['weixin'] : '';
			$data['qq'] 			= isset($fields['qq']) ? $fields['qq'] : '';
			$data['phone'] 			= isset($fields['phone']) ? $fields['phone'] : '';
			$data['group_visible'] 	= 1;
			$data['visible_item']	= self::MAX_VISIBLE_ITEM;
			$data['created_at'] 	= date("Y-m-d  H:i:s", time());
			$data['updated_at'] 	= date("Y-m-d  H:i:s", time());
			
			$insertId 				= $this->add($data);
		}
		
		return $insertId;
	}
	
	# 根据用户的mid判断用户存在不存在
	public function getUserInfoByMid($mid) {
		$map 				= array();
		$map['mid'] 		= $mid;
		$res 				= $this->where($map)->find();
		
		return $res;
	}
	
	# 保存用户的头像
	public function saveHeadImg($uid, $img) {
		$map 				= array();
		$map['id'] 			= $uid;
		$map['head_img'] 	= $img;
		$status             = $this->save($map);
		$status             = $status === false ? false : true;
		
		return $status;
	}
	
	# 拼装用户的头像url
	private function wrapHeadImg($img) {
		$imgUrl   = array('thumb' => '', 'origin' => '');
		if (!empty($img)) {
			$thumb 	= C('READ_IMG_URL')."/".C('TAG_NAME_HEAD_IMG_THUMB').'/'.$img.".jpg";
			$origin = C('READ_IMG_URL')."/".C('TAG_NAME_HEAD_IMG_ORIGIN').'/'.$img.".jpg";
			$imgUrl = array('thumb' => $thumb, 'origin' => $origin);
		}
		
		return $imgUrl;
	}
	
}