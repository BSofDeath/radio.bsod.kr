function changeTable() {
    const table = document.getElementsByTagName('table');
    const selector = document.getElementById('selector');
    const index = selector.selectedIndex;
    const city = selector.options[index].value;

    for (let i = 0; i < table.length; i++) {
        table[i].classList.add('hidden');
        if (table[i].classList.contains('visible')) {
            table[i].classList.remove('visible');
        }
    }
    const target = document.getElementById(city);
    target.classList.replace('hidden', 'visible');
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

    // 저장된 값이 있다면 선택 옵션에 설정
    if (savedValue) {
        selector.value = savedValue;
    }
});