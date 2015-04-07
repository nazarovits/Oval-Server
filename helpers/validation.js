/**
 * Created by User on 07.04.2015.
 */

function Check(validJSON) {
    var self = this;

    this.run = function (options) {
        this.saveModelOptions = options;
        this.errors = {};
        for (var key in validJSON) {
            validJSON[key].forEach(function (element) {
                try {
                    var result = self[element](key, options[key]);
                    if (key in options) {
                        self.saveModelOptions[key] = result;
                    }
                } catch (err) {
                    self.errors[key] = err;
                }
            })
        };
        return {"options": self.saveModelOptions, "errors": self.errors};
    };
};

Check.prototype = {
    required: function (key, val) {
        if (val === undefined && val !== null) {
            throw new Error('The ' + key + ' required')
        } else {
            return val;
        };
    },

    isEmail: function (key, val) {
        var regexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if (regexp.test(val)) {
            return val;
        } else {
            throw new Error('The ' + key + ' must be a valid email');
        }
    },

    isInt: function (key, val) {
        if (!isNaN(+val)) {
            if (val === null) {
                return null;
            } else {
                return parseInt(val);
            };
        } else {
            throw new Error('The ' + key + ' must be int');
        };
    },
    isFloat: function (key, val) {
        if (!isNaN(+val)) {
            return parseFloat(val);
        } else {
            throw new Error('The ' + key + ' must be float');
        };
    },
    isDate: function (key, val) {
        var date = new Date(val);
        if (!isNaN(date.valueOf())) {
            return date;
        }
        else {
            throw new Error('The ' + key + ' must be a valid date');
        }
    },
    isBoolean: function (key, val) {
        if (typeof(val) === 'boolean') {
            return val;
        } else if (val === 'true' || val === 'false') {
            return Boolean(val);
        } else {
            throw new Error('The ' + key + ' must be boolean');
        }
    },
    isTime: function (key, val) {
        var regexp = /^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]:[0-5][0-9]$/;
        if (regexp.test(val)) {
            return val;
        } else {
            throw new Error('The ' + key + ' must be a time');
        }
    }
}

module.exports.Check = Check;