const express = require('express')
const router = express.Router();
const { query, body, validationResult } = require('express-validator');
const UserService = require('../services/userService')
let userServiceInstance = new UserService();

/**
 * User routes
 */

/**
 *  Adds the address of a new user
 *  @params address
 */

router.post('/', [
    body('address', 'A valid ethereum address is required').exists().isLength({ min: 42, max: 42 }),
], async (req, res, next) => {

    try {

        let userExists = await userServiceInstance.userExists(req.body)

        if (userExists) {
            return res.status(200).json({ message: 'User already exists', data: userExists.id })
        }

        let userAdd = await userServiceInstance.createUser(req.body);
        if (userAdd) {
            return res.status(200).json({ message: 'User addedd successfully', data: userAdd.id })
        } else {
            return res.status(400).json({ message: 'User addition failed' })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal Server error.Please try again' })
    }
})


/**
 *  Gets all the user details 
 */

router.get('/', async (req, res, next) => {
    try {

        let users = await userServiceInstance.getUsers();
        if (users) {
            return res.status(200).json({ message: 'Users retrieved successfully', data: users })
        } else {
            return res.status(400).json({ message: 'User retrieved failed' })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal Server error.Please try again' })
    }
})

module.exports = router;