export const tableTypeDeparser = type => {
  let id;
  switch (type) {
    case "circle":
      id = "2";
      break;

    case "square":
      id = "3";
      break;

    case "rectangle":
      id = "4";
      break;

    case "ellipse":
      id = "5";
      break;
  }
  return id;
};

export const tableTypeParser = id => {
  let type;
  switch (id) {
    case "2":
      type = "circle";
      break;

    case "3":
      type = "square";
      break;

    case "4":
      type = "rectangle";
      break;

    case "5":
      type = "ellipse";
      break;
  }
  return type;
};

export const isCrossOrigin = url => {
  try {
    return new URL(url, window.location.href).origin !== window.location.origin;
  } catch (e) {
    return false;
  }
};

/**
 * Loads an image to be drawn inside the Konva stage.
 *
 * A cross origin image drawn without CORS taints the canvas, and every later
 * stage.toDataURL() silently returns an empty string (Konva swallows the
 * SecurityError), which leaves the print preview and the downloads empty.
 * So we first try to load it as a CORS request; only if the server refuses we
 * fall back to a plain load, keeping the map visible but flagging the stage as
 * not exportable.
 *
 * Resolves with { image, exportable }, image being null when the url could not
 * be loaded at all.
 */
export const loadCanvasImage = url => {
  const attempts = isCrossOrigin(url)
    ? ["use-credentials", "anonymous", null]
    : [null];

  return new Promise(resolve => {
    const tryLoad = index => {
      const crossOrigin = attempts[index];
      const image = new window.Image();

      if (crossOrigin) {
        image.crossOrigin = crossOrigin;
      }

      image.onload = () =>
        resolve({
          image,
          exportable: Boolean(crossOrigin) || !isCrossOrigin(url)
        });

      image.onerror = () => {
        if (index + 1 < attempts.length) {
          tryLoad(index + 1);
        } else {
          resolve({ image: null, exportable: true });
        }
      };

      image.src = url;
    };

    tryLoad(0);
  });
};
