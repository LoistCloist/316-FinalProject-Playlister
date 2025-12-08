import axios from 'axios'
axios.defaults.withCredentials = true;
const api = axios.create({
    baseURL: 'http://localhost:4000/store',
    withCredentials: true
})

export const createPlaylist = (playlistName, userName, email, songs) => {
    return api.post('/playlist/', {
        playlistName: playlistName,
        userName: userName,
        email: email,
        songs: songs,
    })
}
export const deletePlaylistById = (id) => {
    return api.delete(`/playlist/${id}`);
}
export const getPlaylists = (playlistName, userName, title, artist, year) => {
    // Use GET request with query parameters
    const params = new URLSearchParams();
    if (playlistName) params.append('playlistName', playlistName);
    if (userName) params.append('userName', userName);
    if (title) params.append('title', title);
    if (artist) params.append('artist', artist);
    if (year) params.append('year', year);
    return api.get(`/playlist/search?${params.toString()}`);
}
export const getPlaylistById = (id) => {
    return api.get(`/playlist/${id}`)
}   
export const getUserPlaylists = (userid) => {
    // Add timestamp to bust any potential caching
    const timestamp = new Date().getTime();
    return api.get(`userplaylist/${userid}?t=${timestamp}`)
}
export const getAllPlaylists = () => {
    return api.get('/allplaylists')
}
export const updatePlaylist = (id, playlistName, userName, email, songs) => {
    return api.put(`/playlist/${id}`, {
        playlistName: playlistName,
        userName: userName,
        email: email,
        songs: songs,
    })
}
export const addListener = (playlistId) => {
    return api.post(`/playlist/${playlistId}/listener`)
}
export const addSongToPlaylist = (playlistId, songId) => {
    return api.post(`/playlist/${playlistId}/song`, {
        songId: songId
    })
}

const apis = {
    createPlaylist,
    deletePlaylistById,
    getPlaylists,
    getPlaylistById,
    getUserPlaylists,
    getAllPlaylists,
    updatePlaylist,
    addListener,
    addSongToPlaylist
}

export default apis;