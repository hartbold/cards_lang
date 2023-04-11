const CardsLangLocalData = {
    db: null,
    DB_NAME: 'words-indexeddb',
    DB_VERSION: 1, // Use a long long for this value (don't use a float)
    DB_STORE_NAME: 'words',

    init_localdata: function () {
        const request = window.indexedDB.open(CardsLangLocalData.DB_NAME, 1);
        this.request = request;

        this.request.onsuccess = function (evt) {
            // Equal to: db = req.result;
            CardsLangLocalData.db = this.result;
            console.log("openDb DONE");
            CardsLangLocalData.loadWordList();
        };
        this.request.onerror = function (evt) {
            console.error("openDb:", evt.target.errorCode);
        };

        this.request.onupgradeneeded = function (evt) {
            console.log("openDb.onupgradeneeded");
            const store = evt.currentTarget.result.createObjectStore(
                CardsLangLocalData.DB_STORE_NAME, { keyPath: 'id', autoIncrement: true });

            store.createIndex('word', 'word', { unique: false });
            store.createIndex('dict', 'dict', { unique: false });
            store.createIndex('created_at', 'created_at', { unique: false });

        };

    },

    getObjectStore: function (store_name, mode) {
        var tx = CardsLangLocalData.db.transaction(store_name, mode);
        return tx.objectStore(store_name);
    },

    getWordEdit: function (id) {
        const req = CardsLangLocalData.getObjectStore(CardsLangLocalData.DB_STORE_NAME, "readonly").get(id);
        req.onsuccess = (evt) => {
            var record = evt.target.result;

            const modal = CardsLang.modal_edit_word;
            modal.querySelector(".modal-title").innerHTML = record.word;
            modal.querySelector("#modal-word-edit__title").value = record.w_translated ? record.w_translated : "";
            modal.querySelector("#modal-word-edit__id").value = id;

            $(modal).modal("toggle");
        }
    },

    addWord: function (word, w_translated, dict) {
        console.log("addPublication arguments:", arguments);
        var obj = { word: word, w_translated: w_translated, dict: dict, created_at: new Date() };

        var store = CardsLangLocalData.getObjectStore(CardsLangLocalData.DB_STORE_NAME, 'readwrite');
        var req;
        try {
            req = store.add(obj);
        } catch (e) {
            if (e.name == 'DataCloneError')
                console.log("clone a blob error");
            throw e;
        }

        req.onsuccess = function (evt) {
            obj.id = evt.target.result;
            CardsLang.addListWords(obj);

        };
        req.onerror = function () {
            console.error("addPublication error", this.error);
        };
    },

    saveEditWord: function () {

        const modal = CardsLang.modal_edit_word;
        const tr_word = modal.querySelector("#modal-word-edit__title").value;
        const id = 1 * modal.querySelector("#modal-word-edit__id").value;

        const store = CardsLangLocalData.getObjectStore(CardsLangLocalData.DB_STORE_NAME, "readwrite");
        const req = store.get(id);
        req.onsuccess = (evt) => {
            var record = evt.target.result;
            record.w_translated = tr_word;
            store.put(record).onsuccess = function (event) {
                $("#dict-list tr[data-id='" + id + "'] .btn-edit").html(tr_word);
                $(modal).modal("toggle");
            }
        }

    },

    removeWord: function () {

        const $btn = $(this);
        const $tr = $(this).closest("tr");
        const word = $tr.data("id");

        var store = CardsLangLocalData.getObjectStore(CardsLangLocalData.DB_STORE_NAME, "readwrite");

        var deleteReq = store.delete(word);
        deleteReq.onsuccess = function (evt) {
            $tr.hide(function () {
                $(this).remove();
            })
        };
        deleteReq.onerror = function (evt) {
            console.error("deletePublication:", evt.target.errorCode);
        };
    },

    loadWordList: function () {
        const store = CardsLangLocalData.getObjectStore(CardsLangLocalData.DB_STORE_NAME, "readonly");
        var index = store.index('word');
        var req = index.openCursor(null, 'next');

        req.onsuccess = (evt) => {
            var cursor = evt.target.result;

            if (cursor) {
                // req = store.get(cursor.key);
                CardsLang.addListWords(cursor.value);
                cursor.continue();
            }

        }

        req.onerror = (evt) => {

        }

    },

    UpdateListWhereWord: function (wordvalue) {

        const store = CardsLangLocalData.getObjectStore(CardsLangLocalData.DB_STORE_NAME, "readonly");
        const index = store.index('word')
        const range = IDBKeyRange.bound(wordvalue, wordvalue + '\uffff')

        CardsLang.list_items.innerHTML = "";

        index.openCursor(range).onsuccess = function (event) {
            const cursor = event.target.result
            if (cursor) {
                CardsLang.addListWords(cursor.value);
                cursor.continue()
            }
        }
    },

    loadRandomWord: function () {
        var store = CardsLangLocalData.getObjectStore(CardsLangLocalData.DB_STORE_NAME, "readonly");

        const getRandomInt = function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        const done = function (cursor) {
            CardsLang.modalGameLoad(cursor.value);
        }

        store.count().onsuccess = function (event) {
            var total = event.target.result;

            if (!total) {
                return;
            }

            var needRandom = true;
            console.log("ok, total is " + total);
            store.openCursor().onsuccess = function (e) {
                var cursor = e.target.result;
                if (needRandom) {
                    var advance = getRandomInt(0, total - 1);
                    console.log("going up " + advance);
                    if (advance > 0) {
                        needRandom = false;
                        cursor.advance(advance);
                    } else {
                        done(cursor);
                    }
                } else {
                    done(cursor);
                }

            };

        };
    }
};