export const client = ({ dispatch, getState }) => next => action => {
  if (typeof window !== "undefined") {
    switch (action.type) {
      case "TDS_CLIENT_RELOAD": {
        console.log("trigger reload");
        window.location.reload(true);
        break;
      }
      case "TDS_CLIENT_UPDATE_SCRIPT": {
        const script = window.document.querySelector("script[src]");
        // const parent = script.parentNode;
        // parent.removeChild(script);
        script.setAttribute(
          "src",
          script.src.split("?")[0] + "?t" + new Date().getTime()
        );
        //parent.appendChild(script);
      }
      case "TDS_CLIENT_UPDATE_STYLE": {
        const style = window.document.querySelector('link[rel="stylesheet"]');
        style.setAttribute(
          "href",
          style.getAttribute("href").split("?")[0] + "?t" + new Date().getTime()
        );
      }
    }
  }
  next(action);
};
