import { jsTPS_Transaction } from "jstps"

export default class EditSong_Transaction extends jsTPS_Transaction {
    constructor(initStore, initNewSong, initOldSong) {
        super();
        this.store = initStore;
        this.newSong = initNewSong;
        this.oldSong = initOldSong;
    }

    executeDo() {
        this.store.editSong(this.newSong);
    }
    
    executeUndo() {
        this.store.editSong(this.oldSong);
    }

}