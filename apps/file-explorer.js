export default async function FileExplorer(body, winId) {
  body.style.display = 'flex';
  body.style.flexDirection = 'column';
  body.style.padding = '10px';
  body.style.overflowY = 'auto';

  const header = document.createElement('h2');
  header.textContent = 'File Explorer';
  body.appendChild(header);

  const appList = document.createElement('div');
  appList.style.display = 'flex';
  appList.style.flexDirection = 'column';
  appList.style.gap = '6px';
  body.appendChild(appList);

  // Load apps manifest
  try {
    const response = await fetch('./apps/apps.json');
    const apps = await response.json();

    apps.forEach(app => {
      const appDiv = document.createElement('div');
      appDiv.style.display = 'flex';
      appDiv.style.alignItems = 'center';
      appDiv.style.gap = '8px';
      appDiv.style.padding = '4px';
      appDiv.style.cursor = 'pointer';
      appDiv.style.borderRadius = '4px';
      appDiv.style.transition = 'background 0.2s';

      appDiv.addEventListener('mouseenter', () => appDiv.style.background = 'rgba(255,255,255,0.1)');
      appDiv.addEventListener('mouseleave', () => appDiv.style.background = 'transparent');

      // Icon
      const icon = document.createElement('img');
      icon.src = app.icon || 'images/defaultapp.png';
      icon.width = 32;
      icon.height = 32;
      appDiv.appendChild(icon);

      // Label
      const label = document.createElement('span');
      label.textContent = app.name;
      appDiv.appendChild(label);

      // Launch on double-click
      appDiv.addEventListener('dblclick', () => {
        window.parent.openApp(app.id);
      });

      appList.appendChild(appDiv);
    });
  } catch (err) {
    body.textContent = 'Failed to load apps.';
    console.error(err);
  }
}
