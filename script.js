const scoreboardContainer = document.getElementById('holesContainer');
const playerNameInput = document.getElementById('playerName');
const darkModeToggle = document.getElementById('darkModeToggle');
const resetBtn = document.getElementById('resetBtn');
const exportBtn = document.getElementById('exportBtn');
const totalScoreEl = document.getElementById('totalScore');
const totalParEl = document.getElementById('totalPar');
const scoreDifferenceEl = document.getElementById('scoreDifference');

let holesData = Array(18).fill().map(() => ({ par: 4, strokes: 0, result: '' }));
let isDarkMode = false;
let playerName = '';

function init() {
  loadFromLocalStorage();
  renderHoles();
  updateSummary();
  setupEventListeners();
}

function renderHoles() {
  scoreboardContainer.innerHTML = '';
  holesData.forEach((hole, index) => {
    const holeCard = document.createElement('div');
    holeCard.className = 'hole-card bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-xl transition-all duration-300';
    holeCard.innerHTML = `
      <h3 class="text-lg font-semibold text-center text-gray-800 dark:text-white mb-3">Hole ${index+1}</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Par</label>
          <input type="number" min="3" max="5" value="${hole.par}" 
                 class="par-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" data-hole="${index}">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Strokes</label>
          <input type="number" min="1" value="${hole.strokes || ''}" 
                 class="strokes-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" data-hole="${index}" placeholder="Enter strokes">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Result</label>
          <div class="result-display p-2 rounded-md text-center font-semibold ${getResultClass(hole.result)}" data-hole="${index}">
            ${hole.result || 'Not played'}
          </div>
        </div>
      </div>
    `;
    scoreboardContainer.appendChild(holeCard);
  });

  document.querySelectorAll('.par-input').forEach(input => input.addEventListener('change', handleParChange));
  document.querySelectorAll('.strokes-input').forEach(input => input.addEventListener('change', handleStrokesChange));
}

function handleParChange(e) {
  const idx = parseInt(e.target.dataset.hole);
  let val = parseInt(e.target.value) || 4;
  if(val < 3 || val > 5) val = 4;
  holesData[idx].par = val;
  if(holesData[idx].strokes > 0) calculateResult(idx);
  saveToLocalStorage();
  updateSummary();
}

function handleStrokesChange(e) {
  const idx = parseInt(e.target.dataset.hole);
  let val = parseInt(e.target.value) || 0;
  holesData[idx].strokes = val;
  if(val > 0) calculateResult(idx);
  else {
    holesData[idx].result = '';
    updateResultDisplay(idx);
  }
  saveToLocalStorage();
  updateSummary();
}

function calculateResult(idx) {
  const { par, strokes } = holesData[idx];
  if(strokes === 1) holesData[idx].result = "Hole-in-one!";
  else if(strokes <= par-2) holesData[idx].result = "Eagle";
  else if(strokes === par-1) holesData[idx].result = "Birdie";
  else if(strokes === par) holesData[idx].result = "Par";
  else if(strokes === par+1) holesData[idx].result = "Bogey";
  else if(strokes === par+2) holesData[idx].result = "Double Bogey";
  else holesData[idx].result = "Go Home!";
  updateResultDisplay(idx);
}

function updateResultDisplay(idx) {
  const el = document.querySelector(`.result-display[data-hole="${idx}"]`);
  if(el) el.className = `result-display p-2 rounded-md text-center font-semibold ${getResultClass(holesData[idx].result)}`;
  if(el) el.textContent = holesData[idx].result || 'Not played';
}

function getResultClass(result) {
  switch(result) {
    case "Hole-in-one!": return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
    case "Eagle": return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
    case "Birdie": return "bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200";
    case "Par": return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
    case "Bogey": return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200";
    case "Double Bogey": return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
    case "Go Home!": return "bg-gray-800 dark:bg-gray-900 text-white dark:text-gray-200";
    default: return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
  }
}

function updateSummary() {
  const totalScore = holesData.reduce((sum, h)=>sum+(h.strokes||0),0);
  const totalPar = holesData.reduce((sum,h)=>sum+h.par,0);
  const diff = totalScore-totalPar;
  totalScoreEl.textContent = totalScore;
  totalParEl.textContent = totalPar;
  scoreDifferenceEl.textContent = diff>0?`+${diff}`:diff;
  scoreDifferenceEl.className = `text-2xl font-bold ${diff>0?'text-red-500':diff<0?'text-green-500':'text-gray-800 dark:text-white'}`;
}

function setupEventListeners() {
  darkModeToggle.addEventListener('click', ()=>{
    isDarkMode = !isDarkMode;
    document.documentElement.classList.toggle('dark', isDarkMode);
    darkModeToggle.innerHTML = isDarkMode?'<i class="fas fa-sun"></i>':'<i class="fas fa-moon"></i>';
    localStorage.setItem('golfScoreboardDarkMode', isDarkMode);
  });

  resetBtn.addEventListener('click', ()=>{
    if(confirm('Reset all scores?')){
      holesData = Array(18).fill().map(()=>({par:4,strokes:0,result:''}));
      saveToLocalStorage();
      renderHoles();
      updateSummary();
    }
  });

  exportBtn.addEventListener('click', exportData);

  playerNameInput.addEventListener('change', ()=>{
    playerName = playerNameInput.value;
    localStorage.setItem('golfScoreboardPlayerName', playerName);
  });
}

function exportData(){
  const data = { playerName, holes: holesData, summary:{ totalScore: parseInt(totalScoreEl.textContent), totalPar: parseInt(totalParEl.textContent), scoreDifference: scoreDifferenceEl.textContent }, exportDate: new Date().toISOString()};
  const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `golf-scoreboard-${playerName||'anon'}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

function saveToLocalStorage(){ localStorage.setItem('golfScoreboardData', JSON.stringify(holesData)); }

function loadFromLocalStorage(){
  const savedData = localStorage.getItem('golfScoreboardData');
  if(savedData) holesData = JSON.parse(savedData);
  const savedName = localStorage.getItem('golfScoreboardPlayerName');
  if(savedName){ playerName = savedName; playerNameInput.value = savedName; }
  const savedDark = localStorage.getItem('golfScoreboardDarkMode');
  if(savedDark==='true'){ isDarkMode=true; document.documentElement.classList.add('dark'); darkModeToggle.innerHTML='<i class="fas fa-sun"></i>'; }
}

document.addEventListener('DOMContentLoaded', init);
