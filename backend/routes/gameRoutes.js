const express = require('express');
const router = express.Router()
const  {updateresult,getLeaderBoard,addstrategy,getstrategy} = require('../controllers/gameController')


router.get('/getLeaderBoard', getLeaderBoard)
router.get('/getstrategy', getstrategy)
router.post('/updateresult', updateresult)
router.post('/addstrategy', addstrategy)

module.exports = router