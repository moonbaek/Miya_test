#MIYA Voxel creator app
pm2 delete voxel;
pm2 start npm --name voxel -- start
echo 'start MIYA voxel creator by pm2';
pm2 save;
sleep 1;
echo 'done...';
exit;
