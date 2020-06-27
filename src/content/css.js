const css = (str, ...args) =>
  str
    .map((e, i) => [e, args[i]])
    .flat()
    .join("");

document.head.appendChild(
  Object.assign(document.createElement("style"), {
    type: "text/css",
    id: "webextension-collage-css",
    innerText: css`
      .webextension-collage {
        --radius: 2.5px;
        z-index: 10000000;
      }
      .webextension-collage-hide {
        display: none;
      }
      .webextension-collage,
      .webextension-collage svg,
      .webextension-collage > div {
        position: fixed;
        top: 0;
        right: 0;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
      }
      .webextension-collage-info {
        all: unset;
        position: fixed;
        top: 14px;
        right: 14px;
        background: black;
        color: white;
        font-family: Arial;
        font-size: 14px;
        padding: 14px;
        z-index: 999999999;
      }
      .webextension-collage-paste {
        pointer-events: none;
      }
      .webextension-collage img {
        all: unset;
        cursor: move;
        position: relative;
        user-select: none;
        pointer-events: all;
      }
      .webextension-collage path {
        fill: rgba(215, 215, 193, 0.77);
      }
      .webextension-collage path:focus {
        fill: rgba(215, 215, 193, 0.77);
        stroke: black;
        stroke-width: 3;
        stroke-linecap: round;
      }
      .webextension-collage > div {
        width: calc(var(--radius) * 2);
        height: calc(var(--radius) * 2);
        background: black;
      }
    `,
  })
);
