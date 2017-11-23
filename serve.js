const express = require('express');
const path = require('path');

const app = express();

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client/index.htm'));
});
app.get('/app.js', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client/dist/app.js'));
});

app.listen(3000, () => 
    console.log('listening on 3000!'));