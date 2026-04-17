Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
$env:Path = "c:\Users\zjw\.trae-cn\sdks\versions\node\current;" + $env:Path

Write-Host "Installing dependencies..." -ForegroundColor Green
& "c:\Users\zjw\.trae-cn\sdks\versions\node\current\node.exe" "c:\Users\zjw\.trae-cn\sdks\versions\node\current\node_modules\npm\bin\npm-cli.js" install

Write-Host "Starting development server..." -ForegroundColor Green
& "c:\Users\zjw\.trae-cn\sdks\versions\node\current\node.exe" "c:\Users\zjw\.trae-cn\sdks\versions\node\current\node_modules\npm\bin\npm-cli.js" run dev
