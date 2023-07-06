(() => {
  let youtubeLeftPlayer, youtubePlayer;
  let currentVideo = "";
  let currentVideoBookmarks = [];
  chrome.runtime.onMessage.addListener((obj, sender, resoponse) => {
    const { value, type, videoId } = obj;
    if (type === "NEW") {
      currentVideo = videoId;
      newVideoLoaded();
    } else if (type === "PLAY") {
      document.getElementsByClassName("video-stream")[0].currentTime = value;
    } else if (type === "DELETE") {
      currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
      chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });

      response(currentVideoBookmarks);
    }
  });

  const fetchBookMarks = () => {
    return new Promise((resolve) => {
      chrome.storage.sync.get([currentVideo], (obj) => {
        resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
      });
    });
  };

  const newVideoLoaded = async () => {
    const bookmarkbtnexist = document.getElementsByClassName("bookmark-btn")[0];
    youtubeLeftPlayer = document.getElementsByClassName("ytp-left-controls")[0];
    youtubePlayer = document.getElementsByClassName("video-stream")[0];
    currentVideoBookmarks = await fetchBookMarks();
    if (!bookmarkbtnexist) {
      const bookmark = document.createElement("img");
      bookmark.src = chrome.runtime.getURL("./assets/bookmark.png");
      bookmark.className = "ytp-button " + "bookmark-btn";
      youtubeLeftPlayer.appendChild(bookmark);
      bookmark.addEventListener("click", addNewBookMarkEventHandler);
    }
  };
  const addNewBookMarkEventHandler = async () => {
    currentVideoBookmarks = await fetchBookMarks();
    console.log(currentVideoBookmarks);
    const newBookmark = {
      time: youtubePlayer.currentTime,
      desc: "bookmark at " + getTime(youtubePlayer.currentTime),
    };
    chrome.storage.sync.set({
      [currentVideo]: JSON.stringify(
        [...currentVideoBookmarks, newBookmark].sort((a, b) => {
          a.time - b.time;
        })
      ),
    });
  };

  const getTime = (t) => {
    let date = new Date(0);
    date.setSeconds(t);
    return date.toISOString().substr(11, 8);
  };
  newVideoLoaded();
})();
