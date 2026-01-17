chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'GET_TEXT') {
    const text = document.body.innerText.substring(0, 50000); // Truncate to 50k chars
    sendResponse({ text });
  }
});
