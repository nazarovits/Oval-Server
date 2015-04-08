module.exports = function (app, PostGre) {
    var logWriter = require('../helpers/logWriter')();
    //var syncRouter = require('./synchronize')(PostGre);
   // var paymentRouter = require('./payment')(PostGre);
    var badRequests = require('../helpers/badRequests')();
   // var membersRouter = require('./members')(PostGre);
    //var usersRouter = require('./users')(PostGre);
   // var Session = require('../handlers/sessions');
    var CONSTANTS = require('../constants/constants');
    var RESPONSES = require('../constants/responseMessages');

    //var session = new Session(PostGre);

    app.get('/', function (req, res, next) {
        //res.sendfile('index.html');
        res.send('Success');
    });

   // app.use('/sync', session.authenticatedUser, syncRouter);

   // app.use('/members/payment', paymentRouter);
   // app.use('/members', membersRouter);
   // app.use('/users', usersRouter);

   /* app.post('/authenticate', function (req, res, next) {
        var cid = req.body.cid;
        if (cid) {
            session.register(req, res, {cid: cid});
        } else {
            next(badRequests.invalidValue());
        }
    });*/

    app.post('/fetch/:tableName', function (req, res, next) {
        var tableName = req.params.tableName || CONSTANTS.DEFAULT_TABLE;
        var fetchList = req.body;
        var TargetModel = PostGre.Collections[tableName];

        if (TargetModel) {
            if (fetchList && fetchList.length) {
                TargetModel.query(function (qb) {
                    qb.whereIn('uid', fetchList);
                }).fetch().then(function (result) {
                    res.status(200).send(result);
                }).otherwise(function (err) {
                    res.status(500).send(err);
                });

            } else {
                res.status(500).send(RESPONSES.NOT_ENOUGH_PARAMETERS);
            }
        } else {
            res.status(500).send(RESPONSES.NOT_EXISTS);
        }
    });


    function notFound (req, res, next) {
        res.status(404);

        if (req.accepts('html')) {
            return res.send(RESPONSES.PAGE_NOT_FOUND);
        }

        if (req.accepts('json')) {
            return res.json({error: RESPONSES.PAGE_NOT_FOUND});
        }

        res.type('txt');
        res.send(RESPONSES.PAGE_NOT_FOUND);
    };

    function errorHandler (err, req, res, next) {
        var satus = err.status || 500;

        if (process.env.NODE_ENV === 'production') {
            if (satus === 401) {
                logWriter.log('', err.message + '\n' + err.stack);
            }
            res.status(satus);
        } else {
            if (satus !== 401) {
                logWriter.log('', err.message + '\n' + err.stack);
            }
            res.status(satus).send(err.message + '\n' + err.stack);
        }

        if (satus === 401) {
            console.warn(err.message);
        } else {
            console.error(err.message);
            console.error(err.stack);
        }

        next();
    };

    app.use(notFound);
    app.use(errorHandler);
};