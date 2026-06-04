const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 1000,
    minHeight: 700,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  // Load index.html
  mainWindow.loadFile('index.html');

  // Build clean, professional menu in Portuguese
  const menuTemplate = [
    {
      label: 'Arquivo',
      submenu: [
        { label: 'Recarregar App', role: 'reload' },
        { label: 'Forçar Recarregamento', role: 'forceReload' },
        { type: 'separator' },
        { label: 'Sair', click: () => app.quit() }
      ]
    },
    {
      label: 'Exibir',
      submenu: [
        { label: 'Aumentar Zoom', role: 'zoomIn' },
        { label: 'Diminuir Zoom', role: 'zoomOut' },
        { label: 'Zoom Original', role: 'resetZoom' },
        { type: 'separator' },
        { label: 'Tela Cheia', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Ajuda',
      submenu: [
        { label: 'Alternar Ferramentas de Desenvolvedor (DevTools)', role: 'toggleDevTools' },
        { type: 'separator' },
        {
          label: 'Sobre o Criador',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Sobre',
              message: 'Teamfight Manager 2 Champion Creator',
              detail: 'Versão 1.1.0\nCriador original: RayTatsu\nInterface Desktop portável construída com Electron.'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
