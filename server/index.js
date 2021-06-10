"use strict";

import express from 'express';

const PORT = 8080;
const app = express();

app.get('/', (req, res) => {
    console.log(req);
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`APP IS LISTENING ON PORT ${PORT}`);
});
