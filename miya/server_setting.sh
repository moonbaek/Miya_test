#!/bin/bash

echo Input MIYA flask server ip:
read flask_server_ip
echo Input MIYA flask server port:
read flask_server_port
#echo Input MIYA SQL server IP:
#read sql_server_ip
echo Input MIYA SQL server port:
read sql_server_port
#echo Input MIYA Creator server IP:
#read creator_server_ip
echo Input MIYA creator server port:
read creator_server_port
echo ---------- MIYA Sever Settings ----------
echo Flask Server IP : $flask_server_ip
echo Flask Server port : $flask_server_port
#For dev only, use same flask server for SQL IP
echo SQL Server IP : $flask_server_ip
echo SQL Server port : $sql_server_port
#For dev only, use same flask server for Creator IP
echo Creator Server IP : $flask_server_ip
echo Creator Server port : $creator_server_port

# process.env for MIYA Creator
echo flask_server_ip=$flask_server_ip >>  process.env
echo flask_server_port=$flask_server_port >>  process.env
#For dev only , use same flask server for SQL IP
#echo sql_server_ip=$sql_server_ip >> process.env
echo sql_server_ip=$flask_server_ip >> process.env
echo sql_server_port=$sql_server_port >>  process.env
#For dev, use same flask server for Creator IP
#echo creator_server_ip=$flask_server_ip >>  process.env
echo creator_server_port=$creator_server_port >> process.env

#flask_setting.cfg for MIYA Flask Server
echo MIYA_FLASK_IP="'$flask_server_ip'" >> flask_setting.cfg
echo MIYA_FLASK_PORT=$flask_server_port >>  flask_setting.cfg
#For dev only, use same flask server for Creator IP

echo MYSQL_DATABASE_USER="'miya'" >> flask_setting.cfg
echo MYSQL_DATABASE_PASSWORD="'miyamysql'" >> flask_setting.cfg
echo MYSQL_DATABASE_DB="'MIYA_DB'" >> flask_setting.cfg
#For dev only, use same flask server for SQL IP
echo MYSQL_DATABASE_HOST="'$flask_server_ip'" >> flask_setting.cfg
echo MYSQL_DATABASE_PORT=$sql_server_port >>  flask_setting.cfg

echo MIYA_CREATOR_IP="'$flask_server_ip'" >> flask_setting.cfg
echo MIYA_CREATOR_PORT=$creator_server_port >> flask_setting.cfg

export MIYA_FLASK_SETTINGS=flask_setting.cfg

mv process.env miyacreator/.env
mv flask_setting.cfg miyaserver/flask_setting.cfg

