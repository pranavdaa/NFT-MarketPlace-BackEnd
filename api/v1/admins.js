const express = require('express')
const router = express.Router({ mergeParams: true })
const { check, validationResult } = require('express-validator');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const adminService = require('../services/admin')
let adminServiceInstance = new adminService();
let config = require('../../config/config')


/**
 * admin routes
 */

/**
 *   Admin Login
 *  @params username String
 *  @params signature String
 */

router.post('/login', [
    // check('username', 'A valid username is required').exists(),
    // check('password', 'A valid password is required').exists()
],
    async (req, res) => {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: errors.array() });
            }

            let admin = await adminServiceInstance.getAdmin(req.body);
            if (admin) {

                let passwordCheck = await bcrypt.compareSync(req.body.password, admin.password);
                if (passwordCheck) {
                    var token = jwt.sign({ username: admin.username }, config.secret, {
                        expiresIn: "24h"
                    });
                    return res.status(200).json({ message: 'Successfully Logged In', data: admin, auth_token: token })
                } else {
                    return res.status(401).json({ message: 'Invalid Credentials' })
                }
            } else {
                return res.status(401).json({ message: 'Invalid credentials' })
            }

        } catch (err) {
            console.log(err)
            return res.status(500).json({ message: 'Internal Server error. Please try again!' })
        }
    })


module.exports = router;
