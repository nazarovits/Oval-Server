var TABLES = require('../constants/tables');

var Models = function (PostGre) {
    "use strict";
    var _ = require('underscore');

    var Model = PostGre.Model.extend({
        hasTimestamps: true,
        getName: function () {
            return this.tableName.replace(/s$/, '')
        }
    }, {
        fetchMe: function (queryObject, optionsObject) {
            return this.forge(queryObject).fetch(optionsObject);
        },
        insert: function (requestBody, customBody, saveOptions) {
            requestBody = _.mapObject(requestBody, function (val, key) {
                if (val === 'null') {
                    return null;
                }
                return val;
            });
            return this.forge(requestBody).save(customBody, saveOptions);
        }
    });

    /*In lowerCase and with 's prefix, because we dynamically load this model from Postgre.Models based on request tableName,
     which is in lowerCase too

     Request Example: {
     "table": "members",
     "deleted": [
     "a234dc34",
     "34bcf421",
     "4bb2142a"
     ],
     "modified": [

     */

    /*this[TABLES.KITS] = require('./kits')(PostGre, Model);
    this[TABLES.SYNCHRONIZES.withoutUnderscore()] = require('./synchronize')(PostGre, Model);
    this[TABLES.KIT_ORDERS.withoutUnderscore()] = require('./kitOrders')(PostGre, Model);
    this[TABLES.LOCATIONS.withoutUnderscore()] = require('./locations')(PostGre, Model);
    this[TABLES.MEMBERS.withoutUnderscore()] = require('./members')(PostGre, Model);
    this[TABLES.MARSHALLING_ACTIVITIES.withoutUnderscore()] = require('./marshallingActivities')(PostGre, Model);
    this[TABLES.MEMBERSHIP_FEES.withoutUnderscore()] = require('./membershipFees')(PostGre, Model);
    this[TABLES.RACE_COURSES.withoutUnderscore()] = require('./raceCourses')(PostGre, Model);
    this[TABLES.RACE_COURSES_ADVANCED.withoutUnderscore()] = require('./raceCoursesAdvanced')(PostGre, Model);
    this[TABLES.RACE_EVENTS.withoutUnderscore()] = require('./raceEvents')(PostGre, Model);
    this[TABLES.RACE_REGISTRATION.withoutUnderscore()] = require('./raceRegistrations')(PostGre, Model);
    this[TABLES.RACE_RESULTS.withoutUnderscore()] = require('./raceResults')(PostGre, Model);
    this[TABLES.SERIES.withoutUnderscore()] = require('./series')(PostGre, Model);
    this[TABLES.TIME_TAGS.withoutUnderscore()] = require('./timeTags')(PostGre, Model);
    this[TABLES.TIME_TAGS_RETURNED.withoutUnderscore()] = require('./timeTagsReturned')(PostGre, Model);
    this[TABLES.USERS.withoutUnderscore()] = require('./users')(PostGre, Model);*/
};
module.exports = Models;