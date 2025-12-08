import { createContext, useContext, useState } from 'react'
import { jsTPS } from "jstps"
import AuthContext from '../auth'
import playlistRequestSender from './requests/playlistRequestSender'

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
                // Check if currentList or listMarkedForDeletion still exist in the new playlists
                // If not, clear them to prevent stale references that could trigger modals
                const currentListExists = playlistStore.currentList && 
                    newPlaylists.some(p => p.playlistId === playlistStore.currentList.playlistId);
                const listMarkedExists = playlistStore.listMarkedForDeletion && 
                    newPlaylists.some(p => p.playlistId === playlistStore.listMarkedForDeletion.playlistId);
                
                // If listMarkedForDeletion no longer exists, close the delete modal
                const shouldCloseDeleteModal = !listMarkedExists && 
                    playlistStore.currentModal === CurrentModal.DELETE_PLAYLIST_MODAL;
                
                return setPlaylistStore({
                    ...playlistStore,
                    playlists: newPlaylists,
                    // Clear currentList if it no longer exists in the new playlists
                    currentList: currentListExists ? playlistStore.currentList : null,
                    // Clear listMarkedForDeletion if it no longer exists in the new playlists
                    listMarkedForDeletion: listMarkedExists ? playlistStore.listMarkedForDeletion : null,
                    // Close delete modal if the marked list no longer exists
                    currentModal: shouldCloseDeleteModal ? CurrentModal.NONE : playlistStore.currentModal
                })
            }
            case PlaylistStoreActionType.UPDATE_PLAYLIST_IN_LIST: {
                const updatedPlaylists = playlistStore.playlists.map(playlist => 
                    playlist.playlistId === payload.playlist.playlistId ? payload.playlist : playlist
                );
                return setPlaylistStore({
                    ...playlistStore,
                    playlists: updatedPlaylists
                })
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
            case PlaylistStoreActionType.DUPLICATE_SONG_IN_PLAYLIST: {
                const songToDuplicate = playlistStore.currentListSongs.find(
                    song => song.songId === payload.songId
                );
                if (songToDuplicate) {
                    const newSongs = [...playlistStore.currentListSongs, { ...songToDuplicate }];
                    return setPlaylistStore({
                        ...playlistStore,
                        currentListSongs: newSongs
                    })
                }
                return playlistStore;
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
                // Hide modal first
                playlistStoreReducer({
                    type: PlaylistStoreActionType.HIDE_MODALS,
                    payload: {
                        listMarkedForDeletion: null,
                        currentList: null
                    }
                });
                // Reload playlists after successful deletion
                await loadUserPlaylists();
                // Small delay to ensure store updates before component re-renders
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

    const loadUserPlaylists = async function() {
        if (!auth.loggedIn || !auth.user?.userId) {
            console.log("User not logged in, cannot load playlists");
            return;
        }
        try {
            console.log("Loading playlists for user:", auth.user.userId);
            const response = await playlistRequestSender.getUserPlaylists(auth.user.userId);
            if (response.status === 200 && response.data.success) {
                console.log("Loaded playlists:", response.data.playlists);
                getAllPlaylists(response.data.playlists || []);
                // Increment refresh trigger to notify components
                setPlaylistStore(prevStore => {
                    const newTrigger = prevStore.playlistsRefreshTrigger + 1;
                    console.log("🔄 Incrementing playlistsRefreshTrigger to:", newTrigger);
                    return {
                        ...prevStore,
                        playlistsRefreshTrigger: newTrigger
                    };
                });
            }
        } catch (error) {
            console.error("Error loading user playlists:", error);
        }
    }

    const searchPlaylists = async function(playlistName, userName, title, artist, year) {
        try {
            // If all fields are empty, load user's playlists instead
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
                // No results found
                getAllPlaylists([]);
            }
        } catch (error) {
            console.error("Failed to search playlists:", error);
            if (error.response?.status === 404 || error.response?.status === 400) {
                // No results found or invalid request
                getAllPlaylists([]);
            } else {
                alert('Error searching playlists');
            }
        }
    }

    const undo = function() {
        tps.undoTransaction();
    }

    const redo = function() {
        tps.doTransaction();
    }

    const addTransaction = function(transaction) {
        tps.addTransaction(transaction);
    }

    // Methods for managing current playlist songs (used by transactions)
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

    const addSongToPlaylist = function(song) {
        playlistStoreReducer({
            type: PlaylistStoreActionType.ADD_SONG_TO_PLAYLIST,
            payload: { song: song }
        });
    }

    const removeSongFromPlaylist = function(songId) {
        playlistStoreReducer({
            type: PlaylistStoreActionType.REMOVE_SONG_FROM_PLAYLIST,
            payload: { songId: songId }
        });
    }

    const duplicateSong = function(songId) {
        playlistStoreReducer({
            type: PlaylistStoreActionType.DUPLICATE_SONG_IN_PLAYLIST,
            payload: { songId: songId }
        });
    }

    // Combine state and methods without mutating the state object
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
        playPlaylist,
        findPlaylist,
        findPlaylistById,
        getAllPlaylists,
        loadUserPlaylists,
        searchPlaylists,
        undo,
        redo,
        addTransaction,
        setCurrentListSongs,
        setCurrentListName,
        addSongToPlaylist,
        removeSongFromPlaylist,
        duplicateSong
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

