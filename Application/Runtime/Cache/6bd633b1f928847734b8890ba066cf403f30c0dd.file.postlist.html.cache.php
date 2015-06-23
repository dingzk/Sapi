<?php /* Smarty version Smarty-3.1.6, created on 2015-04-20 14:17:17
         compiled from "./Application/Mobile/View\Index\postlist.html" */ ?>
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
  ),
  'nocache_hash' => '12822553499edb894f2-17114172',
  'function' => 
  array (
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.6',
  'unifunc' => 'content_553499edc0a40',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_553499edc0a40')) {function content_553499edc0a40($_smarty_tpl) {?>
<?php $_smarty_tpl->tpl_vars['debug'] = new Smarty_variable(true, null, 0);?>                 				  
<?php $_smarty_tpl->tpl_vars['devPath'] = new Smarty_variable('/Public/mobile/entry', null, 0);?>			      
<?php $_smarty_tpl->tpl_vars['distPath'] = new Smarty_variable('/Public/mobile/dist', null, 0);?>               
<?php echo $_smarty_tpl->getSubTemplate ('../Public/header.html', $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 9999, null, array(), 0);?>

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
    <?php echo $_smarty_tpl->getSubTemplate ('../Public/footer.html', $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 9999, null, array(), 0);?>

</body>
</html><?php }} ?>