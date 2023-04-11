const RowList = (word) => {

    const tr = $(`<tr data-id="${word.id}">
    <td><i class="fa fa-star font-light" ></i></td>
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
        btn.addEventListener('click', CardsLang.openEditModal);
    })

    return tr;
}