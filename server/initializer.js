import { buildAPI } from "./api.js";
import { initializeUsernames } from "./users.js";
import { initWS } from "./websocket.js";

export const initialize = (server, app) => {
    return new Promise((resolve, reject) => {
        initializeUsernames()
        .then(() => {
            initWS(server)
        })
        .then(() => {
            buildAPI(app);
        })
        resolve();
    });
};