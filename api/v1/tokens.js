const express = require('express')
const router = express.Router();
const { check, validationResult } = require('express-validator');

/**
 * Token routes
 */

/**
 *  Gets all the token details 
 */

router.get('/', async (req, res) => {
  try {

  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error.Please try again' })
  }
})



/**
 *  Gets single token detail 
 *  @param id type: integer
 */

router.get('/:tokenId', [
  check('tokenId', 'A valid id is required').exists()
], async (req, res) => {
  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error.Please try again' })
  }
})

module.exports = router;
