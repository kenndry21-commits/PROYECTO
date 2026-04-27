const { app, BrowserWindow } = require('electron')
const { spawn } = require('child_process')
const path = require('path')

let mainWindow
let nextProcess

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false
    },
    title: 'Taller Automotriz Mecatrónica'
  })

  mainWindow.loadURL('http://localhost:3000')
  mainWindow.maximize()
}

app.whenReady().then(() => {
  const nextPath = path.join(process.resourcesPath, 'app', 'node_modules', '.bin', 'next.cmd')
  const appPath = path.join(process.resourcesPath, 'app')

  nextProcess = spawn(nextPath, ['start'], {
    cwd: appPath,
    stdio: 'ignore'
  })

  setTimeout(() => {
    createWindow()
  }, 4000)
})

app.on('window-all-closed', () => {
  if (nextProcess) nextProcess.kill()
  if (process.platform !== 'darwin') app.quit()
})