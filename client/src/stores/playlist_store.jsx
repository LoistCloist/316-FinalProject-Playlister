import { createContext, useContext, useState, useRef } from 'react'
import { jsTPS, TRANSACTION_STACK_EXCEPTION } from "jstps"
import AuthContext from '../auth'
import playlistRequestSender from './requests/playlistRequestSender'
import songRequestSender from './requests/songRequestSender'
import DuplicateSongInPlaylist_Transaction from '../transactions/DuplicateSongInPlaylist_Transaction'
import RemoveSongFromPlaylist_Transaction from '../transactions/RemoveSongFromPlaylist_Transaction'

const PlaylistStoreContext = createContext({});
console.log("created PlaylistStoreContext");

const PlaylistStoreActionType = {
    CREATE_NEW_LIST: "CREATE_NEW_LIST",
    MARK_LIST_FOR_DELETION: "MARK_LIST_FOR_DELETION",
    SET_CURRENT_LIST: "SET_CURRENT_LIST",
    EDIT_PLAYLIST: "EDIT_PLAYLIST",
    HIDE_MODALS: "HIDE_MODALS",
    SORT_PLAYLISTS: "SORT_PLAYLISTS",
    DUPLICATE_PLAYLIST: "DUPLICATE_PLAYLIST",
    DELETE_PLAYLIST: "DELETE_PLAYLIST",
    PLAY_PLAYLIST: "PLAY_PLAYLIST",
    FIND_PLAYLIST: "FIND_PLAYLIST",
    FIND_PLAYLIST_BY_ID: "FIND_PLAYLIST_BY_ID",
    GET_ALL_PLAYLISTS: "GET_ALL_PLAYLISTS",
    UPDATE_PLAYLIST_IN_LIST: "UPDATE_PLAYLIST_IN_LIST",
}

const tps = new jsTPS();

const CurrentModal = {
    NONE: "NONE",
    DELETE_PLAYLIST_MODAL: "DELETE_PLAYLIST_MODAL",
    VERIFY_REMOVE_sONG_MODAL: "VERIFY_REMOVE_SONG_MODAL",
    PLAY_PLAYLIST_MODAL: "PLAY_PLAYLIST_MODAL",
    EDIT_SONG_MODAL: "EDIT_SONG_MODAL",
    SELECT_AVATAR_IMAGE_MODAL: "SELECT_AVATAR_IMAGE_MODAL",
    EDIT_PLAYLIST_MODAL: "EDIT_PLAYLIST_MODAL",
    DUPLICATE_PLAYLIST_MODAL: "DUPLICATE_PLAYLIST_MODAL"
}

