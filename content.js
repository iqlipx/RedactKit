function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function redactText(text, regexes) {
  for (const regex of regexes) {
    text = text.replace(regex, '[REDACTED]');
  }
  return text;
}

function walk(node, regexes) {
  if (node.nodeType === 3) {
    const parent = node.parentNode;
    if (parent && !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.nodeName)) {
      node.textContent = redactText(node.textContent, regexes);
    }
  } else {
    for (const child of node.childNodes) {
      walk(child, regexes);
    }
  }
}

function updateTitle(regexes) {
  const currentTitle = document.title;
  const redactedTitle = redactText(currentTitle, regexes);
  if (currentTitle !== redactedTitle) {
    document.title = redactedTitle;
  }
}

function startTitleWatcher(regexes) {
  let lastTitle = document.title;

  setInterval(() => {
    if (document.title !== lastTitle) {
      const redacted = redactText(document.title, regexes);
      if (document.title !== redacted) {
        document.title = redacted;
      }
      lastTitle = redacted;
    }
  }, 500);
}

function redactFormFields(regexes) {
  const fieldSelector = 'input[type="text"], input[type="email"], input[type="tel"], input[type="url"], input[type="search"], input:not([type]), textarea';
  const fields = document.querySelectorAll(fieldSelector);

  fields.forEach(field => {
    if (field.value) {
      const redacted = redactText(field.value, regexes);
      if (field.value !== redacted) {
        field.value = redacted;
      }
    }

    field.addEventListener('input', () => {
      const redacted = redactText(field.value, regexes);
      if (field.value !== redacted) {
        field.value = redacted;
      }
    });
  });
}

function applyRedactions(words) {
  if (!words || words.length === 0) return;

  const regexes = words.map(word => new RegExp(`\\b${escapeRegExp(word)}\\b`, 'gi'));

  walk(document.body, regexes);
  redactFormFields(regexes);
  updateTitle(regexes);
  startTitleWatcher(regexes);

  const pageObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        walk(node, regexes);
        if (node.nodeType === 1) {
          redactFormFields(regexes);
        }
      });
    });
  });

  pageObserver.observe(document.body, { childList: true, subtree: true });
}

browser.storage.local.get(['redactedWords', 'redactionEnabled'], result => {
  const { redactedWords, redactionEnabled } = result;

  if (redactionEnabled) {
    applyRedactions(redactedWords || []);
  }
});
