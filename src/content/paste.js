const persist = { root: undefined, listeners: [] };

globalThis.paste = {
  name: "paste",
  setup: () => {
    persist.root =
      persist.root ??
      Object.assign(document.createElement("div"), {
        className: "webextension-collage webextension-collage-paste",
      });
    return {
      root: persist.root,
      dispose: () => {
        persist.root.remove();
        // Object.values(parent.listeners)
        //   .map((listeners) => Object.values(listeners))
        //   .forEach((removers) => removers.forEach((remover) => remover()));
      },
      listeners: {
        paste: (event) => {
          [...(event.clipboardData || event.originalEvent.clipboardData).items]
            .map((item) => item.getAsFile())
            .filter(Boolean)
            .map((file) =>
              new Promise((resolve) => {
                const reader = new FileReader();
                reader.addEventListener("load", ({ target }) => {
                  resolve(target.result);
                });
                reader.readAsDataURL(file);
              })
                .then((src) =>
                  Object.assign(new Image(), { src, draggable: false })
                )
                .then((image) => {
                  const state = {
                    mouse: { x: 0, y: 0 },
                    pos: { x: 0, y: 0 },
                    drag: false,
                  };
                  const listeners = {
                    mousedown: (e) => {
                      state.drag = true;
                      state.pos.x = state.mouse.x - image.offsetLeft;
                      state.pos.y = state.mouse.y - image.offsetTop;
                      e.preventDefault();
                    },
                    mouseup: (e) => {
                      state.drag = false;
                      e.preventDefault();
                    },
                    mousemove: (e) => {
                      state.mouse.x = e.pageX;
                      state.mouse.y = e.pageY;
                      if (state.drag) {
                        image.style.position = "absolute";
                        image.style.left = state.mouse.x - state.pos.x + "px";
                        image.style.top = state.mouse.y - state.pos.y + "px";
                      }
                      e.preventDefault();
                    },
                  };
                  persist.listeners = [
                    ...persist.listeners,
                    Object.entries(listeners).map(([key, cb]) => {
                      image.addEventListener(key, cb);
                      return () => image.removeEventListener(key, cb);
                    }),
                  ];
                  return image;
                })
                .then((image) => {
                  persist.root.appendChild(image);
                })
            );
        },
      },
    };
  },
};
