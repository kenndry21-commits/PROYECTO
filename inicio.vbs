Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c cd C:\Users\Usuario\Desktop\KEN && npm run dev", 0, False
WScript.Sleep 3000
WshShell.Run "cmd /c ngrok http --domain=stagnant-darling-coeditor.ngrok-free.dev 3000", 0, False