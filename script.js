document.addEventListener("DOMContentLoaded", function () {
    const selector = document.getElementById("city-select");
    let savedValue = localStorage.getItem("selectedValue");

    if (savedValue) selector.value = savedValue;

    selector.dispatchEvent(new Event("change"));
});
