<?php
namespace Service\Controller;

use Service\Model\PostImgModel;
use Org\Util\String;
use Think\Log;
define("UPLOAD_PATH_TMP", dirname(__FILE__)."/../Uploads/");	# 图片先缓存在本地，然后再上传到图床

/**
 * 图片处理类
 * @author zhenkai.ding
 *
 */
class ImagesController extends CommonController {
	
	public function _initialize() {
		parent::_initialize();
	}
	
	// 用户提交图片的处理
	public function upload() {
		
		$upload 		   	= new \Think\Upload();
		$upload->maxSize   	= 6291456 ;	// 设置附件上传大小(6M)
		$upload->exts      	= array('jpg', 'gif', 'png', 'jpeg', 'bmp');
		$upload->rootPath  	= UPLOAD_PATH_TMP;
		
		$upload->saveName 	= array('uniqid','');
		$upload->autoSub  	= true;
		$upload->subName  	= array('date','Ymd');
		
		$returnImg 		  	= array(); 
		$info   		  	= $upload->upload();
		Log::write(serialize($info));
		if (! $info) {
			return $upload->getError ();
		} else { // 上传成功
			foreach ( $info as $file ) {
				$filename 		= $upload->rootPath.$file ['savepath'] . $file ['savename'];
				$returnImg[] 	= $this->uploadToServer ( $filename ); // 不能批量上传，只能单个遍历上传
			}
			if (!empty($returnImg)) {
				$postImgModel 	= new PostImgModel();
				$returnImg 		= $postImgModel->wrapImgUrls($returnImg);
				$returnImg      = array_values($returnImg);
			}
			
			return $returnImg;
		}
	}
	
	// 转化客户端提交的图片二进制流
	public function stream2Img(array $streams) {
		
		$returnImg  = array();
		if (! empty ( $streams )) {
			// 创建并写入数据流，然后保存文件
			$date 	= date("Ymd", time());
			$imgDir = UPLOAD_PATH_TMP.$date;
			if (!is_dir($imgDir)) {
				mkdir($imgDir);
			}
			foreach ($streams as $k => $img ) {
				$uniqueId 	= String::uuid();
				$file		= $imgDir."/".$uniqueId.$k.".jpg";	# 瓶装文件名
				if (@$fp 	= fopen ( $file, 'w+' )) {
					fwrite ( $fp, $img );
					fclose ( $fp );
				}
				$returnImg[] = $this->uploadToServer ( $file ); // 不能批量上传，只能单个遍历上传
			}
		}
		return	$returnImg;
	}
	
	
	// 上传到图床
	private function uploadToServer($file) {
		
		$url  				= C('UPLOAD_IMG_URL'); 	# 上传图床的地址
		$fields             = array();
		if (class_exists('\CURLFile')) {
			$fields['file'] = new \CURLFile($file);	# >php5.5 使用curlfile类
		} else {
			$fields['file'] = '@'.$file; 			# php5.4 加@符号curl就会把它当成是文件上传处理
		}
		$result 			= xcurl($url, $fields, 20);
		
		$res                = json_decode($result, true);
		
		$imgName            = "";
		if (! empty ( $res ) && $res ['code'] == 200) {
			list(, $imgName) 	= explode ( ",", $res ['data'] ); // 取后者
			unlink($file); # 删除本地的缓存图片
		} else {
			# 上传错误，记录日志
			Log::write ( "upload img failed : " . serialize ( $res) );
		}
		
		return $imgName;
	}
	
	
	// 添加tag
	public function addTag($tagName, $size = '184*184') {
		
		$url  				= C('ADD_TAG_URL'); // 上传图床的地址
		$fields             = array();
		$fields['name'] 	= $tagName;
		$fields['size'] 	= $size;
		
		$result 			= xcurl($url, $fields);
		
		$result             = !empty($result) ? $result : array();
		
		return json_decode($result, true);
		
	}
	
	
	
}
