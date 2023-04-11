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
        input.addEventListener('keyup', CardsLang.modalAddListenerSave);
    })

    return row;

}