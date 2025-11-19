const express = require('express')
const StoreController = require('../controllers')
const router = express.Router()
const auth = require('../auth')

router.post('/playlist', auth.verify, PlaylistController.createPlaylist)
router.delete('/playlist/:id', auth.verify, PlaylistController.deletePlaylistById)
router.get('/playlist', auth.verify, PlaylistController.getPlaylist)
router.get('/playlist/:id', auth.verify, PlaylistController.getPlaylistById)
router.get('/userplaylist/:userid', auth.verify, PlaylistController.getUserPlaylists)
router.get('/playlist/all', auth.verify, PlaylistController.getAllPlaylists)
router.put('/playlist/:id', auth.verify, PlaylistController.updatePlaylist)

router.post('/songs', auth.verify, SongController.createSong)
router.get('/songs', auth.verify, SongController.getTargetSong)
router.get('/songs/:id', auth.verify, SongController.getSongById)
router.put('/songs/:id', auth.verify, SongController.editSongById)
router.get('/songs/:playlistId', auth.verify, SongController.getAllSongsInPlaylist)
route.get('/userSongs/:id', auth.verify, SongController.getUserSongs)
route.delete('/songs/:id', auth.verify, SongController.deleteSongById)



module.exports = router