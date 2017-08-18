// Background job which monitors chrome tabs and closes duplicates.

var tabs = [];

// Called when extension is installed or updated
chrome.runtime.onInstalled.addListener(function(reason){
  // Set initial tabs
  chrome.tabs.query({}, function(result) {
    for (var i = 0; i < result.length; i++) {
      tabs.push(result[i])
    }
  });

  // TODO: Close and remove duplicates in initial tabs
});

// Called when new tab is created
chrome.tabs.onCreated.addListener(function(tab) {
  if (tab.url !== null && tab.url !== "undefined") {

    // Remove old duplicated tab
    if (this.isTabKnown(tab) === true) {
      var oldTab = findTabByUrl(tab.url);
      if (oldTab !== null) {
        chrome.tabs.remove(oldTab.id); // close tab
        this.removeTab(oldTab)
      }
    }

    // Save new tab
    this.addTab(tab)
  }
});

// Called when tab is closed
chrome.tabs.onRemoved.addListener(function(tabId, detachInfo) {
  var oldTab = findTabById(tabId);
  if (oldTab !== null) {
    this.removeTab(oldTab)
  }
});

// Called when tab is updated or refreshed
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (tab.url !== null && tab.url !== "undefined") {
      // If tab url is known find and close duplicated (older) tab
      if (this.isTabKnown(tab) === true) {
        var tabsByUrlResult = findTabsByUrl(tab.url);
        for (var i = 0; i < tabsByUrlResult.length; i++) {
          if (tabsByUrlResult[i].id !== tab.id) {
            chrome.tabs.remove(tabsByUrlResult[i].id); // close tab
            this.removeTab(tabsByUrlResult[i])
          }
        }
      }

      // Update tabs
      var updatedTab = findTabById(tab.id);
      if (updatedTab !== null) {
        this.removeTab(updatedTab)
      }
      this.addTab(tab)
    }
});

function isTabKnown(tab) {
    for (var i = 0; i < tabs.length; i++) {
      if (tab.url === tabs[i].url) {
        return true
      }
    }
    return false;
}

function findTabByUrl(url) {
  for (var i = 0; i < tabs.length; i++) {
    if (url === tabs[i].url) {
      return tabs[i]
    }
  }
  return null;
}

function findTabsByUrl(url) {
  var tabsByUrl = [];

  for (var i = 0; i < tabs.length; i++) {
    if (url === tabs[i].url) {
      tabsByUrl.push(tabs[i])
    }
  }
  return tabsByUrl;
}

function findTabById(id) {
  for (var i = 0; i < tabs.length; i++) {
    if (id === tabs[i].id) {
      return tabs[i]
    }
  }
  return null;
}

function addTab(tab) {
  tabs.push(tab)
}

function removeTab(tab) {
    var index = tabs.indexOf(tab);
    if (index !== -1) {
        tabs.splice(index, 1);
    }
}