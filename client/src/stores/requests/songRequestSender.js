import axios from 'axios'
axios.defaults.withCredentials = true;
const api = axios.create({
    baseURL: 'http://localhost:4000/store',
})

export const createSong = ( title, artist, year, youtubeId, ownerEmail ) => {
    return api.post('/songs/', {
        title: title,
        artist: artist,
        year: year,
        youtubeId: youtubeId,
        ownerEmail: ownerEmail
    })
}
export const getTargetSongs = (title, artist, year) => {
    const params = {};
    if (title) params.title = title;
    if (artist) params.artist = artist;
    if (year) params.year = year;
    return api.get('/songs', { params });
}
export const getSongById = (id) => {
    return api.get(`/songs/${id}`);
}
export const editSongById = ( songId, title, artist, year, youtubeId ) => {
    return api.put(`/songs/${songId}`, {
        title: title,
        artist: artist,
        year: year,
        youtubeId: youtubeId
    })
}   
export const getAllSongsInPlaylist = (playlistId) => {
    return api.get(`/songs/playlist/${playlistId}`)
}
export const getUserSongs = (userId) => {
    return api.get(`/userSongs/${userId}`)
}
export const deleteSongById = (id) => {
    return api.delete(`/songs/${id}`)
}
export const incrementListen = (songId) => {
    return api.post(`/songs/${songId}/listen`)
}
export const searchSongs = (title, artist, year) => {
    const params = {};
    if (title) params.title = title;
    if (artist) params.artist = artist;
    if (year) params.year = year;
    return api.get('/songs', { params });
}

const apis = {
    createSong,
    getTargetSongs,
    searchSongs,
    getSongById,
    editSongById,
    getAllSongsInPlaylist,
    getUserSongs,
    deleteSongById,
    incrementListen
}

export default apis