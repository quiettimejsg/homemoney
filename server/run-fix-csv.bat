@echo off
:loop
 echo Executing CSV fix script...
 node scripts/fix-csv.js
 echo Script execution completed. Restarting in 1 minute...
 timeout /t 60 /nobreak >nul
 goto loop