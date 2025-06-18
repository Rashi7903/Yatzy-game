const categories = [
  "Ones", "Twos", "Threes", "Fours", "Fives", "Sixes",
  "Three of a Kind", "Four of a Kind", "Full House",
  "Small Straight", "Large Straight", "Yatzy", "Chance"
];

let currentPlayer = 1;
let rollsLeft = 3;
let dice = [0, 0, 0, 0, 0];
let selectedDice = [false, false, false, false, false];
let playerScores = {
  1: {},
  2: {}
};
let usedCategories = {
  1: new Set(),
  2: new Set()
};

const diceContainer = document.getElementById("dice-container");
const rollButton = document.getElementById("roll-button");
const scoreBody = document.getElementById("score-body");
const rollsLeftDisplay = document.getElementById("rolls-left");
const resultMessage = document.getElementById("result-message");

function rollDice() {
  if (rollsLeft <= 0) return;
  for (let i = 0; i < 5; i++) {
    if (!selectedDice[i]) {
      dice[i] = Math.floor(Math.random() * 6) + 1;
    }
  }
  rollsLeft--;
  rollsLeftDisplay.textContent = rollsLeft;
  renderDice();
  showSuggestions();
}

function renderDice() {
  diceContainer.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const die = document.createElement("div");
    die.className = "die";
    die.textContent = dice[i] || "🎲";
    if (selectedDice[i]) die.classList.add("selected");
    die.onclick = () => {
      selectedDice[i] = !selectedDice[i];
      renderDice();
    };
    diceContainer.appendChild(die);
  }
}

function calculateScore(category, diceValues) {
  const counts = Array(7).fill(0);
  for (let d of diceValues) counts[d]++;
  const total = diceValues.reduce((a, b) => a + b, 0);

  switch (category) {
    case "Ones": return counts[1] * 1;
    case "Twos": return counts[2] * 2;
    case "Threes": return counts[3] * 3;
    case "Fours": return counts[4] * 4;
    case "Fives": return counts[5] * 5;
    case "Sixes": return counts[6] * 6;
    case "Three of a Kind": return counts.some(c => c >= 3) ? total : 0;
    case "Four of a Kind": return counts.some(c => c >= 4) ? total : 0;
    case "Full House": return (counts.includes(3) && counts.includes(2)) ? 25 : 0;
    case "Small Straight": {
  const unique = [...new Set(dice)].sort();
  const smallStraights = [
    [1, 2, 3, 4],
    [2, 3, 4, 5],
    [3, 4, 5, 6],
  ];
  for (const seq of smallStraights) {
    if (seq.every(n => unique.includes(n))) return 30;
  }
  return 0;
}

case "Large Straight": {
  const sorted = [...new Set(dice)].sort((a, b) => a - b);
  const large1 = [1, 2, 3, 4, 5];
  const large2 = [2, 3, 4, 5, 6];
  if (JSON.stringify(sorted) === JSON.stringify(large1) ||
      JSON.stringify(sorted) === JSON.stringify(large2)) {
    return 40;
  }
  return 0;
}

    case "Yatzy": return counts.includes(5) ? 50 : 0;
    case "Chance": return total;
  }
  return 0;
}

function showSuggestions() {
  const cells = document.querySelectorAll(`#score-body td[data-player="${currentPlayer}"]`);
  cells.forEach((cell) => {
    const category = cell.dataset.category;
    if (!usedCategories[currentPlayer].has(category)) {
      const score = calculateScore(category, dice);
      cell.textContent = `(${score})`;
      cell.classList.add("score-option");
      cell.onclick = () => selectCategory(category, score);
    }
  });
}

function selectCategory(category, score) {
  playerScores[currentPlayer][category] = score;
  usedCategories[currentPlayer].add(category);
  resetTurn();
  renderScoreTable();
  checkGameOver();
}

function resetTurn() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  dice = [0, 0, 0, 0, 0];
  selectedDice = [false, false, false, false, false];
  rollsLeft = 3;
  rollsLeftDisplay.textContent = rollsLeft;
  renderDice();
  clearSuggestions();
}

function clearSuggestions() {
  const cells = document.querySelectorAll("td");
  cells.forEach(cell => {
    if (cell.classList.contains("score-option")) {
      cell.classList.remove("score-option");
      cell.onclick = null;
      cell.textContent = "(0)";
    }
  });
}

function renderScoreTable() {
  scoreBody.innerHTML = "";
  categories.forEach(category => {
    const row = document.createElement("tr");

    const catCell = document.createElement("td");
    catCell.textContent = category;

    const p1Cell = document.createElement("td");
    p1Cell.dataset.player = "1";
    p1Cell.dataset.category = category;
    p1Cell.textContent = usedCategories[1].has(category) ? playerScores[1][category] : "(0)";

    const p2Cell = document.createElement("td");
    p2Cell.dataset.player = "2";
    p2Cell.dataset.category = category;
    p2Cell.textContent = usedCategories[2].has(category) ? playerScores[2][category] : "-";

    row.appendChild(catCell);
    row.appendChild(p1Cell);
    row.appendChild(p2Cell);
    scoreBody.appendChild(row);
  });

  document.getElementById("score1").textContent = totalScore(1);
  document.getElementById("score2").textContent = totalScore(2);
}

function totalScore(player) {
  return Object.values(playerScores[player]).reduce((a, b) => a + b, 0);
}

function checkGameOver() {
  if (usedCategories[1].size === categories.length && usedCategories[2].size === categories.length) {
    const score1 = totalScore(1);
    const score2 = totalScore(2);
    if (score1 > score2) {
      resultMessage.textContent = "🎉 Player 1 Wins!";
    } else if (score2 > score1) {
      resultMessage.textContent = "🎉 Player 2 Wins!";
    } else {
      resultMessage.textContent = "🤝 It's a Draw!";
    }
    rollButton.disabled = true;
  }
}

rollButton.onclick = rollDice;
renderDice();
renderScoreTable();
