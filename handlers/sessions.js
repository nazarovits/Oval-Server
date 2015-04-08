var Session = function (PostGre) {

    this.register = function (req, res, options) {
        if (req.session && options && req.session.cid === options.cid) {
            return res.status(200).send({success: "Login successful", cid: options.id});
        }
        req.session.loggedIn = true;
        req.session.cid = options.cid;
        req.session.login = options.email;
        res.status(200).send({success: "Login successful", cid: options.id});
    };

    this.kill = function (req, res, next) {
        if (req.session) {
            req.session.destroy();
        }
        res.status(200).send({success: "Logout successful"});
    };

    this.authenticatedUser = function (req, res, next) {
        if (req.session && req.session.cid) {
            next();
        } else {
            var err = new Error('UnAuthorized');
            err.status = 401;
            next(err);
        }
    };

    this.isAuthenticatedUser = function (req, res, next) {
        if (req.session && req.session.uId && req.session.loggedIn) {
            res.status(200).send();
        } else {
            var err = new Error('UnAuthorized');
            err.status = 401;
            next(err);
        }
    };

};

module.exports = Session;