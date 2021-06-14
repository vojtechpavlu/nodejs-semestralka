import { buildAPI } from "./api.js";
import { initializeUsernames } from "./users.js";
import { initWS } from "./websocket.js";

export const initialize = (port, app) => {
    return new Promise((resolve, reject) => {
        initializeUsernames()
        .then(() => {
            initWS(port)
        })
        .then(() => {
            buildAPI(app);
        })
        resolve();
    });
};