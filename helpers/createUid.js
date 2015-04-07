
var crypto = require('crypto');

module.exports = function () {
    var length = arguments.length;
    var callback;
    var isCallback;
    var err;
    var stringToEncrypt;
    var encryptedString;

    var myEncrypt = function (rawString) {
        return crypto.createHash('sha512').update(rawString, 'utf8').digest('hex');
    };

    if (!length) {
        return new Error('No arguments')
    }

    if (typeof(arguments[length - 1]) === 'function') {
        isCallback = true;
        if (length < 2) {
            err = new Error('Expected more arguments')
        }
        callback = arguments[length - 1];
        arguments.length = length - 1;
    }

    stringToEncrypt = Array.prototype.join.call(arguments);
    encryptedString = myEncrypt(stringToEncrypt);

    if (isCallback) {
        callback(err, encryptedString);
    } else {
        return (encryptedString);
    }
};

