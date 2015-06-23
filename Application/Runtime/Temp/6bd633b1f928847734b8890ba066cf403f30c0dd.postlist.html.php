<?php /*%%SmartyHeaderCode:12822553499edb894f2-17114172%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '6bd633b1f928847734b8890ba066cf403f30c0dd' => 
    array (
      0 => './Application/Mobile/View\\Index\\postlist.html',
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
  'nocache_hash' => '12822553499edb894f2-17114172',
  'version' => 'Smarty-3.1.6',
  'unifunc' => 'content_553d9fc592560',
  'has_nocache_code' => false,
  'cache_lifetime' => 3600,
),true); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_553d9fc592560')) {function content_553d9fc592560($_smarty_tpl) {?>                 				  
			      
               
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
  			<span class="icon icon-left-nav pull-left" data-rel="back"></span>
	        <span class="title"></span>
	        <a class="pull-right post-btn">
	        <span class="ico ico-post pull-left"></span>
	        <span>发帖</span>
	    	</a>
    	</nav>
  </header>

  <div class="page-content page-post-list page-postlist">
  	<div class="list-content-wrap">
  	</div>
  </div>
  
    <script type="text/template" id="post_list_tpl" >
    	{{each list as item }}
      		<div class="post-list" postid="{{item.id}}">
			  	<div class="list-wrap">
			  		<div class="list-content">
			  			<div>
					  		<span class="name">{{item.user.nick_name}}</span>
					  		<span class="sex-age {{item.user.sex | sex}}"><em class="ico ico-{{item.user.sex | sex}}"></em><em class="age">{{item.user.age}}</em></span>
					  		<span class="time pull-right">{{item.created_at}}</span>
					  	</div>
				  		<span><em class="ico ico-dest"></em> 目的地： {{item.dest}}</span></br>
				  		<span><em class="ico ico-date"></em> 出发时间： {{item.start_at}}</span></br>
				  		<span style="padding-left: 29px;"> 旅行时间： {{item.days}}天</span></br>
				  		<span><em class="ico ico-phone"></em> 联系方式： </span>
				  		<div class="contact can-copy">
				  			{{if item.weixin}}
					  		<span>微信  {{item.weixin}}</span>
					  		{{/if}}
					  		{{if item.qq}}
					  		<span>QQ&nbsp;&nbsp;  {{item.qq}}</span>
					  		{{/if}}
					  		{{if item.phone}}
					  		<span>手机 <a href="tel:{{item.phone}}">{{item.phone}}</a></span>
					  		{{/if}}
				  	    </div>
				  		<p>
				  			{{item.content}}
				  		</p>
				  		<ul>
				  			{{each item.thumb as img i}}
				  			<li><img src="{{img}}" alt="" preview="{{item.preview[i]}}"></li>
				  			{{/each}}
				  		</ul>
				  		{{if item.post_place}}
				  		<div><em class="ico ico-position"></em><em class="position">{{item.post_place}}</em></div>
				  		{{/if}}
				  		<div class="clearfix">
				  			<span class="pull-right join-count"><em>{{item.like_num}}</em>人求同行</span>
				  			{{if item.is_my == 1}}
					  		<span class="pull-right del">删除</span>
					  		{{/if}}
				  		</div>
			  		</div>
			  	</div>
			  	{{if item.is_my == 0}}
			  	<div class="join">
			  		{{if item.is_liked == 0 }}
			  		<em class="ico ico-love"></em>
			  		<em class="text">求同行</em>
			  		{{else}}
					<em class="ico ico-loved"></em>
					<em class="text">已约行</em>
					{{/if}}
			    </div>
			    {{/if}}
		  	</div>
        {{/each}}
    </script>
   
	

		</div>
	</div>
    
</body>
</html><?php }} ?>