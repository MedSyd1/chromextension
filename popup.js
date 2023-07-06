import { getActiveTabURL } from "./utils.js";

const addNewBookmark = (bookmarksElement, bookmark) => {
  const bookmarkTitleElement = document.createElement("div");
  const newBookmarkElement = document.createElement("div");
  const controlesElement = document.createElement("div");
  controlesElement.className = "bookmark-controls";

  bookmarkTitleElement.textContent = bookmark.desc;
  bookmarkTitleElement.className = "bookmark-title";

  newBookmarkElement.id = "bookmark-" + bookmark.time;
  newBookmarkElement.className = "bookmark";
  newBookmarkElement.setAttribute("timestamp", bookmark.time);

  setBookmarkAttributes("play", onPlay, controlesElement);
  setBookmarkAttributes("delete", onDelete, controlesElement);

  newBookmarkElement.appendChild(bookmarkTitleElement);
  newBookmarkElement.appendChild(controlesElement);
  bookmarksElement.appendChild(newBookmarkElement);
};

const viewBookmarks = (currentBookmarks) => {
  const bookmarks = document.getElementById("bookmarks");
  bookmarks.innerHTML = "";
  if (currentBookmarks.length > 0) {
    for (let i = 0; i < currentBookmarks.length; i++) {
      addNewBookmark(bookmarks, currentBookmarks[i]);
    }
  } else {
    bookmarks.innerHTML = "<div>no bookmarks for this video</div>";
  }
};

const onPlay = async (e) => {
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const activeTab = await getActiveTabURL();
  chrome.tabs.sendMessage(activeTab.id, {
    type: "PLAY",
    value: bookmarkTime,
  });
};

const onDelete = async (e) => {
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const activeTab = await getActiveTabURL();
  const bookmarkTimeElemetToDelete = document.getElementById(
    "bookmark-" + bookmarkTime
  );
  bookmarkTimeElemetToDelete.parentNode.removeChild(bookmarkTimeElemetToDelete);
  chrome.tabs.sendMessage(
    activeTab.id,
    {
      type: "DELETE",
      value: bookmarkTime,
    },
    viewBookmarks
  );
};

const setBookmarkAttributes = (src, eventListener, parrentControlElement) => {
  const controlElement = document.createElement("img");
  controlElement.src = "assets/" + src + ".png";
  controlElement.title = src;
  controlElement.addEventListener("click", eventListener);
  parrentControlElement.appendChild(controlElement);
};

document.addEventListener("DOMContentLoaded", async () => {
  const activeTab = await getActiveTabURL();
  const queryParams = new URLSearchParams(new URL(activeTab.url).search);
  const currentVideo = queryParams.get("v");
  if (activeTab.url.includes("https://www.youtube.com/watch") && currentVideo) {
    chrome.storage.sync.get([currentVideo], (obj) => {
      const currentVideoBookmarks = obj[currentVideo]
        ? JSON.parse(obj[currentVideo])
        : [];
      viewBookmarks(currentVideoBookmarks);
    });
  } else {
    const container = document.getElementsByClassName("container")[0];
    container.innerHTML = "<div>this is not a youtube video page</div>";
  }
});
