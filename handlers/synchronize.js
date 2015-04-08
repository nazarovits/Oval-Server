
var Synch = function (PostGre) {
    var async = require('async');
    var Sync = PostGre.Models.synchronizes;
    var RESPONSES = require('../constants/responseMessages');
    var CONSTANTS = require('../constants/constants');
    var badRequests = require('../helpers/badRequests')();
    var _ = require('underscore');
    var logWriter = require('../helpers/logWriter')();
    var redisClient = require('../helpers/redisClient')();

    function pushParser (pushArray, callback) {
        PostGre.transaction(function (transaction) {
            var iterator = manipulationIterator.bind(transaction);

            async.each(pushArray, iterator, function (err) {
                if (err) {
                    logWriter.log('syncronizws ', err);
                    return transaction.rollback();
                }
                transaction.commit();
            });
        }).exec(callback);
    };

    function manipulationIterator (pushObject, innerCb) {
        var transaction = this;

        if (pushObject && !(Object.keys(pushObject).length)) {
            innerCb(badRequests.notEnParams());
        }
        var processesArray = [];
        var table = pushObject.table;
        var modified = pushObject.updated;
        var added = pushObject.added;
        var deleted = pushObject.deleted;

        if (!table) {
            innerCb(badRequests.notEnParams());
        }

        if (added && added instanceof Array) {
            processesArray.push(adder);
        }
        if (modified && modified instanceof Array) {
            processesArray.push(updater);
        }
        if (deleted && deleted instanceof Array) {
            processesArray.push(remover);
        }


        function adder (paralelCb) {
            async.each(added, insertIterator, function (err) {
                if (err) {
                    console.log(err);
                    paralelCb(err);
                }
                paralelCb(null, 'adder');
            });
        }

        function updater (paralelCb) {
            async.each(modified, updateIterator, function (err) {
                if (err) {
                    paralelCb(err);
                }
                paralelCb(null, 'updater');
            });
        }

        function remover (paralelCb) {
            async.each(modified, deleteIterator, function (err) {
                if (err) {
                    paralelCb(err);
                }
                paralelCb(null, 'remover');
            });
        }

        function insertIterator (insertedObject, insertCb) {
            var TargetModel = PostGre.Models[table];

            if (TargetModel && Object.keys(TargetModel).length) {
                TargetModel.insert(insertedObject, null, {transacting: transaction}).exec(function (err, responseObject) {
                    if (err) {
                        return insertCb(err);
                    }
                    insertCb();
                });
            } else {
                insertCb(badRequests.notEnParams());
            }
        };

        function updateIterator (updatedObject, updateCb) {
            var TargetModel = PostGre.Models[table];

            if (TargetModel && Object.keys(TargetModel).length && updatedObject.uid) {
                TargetModel.fetchMe({uid: updatedObject.uid}).exec(function (err, updatedModel) {
                    if (!err) {
                        updatedModel.save(updatedObject, {
                            patch: true,
                            transacting: transaction
                        }).exec(function (err, responseObject) {
                            if (err) {
                                return updateCb(err);
                            }
                            updateCb();
                        });
                    } else {
                        updateCb(badRequests.notEnParams())
                    }
                });
            } else {
                updateCb(badRequests.notEnParams());
            }
        };

        function deleteIterator (uid, removeCb) {
            var TargetModel = PostGre.Models[table];

            if (TargetModel && Object.keys(TargetModel).length) {
                TargetModel.fetchMe({uid: uid}).exec(function (err, model) {
                    if (!err) {
                        model.destroy({transacting: transaction}).exec(function (err, deletedSuccess) {
                            if (err) {
                                return removeCb(err);
                            }
                            removeCb();
                        });
                    } else {
                        removeCb(badRequests.notEnParams());
                    }
                });
            }
        }

        async.series(processesArray, function (err, results) {
            if (err) {
                innerCb(err);
            } else {
                innerCb();
            }
        });
    }

    this.pull = function (req, res, next) {
        var cid = req.session.cid || CONSTANTS.DEFAULT_CID;

        function merge2Comit (target, source) {
            for (var item in source) {
                if (item in target) {
                    var withoutOperation = _.intersection(target[item].added, source[item].deleted); // it was created and deleted ; this element we must exclude for all operation
                    target[item].added = _.difference(target[item].added, source[item].deleted); //remove all deleted
                    target[item].updated = _.difference(target[item].updated, source[item].deleted); //remove all deleted
                    target[item].deleted = _.difference(target[item].deleted, withoutOperation); //exclude all

                    target[item].added = _.uniq(_.union(target[item].added, source[item].added));
                    target[item].updated = _.uniq(_.union(target[item].updated, source[item].updated));
                    target[item].updated = _.difference(target[item].updated, target[item].added); //if item was created and modify it must be only in added

                } else {
                    target[item] = source[item];
                }
            }
        };

        function dataMerge (Model) {
            var data;
            var result = [];
            var target;
            redisClient.cacheStore.readFromStorage('lastPush', function (err, redisResponse) {
                if (err) {
                    return next(new Error(err));
                }

                Model
                    .query(function (qb) {
                        qb.orderBy('created_at', 'asc');
                    })
                    .fetchAll({require: true})
                    .then(function (collection) {

                        data = collection.toJSON();
                        data = _.pluck(data, "sync_object");
                        target = data[0];

                        for (var i = 1; i < data.length; i++) {
                            merge2Comit(target, data[i]);
                        }
                        target = _.mapObject(target, function (val, key) {
                            var resObject = {};
                            resObject.table = key;
                            for (var item in val) {
                                resObject[item] = val[item];
                            }
                            result.push(resObject);
                        });

                        res.status(200).send({
                            result: result,
                            lastpush: redisResponse
                        });

                    }).otherwise(function (err) {
                        if (err.message === 'EmptyResponse') {
                            res.status(200).send({
                                result: RESPONSES.YOUR_DATA_ALREADY_UPDATE,
                                lastpush: redisResponse
                            });
                        } else {
                            next(err);
                        }
                    });
            });
        };

        Sync
            .query(function (qb) {
                qb.where('cid', cid).orderBy("created_at", 'desc').limit(1);
            })
            .fetch({require: true})
            .then(function (model) {
                var SyncForMerge = Sync.query(function (qb) {
                    qb.where('created_at', '>', model.get("created_at"));
                });
                dataMerge(SyncForMerge);
            }).otherwise(function (err) {
                if (err.message === 'EmptyResponse') {
                    dataMerge(Sync);
                } else {
                    next(err);
                }
            });


    };

    this.push = function (req, res, next) {
        var lastPush = req.body.lastpush;
        var cid = req.session.cid || CONSTANTS.DEFAULT_CID;
        var requestBody = req.body.values;
        var requestJSON;
        var current;

        if (lastPush === 'null') {
            lastPush = null;
        }
        redisClient.cacheStore.readFromStorage('lastPush', function (err, redisResponse) {
            if (err) {
                next(err);
            } else if ((redisResponse === lastPush) || (redisResponse === null)) {
                redisClient.cacheStore.readFromStorage('inProgress', function (err, redisResponse) {
                    if (err) {
                        next(err);
                    } else {
                        if (redisResponse) {
                            res.status(403).send({error: "Another Computer is Synchronizing"});
                        } else {
                            redisClient.cacheStore.writeToStorage('inProgress', true);

                            if (requestBody instanceof Array) {
                                pushParser(requestBody, function (err, response) {
                                    if (err) {
                                        redisClient.cacheStore.removeFromStorage('inProgress');
                                        return next(new Error(err));
                                    }

                                    requestJSON = _.indexBy(requestBody, "table");

                                    for (var item in requestJSON) {
                                        current = requestJSON[item];
                                        current.added = current.added ? current.added : [];
                                        current.deleted = current.deleted ? current.deleted : [];
                                        current.modified = current.modified ? current.modified : [];
                                        requestJSON[item] = {
                                            added: _.pluck(current.added, "uid"),
                                            updated: _.pluck(current.modified, "uid"),
                                            deleted: current.deleted
                                        }
                                    }

                                    Sync.insert({
                                        cid: cid,
                                        last_sync: new Date(),
                                        sync_object: requestJSON
                                    }).exec(function (err, savedModel) {
                                        if (err) {
                                            next(err);
                                        } else {
                                            redisClient.cacheStore.writeToStorage('lastPush', savedModel.get('created_at'));
                                            res.status(201).send(savedModel.getName() + ' ' + RESPONSES.WAS_CREATED);
                                        }
                                        redisClient.cacheStore.removeFromStorage('inProgress');
                                    });
                                });

                            } else {
                                redisClient.cacheStore.removeFromStorage('inProgress');
                                next(badRequests.invalidValue());
                            }
                        }
                    }
                });
            } else {
                res.status(403).send({error: 'Please Pull From Server before Push'});
            }
        });
    }

};

module.exports = Synch;