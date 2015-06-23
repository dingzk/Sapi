#/bin/sh

#web目录定义
webroot=/home/www
#项目名称
webname=tourpal

today=$(date +%Y-%m-%d)
echo "cd "${webroot}
cd ${webroot}
echo "rm -rf "${webname}
rm -rf ${webname}
echo "mv "${webname}.${today} ${webname}
mv ${webname}.${today} ${webname}

