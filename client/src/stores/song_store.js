import { createContext, useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { jsTPS } from "jstps"
import UpdateSong_Transaction from '../transactions/EditSong_Transaction'
import DuplicateSong_Transaction from '../transactions/DuplicateSong_Transaction'
import AuthContext from '../auth'

export const SongStoreContext = createContext({});
console.log("created SongStoreContext");

export const SongStoreActionType = {
    HIDE_MODALS: "HIDE_MODALS",
    SORT_SONGS: "SORT_SONGS",
    ADD_SONG_TO_CATALOG: "ADD_SONG_TO_CATALOG",
    GET_ALL_PLAYLISTS: "GET_ALL_PLAYLISTS",
    GET_USER_SONGS: "GET_USER_SONGS"
}