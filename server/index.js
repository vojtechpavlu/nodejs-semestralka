"use strict";

import express from 'express';
import { initialize } from './initializer.js';

import path from 'path';
import {fileURLToPath} from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import fs from 'fs';
import https from 'https';
import http from 'http';

const credentials = {
    key: fs.readFileSync(path.join(__dirname, '..', 'tls', 'server.key'), 'utf8'), 
    cert: fs.readFileSync(path.join(__dirname, '..', 'tls', 'server.cert'), 'utf8')
}


const DEF_PORT = 443 //process.env.PORT || 8080;
const WS_PORT =  8085;
const app = express();

app.use(express.static('client'));

initialize(WS_PORT, app).then(() => {
    let httpsServer = https.createServer(credentials, app)
    httpsServer.listen(DEF_PORT);
    console.log(`App is listening at port ${DEF_PORT}`);
});
