const express = require('express')
const router = express.Router();
const { check, body, validationResult } = require('express-validator');
const Erc20tokenService = require('../services/erc20tokenService')
let erc20tokenServiceInstance = new Erc20tokenService();
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const upload = multer({
    storage: storage,
});

/**
 * erc20token routes
 */

/**
 *  Adds a new erc20token
 *  @params name type: name
 *  @params symbol type: description
 *  @params decimal type: string
 *  @params matic_address type: string
 *  @params ethereum_address type: string
 */

router.post('/', [
    body('name', 'A valid name is required').exists(),
    body('symbol', 'A valid sumbol is required').exists(),
    body('decimal', 'A valid decimal required').exists(),
    body('matic_address', 'A valid address is required').exists(),
    body('ethereum_address', 'A valid address is required').exists(),
], async (req, res, next) => {

    try {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }

        let erc20tokenExists = await erc20tokenServiceInstance.erc20tokenExists(req.body)

        if (erc20tokenExists) {
            return res.status(200).json({ message: 'erc20token already exists', data: erc20tokenExists })
        }

        let erc20token = await erc20tokenServiceInstance.adderc20token(req.body);
        if (erc20token) {
            return res.status(200).json({ message: 'erc20token addedd successfully', data: erc20token })
        } else {
            return res.status(400).json({ message: 'erc20token addition failed' })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal Server error.Please try again' })
    }
})


/**
 *  Gets all the erc20token details 
 */

router.get('/', async (req, res, next) => {
    try {

        let erc20tokens = await erc20tokenServiceInstance.geterc20tokens();
        if (erc20tokens) {
            return res.status(200).json({ message: 'erc20tokens retrieved successfully', data: erc20tokens })
        } else {
            return res.status(400).json({ message: 'erc20tokens retrieved failed' })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal Server error.Please try again' })
    }
})



/**
 *  Gets single erc20token detail 
 *  @param id type: integer
 */

router.get('/:id', [check('id', 'A valid id is required').exists()
], async (req, res, next) => {
    try {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }

        let erc20token = await erc20tokenServiceInstance.geterc20token(req.params);
        if (erc20token) {
            return res.status(200).json({ message: 'erc20token retrieved successfully', data: erc20token })
        } else {
            return res.status(400).json({ message: 'erc20token retrieved failed' })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal Server error.Please try again' })
    }
})


module.exports = router;