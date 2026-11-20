document.getElementById("openBtn").addEventListener("click", async () => {
  const url = chrome.runtime.getURL("src/workbench/migrator.html");
  await chrome.tabs.create({ url });
  window.close();
});
