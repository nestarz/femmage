globalThis.isChrome = typeof globalThis.browser === undefined;
globalThis.browser = globalThis.browser ?? chrome;

const switcher = ({ setup }) => {
  const { dispose, listeners, root } = setup();
  document.body.appendChild(root);

  const removers = Object.entries({
    ...listeners,
  }).map(([type, listener]) => {
    document.addEventListener(type, listener);
    return () => document.removeEventListener(type, listener);
  });

  return () => {
    removers.forEach((remover) => remover());
    root.remove();
    if (dispose) dispose();
  };
};

const state = { modeIndex: 1, dispose: () => null };
document.addEventListener("keydown", async (event) => {
  if ((event.ctrlKey || event.metaKey) && event.code === "KeyD") {
    // import("src/content/css.js");
    const modes = await Promise.all([
      null,
      // import("src/content/clip.js").then(({ default: clip }) => clip),
      // import("src/content/paste.js").then(({ default: paste }) => paste),
      globalThis.clip,
      globalThis.paste,
    ]);
    if (state.dispose) state.dispose();
    const current = modes[state.modeIndex % modes.length];
    const info = document.body.appendChild(
      Object.assign(document.createElement("div"), {
        className: "webextension-collage-info",
        innerText: current ? `Mode ${current.name}` : "Reset",
      })
    );
    setTimeout(() => info.remove(), 1500);
    if (current) state.dispose = switcher(current);
    state.modeIndex += 1;
    event.preventDefault();
  }
});
