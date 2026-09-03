import fs from 'fs'
import path from 'path'
import http from 'http'
import { fileURLToPath } from 'url'
import { app, BrowserWindow } from 'electron'
import next from 'next'

const __filename = fileURLToPath(import.meta.url)

// ---------------------------------------------------------------------------
// 1. Single Instance Lock (Prevents running two conflicting Next.js servers)
// ---------------------------------------------------------------------------
let mainWindow: BrowserWindow | null = null
const gotSingleInstanceLock = app.requestSingleInstanceLock()

if (!gotSingleInstanceLock) {
  app.quit()
  process.exit(0)
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

// ---------------------------------------------------------------------------
// 2. Safe Logging Utility
// ---------------------------------------------------------------------------
const safeLog = (msg: string) => {
  try {
    const userData = app && typeof app.getPath === 'function' ? app.getPath('userData') : null
    if (userData) {
      const logPath = path.join(userData, 'desktop-debug.log')
      fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`, { encoding: 'utf8' })
    }
  } catch {
    // ignore write errors
  }
  try {
    console.log(msg)
  } catch {}
}

// ---------------------------------------------------------------------------
// 3. Project Directory Resolution
// ---------------------------------------------------------------------------
const __projectDir = (() => {
  try {
    if (app && app.isPackaged) {
      const resources = process.resourcesPath
      const candidates = [
        path.join(resources, 'app'),
        path.join(resources, 'app.asar.unpacked'),
        path.join(resources, 'app.asar'),
      ]
      for (const c of candidates) {
        try {
          if (fs.existsSync(path.join(c, '.next')) || fs.existsSync(path.join(c, 'package.json'))) {
            return c
          }
        } catch {}
      }
      return resources
    }

    let dir = path.dirname(__filename)
    for (let i = 0; i < 6; i++) {
      try {
        if (fs.existsSync(path.join(dir, '.next')) || fs.existsSync(path.join(dir, 'package.json'))) {
          return dir
        }
      } catch {}
      const parent = path.dirname(dir)
      if (parent === dir) break
      dir = parent
    }
    return path.resolve(path.dirname(__filename), '..')
  } catch (err) {
    try {
      console.error('Error resolving __projectDir', err)
    } catch {}
    return path.resolve('.')
  }
})()

safeLog(`Resolved __projectDir=${__projectDir}`)
safeLog(`process.resourcesPath=${process.resourcesPath}`)
safeLog(`app.isPackaged=${app && app.isPackaged}`)

// ---------------------------------------------------------------------------
// 4. Server Configuration
// ---------------------------------------------------------------------------
const dev = (process.env.ELECTRON_DEV === '1' || process.env.NODE_ENV === 'development') && !app.isPackaged
const HOSTNAME = '127.0.0.1' // Explicitly bind to localhost (Security: prevents exposing port over local network)
const PORT = parseInt(process.env.PORT ?? '3000', 10)
let server: http.Server | null = null

safeLog(`Running next in dev=${dev} NODE_ENV=${process.env.NODE_ENV}`)

async function startNext(): Promise<void> {
  const dir = __projectDir
  safeLog(`Starting Next with dir=${dir}`)

  const nextApp = next({ dev, dir, hostname: HOSTNAME, port: PORT })
  await nextApp.prepare()
  const handle = nextApp.getRequestHandler()

  server = http.createServer((req, res) => handle(req, res))

  await new Promise<void>((resolve, reject) => {
    // Explicitly bind to 127.0.0.1 for security
    server!.listen(PORT, HOSTNAME, (err?: Error) => (err ? reject(err) : resolve()))
  })

  safeLog(`Next server listening on http://${HOSTNAME}:${PORT} (dev=${dev})`)
}

function stopServer(): Promise<void> {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => {
        server = null
        resolve()
      })
    } else {
      resolve()
    }
  })
}

// ---------------------------------------------------------------------------
// 5. Window Management
// ---------------------------------------------------------------------------
function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#000000', // Eliminates white flash on launch (matches dark terminal UI)
    show: false,                // Hidden until ready to show
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  })

  // Prevent white flash by showing window only after initial HTML is parsed
  win.once('ready-to-show', () => {
    win.show()
  })

  win.on('closed', () => {
    if (mainWindow === win) {
      mainWindow = null
    }
  })

  win.loadURL(`http://${HOSTNAME}:${PORT}`)
  return win
}

// ---------------------------------------------------------------------------
// 6. Application Lifecycle
// ---------------------------------------------------------------------------
app.whenReady().then(async () => {
  try {
    await startNext()
    mainWindow = createWindow()

    // macOS activate support (re-create window if clicked in Dock with no windows open)
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createWindow()
      }
    })
  } catch (err) {
    safeLog('Failed to start Next: ' + String(err))
    try {
      const userData = app.getPath('userData')
      const logPath = path.join(userData, 'electron-error.log')
      fs.appendFileSync(
        logPath,
        `[${new Date().toISOString()}] Failed to start Next:\n${String(err)}\n\n`,
        { encoding: 'utf8', flag: 'a' }
      )
    } catch (logErr) {
      safeLog('Failed to write error log: ' + String(logErr))
    }
    app.quit()
  }
})

app.on('window-all-closed', () => {
  // On macOS, apps usually stay open in Dock until Command+Q; on Windows/Linux, quit immediately
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', async (e) => {
  if (server) {
    e.preventDefault()
    await stopServer()
    app.exit(0)
  }
})

// Clean shutdown on OS kill signals
process.on('SIGINT', async () => {
  await stopServer()
  app.quit()
})

process.on('SIGTERM', async () => {
  await stopServer()
  app.quit()
})
