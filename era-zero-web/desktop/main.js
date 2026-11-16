// Era Zero para computador (Electron). Os arquivos do jogo ficam em ./app (gerados por tools/build.py).
const { app, BrowserWindow, protocol, net, Menu } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } }]);
app.whenReady().then(() => {
  const root = path.join(__dirname, 'app');
  protocol.handle('app', req => {
    let p = decodeURIComponent(new URL(req.url).pathname);
    if (p === '/' || p === '') p = '/index.html';
    const file = path.normalize(path.join(root, p));
    if (!file.startsWith(root)) return new Response('', { status: 403 });
    return net.fetch(pathToFileURL(file).toString());
  });
  Menu.setApplicationMenu(null);
  const win = new BrowserWindow({ width: 1280, height: 760, minWidth: 900, minHeight: 540, backgroundColor: '#05090d', title: 'Era Zero',
    icon: path.join(root, 'icons', 'icon-512.png'), autoHideMenuBar: true, webPreferences: { contextIsolation: true } });
  win.webContents.on('before-input-event', (e, input) => { if (input.type === 'keyDown' && input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); } });
  win.loadURL('app://game/index.html');
  // teste automático usado na compilação: abre o jogo e confirma que ele carregou
  if (process.argv.includes('--smoke-test')) {
    win.webContents.on('did-finish-load', async () => {
      for (let i = 0; i < 150; i++) {
        const ok = await win.webContents.executeJavaScript('!!(window.__eraZero && window.__eraZero.ready)').catch(() => false);
        if (ok) { console.log('SMOKE_OK'); app.exit(0); return; }
        await new Promise(r => setTimeout(r, 1000));
      }
      console.log('SMOKE_FAIL'); app.exit(1);
    });
  }
});
app.on('window-all-closed', () => app.quit());
