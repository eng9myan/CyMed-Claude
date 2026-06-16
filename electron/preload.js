/**
 * CyMed Desktop Preload — exposes a minimal, secure API to the web client.
 * Runs in an isolated context (contextIsolation: true).
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('cymed', {
  platform: 'desktop',
  version: '1.0.0',
  os: process.platform,
});
