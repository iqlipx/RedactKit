document.getElementById('saveBtn').addEventListener('click', () => {
  const words = document.getElementById('words').value.split(',').map(w => w.trim()).filter(w => w);
  chrome.storage.local.set({ redactedWords: words }, () => {
    document.getElementById('status').textContent = "✅ Saved!";
    setTimeout(() => { 
      document.getElementById('status').textContent = ""; 
    }, 2000);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  
  chrome.storage.local.get('redactedWords', data => {
    if (data.redactedWords) {
      document.getElementById('words').value = data.redactedWords.join(', ');
    }
  });

  chrome.storage.local.get('redactionEnabled', data => {
    const toggle = document.getElementById('toggle');
    toggle.checked = data.redactionEnabled || false;
  });

  document.getElementById('toggle').addEventListener('change', (event) => {
    const isEnabled = event.target.checked;
    chrome.storage.local.set({ redactionEnabled: isEnabled });
  });

  document.addEventListener('wheel', function (e) {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  });

  document.addEventListener('gesturestart', function (e) {
    e.preventDefault(); 
  });
});
