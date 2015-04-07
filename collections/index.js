var TABLES = require('../constants/tables');

var Collections = function (PostGre) {
    //console.log(PostGre.Models);
    var Collection = PostGre.Collection.extend({});

    /*this[TABLES.SYNCHRONIZES.withoutUnderscore()] = require('./synchronize')(PostGre, Collection);
    this[TABLES.KIT_ORDERS.withoutUnderscore()] = require('./kitOrders')(PostGre, Collection);
    this[TABLES.LOCATIONS.withoutUnderscore()] = require('./locations')(PostGre, Collection);
    this[TABLES.MEMBERS.withoutUnderscore()] = require('./members')(PostGre, Collection);
    this[TABLES.USERS.withoutUnderscore()] = require('./users')(PostGre, Collection);
    this[TABLES.MARSHALLING_ACTIVITIES.withoutUnderscore()] = require('./marshallingActivities')(PostGre, Collection);
    this[TABLES.MEMBERSHIP_FEES.withoutUnderscore()] = require('./membershipFees')(PostGre, Collection);
    this[TABLES.RACE_COURSES.withoutUnderscore()] = require('./raceCourses')(PostGre, Collection);
    this[TABLES.RACE_COURSES_ADVANCED.withoutUnderscore()] = require('./raceCoursesAdvanced')(PostGre, Collection);
    this[TABLES.RACE_EVENTS.withoutUnderscore()] = require('./raceEvents')(PostGre, Collection);
    this[TABLES.RACE_REGISTRATION.withoutUnderscore()] = require('./raceRegistrations')(PostGre, Collection);
    this[TABLES.RACE_RESULTS.withoutUnderscore()] = require('./raceResults')(PostGre, Collection);
    this[TABLES.SERIES.withoutUnderscore()] = require('./series')(PostGre, Collection);
    this[TABLES.TIME_TAGS.withoutUnderscore()] = require('./timeTags')(PostGre, Collection);
    this[TABLES.TIME_TAGS_RETURNED.withoutUnderscore()] = require('./timeTagsReturned')(PostGre, Collection);*/
};
module.exports = Collections;