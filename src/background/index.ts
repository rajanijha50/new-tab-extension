/// <reference types="chrome" />

// Background service worker for New Tab Dashboard Extension
// Handles extension lifecycle events

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Open options page on first install to let user configure
    chrome.runtime.openOptionsPage();
  }
});

// Keep service worker alive by listening to messages
chrome.runtime.onMessage.addListener((_message, _sender, sendResponse) => {
  sendResponse({ status: 'alive' });
  return true;
});
