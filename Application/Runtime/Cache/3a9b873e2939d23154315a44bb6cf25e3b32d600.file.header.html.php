<?php /* Smarty version Smarty-3.1.6, created on 2015-03-16 11:11:06
         compiled from "E:\xampp\htdocs\tourpal\Application\Webview\View\Public\header.html" */ ?>
<?php /*%%SmartyHeaderCode:1556154f95633957f76-54096219%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '3a9b873e2939d23154315a44bb6cf25e3b32d600' => 
    array (
      0 => 'E:\\xampp\\htdocs\\tourpal\\Application\\Webview\\View\\Public\\header.html',
      1 => 1426233454,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '1556154f95633957f76-54096219',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.6',
  'unifunc' => 'content_54f95633a92f4',
  'variables' => 
  array (
    'title' => 0,
    'cssArr' => 0,
    'debug' => 0,
    'distPath' => 0,
    'src' => 0,
    'devPath' => 0,
    'mainjs' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_54f95633a92f4')) {function content_54f95633a92f4($_smarty_tpl) {?><!DOCTYPE html>
<html lang="zh-cn">
<head>

    <?php $_smarty_tpl->tpl_vars['title'] = new Smarty_variable("找驴友", null, 0);?>
    <?php $_smarty_tpl->tpl_vars['cssArr'] = new Smarty_variable(array("/tourpal/main"), null, 0);?>
    <?php $_smarty_tpl->tpl_vars['mainjs'] = new Smarty_variable("/tourpal/main", null, 0);?>

<meta charset="UTF-8">
<title><?php echo $_smarty_tpl->tpl_vars['title']->value;?>
</title>
<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black" />
<meta name="format-detection" content="telephone=no" />
<meta name="description" content="" />
<meta name="keywords" content="" />
<?php  $_smarty_tpl->tpl_vars['src'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['src']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['cssArr']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['src']->key => $_smarty_tpl->tpl_vars['src']->value){
$_smarty_tpl->tpl_vars['src']->_loop = true;
?>
<?php if ($_smarty_tpl->tpl_vars['debug']->value){?>
<link rel="stylesheet" href="<?php echo $_smarty_tpl->tpl_vars['distPath']->value;?>
<?php echo $_smarty_tpl->tpl_vars['src']->value;?>
.css" />
<?php }else{ ?>
<link rel="stylesheet" href="<?php echo $_smarty_tpl->tpl_vars['distPath']->value;?>
<?php echo $_smarty_tpl->tpl_vars['src']->value;?>
.min.css" />
<?php }?>
<?php } ?>
<?php if ($_smarty_tpl->tpl_vars['debug']->value){?>
<script type="text/javascript" data-main="<?php echo $_smarty_tpl->tpl_vars['devPath']->value;?>
<?php echo $_smarty_tpl->tpl_vars['mainjs']->value;?>
.js" src="/Public/webview/lib/require.js"></script>
<?php }else{ ?>
<script type="text/javascript" data-main="<?php echo $_smarty_tpl->tpl_vars['distPath']->value;?>
<?php echo $_smarty_tpl->tpl_vars['mainjs']->value;?>
.min.js" src="<?php echo $_smarty_tpl->tpl_vars['distPath']->value;?>
/require.min.js"></script>
<?php }?>
</head><?php }} ?>