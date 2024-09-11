function changeTable() {
    const selector = document.getElementById("city-select");
    const table = document.getElementsByTagName("table");

    for (let i = 0; i < table.length; i++) {
        if (table[i].id === selector.value) table[i].classList.add("visible");
        else table[i].classList.remove("visible");
    }

    localStorage.setItem("selectedValue", selector.value);
}

document.addEventListener("DOMContentLoaded", function () {
    var selector = document.getElementById("city-select");
    var savedValue = localStorage.getItem("selectedValue");
    if (savedValue) {
        selector.value = savedValue;
    }
    changeTable();
});
