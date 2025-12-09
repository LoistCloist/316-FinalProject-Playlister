import { jsTPS_Transaction } from "jstps"

export default class DuplicateSongInPlaylist_Transaction extends jsTPS_Transaction {
    constructor(initPlaylistStore, initSongId) {
        super();
        this.store = initPlaylistStore;
        this.songId = initSongId;
    }

    executeDo() {
        this.store.duplicateSong(this.songId);
    }
    
    async executeUndo() {
        // Remove the last occurrence of the song (the duplicate we just added)
        await this.store.removeSongFromPlaylist(this.songId);
    }

}

