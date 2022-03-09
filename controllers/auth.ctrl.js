const authService = require('../services/auth.svc');
const constants = require('../constants');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const commonService = require('../services/common.svc');
const mailerService = require('../services/mailer.svc');

class AuthController {
    async register(req, res) {
        try {
            const user = await authService.getByEmail(req.body.email);
            if (user) {
                res.status(constants.STATUS_CODES.CONFLICT);
                res.send({ error: 'conflict', errorDescription: 'Email already exist' });
            } else {
                const hashedPassword = await bcrypt.hash(req.body.password, 5);
                req.body.password = hashedPassword;
                const user = await authService.create(req.body);
                const token = await jwt.sign({
                    userId: user._id,
                    mobile: user.mobile,
                    email: user.email
                }, constants.Secret, { expiresIn: 60 * 60 });
                res.status(constants.STATUS_CODES.SUCCESS);
                res.send({ data: { token, userId: user._id } });
            }
        } catch (err) {
            console.log(err);
            res.status(constants.STATUS_CODES.EXCEPTION)
            res.send({ error: 'server_error', errorDescription: err });
        }

    }
    async login(req, res) {
        try {
            console.log(req.body.mobile);
            const user = await authService.getByEmail(req.body.email);
            if (user) {
                const passwordCheck = await bcrypt.compare(req.body.password, user.password);
                if (passwordCheck) {
                    const token = await jwt.sign({
                        userId: user._id,
                        mobile: user.mobile,
                        email: user.email
                    }, constants.Secret, { expiresIn: 60 * 60 });
                    let role = 'user';
                    if (user.email === 'admin@yopmail.com') {
                        role = 'admin';
                    }
                    res.status(constants.STATUS_CODES.SUCCESS);
                    res.send({ data: { token, userId: user._id, role } });
                } else {
                    res.status(constants.STATUS_CODES.CONFLICT);
                    res.send({ error: 'conflict', errorDescription: 'Incorrect password' });
                }
            } else {
                res.status(constants.STATUS_CODES.CONFLICT);
                res.send({ error: 'conflict', errorDescription: 'Email is not registered' });
            }
        } catch (err) {
            console.log(err);
            res.status(constants.STATUS_CODES.EXCEPTION)
            res.send({ error: 'server_error', errorDescription: err });
        }
    }

    async sendMail(req, res) {
        try {
            const user = await authService.getByEmail(req.body.email);
            if (user) {
                const resetPasswordToken = await commonService.generateRandomString(8);
                const resetPasswordExpiry = Date.now() + 24 * 60 * 60 * 1000;
                const updatedUser = await authService.update({ id: user._id, resetPasswordToken, 
                    resetPasswordExpiry });
                const mailer = await mailerService.sendMail({
                    email: user.email, resetPasswordToken,
                    resetPasswordExpiry,
                    firstName: user.firstName,
                    lastName: user.lastName
                });
                res.status(constants.STATUS_CODES.SUCCESS);
                res.send({ data: mailer });
            } else {
                res.status(constants.STATUS_CODES.CONFLICT);
                res.send({ error: 'conflict', errorDescription: 'email not registered' });
            }
        } catch (err) {
            console.log(err);
            res.status(constants.STATUS_CODES.EXCEPTION)
            res.send({ error: 'server_error', errorDescription: err });
        }
    }
    async updatePassword(req, res) {
        try {
            const user = await authService.getByEmail(req.body.email);
            const isExpired = (new Date() <= new Date(Number(req.body.resetPasswordExpiry))) 
            ? false : true;
            if (isExpired) {
                res.status(constants.STATUS_CODES.SUCCESS);
                res.send({ error: 'invalid_request', errorDescription: 'Link expired' });
            } else if (user && user.resetPasswordToken && user.resetPasswordToken === 
                req.body.resetPasswordToken) {
                let hashedPassword = bcrypt.hashSync(req.body.password, 5);
                req.body.password = hashedPassword;
                const updatedUser = await authService.updatePassword({ id: user._id, 
                    resetPasswordExpiry: null, resetPasswordToken: null, password: hashedPassword });
                res.status(constants.STATUS_CODES.SUCCESS);
                res.send({ status: 'Updated successfully', data: updatedUser });
            } else {
                console.log(user);
            }
        } catch (error) {
            res.status(constants.STATUS_CODES.EXCEPTION);
            res.send({ error: 'server_error', errorDescription: err });
        }
    }

    async myProfile(req, res) {
        try {
            const user = await authService.byUserId(req.params.userId);
            res.status(constants.STATUS_CODES.SUCCESS);
            res.send({status: 'success', user});
        } catch (error) {
            res.status(constants.STATUS_CODES.EXCEPTION);
            res.send({ error: 'server_error', errorDescription: err });
        }
    }


}

module.exports = new AuthController();