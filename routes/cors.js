const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = ['http://localhost:3000', 'https://localhost:3443'];
var corsOptionsDelegate = (req, callback) => {       // this function will check to see if the incoming req
                                            // belongs to one of the whitelist origins. If it is, reply back origin: true
    var corsOptions;

    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };      // means that the origin in the incoming req is in the whitelist
    }

    else {
        corsOptions = { origin: false };
    }

    callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate); 