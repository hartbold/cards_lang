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
    modal_game: null,
    modal_game_btn: null,
    modal_game_btn_open: null,

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
        this.modal_game = document.getElementById('modal-word-game');
        this.modal_game_btn = document.getElementById('game-resolve');
        this.modal_game_btn_open = document.getElementById('random-word');

        this.init_listeners();
    },

    init_listeners: function () {
        this.input_search_bar.addEventListener("keyup", this.searchListItems);
        this.btn_add_item.addEventListener("click", this.addListItem);
        this.btn_show_lists.addEventListener("click", this.show_lists_show);

        this.modal_add_list.addEventListener('shown.bs.modal', this.modalAddListShow);
        this.modal_btn_add_word.addEventListener("click", this.modalAddWord);
        this.modal_btn_save_words.addEventListener("click", this.modalSaveWords);

        this.modal_btn_edit_save.addEventListener("click", this.modalEditSave);

        // this.modal_game.addEventListener("shown.bs.modal", this.modalGameShow);
        this.modal_game.addEventListener("hidden.bs.modal", this.modalGameHide);
        this.modal_game_btn.addEventListener("click", this.modalGameResolve);
        this.modal_game_btn_open.addEventListener("click", this.modalGameShow);

    },

    addListWords: function (word) {
        CardsLang.list_items.append(RowList(word));
    },

    searchListItems: function () {

        const word = CardsLang.input_search_bar.value

        CardsLangLocalData.UpdateListWhereWord(word);

    },

    addListItem: function () {

        const word = CardsLang.input_search_bar.value
        if (word != "") {
            CardsLangLocalData.addWord(word);
        }

    },

    show_lists_show: function () {

    },

    modalAddListShow: function () {

        if (!CardsLang.ctrl_modal_opened) {
            const fieldset = $(this).find("fieldset");
            for (i = 0; i < 5; i++) {
                const row = RowDict();
                // row.querySelectorAll("input").addEventListener("keyup", CardsLang.modalAddListenerSave);
                fieldset.prepend(row);
            }
        }


        CardsLang.ctrl_modal_opened = true;


        // ? load previous words ? 

    },

    modalAddWord: function () {
        const row = RowDict();
        // row.querySelectorAll("input").addEventListener("keyup", CardsLang.modalAddListenerSave);
        $(this).closest(".modal").find("fieldset").append(row);
    },

    modalAddListenerSave: function () {
        // CardsLang.weakMap.set(this, this.value);
    },

    modalSaveWords: function () {

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

    openEditModal: function () {
        const id = $(this).closest("tr").data("id");
        CardsLangLocalData.getWordEdit(id);
    },

    modalEditSave: function () {
        CardsLangLocalData.saveEditWord();
    },

    modalGameShow: function () {
        CardsLangLocalData.loadRandomWord();
    },
    modalGameHide: function () {
        const $modal = $(CardsLang.modal_game);
        $modal.find("h2").html("");
        $modal.find("#game-resolve").removeClass("d-none");
        $modal.find("p").addClass("d-none");

    },
    modalGameResolve: function () {
        $(this).addClass("d-none");
        $(CardsLang.modal_game).find("p").removeClass("d-none");
    },
    modalGameLoad: function (obj) {
        console.log(obj);
        if (obj) {
            const $modal = $(CardsLang.modal_game);
            $modal.find("h2").html(obj.word);
            $modal.find("p").html(obj.w_translated);

            $modal.toggle("show");
        }

    }
};