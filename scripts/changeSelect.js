document.getElementById("city-select").addEventListener("change", function () {
    const tables = Array.from(document.getElementsByTagName("table"));

    tables.forEach((element) => {
        if (element.id === this.value) element.classList.add("visible");
        else element.classList.remove("visible");
    });

    localStorage.setItem("selectedValue", this.value);
});
