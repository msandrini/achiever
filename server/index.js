const express = require('express');
const path = require('path');

const app = express();
const getFromRoot = file => path.resolve(__dirname, `../${file}`);

app.get('/', (req, res) => {
    res.sendFile(getFromRoot('client/index.htm'));
});
app.get('/app.js', (req, res) => {
    res.sendFile(getFromRoot('client/dist/app.js'));
});

app.listen(3000, () => 
    console.log('listening on 3000!'));