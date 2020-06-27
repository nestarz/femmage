globalThis.isChrome = typeof globalThis.browser === undefined;
globalThis.browser = globalThis.browser ?? chrome;

const bbox = (points) => {
  const X = points.filter((_, i) => (i + 1) % 2);
  const Y = points.filter((_, i) => i % 2);
  return [
    [Math.min(...X), Math.min(...Y)],
    [Math.max(...X), Math.max(...Y)],
  ];
};

const clip = (context, d) => {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttributeNS(null, "d", d);
  const points = d.match(/\d+/g).map(Number);

  const clipped = Object.assign(document.createElement("canvas"), {
    width: context.canvas.width,
    height: context.canvas.height,
  }).getContext("2d");
  clipped.clip(new Path2D(d));
  clipped.drawImage(context.canvas, 0, 0);

  const [[minX, minY], [maxX, maxY]] = bbox(points);
  const output = document.createElement("canvas").getContext("2d");
  const [w, h] = [maxX - minX, maxY - minY];
  Object.assign(output.canvas, { width: w, height: h });
  output.drawImage(clipped.canvas, minX, minY, w, h, 0, 0, w, h);
  return output;
};

const base64toCanvas = async (src) => {
  const image = Object.assign(new Image(), { src });
  await new Promise((r) => image.addEventListener("load", r));
  const context = Object.assign(document.createElement("canvas"), {
    width: image.width,
    height: image.height,
  }).getContext("2d");
  context.drawImage(image, 0, 0);
  return context;
};

const screen = (path, _, sendResponse) => {
  let schedule = setTimeout(() => sendResponse(false), 1200);
  browser.tabs.captureVisibleTab(
    { format: "png" },
    async (screenshotBase64) => {
      clearTimeout(schedule);
      const context = await base64toCanvas(screenshotBase64);
      const image = clip(context, path);
      const base64 = image.canvas.toDataURL();
      sendResponse(base64);
      if (!globalThis.isChrome) {
        fetch(base64)
          .then((res) => res.arrayBuffer())
          .then((buffer) => browser.clipboard.setImageData(buffer, "png"));
      }
    }
  );

  return true; // https://stackoverflow.com/a/46257926/4246603
};

console.log("[COLLAGE] Background Script Loaded");
browser.runtime.onMessage.addListener(screen);
