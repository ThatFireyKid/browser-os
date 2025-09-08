export default function createNotepadApp(openApp) {
  let windowCount = 0;

  return function(win) {
    windowCount++;
    win.id = `notepad-${windowCount}`;

    // Header controls
    const npHeader = document.createElement('div');
    npHeader.classList.add('notepad-header');
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

    win.append(npHeader, ta);

    // --- File management ---
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
  };
}
