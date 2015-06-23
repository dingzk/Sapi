#/bin/sh

#web目录定义
webroot=/home/www
#项目名称
webname=tourpal
srcname=tourpal
#静态资源地址
public_src=${webroot}/${srcname}/Public
#代码源地址
websrc=/home/zhenkai.ding/to_online

today=$(date +%Y-%m-%d)
echo $today

if [ ! -d "${websrc}/${srcname}" ] ; then
        mkdir ${websrc}/${srcname}
        cd ${websrc}/${srcname}
        svn co http://svn.elong.cn/svn/Code/SDU/tourpal/web/online . --username zhenkai.ding
fi
if [ ! "$(ls -A ${websrc}/${srcname})" ] ; then
         cd ${websrc}/${srcname}
         svn co http://svn.elong.cn/svn/Code/SDU/tourpal/web/online . --username zhenkai.ding
fi
cd ${websrc}/${srcname}
echo `svn up`
cd ${websrc}
#rm -rf ${srcname}.zip
#zip -r ${srcname}.zip ${srcname}/

#到服务器目录下进行备份
cd ${webroot}
tar czvf ${webname}.${today}.tar.gz ${webname}
cp -rp ${webname} ${webname}.${today}

#到上线目录下解压
#cd ${websrc}
#rm -rf ${srcname}
#unzip ${srcname}.zip
cd ${websrc}/${srcname}
find ./ -name .svn | xargs rm -rf {}
#到服务器目录下进行上线
cd ${webroot}
rm -rf ${webname}/*
mv  ${websrc}/${srcname}/* ${webname}
chown www:www -R ${webname}
chmod 777 -R ${webroot}/${webname}/Application/Runtime
chmod 777 -R ${webroot}/${webname}/Application/Service/Uploads
mkdir /data/stat
ln -s /data/stat ${webroot}/${webname}/Application/Service/Stat
chmod 777 -R ${webroot}/${webname}/Application/Service/Stat

#建立public下的dist软链
#mv  ${public_src}/js ${public_src}/js.${today}
#mv  ${public_src}/css ${public_src}/css.${today}
#ln -s ${public_src}/dist/js ${public_src}/js
#ln -s ${public_src}/dist/css ${public_src}/css

#日志目录
#logPath="/data/intfs_log/" 
#if [ ! -d "$logPath" ]; then
#    mkdir "$logPath"
#    #chmod 777 -R ${logPath}
#fi
#
## 定义接口路径
#intfsPath="/home/q/ops_manage/intfs/" 
##建立相对应的日志目录
#fileList=`ls ${intfsPath}`
#for file in ${fileList}
#do
#    if  [ -d ${intfsPath}${file} ] && [ ${file} != "common" ] && [ ${file} != "demo" ] ; then
#        if [ ! -d "${logPath}${file}" ]; then
#            mkdir ${logPath}${file}  
#        fi
#        # 建立软链
#        echo ln -s ${logPath}${file} ${intfsPath}${file}/log 
#        ln -s ${logPath}${file} ${intfsPath}${file}/log 
#    fi
#done 
#
#
#chmod 777 -R ${logPath}
#
#到上线目录下进行清理
#cd ${websrc}
#rm -rf ${webname}