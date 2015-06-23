<?php /* Smarty version Smarty-3.1.6, created on 2015-05-12 15:53:23
         compiled from "./Application/Api/View\Images\index.html" */ ?>
<?php /*%%SmartyHeaderCode:1982154f82a05a4b259-84634094%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'b6d64b6a2ac8ce53fdad7cd67558c82a5fd004ad' => 
    array (
      0 => './Application/Api/View\\Images\\index.html',
      1 => 1431417196,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '1982154f82a05a4b259-84634094',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.6',
  'unifunc' => 'content_54f82a05a7562',
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_54f82a05a7562')) {function content_54f82a05a7562($_smarty_tpl) {?><html>
<body>

<form action="http://127.0.0.1/tourpal/index.php/Api/Images/uploadImg" method="post"
enctype="multipart/form-data">
<label for="file">Filename:</label>
<input type="file" name="file[]" id="file" /> 
<input type="file" name="file[]" id="file" /> 
<input type="file" name="file[]" id="file" /> 
<br />
<input type="submit" name="submit" value="Submit" />
</form>

</body>
</html><?php }} ?>