#/bin/sh

## 定义接口路径
logPath="/home/wwwlogs/logbak/" 
untarpath="/home/wwwlogs/logbak/untar"
mkdir ${untarpath}
rm -rf ${untarpath}/*
#建立相对应的日志目录
fileList=`ls ${logPath}`
for file in ${fileList}
do
    if  [ ${file} != "untar" ] && [ ${file} != "untar.sh" ] ; then
	tar -zxvf ${intfsPath}${file} -C ${untarpath}
    fi
done 

cd ${untarpath}
fileuntarlist=`ls ${untarpath}`
for f in ${fileuntarlist}
do
    if  [ ${f} != "all" ] ; then
	cat ${f} |grep -v "status.html" >> all
    fi
done  

rm -rf access.*
