chrome.runtime.onInstalled.addListener(() => {
  console.log('TnC Analyzer Extension Installed');
});

const LEGAL_KEYWORDS = [
  'terms',
  'privacy',
  'policy',
  'agreement',
  'legal',
  'tos',
  'eula',
  'condition'
];

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' || changeInfo.url) {
    const urlToCheck = (changeInfo.url || tab.url || '').toLowerCase();
    
    // Skip internal chrome:// pages or empty urls
    if (!urlToCheck || urlToCheck.startsWith('chrome://')) return;

    const isLegalPage = LEGAL_KEYWORDS.some(keyword => urlToCheck.includes(keyword));

    if (isLegalPage) {
      chrome.action.setBadgeText({ text: '!', tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#FFFFFF', tabId });
      chrome.action.setBadgeTextColor({ color: '#000000', tabId });
    } else {
      chrome.action.setBadgeText({ text: '', tabId });
    }
  }
});
