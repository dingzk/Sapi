/**
 *@overfileView 路由配置
 *author Yoocky <mengyanzhou@gmail.com>
 */
define(['src/js/core'], function(core){
  //route
    core.router.add({
        "hotcity":{
            lindex:1,
            tpl:"hotcity",
            url:"hotcity"
        }, 
        "card":{
            lindex:2,
            tpl:"card",
            url:"card"
        }, 
        "mycard":{
            lindex:3,
            tpl:"mycard",
            url:"mycard"
        }, 
        "postlist":{
            lindex:4,
            tpl:"postlist",
            url:"postlist"
        },  
        "post":{
            lindex:5,
            tpl:"post",
            url:"post"
        },
        "message":{
            lindex:6,
            tpl:"message",
            url:"message"
        }, 
        "joylist":{
            lindex:7,
            tpl:"joylist",
            url:"joylist"
        }, 
         "mypost":{
            lindex:8,
            tpl:"mypost",
            url:"mypost"
        }, 
        "myjoy":{
            lindex:9,
            tpl:"myjoy",
            url:"myjoy"
        },
        "feedback": {
            lindex:10,
            tpl:"feedback",
            url:"feedback"
        },
        "postdetail": {
            lindex:11,
            tpl:"postdetail",
            url:"postdetail"
        },
        "setting": {
            lindex:12,
            tpl:"setting",
            url:"setting"
        }                         
    });
});