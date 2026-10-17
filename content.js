const IMAGES_PATH = "images/";
const EXTENSION_NAME = "Windy31ify";
const TOTAL_IMAGES = 17;

let isEnabled = true;
let onlyOriginal = false;

chrome.storage.local.get({ isEnabled: true, onlyOriginal: false }, (data) => {
  isEnabled = data.isEnabled;
  onlyOriginal = data.onlyOriginal;
  if (!isEnabled) {
    removeAllOverlays();
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.isEnabled) {
    isEnabled = changes.isEnabled.newValue;
    if (!isEnabled) {
      removeAllOverlays();
    }
  }
  if (changes.onlyOriginal) {
    onlyOriginal = changes.onlyOriginal.newValue;
    removeAllOverlays();
  }
});

function removeAllOverlays() {
  const overlays = document.querySelectorAll(`img#${EXTENSION_NAME}`);
  overlays.forEach(overlay => overlay.remove());
}

function applyOverlay(thumbnailElement, overlayImageURL, isImageOne = false, flipX = false, flipY = false) {
  const overlayImage = document.createElement("img");
  overlayImage.id = EXTENSION_NAME;
  overlayImage.src = overlayImageURL;
  overlayImage.style.position = "absolute";
  overlayImage.style.top = "50%";
  overlayImage.style.left = "50%";
  overlayImage.style.width = "100%";
  overlayImage.style.height = "100%";
  overlayImage.style.objectFit = "contain";
  overlayImage.style.zIndex = "1";
  overlayImage.style.pointerEvents = "none";
  overlayImage.style.userSelect = "none";

  const scaleX = flipX ? -1 : 1;
  const scaleY = flipY ? -1 : 1;
  const flipStyle = ` scale(${scaleX}, ${scaleY})`;

  if (isImageOne) {
    const shiftX = -50 - Math.floor(Math.random() * 19);
    overlayImage.style.transform = `translate(${shiftX}%, -50%)${flipStyle}`;
  } else {
    overlayImage.style.transform = `translate(-50%, -50%)${flipStyle}`;
  }

  thumbnailElement.parentElement.insertBefore(overlayImage, thumbnailElement.nextSibling);
}

function findThumbnails() {
  const imageSelectors = [
    ".yt-thumbnail-view-model__image img",
    "ytd-thumbnail a > yt-image > img.yt-core-image",
    "img.ytCoreImageHost"
  ];

  const allImages = [];
  for (const selector of imageSelectors) {
    allImages.push(...Array.from(document.querySelectorAll(selector)));
  }

  const targetAspectRatio = [16 / 9, 4 / 3];
  const errorMargin = 0.05;

  const listAllThumbnails = allImages.filter(image => {
    if (!image.height || image.height === 0) return false;
    const aspectRatio = image.width / image.height;
    return (Math.abs(aspectRatio - targetAspectRatio[0]) < errorMargin) || 
           (Math.abs(aspectRatio - targetAspectRatio[1]) < errorMargin);
  });

  return listAllThumbnails.filter(image => {
    const parent = image.parentElement;
    if (!parent) return false;

    const isVideoPreview = parent.closest("#video-preview") !== null || 
                           Array.from(parent.classList).some(cls => cls.includes("ytAnimated"));
    const isChapter = parent.closest("#endpoint") !== null;

    const alreadyHasAThumbnail = Array.from(parent.children).some(child => 
      child.id && child.id.includes(EXTENSION_NAME)
    );

    return !alreadyHasAThumbnail && !isVideoPreview && !isChapter;
  });
}

function applyOverlayToThumbnails() {
  if (!isEnabled) return;

  const thumbnailElements = findThumbnails();

  thumbnailElements.forEach((thumbnailElement) => {
    let chosenIndex = 1;

    if (!onlyOriginal) {
      const rareChance = Math.random() < 0.02;

      if (rareChance) {
        chosenIndex = 9;
      } else {
        const pool = [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17];
        chosenIndex = pool[Math.floor(Math.random() * pool.length)];
      }
    }

    const flipX = Math.random() < 0.25;
    const flipY = Math.random() < 0.03;

    const overlayImageURL = chrome.runtime.getURL(`${IMAGES_PATH}${chosenIndex}.png`);
    const isImageOne = (chosenIndex === 1);
    applyOverlay(thumbnailElement, overlayImageURL, isImageOne, flipX, flipY);
  });
}

setInterval(applyOverlayToThumbnails, 150);