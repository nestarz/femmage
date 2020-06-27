globalThis.clip = {
  name: "clip",
  setup: () => {
    const state = {
      gesture: false,
      line: "",
      start: [],
      current: null,
      focus: null,
      mode: null,
    };
    const root = Object.assign(document.createElement("div"), {
      className: "webextension-collage webextension-collage-clip",
    });
    const svg = root.appendChild(
      Object.assign(
        document.createElementNS("http://www.w3.org/2000/svg", "svg")
      )
    );
    const createPath = (svg) => {
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      path.tabIndex = 0;
      path.addEventListener("focus", () => (state.focus = path));
      path.addEventListener("blur", () => {
        if (state.focus === path) state.focus = null;
      });
      return svg.appendChild(path);
    };

    const createDot = (clientX, clientY) => {
      const dot = Object.assign(document.createElement("div"), {
        className: "dot",
      });
      const radius = parseInt(
        getComputedStyle(root).getPropertyValue("--radius"),
        10
      );
      Object.assign(dot.style, {
        top: `${clientY - radius}px`,
        left: `${clientX - radius}px`,
      });
      root.appendChild(dot);
    };

    return {
      root,
      dispose: () => root.remove(),
      listeners: {
        keydown: (event) => {
          if (event.code === "Tab") event.preventDefault();
          else if ((event.ctrlKey || event.metaKey) && event.code === "KeyC") {
            root.classList.add("webextension-collage-hide");
            browser.runtime.sendMessage(
              (state.focus || state.current)?.getAttributeNS(null, "d"),
              (response) => {
                root.classList.remove("webextension-collage-hide");
                if (!response) console.error(browser.runtime.lastError.message);
                else if (globalThis.isChrome) {
                  fetch(response)
                    .then((res) => res.blob())
                    .then((blob) =>
                      navigator.clipboard.write([
                        new ClipboardItem({ "image/png": blob }),
                      ])
                    );
                }
              }
            );
            event.preventDefault();
          }
        },
        keyup: (event) => {
          if (event.code === "Tab") {
            state.focus.nextElementSibling
              ? state.focus.nextElementSibling.focus()
              : svg.querySelector("path")?.focus();
            event.preventDefault();
          }
        },
        mousedown: (event) => {
          state.gesture = true;
          const starting = state.start.length === 0;
          if (starting) {
            state.current = createPath(svg);
            state.current.focus();
            state.start = [event.clientX, event.clientY];
            state.line = "";
          }
          state.line += `${starting ? "M" : "L"}${event.clientX},${
            event.clientY
          } `;
          createDot(event.clientX, event.clientY);
          event.preventDefault();
        },
        mousemove: ({ clientX, clientY, target }) => {
          if (state.gesture === true) {
            state.line += `L${clientX},${clientY} `;
            createDot(clientX, clientY);
          }
        },
        mouseup: (event) => {
          const l2 = (x1, y1, x2, y2) =>
            Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
          if (l2(event.clientX, event.clientY, ...state.start) < 10) {
            state.start = [];
            console.log("closing");
          }

          state.gesture = false;
          createDot(event.clientX, event.clientY);
          state.line += `L${event.clientX},${event.clientY} `;
          state.current.setAttributeNS(null, "d", state.line);
          event.preventDefault();
          localStorage.setItem(
            "svg",
            new XMLSerializer().serializeToString(svg)
          );
        },
      },
    };
  },
};
