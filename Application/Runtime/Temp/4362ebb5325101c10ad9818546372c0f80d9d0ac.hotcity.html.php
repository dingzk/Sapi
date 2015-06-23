<?php /*%%SmartyHeaderCode:5380553499e998c322-18112572%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '4362ebb5325101c10ad9818546372c0f80d9d0ac' => 
    array (
      0 => './Application/Mobile/View\\Index\\hotcity.html',
      1 => 1429085810,
      2 => 'file',
    ),
    '743b5ff89cb56017827673f48b187f2cc9276a21' => 
    array (
      0 => 'E:\\xampp\\htdocs\\tourpal\\Application\\Mobile\\View\\Public\\base.html',
      1 => 1429178094,
      2 => 'file',
    ),
    'ee95671fce1fc55c2653e42ff7ee216e7f81ab04' => 
    array (
      0 => 'E:\\xampp\\htdocs\\tourpal\\Application\\Mobile\\View\\Public\\header.html',
      1 => 1429262956,
      2 => 'file',
    ),
    '4c3373121c2352718775ffb951044a7b4cff2c9b' => 
    array (
      0 => 'E:\\xampp\\htdocs\\tourpal\\Application\\Mobile\\View\\Public\\footer.html',
      1 => 1428655765,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '5380553499e998c322-18112572',
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.6',
  'unifunc' => 'content_553499e9b119b',
  'cache_lifetime' => 3600,
),true); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_553499e9b119b')) {function content_553499e9b119b($_smarty_tpl) {?>                 				  
			      
               
<!DOCTYPE html>
<html lang="zh-cn">
<head>

            
<meta charset="UTF-8">
<title>艺龙驴友</title>
<meta name="apple-mobile-app-status-bar-style" content="white" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0" />
<link rel="apple-touch-icon" href="/Public/mobile/dist/tourpal/imgs/icon.png" />
<link rel="apple-touch-startup-image" href="/Public/mobile/dist/tourpal/imgs/start.png" />
<meta name="format-detection" content="telephone=no" />
<meta name="description" content="" />
<meta name="keywords" content="" />
<link rel="stylesheet" href="/Public/mobile/dist/tourpal/main.css" />
<script type="text/javascript" data-main="/Public/mobile/entry/tourpal/main.js" src="/Public/mobile/lib/require.js"></script>
</head>
<body>
	<div class="pages">
		<div class="page">
			
    <header class="bar bar-nav">

      <nav>
        <span class="title pull-left" style="margin:0;">首页</span>
        <a class="ico ico-person pull-right" href="mycard" data-rel="link" needlogin="true"></a>
        <a class="ico ico-message pull-right"  href="message" data-rel="link" needlogin="true"><em class="new-message none"></em></a>
      </nav>
    </header>
    <div class="page-content">
       <br/>
       <form class="input-group ">
          <div class="input-row button-line">
            <label>城市</label>
            <input id="city_selector" type="text" class="name" placeholder="请选择城市" readonly="readonly" >
            <span class="icon icon-search" id="btn_search"></span>
            <div class="triangle-right-buttom"></div>
          </div>
        </form>
        <div class="hot-city">
           <h5><span>热门城市</span></h5>
           <ul class="hot-city-list">
                <li>
                    <a data-rel="link" href="postlist?city=北京"><img src="http://pavo.elongstatic.com/i/tourpal_184x184/0000x3ZY.jpg" alt="北京"></a>
                    <span>北京</span>
                </li>
                
                <li>
                    <a data-rel="link" href="postlist?city=拉萨"><img src="http://pavo.elongstatic.com/i/tourpal_184x184/0000uw4P.jpg" alt="拉萨"></a>
                    <span>拉萨</span>
                </li>
                
                <li>
                    <a data-rel="link" href="postlist?city=丽江"><img src="http://pavo.elongstatic.com/i/tourpal_184x184/0000uw4Q.jpg" alt="丽江"></a>
                    <span>丽江</span>
                </li>
                
                <li>
                    <a data-rel="link" href="postlist?city=厦门"><img src="http://pavo.elongstatic.com/i/tourpal_184x184/0000wvay.jpg" alt="厦门"></a>
                    <span>厦门</span>
                </li>
            </ul>
        </div>
        <p class="feedback">
          <a class="" href="feedback" data-rel="link">意见反馈</a>
        </p>
    </div>
    
      <script type="text/template" id="hot_city_tpl">
        {{each data as item}}
        <li>
            <a data-rel="link" href="postlist?city={{item.name}}"><img src="{{item.url}}" alt="{{item.name}}"></a>
            <span>{{item.name}}</span>
        </li>
        {{/each}}
      </script>
    

		</div>
	</div>
    
</body>
</html><?php }} ?>