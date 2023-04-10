const RowDict = () => {

    const row = $(`<div class="row row-dict">
    <div class="col-6 col-lg-5">
        <input type="text" class="form-control og-text" placeholder="Palabra original" />
    </div>
    <div class="col-6 col-lg-5">
        <input type="text" class="form-control tr-text" placeholder="Traducción" />
    </div>
</div>`)[0]

    row.querySelectorAll("input").forEach(input => {
        input.addEventListener('keyup', CardsLang.modal_add_listener_save);
    })

    return row;

}

const RowList = (word) => {

    const tr = $(`<tr data-id="${word.id}">
    <td><i class="fa fa-rug"></i></td>
    <td>
    <b>${word.word}</b>
    </td>
    <td>
   <button class="btn btn-link btn-sm btn-edit">${word.w_translated ? word.w_translated : "-- añade traducción --"}</button>
    </td>
    <td>
    <button class="btn btn-remove"><i class="fa fa-trash text-danger"></i></button>
    </td>
    </tr>`)[0];

    tr.querySelectorAll(".btn-remove").forEach(btn => {
        btn.addEventListener('click', CardsLangLocalData.removeWord);
    })

    tr.querySelectorAll(".btn-edit").forEach(btn => {
        btn.addEventListener('click', CardsLang.open_edit_modal);
    })

    return tr;
}

const CardsLang = {

    words: [],
    modal_words: [],

    request: null,

    input_search_bar: null,
    btn_add_item: null,
    // btn_add_list,
    btn_show_lists: null,
    list_items: null,
    modal_add_list: null,
    modal_btn_add_word: null,
    modal_btn_save_words: null,
    modal_edit_word: null,
    modal_btn_edit_save: null,

    ctrl_modal_opened: false,

    load: function () {
        this.input_search_bar = document.getElementById('search-bar');
        this.btn_add_item = document.getElementById('add-item');
        // this.btn_add_list = document.getElementById('lists-add');
        this.btn_show_lists = document.getElementById('lists-show');
        this.list_items = document.getElementById('dict-list');
        this.modal_add_list = document.getElementById('modal-lists-add');
        this.modal_btn_add_word = document.getElementById('add-word');
        this.modal_btn_save_words = document.getElementById('save-words');
        this.modal_edit_word = document.getElementById('modal-word-edit');
        this.modal_btn_edit_save = document.getElementById('save-edit');

        this.init_listeners();
    },

    init_listeners: function () {
        this.input_search_bar.addEventListener("keyup", this.search_list_items);
        this.btn_add_item.addEventListener("click", this.add_list_items);
        // this.btn_add_list.addEvent("click", this.add_list_show);
        this.btn_show_lists.addEventListener("click", this.show_lists_show);

        this.modal_add_list.addEventListener('shown.bs.modal', this.modal_add_list_on_shown);
        this.modal_btn_add_word.addEventListener("click", this.modal_add_word);
        this.modal_btn_save_words.addEventListener("click", this.modal_save_words);

        this.modal_btn_edit_save.addEventListener("click", this.modal_edit_save);
    },

    add_list_words: function (word) {
        CardsLang.list_items.append(RowList(word));
    },

    search_list_items: function () {

        const word = CardsLang.input_search_bar.value

        CardsLangLocalData.UpdateListWhereWord(word);

    },

    add_list_items: function () {

        const word = CardsLang.input_search_bar.value
        if (word != "") {
            CardsLangLocalData.addWord(word);
        }

    },

    /**
     * abre el modal para ir añadiendo 
     */
    add_list_show: function () {

    },

    show_lists_show: function () {

    },

    modal_add_list_on_shown: function () {

        if (!CardsLang.ctrl_modal_opened) {
            const fieldset = $(this).find("fieldset");
            for (i = 0; i < 5; i++) {
                const row = RowDict();
                // row.querySelectorAll("input").addEventListener("keyup", CardsLang.modal_add_listener_save);
                fieldset.prepend(row);
            }
        }


        CardsLang.ctrl_modal_opened = true;


        // ? load previous words ? 

    },

    modal_add_word: function () {
        const row = RowDict();
        // row.querySelectorAll("input").addEventListener("keyup", CardsLang.modal_add_listener_save);
        $(this).closest(".modal").find("fieldset").append(row);
    },

    modal_add_listener_save: function () {
        // CardsLang.weakMap.set(this, this.value);
    },

    modal_save_words: function () {

        const modal = CardsLang.modal_add_list;

        const input_title = modal.querySelector("#modal-list-add__title");
        const title = input_title.value;

        modal.querySelectorAll(".row-dict").forEach((row) => {
            const word = row.querySelector(".og-text").value;
            const w_translated = row.querySelector(".tr-text").value;

            if (word != "") {
                CardsLangLocalData.addWord(word, w_translated, title);
            }

            row.remove();
        })

        input_title.value = "";

        $(modal).modal("toggle");
        CardsLang.ctrl_modal_opened = false;

    },

    open_edit_modal: function () {
        const id = $(this).closest("tr").data("id");
        CardsLangLocalData.getWordEdit(id);
    },

    modal_edit_save: function () {
        CardsLangLocalData.saveEditWord();
    }
};


/**
 * 
 */
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
        console.log(id)
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
            /*displayActionFailure("This engine doesn't know how to clone a Blob, " +
                                 "use Firefox");*/
            throw e;
        }

        req.onsuccess = function (evt) {
            console.log("Insertion in DB successful");

            // CardsLang.input_search_bar.value = "";
            // CardsLang.input_search_bar.dispatchEvent("onkeyup");

            CardsLang.add_list_words(obj);

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
            console.log("evt:", evt);
            console.log("evt.target:", evt.target);
            console.log("evt.target.result:", evt.target.result);
            console.log("delete successful");

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
                CardsLang.add_list_words(cursor.value);

                //req.onsuccess = (evt) => {
                //  var value = evt.target.result;
                //CardsLang.add_list_words(value);
                // console.log(value);
                //}

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
                CardsLang.add_list_words(cursor.value);
                cursor.continue()
            }
        }
    },
};