const { Pool } = require('pg')
const pool = new Pool({
  user: 'nftmptest',
  host: 'nft-marketplace-testing.cavystasz3yt.us-west-1.rds.amazonaws.com',
  database: 'nfttesting',
  password: 'xBFYJJksWWUK9BnS',
  port: 5432,
})
pool.query('SELECT NOW()', (err, res) => {
  console.log(err, res) 
  pool.end() 
})