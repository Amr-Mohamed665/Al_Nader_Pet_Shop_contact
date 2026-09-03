@echo off
echo ===================================================
echo Pushing Al Nader Pet Shop to GitHub...
echo ===================================================

cd /d "%~dp0"

:: Check if frontend/.git exists and delete it to prevent submodule issues
if exist "frontend\.git" (
    echo Removing old git repository in frontend folder...
    rmdir /s /q "frontend\.git"
)

:: Initialize git repository if not already initialized
if not exist ".git" (
    echo Initializing root Git repository...
    git init
)

:: Add remote origin (handling if it already exists)
git remote remove origin >nul 2>&1
git remote add origin https://github.com/Amr-Mohamed665/Al_Nader_Pet_Shop_contact.git

:: Set branch name to main
git branch -M main

:: Stage and commit files
echo Staging files...
git add .
echo Committing files...
git commit -m "fix: resolve Vercel build TypeScript errors and update next.config.ts"

:: Push to GitHub
echo Pushing to GitHub...
git push -u origin main --force

echo ===================================================
echo Done! Please review the output above.
echo Next step: Go to vercel.com and redeploy your project.
echo ===================================================
pause
