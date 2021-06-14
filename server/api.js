'use strict'
import {getWSPort} from './websocket.js';


//import {createUser, getAllUsers} from './userService.js'

/**
 * Doplní routes pro Express REST API chatu dodané instanci Express.
 * 
 * @param {Express} app instance, do které budou přidány příslušné
 *                      routes
 */
export function buildAPI(app) {
    new Promise((resolve, reject) => {
        try {
            generalAPI(app);
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}

const generalAPI = (app) => {

    app.get('/api/general/wsport/', (req, res) => {
        res.send({wsport: getWSPort()});
    });
}


