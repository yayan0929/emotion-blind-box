@echo off
chcp 65001 >nul
echo Trying to push code (attempt 1)...
cd /d c:/Users/HP/CodeBuddy/239025009
git push origin master:main

if %errorlevel% neq 0 (
    echo First attempt failed, trying again in 5 seconds...
    timeout /t 5 /nobreak >nul
    echo Trying to push code (attempt 2)...
    git push origin master:main
    
    if %errorlevel% neq 0 (
        echo Second attempt failed, trying one more time in 5 seconds...
        timeout /t 5 /nobreak >nul
        echo Trying to push code (attempt 3)...
        git push origin master:main
        
        if %errorlevel% neq 0 (
            echo All attempts failed. Please check your network connection.
            echo You may need to try again later or use a different network.
        )
    )
)

echo.
pause