function PlaylistStoreContextProvider(props) {
    const [ playlistStore, setPlaylistStore ] = useState({
        currentModal: CurrentModal.NONE,
        playlists: [],
        currentList: null,
        currentListSongs: [], // Songs in the currently edited playlist
        currentListName: '', // Name of the currently edited playlist
        newListCounter: 0,
        listMarkedForDeletion: null,
        playlistsRefreshTrigger: 0 // Trigger to force re-render when playlists are updated
    })

    const { auth } = useContext(AuthContext);
    const duplicateCountRef = useRef(new Map()); // Track duplicate count per song title

    const playlistStoreReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case PlaylistStoreActionType.CREATE_NEW_LIST: {
                // If currentList is provided, open the edit modal for it
                const shouldOpenEditModal = payload.currentList !== null && payload.currentList !== undefined;
                const newPlaylists = payload.currentList
                    ? [...playlistStore.playlists, payload.currentList]
                    : playlistStore.playlists;
                return setPlaylistStore({
                    ...playlistStore,
                    currentModal: shouldOpenEditModal ? CurrentModal.EDIT_PLAYLIST_MODAL : CurrentModal.NONE,
                    currentList: payload.currentList || null,
                    playlists: newPlaylists,
                    newListCounter: payload.newListCounter !== undefined ? payload.newListCounter : playlistStore.newListCounter + 1,
                    listMarkedForDeletion: null
                })
            }
            case PlaylistStoreActionType.MARK_LIST_FOR_DELETION: {
                return setPlaylistStore({
                    ...playlistStore,
                    currentModal: CurrentModal.DELETE_PLAYLIST_MODAL,
                    currentList: payload.list,
                    listMarkedForDeletion: payload.list
                })
            }
            case PlaylistStoreActionType.SET_CURRENT_LIST: {
                return setPlaylistStore({
                    ...playlistStore,
                    currentList: payload.list
                })
            }
            case PlaylistStoreActionType.EDIT_PLAYLIST: {
                return setPlaylistStore({
                    ...playlistStore,
                    currentModal: CurrentModal.EDIT_PLAYLIST_MODAL,
                    currentList: payload.list
                })
            }
            case PlaylistStoreActionType.HIDE_MODALS: {
                return setPlaylistStore({
                    ...playlistStore,
                    currentModal: CurrentModal.NONE,
                    currentList: null,
                    listMarkedForDeletion: null
                })
            }
            case PlaylistStoreActionType.SORT_PLAYLISTS: {
                return setPlaylistStore({
                    ...playlistStore,
                    playlists: payload.playlists
                })
            }
            case PlaylistStoreActionType.DUPLICATE_PLAYLIST: {
                return setPlaylistStore({
                    ...playlistStore,
                    currentModal: CurrentModal.DUPLICATE_PLAYLIST_MODAL,
                    currentList: payload.list
                })
            }
            case PlaylistStoreActionType.DELETE_PLAYLIST: {
                return setPlaylistStore({
                    ...playlistStore,
                    currentModal: CurrentModal.DELETE_PLAYLIST_MODAL,
                    listMarkedForDeletion: payload.list
                })
            }
            case PlaylistStoreActionType.PLAY_PLAYLIST: {
                return setPlaylistStore({
                    ...playlistStore,
                    currentModal: CurrentModal.PLAY_PLAYLIST_MODAL,
                    currentList: payload.list
                })
            }
            case PlaylistStoreActionType.FIND_PLAYLIST: {
                return setPlaylistStore({
                    ...playlistStore,
                    currentModal: CurrentModal.NONE,
                    playlists: payload.playlists,
                    currentList: null
                })
            }
            case PlaylistStoreActionType.FIND_PLAYLIST_BY_ID: {
                return setPlaylistStore({
                    ...playlistStore,
                    currentModal: CurrentModal.NONE,
                    currentList: payload.list
                })
            }
            case PlaylistStoreActionType.GET_ALL_PLAYLISTS: {
                const newPlaylists = payload.playlists ? [...payload.playlists] : [];
                
                return setPlaylistStore(prevStore => {
                    if (prevStore.currentModal === CurrentModal.NONE) {
                        return {
                            ...prevStore,
                            playlists: newPlaylists,
                            currentList: null,
                            listMarkedForDeletion: null
                        };
                    }
                    
                    const currentListExists = prevStore.currentList && 
                        newPlaylists.some(p => p.playlistId === prevStore.currentList.playlistId);
                    const listMarkedExists = prevStore.listMarkedForDeletion && 
                        newPlaylists.some(p => p.playlistId === prevStore.listMarkedForDeletion.playlistId);
                    
                    const shouldCloseDeleteModal = !listMarkedExists && 
                        prevStore.currentModal === CurrentModal.DELETE_PLAYLIST_MODAL;
                    
                    const shouldCloseEditModal = !currentListExists && 
                        prevStore.currentModal === CurrentModal.EDIT_PLAYLIST_MODAL;
                    
                    let newModal = prevStore.currentModal;
                    if (shouldCloseDeleteModal || shouldCloseEditModal) {
                        newModal = CurrentModal.NONE;
                    }
                    
                    const preservedCurrentList = (currentListExists && newModal === CurrentModal.EDIT_PLAYLIST_MODAL) 
                        ? prevStore.currentList : null;
                    
                    return {
                        ...prevStore,
                        playlists: newPlaylists,
                        currentList: preservedCurrentList,
                        listMarkedForDeletion: (listMarkedExists && newModal === CurrentModal.DELETE_PLAYLIST_MODAL) 
                            ? prevStore.listMarkedForDeletion : null,
                        currentModal: newModal
                    };
                });
            }
            case PlaylistStoreActionType.UPDATE_PLAYLIST_IN_LIST: {
                return setPlaylistStore(prevStore => {
                    const updatedPlaylists = prevStore.playlists.map(playlist => 
                        playlist.playlistId === payload.playlist.playlistId ? payload.playlist : playlist
                    );
                    
                    // Preserve currentList if modal is ope
                    const isEditModal = prevStore.currentModal === CurrentModal.EDIT_PLAYLIST_MODAL;
                    const isPlayModal = prevStore.currentModal === CurrentModal.PLAY_PLAYLIST_MODAL;
                    
                    if (!isEditModal && !isPlayModal) {
                        return {
                            ...prevStore,
                            playlists: updatedPlaylists,
                            currentList: null
                        };
                    }
                    
                    const shouldUpdateCurrentList = prevStore.currentList && 
                        prevStore.currentList.playlistId === payload.playlist.playlistId;
                    
                    return {
                        ...prevStore,
                        playlists: updatedPlaylists,
                        currentList: shouldUpdateCurrentList ? payload.playlist : prevStore.currentList
                    };
                });
            }
            case PlaylistStoreActionType.SET_CURRENT_LIST_SONGS: {
                return setPlaylistStore({
                    ...playlistStore,
                    currentListSongs: payload.songs ? [...payload.songs] : []
                })
            }
            case PlaylistStoreActionType.SET_CURRENT_LIST_NAME: {
                return setPlaylistStore({
                    ...playlistStore,
                    currentListName: payload.name || ''
                })
            }
            case PlaylistStoreActionType.ADD_SONG_TO_PLAYLIST: {
                const newSongs = [...playlistStore.currentListSongs, payload.song];
                return setPlaylistStore({
                    ...playlistStore,
                    currentListSongs: newSongs
                })
            }
            case PlaylistStoreActionType.REMOVE_SONG_FROM_PLAYLIST: {
                const newSongs = playlistStore.currentListSongs.filter(
                    song => song.songId !== payload.songId
                );
                return setPlaylistStore({
                    ...playlistStore,
                    currentListSongs: newSongs
                })
            }
            default:
                return playlistStore;
        }
    }
    const createNewList = async function() {

        const playlistName = "Untitled Playlist" + (playlistStore.newListCounter + 1);
        const userName = auth.user?.userName || '';
        const email = auth.user?.email || '';
        const songs = [];
        const response = await playlistRequestSender.createPlaylist(
            playlistName,
            userName,
            email,
            songs
        );
        if (response.status === 200 && response.data.success) {
            const newPlaylist = {
                playlistId: response.data.playlistId,
                playlistName: playlistName,
                userName: userName,
                email: email,
                songs: songs,
                userAvatar: auth.user?.avatar || null
            };
            
            // Update the counter, set current list, and open edit modal
            playlistStoreReducer({
                type: PlaylistStoreActionType.CREATE_NEW_LIST,
                payload: {
                    newListCounter: playlistStore.newListCounter + 1,
                    currentList: newPlaylist
                }
            });
        }
        else {
            console.error('Failed to create new playlist:', response.data);
            alert('Failed to create new playlist');
            return;
        }
        
    }
    const markListForDeletion = function(list) {
        playlistStoreReducer({
            type: PlaylistStoreActionType.MARK_LIST_FOR_DELETION,
            payload: { list: list }
        });
    }

    const setCurrentList = function(list) {
        playlistStoreReducer({
            type: PlaylistStoreActionType.SET_CURRENT_LIST,
            payload: { list: list }
        });
    }

    const editPlaylist = function(list) {
        playlistStoreReducer({
            type: PlaylistStoreActionType.EDIT_PLAYLIST,
            payload: { list: list }
        });
    }

    const updatePlaylistInList = function(playlist) {
        playlistStoreReducer({
            type: PlaylistStoreActionType.UPDATE_PLAYLIST_IN_LIST,
            payload: { playlist: playlist }
        });
    }

    const hideModals = function() {
        playlistStoreReducer({
            type: PlaylistStoreActionType.HIDE_MODALS,
            payload: {}
        });
    }

    const sortPlaylists = function(sortBy, sortOrder) {
        const sortedPlaylists = [...playlistStore.playlists].sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];
            
            // Handle string comparison
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            // Compare values
            let comparison = 0;
            if (aValue > bValue) {
                comparison = 1;
            } else if (aValue < bValue) {
                comparison = -1;
            }
            
            // Reverse for descending order
            return sortOrder === 'asc' ? comparison : -comparison;
        });
        playlistStoreReducer({
            type: PlaylistStoreActionType.SORT_PLAYLISTS,
            payload: { playlists: sortedPlaylists }
        });
    }

    const duplicatePlaylist = function(list) {
        playlistStoreReducer({
            type: PlaylistStoreActionType.DUPLICATE_PLAYLIST,
            payload: { list: list }
        });
    }

    const deletePlaylist = async function(list) {
        if (!list || !list.playlistId) {
            console.error('Cannot delete playlist: invalid playlist data');
            return;
        }
        try {
            const response = await playlistRequestSender.deletePlaylistById(list.playlistId);
            if (response.status === 200 && response.data.success) {
                playlistStoreReducer({
                    type: PlaylistStoreActionType.HIDE_MODALS,
                    payload: {
                        listMarkedForDeletion: null,
                        currentList: null
                    }
                });
                await loadUserPlaylists();
                await new Promise(resolve => setTimeout(resolve, 100));
            } else {
                console.error('Failed to delete playlist:', response.data);
                alert('Failed to delete playlist');
            }
        } catch (error) {
            console.error('Error deleting playlist:', error);
            alert('Error deleting playlist');
        }
    }

    const playPlaylist = function(list) {
        playlistStoreReducer({
            type: PlaylistStoreActionType.PLAY_PLAYLIST,
            payload: { list: list }
        });
    }

    const findPlaylist = function(playlists) {
        playlistStoreReducer({
            type: PlaylistStoreActionType.FIND_PLAYLIST,
            payload: { playlists: playlists }
        });
    }

    const findPlaylistById = function(list) {
        playlistStoreReducer({
            type: PlaylistStoreActionType.FIND_PLAYLIST_BY_ID,
            payload: { list: list }
        });
    }

    const getAllPlaylists = function(playlists) {
        playlistStoreReducer({
            type: PlaylistStoreActionType.GET_ALL_PLAYLISTS,
            payload: { playlists: playlists }
        });
    }

    const loadAllPlaylists = async function(clearModalState = false) {
        if (!playlistStore) {
            return;
        }
        try {
            if (clearModalState) {
                playlistStoreReducer({
                    type: PlaylistStoreActionType.HIDE_MODALS,
                    payload: {}
                });
                await new Promise(resolve => setTimeout(resolve, 0));
            }
            
            const response = await playlistRequestSender.getAllPlaylists();
            if (response.status === 200 && response.data.success) {
                getAllPlaylists(response.data.playlists || []);
                setPlaylistStore(prevStore => {
                    return {
                        ...prevStore,
                        playlistsRefreshTrigger: prevStore.playlistsRefreshTrigger + 1
                    };
                });
            }
        } catch (error) {
            console.error("Error loading all playlists:", error);
        }
    }

    const loadUserPlaylists = async function(clearModalState = false) {
        if (!auth.loggedIn || !auth.user?.userId) {
            // For guests, don't load playlists leave empty until they search
            if (clearModalState) {
                playlistStoreReducer({
                    type: PlaylistStoreActionType.HIDE_MODALS,
                    payload: {}
                });
            }
            getAllPlaylists([]);
            return;
        }
        if (!playlistStore) {
            return;
        }
        try {
            if (clearModalState) {
                playlistStoreReducer({
                    type: PlaylistStoreActionType.HIDE_MODALS,
                    payload: {}
                });
                await new Promise(resolve => setTimeout(resolve, 0));
            }
            
            const response = await playlistRequestSender.getUserPlaylists(auth.user.userId);
            if (response.status === 200 && response.data.success) {
                getAllPlaylists(response.data.playlists || []);
                setPlaylistStore(prevStore => {
                    return {
                        ...prevStore,
                        playlistsRefreshTrigger: prevStore.playlistsRefreshTrigger + 1
                    };
                });
            }
        } catch (error) {
            console.error("Error loading user playlists:", error);
        }
    }

    const searchPlaylists = async function(playlistName, userName, title, artist, year) {
        try {
            if (!playlistName && !userName && !title && !artist && !year) {
                await loadUserPlaylists();
                return;
            }
            
            const response = await playlistRequestSender.getPlaylists(
                playlistName || undefined,
                userName || undefined,
                title || undefined,
                artist || undefined,
                year || undefined
            );
            if (response.status === 200 && response.data.success) {
                // Replace playlists array with search results
                getAllPlaylists(response.data.playlists || []);
            } else {
                getAllPlaylists([]);
            }
        } catch (error) {
            console.error("Failed to search playlists:", error);
            if (error.response?.status === 404 || error.response?.status === 400) {
                getAllPlaylists([]);
            } else {
                alert('Error searching playlists');
            }
        }
    }

    const undo = function() {
        try {
            if (tps.hasTransactionToUndo()) {
                tps.undoTransaction();
            } else {
                console.warn('[PLAYLIST STORE] No transactions to undo');
            }
        } catch (error) {
            if (error === TRANSACTION_STACK_EXCEPTION) {
                console.warn('[PLAYLIST STORE] No transactions to undo (caught exception)');
            } else {
                console.error('[PLAYLIST STORE] Error undoing transaction:', error);
                throw error;
            }
        }
    }

    const redo = function() {
        try {
            if (tps.hasTransactionToDo()) {
                tps.doTransaction();
            } else {
                console.warn('[PLAYLIST STORE] No transactions to redo');
            }
        } catch (error) {
            if (error === TRANSACTION_STACK_EXCEPTION) {
                console.warn('[PLAYLIST STORE] No transactions to redo (caught exception)');
            } else {
                console.error('[PLAYLIST STORE] Error redoing transaction:', error);
                throw error;
            }
        }
    }
    const addDuplicateSongInPlaylistTransaction = function(songId) {
        try {
            let transaction = new DuplicateSongInPlaylist_Transaction(this, songId);
            tps.processTransaction(transaction);
        } catch (error) {
            console.error('[PLAYLIST STORE] Error adding duplicate song transaction:', error);
            throw error;
        }
    }
    const addRemoveSongFromPlaylistTransaction = function(song) {
        try {
            let transaction = new RemoveSongFromPlaylist_Transaction(this, song);
            tps.processTransaction(transaction);
        } catch (error) {
            console.error('[PLAYLIST STORE] Error adding remove song transaction:', error);
            throw error;
        }
    }

    const setCurrentListSongs = function(songs) {
        playlistStoreReducer({
            type: PlaylistStoreActionType.SET_CURRENT_LIST_SONGS,
            payload: { songs: songs }
        });
    }

    const setCurrentListName = function(name) {
        playlistStoreReducer({
            type: PlaylistStoreActionType.SET_CURRENT_LIST_NAME,
            payload: { name: name }
        });
    }

    const addSongToPlaylist = async function(songId) {
        try {
            const response = await songRequestSender.getSongById(songId);
            if (response.status === 200 && response.data.success && response.data.song) {
                const song = response.data.song;
                playlistStoreReducer({
                    type: PlaylistStoreActionType.ADD_SONG_TO_PLAYLIST,
                    payload: { song: song }
                });
            } else {
                console.error('Failed to fetch song by ID:', songId);
                throw new Error('Failed to fetch song');
            }
        } catch (error) {
            console.error('Error fetching song by ID:', error);
            throw error;
        }
    }

    const removeSongFromPlaylist = async function(songId) {
        try {
            const response = await songRequestSender.getSongById(songId);
            if (response.status === 200 && response.data.success && response.data.song) {
                const song = response.data.song;
                playlistStoreReducer({
                    type: PlaylistStoreActionType.REMOVE_SONG_FROM_PLAYLIST,
                    payload: { songId: song.songId }
                });
                addRemoveSongFromPlaylistTransaction(song);
            } else {
                console.error('Failed to fetch song by ID:', songId);
                throw new Error('Failed to fetch song');
            }
        } catch (error) {
            console.error('Error fetching song by ID:', error);
            throw error;
        }
    }

    const duplicateSong = async function(song) {
        if (!auth.loggedIn || !auth.user) {
            throw new Error('You must be logged in to duplicate songs');
        }

        try {
            // Get or increment duplicate count for this song title
            const baseTitle = song.title || 'Untitled';
            const currentCount = duplicateCountRef.current.get(baseTitle) || 0;
            const newCount = currentCount + 1;
            duplicateCountRef.current.set(baseTitle, newCount);
            
            const newTitle = `${baseTitle} ${newCount}`;
            
            // Deep clone the song and create a new song entry in the database
            const response = await songRequestSender.createSong(
                newTitle,
                song.artist || '',
                song.year || '',
                song.youtubeId || '',
                auth.user.email
            );
            
            if (response.status === 200 && response.data.success && response.data.song) {
                const newSong = response.data.song;
                addDuplicateSongInPlaylistTransaction(newSong.songId);
                return newSong;
            } else {
                throw new Error('Failed to create duplicate song');
            }
        } catch (error) {
            console.error('Error duplicating song:', error);
            throw error;
        }
    }

    const savePlaylistChanges = async function(playlistName, songs) {
        const currentPlaylist = playlistStore.currentList;
        if (!currentPlaylist) {
            throw new Error('No playlist selected');
        }

        if (!auth.loggedIn || !auth.user) {
            throw new Error('You must be logged in to save playlist changes');
        }

        try {
            const processedSongs = await Promise.all(songs.map(async (song) => {
                // Check if this is a duplicated song with a temporary ID
                if (song.songId && song.songId.startsWith('temp-')) {
                    const response = await songRequestSender.createSong(
                        song.title || 'Untitled',
                        song.artist || '',
                        song.year || '',
                        song.youtubeId || '',
                        auth.user.email
                    );
                    
                    if (response.status === 200 && response.data.success && response.data.song) {
                        return response.data.song;
                    } else {
                        throw new Error(`Failed to create duplicate song: ${song.title}`);
                    }
                }
                return song;
            }));

            // Extract song IDs (now all should be real IDs)
            const songIds = processedSongs.map(song => song.songId);
            
            // Update the playlist with the processed songs
            const response = await playlistRequestSender.updatePlaylist(
                currentPlaylist.playlistId,
                playlistName,
                currentPlaylist.userName,
                currentPlaylist.email || auth.user?.email,
                songIds
            );

            if (response.status === 200 && response.data.success) {
                //  update the playlist in the local array
                const updatedPlaylist = {
                    ...currentPlaylist,
                    playlistName: playlistName,
                    songs: processedSongs
                };
                updatePlaylistInList(updatedPlaylist);
                
                hideModals();
                
                await loadUserPlaylists(true);
            } else {
                console.error('Failed to update playlist:', response.data);
                throw new Error('Failed to update playlist');
            }
        } catch (error) {
            console.error('Error updating playlist:', error);
            throw error;
        }
    }

    const playlistStoreWithMethods = {
        ...playlistStore,
        createNewList,
        markListForDeletion,
        setCurrentList,
        editPlaylist,
        updatePlaylistInList,
        hideModals,
        sortPlaylists,
        duplicatePlaylist,
        deletePlaylist,
        loadAllPlaylists,
        playPlaylist,
        findPlaylist,
        findPlaylistById,
        getAllPlaylists,
        loadUserPlaylists,
        searchPlaylists,
        undo,
        redo,
        addDuplicateSongInPlaylistTransaction,
        addRemoveSongFromPlaylistTransaction,
        setCurrentListSongs,
        setCurrentListName,
        addSongToPlaylist,
        removeSongFromPlaylist,
        duplicateSong,
        savePlaylistChanges,
    };

    return (
        <PlaylistStoreContext.Provider value={{
            playlistStore: playlistStoreWithMethods
        }}>
            {props.children}
        </PlaylistStoreContext.Provider>
    )
}

export default PlaylistStoreContext;
export { PlaylistStoreContextProvider };

