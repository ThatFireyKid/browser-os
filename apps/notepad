export default function NotepadApp({ desktop, topZ }) {
  const win = document.createElement('div');
  win.className = 'window';
  win.style.left = `${60 + Math.random() * 120}px`;
  win.style.top = `${60 + Math.random() * 80}px`;
  win.style.zIndex = topZ;

  // Header
  const header = document.createElement('div');
  header.className = 'win-header';
  const title = document.createElement('div');
  title.className = 'win-title';
  title.textContent = 'Notepad';
  const controls = document.createElement('div');
  controls.className = 'win-controls';
  const minBtn = document.createElement('span');
  minBtn.className = 'win-control-btn win-min';
  const closeBtn = document.createElement('span');
  closeBtn.className = 'win-control-btn win-close';
  controls.append(minBtn, closeBtn);
  header.append(title, controls);

  // Body
  const body = document.createElement('div');
  body.className = 'win-body';

  // Notepad UI
  const npHeader = document.createElement('div');
  npHeader.className = 'notepad-header';
  npHeader.innerHTML = `
    <input type="text" class="np-filename" placeholder="File name">
    <select class="np-file-list"></select>
    <button class="np-load">Load</button>
    <button class="np-save">Save</button>
    <button class="np-new">New</button>
    <button class="np-export">Export</button>
    <button class="np-import">Import</button>
    <button class="np-delete">Delete</button>
  `;

  const filenameInput = npHeader.querySelector('.np-filename');
  const fileListElement = npHeader.querySelector('.np-file-list');
  const loadBtn = npHeader.querySelector('.np-load');
  const saveBtn = npHeader.querySelector('.np-save');
  const newBtn = npHeader.querySelector('.np-new');
  const exportBtn = npHeader.querySelector('.np-export');
  const importBtn = npHeader.querySelector('.np-import');
  const deleteBtn = npHeader.querySelector('.np-delete');

  const ta = document.createElement('textarea');
  ta.classList.add('notepad-text');
  ta.style.width = '100%';
  ta.style.height = 'calc(100% - 60px)';

  body.append(npHeader, ta);
  win.append(header, body);
  desktop.appendChild(win);

  // --- File Operations ---
  function updateFileList() {
    fileListElement.innerHTML = '';
    Object.keys(localStorage)
      .filter(k => k.startsWith('tfk_file_'))
      .forEach(k => {
        const option = document.createElement('option');
        option.value = k;
        option.textContent = k.replace('tfk_file_', '');
        fileListElement.appendChild(option);
      });
  }

  fileListElement.addEventListener('change', () => {
    const key = fileListElement.value;
    if (key) {
      ta.value = localStorage.getItem(key) || '';
      filenameInput.value = key.replace('tfk_file_', '');
    }
  });

  loadBtn.addEventListener('click', () => {
    const key = `tfk_file_${filenameInput.value.trim()}`;
    const data = localStorage.getItem(key);
    if (!data) return alert("File not found!");
    ta.value = data;
    updateFileList();
  });

  saveBtn.addEventListener('click', () => {
    const name = filenameInput.value.trim();
    if (!name) return alert("Enter a file name!");
    localStorage.setItem(`tfk_file_${name}`, ta.value);
    alert(`Saved as ${name}.txt`);
    updateFileList();
  });

  newBtn.addEventListener('click', () => {
    filenameInput.value = '';
    ta.value = '';
  });

  exportBtn.addEventListener('click', () => {
    const name = filenameInput.value.trim();
    if (!name) return alert("Enter a file name!");
    const blob = new Blob([ta.value], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = `${name}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  });

  importBtn.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt';
    fileInput.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        ta.value = ev.target.result;
        filenameInput.value = file.name.replace('.txt','');
      };
      reader.readAsText(file);
    };
    fileInput.click();
  });

  deleteBtn.addEventListener('click', () => {
    const key = fileListElement.value;
    if (!key) return alert("Select a file to delete!");
    if (confirm(`Are you sure you want to delete "${key.replace('tfk_file_', '')}"?`)) {
      localStorage.removeItem(key);
      ta.value = '';
      filenameInput.value = '';
      updateFileList();
    }
  });

  updateFileList();

  // --- Window Controls ---
  closeBtn.addEventListener('click', () => win.remove());
  minBtn.addEventListener('click', () => win.style.display = 'none');

  let dragging = false, offsetX = 0, offsetY = 0;
  header.addEventListener('mousedown', e => {
    dragging = true;
    const rect = win.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    win.style.left = `${e.clientX - offsetX}px`;
    win.style.top = `${e.clientY - offsetY}px`;
  });
  document.addEventListener('mouseup', () => dragging = false);

  return win;
}
