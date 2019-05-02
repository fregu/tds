export const client = ({ dispatch, getState }) => next => action => {
  if (typeof window !== "undefined") {
    switch (action.type) {
      case "TDS_CLIENT_RELOAD": {
        console.log("trigger reload");
        window.location.reload(true);
        break;
      }

      case "TDS_CLIENT_UPDATE_STYLE": {
        const stylesheets = window.document.querySelectorAll(
          "link[rel='stylesheet'][href^='/']"
        );

        Array.from(stylesheets).map(style => {
          console.log(style);
          style.setAttribute(
            "href",
            style.getAttribute("href").split("?")[0] +
              "?t" +
              new Date().getTime()
          );
        });
      }
    }
  }
  next(action);
};
