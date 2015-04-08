
var express = require('express');
var router = express.Router();
var SyncHandler = require('../handlers/synchronize');

module.exports = function (PostGre) {
    var syncHandler = new SyncHandler(PostGre);

    router.get('/pull', syncHandler.pull);
    router.post('/push', syncHandler.push);
    return router;
};