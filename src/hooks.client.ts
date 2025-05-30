import { App } from "@capacitor/app";

App.addListener("backButton", (e) => {
    if (e.canGoBack) {
        window.history.back();
    } else {
        App.minimizeApp();
    }
});