const showTable = (city) => {
    const table = document.getElementsByTagName('table');
    for (let i = 0; i < table.length; i++) {
        table[i].classList.add('hidden');
        if (table[i].classList.contains('visible')) {
            table[i].classList.remove('visible');
        }
    }
    const target = document.getElementById(city);
    target.classList.replace('hidden', 'visible');
}