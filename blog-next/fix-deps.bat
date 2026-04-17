@echo off
cd /d "D:\src\go_src\项目\Blog\blog-next"
echo Removing node_modules...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo Installing dependencies...
call npm install
echo Done!
pause
