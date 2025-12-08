import { jsTPS_Transaction } from "jstps"

export default class DuplicateSongInPlaylist_Transaction extends jsTPS_Transaction {
    constructor(initStore, initSongId) {
        super();
        this.store = initStore;
        this.songId = initSongId;
    }

    executeDo() {
        this.store.duplicateSong(this.songId);
    }
    
    executeUndo() {
        // Remove the last occurrence of the song (the duplicate we just added)
        this.store.removeSongFromPlaylist(this.songId);
    }

}

