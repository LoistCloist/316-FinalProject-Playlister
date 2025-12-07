const express = require('express')
const router = express.Router()
const AuthController = require('../controllers/auth-controller')

router.post('/registerUser', AuthController.registerUser)
router.post('/loginUser', AuthController.loginUser)
router.get('/logoutUser', AuthController.logoutUser)
router.get('/getLoggedIn', AuthController.getLoggedIn)
router.put('/editUser', AuthController.editUser)

module.exports = router