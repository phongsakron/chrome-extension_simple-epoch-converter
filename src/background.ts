'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'convertTimestamp',
    title: 'Send to Simple Epoch Converter',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Context menu clicked:', info, tab);
  if (info.menuItemId === 'convertTimestamp' && info.selectionText) {
    // Save the selected text to Chrome storage
    chrome.storage.local.set({ selectedTimestamp: info.selectionText }, () => {
      console.log('Saved selected timestamp:', info.selectionText);
    });

    // Optionally, we can show a notification or a toast-like message
    // but you can't automatically open the extension popup in Chrome.
    // The user still has to click the extension icon to open it.
  }
});
