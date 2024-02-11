function changeTable() {
    const selector = document.getElementById('selector');
    const table = document.getElementsByTagName('table');
    
    for (let i = 0; i < table.length; i++) {
        if (table[i].id === selector.value)
            table[i].classList.add('visible');
        else
            table[i].classList.remove('visible');
    }
    localStorage.setItem('selectedValue', selector.value);
}

function getPlaylistLink() {
    const city = document.getElementsByClassName('selector')[0].value;
    const a = document.getElementsByClassName('playlist_link');
    let result = "https://radio.bsod.kr/playlist/" + city + ".m3u";
    a[0].href = result;
}

document.addEventListener('DOMContentLoaded', function () {
    var selector = document.getElementById('selector');
    var savedValue = localStorage.getItem('selectedValue');
    if (savedValue) { selector.value = savedValue; }
    changeTable();
});