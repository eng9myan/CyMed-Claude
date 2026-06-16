/**
 * CyMed Desktop — Electron Main Process
 *
 * Wraps the hosted CyMed web client in a native Windows/macOS/Linux shell.
 * The desktop app is a thin shell — all business logic stays in the server.
 */
const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron');
const path = require('path');

// CyMed server URL — production points to https://cymed.cy-com.com
const CYMED_URL = process.env.CYMED_URL || 'https://cymed.cy-com.com';
const SPLASH_DURATION_MS = 2000;

let mainWindow = null;
let splashWindow = null;

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 480,
    height: 320,
    frame: false,
    resizable: false,
    transparent: false,
    alwaysOnTop: true,
    center: true,
    show: true,
    backgroundColor: '#0F172A',
    icon: path.join(__dirname, 'assets', 'cymed.ico'),
  });
  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
  splashWindow.setMenu(null);
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    show: false,
    backgroundColor: '#0F172A',
    title: 'CyMed',
    icon: path.join(__dirname, 'assets', 'cymed.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  mainWindow.loadURL(CYMED_URL);

  // Show only after splash + content loaded
  mainWindow.webContents.once('did-finish-load', () => {
    setTimeout(() => {
      if (splashWindow) {
        splashWindow.close();
        splashWindow = null;
      }
      mainWindow.show();
      mainWindow.focus();
    }, SPLASH_DURATION_MS);
  });

  // Open external links in the system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(CYMED_URL)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Custom application menu
  const template = [
    {
      label: 'CyMed',
      submenu: [
        { label: 'About CyMed', click: showAbout },
        { type: 'separator' },
        { label: 'Reload', accelerator: 'Ctrl+R', click: () => mainWindow.reload() },
        { label: 'Toggle Full Screen', accelerator: 'F11', click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()) },
        { type: 'separator' },
        { label: 'Quit CyMed', accelerator: 'Ctrl+Q', click: () => app.quit() },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Zoom In',  accelerator: 'Ctrl+Plus',  click: () => zoom(0.1) },
        { label: 'Zoom Out', accelerator: 'Ctrl+-',     click: () => zoom(-0.1) },
        { label: 'Reset Zoom', accelerator: 'Ctrl+0',   click: () => mainWindow.webContents.setZoomFactor(1) },
      ],
    },
    {
      label: 'Help',
      submenu: [
        { label: 'CyMed Support', click: () => shell.openExternal('https://cy-com.com/support') },
        { label: 'About', click: showAbout },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  mainWindow.on('closed', () => { mainWindow = null; });
}

function zoom(delta) {
  const current = mainWindow.webContents.getZoomFactor();
  mainWindow.webContents.setZoomFactor(Math.max(0.5, Math.min(2.0, current + delta)));
}

function showAbout() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'About CyMed',
    message: 'CyMed Desktop',
    detail: 'Enterprise Healthcare ERP\nVersion 1.0.0\n\n© 2026 CyMed Healthcare Systems\nhttps://cy-com.com',
    buttons: ['OK'],
    icon: path.join(__dirname, 'assets', 'cymed.png'),
  });
}

// ── App lifecycle ──────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createSplashWindow();
  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});

// ── Security: block unauthorized navigation ────────────────────────────────
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (e, url) => {
    if (!url.startsWith(CYMED_URL)) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });
});
