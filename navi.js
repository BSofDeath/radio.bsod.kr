const seoulBtn = document.querySelector('#seoul-btn');
const seoulList = document.querySelector('#seoul-list');
const daejeonBtn = document.querySelector('#daejeon-btn');
const daejeonList = document.querySelector('#daejeon-list');

function showList(btn, list) {
    btn.classList.add('activeBtn');
    list.classList.add('activeList');
    list.classList.remove('hiddenList');
}
function HideList(btn, list) {
    btn.classList.remove('activeBtn');
    list.classList.remove('activeList');
    list.classList.add('hiddenList');
}

seoulBtn.addEventListener('click', function() {
    showList(seoulBtn, seoulList); HideList(daejeonBtn, daejeonList);
});
daejeonBtn.addEventListener('click', function() {
    showList(daejeonBtn, daejeonList); HideList(seoulBtn, seoulList);
});