const express = require('express')
const PlaylistController = require('../controllers/playlist-store-controller')
const router = express.Router()
const auth = require('../auth')

router.post('/playlist', auth.verify, PlaylistController.createPlaylist)
router.delete('/playlist/:id', auth.verify, PlaylistController.deletePlaylistById)
router.post('/playlist/search', auth.verify, PlaylistController.getPlaylists)
router.get('/playlist/:id', auth.verify, PlaylistController.getPlaylistById)
router.get('/userplaylist/:userid', auth.verify, PlaylistController.getUserPlaylists)
router.get('/allplaylists', auth.verify, PlaylistController.getAllPlaylists)
router.put('/playlist/:id', auth.verify, PlaylistController.updatePlaylist)

module.exports = router