// file-explorer.js
(() => {
  const appId = 'file-explorer';

  // Register the app
  registerApp({
    id: appId,
    name: 'File Explorer',
    icon: 'images/folder.png',
    default: (container, winId) => {
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.padding = '8px';
      container.style.overflow = 'auto';
      container.style.height = '100%';

      const header = document.createElement('div');
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.marginBottom = '8px';

      const title = document.createElement('div');
      title.textContent = 'Apps';
      title.style.fontWeight = 'bold';

      const refreshBtn = document.createElement('button');
      refreshBtn.textContent = 'Refresh';

      header.append(title, refreshBtn);
      container.appendChild(header);

      const appList = document.createElement('div');
      appList.style.display = 'grid';
      appList.style.gridTemplateColumns = 'repeat(auto-fill, 100px)';
      appList.style.gap = '8px';
      container.appendChild(appList);

      function renderApps() {
        appList.innerHTML = '';
        Object.keys(window.appRegistry).forEach(id => {
          if (id === appId) return; // skip File Explorer itself
          const app = window.appRegistry[id];
          const appDiv = document.createElement('div');
          appDiv.style.textAlign = 'center';
          appDiv.style.cursor = 'pointer';
          appDiv.style.userSelect = 'none';

          const img = document.createElement('img');
          img.src = app.icon || 'images/default-app.png';
          img.style.width = '64px';
          img.style.height = '64px';
          img.style.display = 'block';
          img.style.marginBottom = '4px';
          appDiv.appendChild(img);

          const label = document.createElement('span');
          label.textContent = app.name;
          appDiv.appendChild(label);

          appDiv.addEventListener('dblclick', () => {
            // Open the app
            if (window.appRegistry[id]) {
              window.openApp(id);
            }
          });

          appList.appendChild(appDiv);
        });
      }

      renderApps();

      refreshBtn.addEventListener('click', renderApps);
    }
  });
})();
