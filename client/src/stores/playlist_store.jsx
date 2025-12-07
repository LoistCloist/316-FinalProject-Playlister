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
        newListCounter: 0,
        listMarkedForDeletion: null
    })

    const { auth } = useContext(AuthContext);

    const playlistStoreReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case PlaylistStoreActionType.CREATE_NEW_LIST: {
                return setPlaylistStore({
                    currentModal: CurrentModal.NONE,
                    playlists: playlistStore.playlists,
                    currentList: null,
                    newListCounter: playlistStore.newListCounter + 1,
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
                    currentList: null
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
                return setPlaylistStore({
                    ...playlistStore,
                    currentModal: CurrentModal.NONE,
                    playlists: payload.playlists ? [...payload.playlists] : []
                })
            }
            default:
                return playlistStore;
        }
    }
    const createNewList = function() {
        playlistStoreReducer({
            type: PlaylistStoreActionType.CREATE_NEW_LIST,
            payload: {}
        });
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
                    payload: {}
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
            }
        } catch (error) {
            console.error("Error loading user playlists:", error);
        }
    }

    const undo = function() {
        tps.undoTransaction();
    }

    const redo = function() {
        tps.doTransaction();
    }

    // Combine state and methods without mutating the state object
    const playlistStoreWithMethods = {
        ...playlistStore,
        createNewList,
        markListForDeletion,
        setCurrentList,
        editPlaylist,
        hideModals,
        sortPlaylists,
        duplicatePlaylist,
        deletePlaylist,
        playPlaylist,
        findPlaylist,
        findPlaylistById,
        getAllPlaylists,
        loadUserPlaylists,
        undo,
        redo
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

