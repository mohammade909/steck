const express = require('express');
const router = express.Router()
const  {getListOfUsers,getUsersById,updateUser,deleteUser,getUsersByEmail,updateamount} = require('../controllers/usersController')


router.get('/list', getListOfUsers)
router.post('/byemail', getUsersByEmail)
router.post('/addamount', updateamount)
router.route('/:id')
  .get(getUsersById)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router