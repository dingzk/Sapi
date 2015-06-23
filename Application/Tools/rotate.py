#!/usr/bin/env python
# -*- coding: utf-8 -*-

import pprint
import os
import sys
import time

# 检查log目录的大小

def getPathSize(path):
    if not os.path.exists(path):
        return 0
    
    if os.path.isfile(path):
        # byte
        return os.path.getsize(path)

    Total = 0
    for strRoot, lsDir, lsFiles in os.walk(path):
        # get child directory size
        for strDir in lsDir:
            Total = Total + getPathSize(os.path.join(strRoot, strDir))

        # get child file size
        for strFile in lsFiles:
            #Total = Total + os.path.getsize(os.path.join(strRoot, strFile))
            Total = Total + getPathSize(os.path.join(strRoot, strFile))

    # unit(G)  
    return Total//1024//1024

# 清空log目录里面的文件,如果要把里面的文件夹清空请自行添加逻辑

def emptyFile(path):
    for strRoot, lsDir, lsFiles in os.walk(path):
        for strFile in lsFiles:
            cmd = ':>' + os.path.join(strRoot, strFile)
            print cmd
            os.system(cmd)

# 打包文件

def bakFile(log_path, bak_path):
    parPath = os.path.dirname(log_path)     # 取父级目录
    chdPath = os.path.split(log_path)[-1]   # 子目录
    cmd = 'cp -rf ' + log_path +' '+ bak_path + ' && cd '+ bak_path +' && tar -zcvf ' + chdPath + time.strftime('%Y%m%d') + ".tar.gz " +  chdPath +' && rm -rf '+chdPath
    print cmd
    os.system(cmd)

if __name__ == '__main__':
    LOG_PATH = '/home/ops/snmp_client/log'
    BAK_PATH = '/home/ops/snmp_client/logbak'
    Total = getPathSize(LOG_PATH)
    maxTotal = 1024    #M
    if Total > maxTotal:
        # rotate log
        bakFile(LOG_PATH, BAK_PATH)
        emptyFile(LOG_PATH) 

    print(Total)

