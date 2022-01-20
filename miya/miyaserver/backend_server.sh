#MIYA backend server
pm2 delete back_end;
pm2 start ./app.py --name back_end --interpreter python3;
echo 'start MIYA backend server by pm2';
pm2 save;
sleep 1;
echo 'done...';
exit;
