const express = require('express')
const PlaylistController = require('../controllers/playlist-store-controller')
const router = express.Router()
const auth = require('../auth')

router.post('/playlist', auth.verify, PlaylistController.createPlaylist)
router.delete('/playlist/:id', auth.verify, PlaylistController.deletePlaylistById)
router.get('/playlist/search', PlaylistController.getPlaylists) // Public - guests can search
router.get('/playlist/:id', PlaylistController.getPlaylistById) // Public - guests can view
router.get('/userplaylist/:userid', auth.verify, PlaylistController.getUserPlaylists) // Requires auth - user's own playlists
router.get('/allplaylists', PlaylistController.getAllPlaylists) // Public - guests can view all
router.put('/playlist/:id', auth.verify, PlaylistController.updatePlaylist)
router.post('/playlist/:id/listener', PlaylistController.addListener) // Public - guests and users can add themselves as listeners

module.exports = router