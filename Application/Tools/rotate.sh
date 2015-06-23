#!/bin/sh

#log rotate
#0 0 * * * cd /home/q/script/cron.d/mail_parse &&  /bin/sh rotate.sh > /dev/null 2>&1
log_path=/home/wwwlogs
log_path_bak=/home/wwwlogs/logbak
log_name=access.log

cd $log_path
d=`date "+%Y%m%d"`
bak_log_name=${log_name}.${d}
echo $d
cp ${log_name} ${bak_log_name}
tar zcvf ${bak_log_name}.tar.gz ${bak_log_name}
if [ ! -d ${log_path_bak} ] ; then
	mkdir ${log_path_bak}
fi
mv ${bak_log_name}.tar.gz ${log_path_bak}
rm -rf ${bak_log_name}
:> ${log_name}
#cd ${log_path_bak}
#find ${log_name}.* -mtime +100 | xargs rm -f
