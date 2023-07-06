chrome.tabs.onUpdated.addListener((tabId, tab) => {
  if (tab.url && tab.url.includes("https://www.youtube.com/watch")) {
    const queryParams = new URLSearchParams(new URL(tab.url).search);
    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      videoId: queryParams.get("v"),
    });
  }
});


