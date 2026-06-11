// MathFun Indonesia - Game Modules
// Balloon Game, Memory Card, Puzzle

// ==================== BALLOON GAME ====================
class BalloonGame {
  constructor() {
    this.score = 0;
    this.lives = 3;
    this.currentQuestion = null;
    this.questionGen = new QuestionGenerator(1);
    this.isPlaying = false;
    this.balloons = [];
    this.gameArea = null;
    this.scoreDisplay = null;
    this.livesDisplay = null;
    this.questionDisplay = null;
    this.balloonInterval = null;
  }

  init() {
    this.gameArea = document.getElementById('gameArea');
    this.scoreDisplay = document.getElementById('score');
    this.livesDisplay = document.getElementById('lives');
    this.questionDisplay = document.getElementById('currentQuestion');
    
    this.generateQuestion();
    this.startGame();
  }

  generateQuestion() {
    this.currentQuestion = this.questionGen.generateAddition();
    if (this.questionDisplay) {
      this.questionDisplay.textContent = this.currentQuestion.question;
    }
    this.speakQuestion();
  }

  speakQuestion() {
    const text = `Berapa hasil dari ${this.currentQuestion.num1} ditambah ${this.currentQuestion.num2}?`;
    if (app && app.speak) {
      app.speak(text);
    }
  }

  startGame() {
    this.isPlaying = true;
    this.score = 0;
    this.lives = 3;
    this.updateDisplay();
    
    this.balloonInterval = setInterval(() => {
      if (this.isPlaying) {
        this.spawnBalloon();
      }
    }, 1500);

    this.startCleanup();
  }

  stopGame() {
    this.isPlaying = false;
    if (this.balloonInterval) {
      clearInterval(this.balloonInterval);
    }
  }

  spawnBalloon() {
    if (!this.gameArea) return;

    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    
    const isCorrect = Math.random() < 0.25;
    let value;
    
    if (isCorrect) {
      value = this.currentQuestion.answer;
    } else {
      const wrongs = this.questionGen.generateWrongAnswers(this.currentQuestion.answer, 5);
      value = wrongs[Math.floor(Math.random() * wrongs.length)];
    }

    balloon.textContent = value;
    balloon.dataset.value = value;
    balloon.style.left = Math.random() * (this.gameArea.offsetWidth - 80) + 'px';
    
    const colors = ['🎈', '🎈', '🎈'];
    balloon.textContent = `${colors[Math.floor(Math.random() * colors.length)]} ${value}`;
    
    balloon.addEventListener('click', () => this.handleBalloonClick(balloon, parseInt(balloon.dataset.value)));
    
    this.gameArea.appendChild(balloon);
    this.balloons.push(balloon);

    // Animate balloon
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(balloon, 
        { y: 0, opacity: 1 }, 
        { y: -600, duration: 5, ease: 'linear' }
      );
    }

    setTimeout(() => {
      if (balloon.parentNode) {
        balloon.remove();
        this.balloons = this.balloons.filter(b => b !== balloon);
      }
    }, 5000);
  }

  handleBalloonClick(balloon, value) {
    if (value === this.currentQuestion.answer) {
      this.score += 10;
      this.showFeedback(true);
      if (app) {
        app.playSound('correct');
        app.addCorrect();
      }
      this.showMascotMessage('correct');
    } else {
      this.lives--;
      this.showFeedback(false);
      if (app) {
        app.playSound('wrong');
        app.addWrong();
      }
      this.showMascotMessage('wrong');
    }

    balloon.remove();
    this.balloons = this.balloons.filter(b => b !== balloon);
    this.updateDisplay();

    if (this.lives <= 0) {
      this.gameOver();
    } else {
      this.generateQuestion();
    }
  }

  showFeedback(isCorrect) {
    const feedback = document.createElement('div');
    feedback.className = 'feedback-overlay';
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 4rem;
      z-index: 1000;
      pointer-events: none;
    `;
    feedback.textContent = isCorrect ? '✅' : '❌';
    document.body.appendChild(feedback);

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(feedback, 
        { scale: 0, opacity: 0 }, 
        { scale: 1.5, opacity: 1, duration: 0.3, yoyo: true, repeat: 1 }
      );
    }

    setTimeout(() => feedback.remove(), 500);
  }

  showMascotMessage(type) {
    if (app && app.showMascotMessage) {
      app.showMascotMessage(type);
    }
  }

  updateDisplay() {
    if (this.scoreDisplay) this.scoreDisplay.textContent = this.score;
    if (this.livesDisplay) this.livesDisplay.textContent = '❤️'.repeat(this.lives);
  }

  startCleanup() {
    setInterval(() => {
      this.balloons.forEach(balloon => {
        if (!balloon.parentNode) {
          this.balloons = this.balloons.filter(b => b !== balloon);
        }
      });
    }, 1000);
  }

  gameOver() {
    this.stopGame();
    
    const modal = document.getElementById('gameOverModal');
    if (modal) {
      document.getElementById('finalScore').textContent = this.score;
      const modalInstance = new bootstrap.Modal(modal);
      modalInstance.show();
    }

    if (typeof gsap !== 'undefined') {
      gsap.fromTo('.modal-content', { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3 });
    }
  }

  restart() {
    this.balloons.forEach(b => b.remove());
    this.balloons = [];
    this.init();
  }
}

// ==================== MEMORY CARD GAME ====================
class MemoryGame {
  constructor() {
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;
    this.isLocked = false;
    this.grid = null;
    this.movesDisplay = null;
    this.pairsDisplay = null;
  }

  init(level = 1) {
    this.grid = document.getElementById('memoryGrid');
    this.movesDisplay = document.getElementById('moves');
    this.pairsDisplay = document.getElementById('pairs');
    
    this.setupGame(level);
  }

  setupGame(level) {
    const pairCount = Math.min(4 + level, 8);
    this.cards = this.generateCards(pairCount);
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;
    this.isLocked = false;
    
    this.renderCards();
    this.updateDisplay();
  }

  generateCards(pairCount) {
    const equations = [];
    
    for (let i = 0; i < pairCount; i++) {
      const questionGen = new QuestionGenerator(Math.ceil((i + 1) / 2));
      const q = questionGen.generateAddition();
      
      equations.push({
        id: i * 2,
        type: 'question',
        value: q.question,
        matchId: i * 2 + 1
      });
      
      equations.push({
        id: i * 2 + 1,
        type: 'answer',
        value: q.answer.toString(),
        matchId: i * 2
      });
    }
    
    return this.shuffle(equations);
  }

  shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  renderCards() {
    if (!this.grid) return;
    
    this.grid.innerHTML = '';
    
    this.cards.forEach((card, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'memory-card';
      cardEl.dataset.index = index;
      cardEl.dataset.id = card.id;
      cardEl.dataset.matchId = card.matchId;
      
      cardEl.innerHTML = `
        <div class="card-front">❓</div>
        <div class="card-back">${card.value}</div>
      `;
      
      cardEl.addEventListener('click', () => this.flipCard(cardEl, card));
      
      this.grid.appendChild(cardEl);
    });
  }

  flipCard(cardEl, card) {
    if (this.isLocked) return;
    if (cardEl.classList.contains('flipped')) return;
    if (cardEl.classList.contains('matched')) return;
    
    cardEl.classList.add('flipped');
    this.flippedCards.push({ element: cardEl, card });
    
    if (app) app.playSound('click');
    
    if (this.flippedCards.length === 2) {
      this.moves++;
      this.updateDisplay();
      this.checkMatch();
    }
  }

  checkMatch() {
    this.isLocked = true;
    
    const [first, second] = this.flippedCards;
    const isMatch = first.card.matchId === second.card.id;
    
    if (isMatch) {
      this.handleMatch(first.element, second.element);
    } else {
      this.handleMismatch(first.element, second.element);
    }
  }

  handleMatch(card1, card2) {
    card1.classList.add('matched');
    card2.classList.add('matched');
    
    this.matchedPairs++;
    this.updateDisplay();
    
    if (app) {
      app.playSound('correct');
      app.addCorrect();
    }
    
    this.showFeedback(true);
    
    this.flippedCards = [];
    this.isLocked = false;
    
    if (this.matchedPairs === this.cards.length / 2) {
      setTimeout(() => this.gameComplete(), 500);
    }
  }

  handleMismatch(card1, card2) {
    if (app) {
      app.playSound('wrong');
      app.addWrong();
    }
    
    this.showFeedback(false);
    
    setTimeout(() => {
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
      this.flippedCards = [];
      this.isLocked = false;
    }, 1000);
  }

  showFeedback(isCorrect) {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed;
      top: 20%;
      left: 50%;
      transform: translateX(-50%);
      font-size: 3rem;
      z-index: 1000;
      pointer-events: none;
      animation: feedbackPop 0.5s ease;
    `;
    feedback.textContent = isCorrect ? '✅' : '❌';
    document.body.appendChild(feedback);
    
    setTimeout(() => feedback.remove(), 500);
  }

  updateDisplay() {
    if (this.movesDisplay) this.movesDisplay.textContent = this.moves;
    if (this.pairsDisplay) this.pairsDisplay.textContent = `${this.matchedPairs}/${this.cards.length / 2}`;
  }

  gameComplete() {
    const modal = document.getElementById('memoryCompleteModal');
    if (modal) {
      document.getElementById('memoryMoves').textContent = this.moves;
      const modalInstance = new bootstrap.Modal(modal);
      modalInstance.show();
    }
    
    if (app) {
      app.showConfetti();
      app.showMascotMessage('correct');
    }
  }

  restart() {
    this.setupGame(1);
  }
}

// ==================== PUZZLE GAME ====================
class PuzzleGame {
  constructor() {
    this.pieces = [];
    this.slots = [];
    this.currentEquation = null;
    this.score = 0;
    this.questionGen = new QuestionGenerator(1);
  }

  init() {
    this.puzzleArea = document.getElementById('puzzleArea');
    this.scoreDisplay = document.getElementById('puzzleScore');
    this.questionDisplay = document.getElementById('puzzleQuestion');
    
    this.generatePuzzle();
    this.setupDragAndDrop();
  }

  generatePuzzle() {
    this.currentEquation = this.questionGen.generateAddition();
    
    if (this.questionDisplay) {
      this.questionDisplay.innerHTML = `
        <span class="puzzle-num">${this.currentEquation.num1}</span>
        <span class="math-symbol">+</span>
        <span class="puzzle-num">${this.currentEquation.num2}</span>
        <span class="math-symbol">=</span>
        <div class="puzzle-slot" data-slot="answer"></div>
      `;
    }

    this.generatePieces();
  }

  generatePieces() {
    const answers = [this.currentEquation.answer, ...this.questionGen.generateWrongAnswers(this.currentEquation.answer, 3)];
    const shuffledAnswers = this.shuffle(answers);
    
    this.piecesArea = document.getElementById('piecesArea');
    if (this.piecesArea) {
      this.piecesArea.innerHTML = '';
      
      shuffledAnswers.forEach((answer, index) => {
        const piece = document.createElement('div');
        piece.className = 'puzzle-piece';
        piece.textContent = answer;
        piece.dataset.value = answer;
        piece.draggable = true;
        
        this.piecesArea.appendChild(piece);
      });
    }
  }

  shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  setupDragAndDrop() {
    document.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('puzzle-piece')) {
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/plain', e.target.dataset.value);
      }
    });

    document.addEventListener('dragend', (e) => {
      if (e.target.classList.contains('puzzle-piece')) {
        e.target.classList.remove('dragging');
      }
    });

    document.addEventListener('dragover', (e) => {
      if (e.target.classList.contains('puzzle-slot')) {
        e.preventDefault();
      }
    });

    document.addEventListener('drop', (e) => {
      if (e.target.classList.contains('puzzle-slot')) {
        e.preventDefault();
        this.handleDrop(e);
      }
    });
  }

  handleDrop(e) {
    const value = parseInt(e.dataTransfer.getData('text/plain'));
    const slot = e.target;
    
    if (slot.classList.contains('filled')) return;
    
    slot.textContent = value;
    slot.dataset.value = value;
    slot.classList.add('filled');
    
    if (app) app.playSound('click');
    
    if (value === this.currentEquation.answer) {
      this.handleCorrectAnswer(slot);
    } else {
      this.handleWrongAnswer(slot);
    }
  }

  handleCorrectAnswer(slot) {
    this.score += 20;
    
    if (this.scoreDisplay) this.scoreDisplay.textContent = this.score;
    
    slot.style.backgroundColor = '#4CAF50';
    slot.style.color = 'white';
    slot.style.borderColor = '#4CAF50';
    
    if (app) {
      app.playSound('correct');
      app.addCorrect();
      app.showMascotMessage('correct');
      app.showConfetti();
    }
    
    setTimeout(() => {
      this.resetPuzzle();
      this.generatePuzzle();
    }, 1500);
  }

  handleWrongAnswer(slot) {
    slot.style.backgroundColor = '#F44336';
    slot.style.color = 'white';
    slot.style.borderColor = '#F44336';
    
    if (app) {
      app.playSound('wrong');
      app.addWrong();
      app.showMascotMessage('wrong');
    }
    
    setTimeout(() => {
      slot.textContent = '';
      slot.dataset.value = '';
      slot.classList.remove('filled');
      slot.style.backgroundColor = '';
      slot.style.color = '';
      slot.style.borderColor = '';
    }, 1000);
  }

  resetPuzzle() {
    const pieces = document.querySelectorAll('.puzzle-piece');
    pieces.forEach(p => p.remove());
    
    const slots = document.querySelectorAll('.puzzle-slot');
    slots.forEach(s => {
      s.textContent = '';
      s.dataset.value = '';
      s.classList.remove('filled');
      s.style.backgroundColor = '';
      s.style.color = '';
      s.style.borderColor = '';
    });
  }

  restart() {
    this.score = 0;
    if (this.scoreDisplay) this.scoreDisplay.textContent = 0;
    this.resetPuzzle();
    this.generatePuzzle();
  }
}

// ==================== GAME INITIALIZATION ====================
let balloonGame;
let memoryGame;
let puzzleGame;

document.addEventListener('DOMContentLoaded', () => {
  // Check which game page we're on
  if (document.getElementById('gameArea')) {
    balloonGame = new BalloonGame();
    balloonGame.init();
    
    document.getElementById('restartBtn')?.addEventListener('click', () => balloonGame.restart());
  }
  
  if (document.getElementById('memoryGrid')) {
    memoryGame = new MemoryGame();
    memoryGame.init(1);
    
    document.getElementById('restartMemoryBtn')?.addEventListener('click', () => memoryGame.restart());
  }
  
  if (document.getElementById('puzzleArea')) {
    puzzleGame = new PuzzleGame();
    puzzleGame.init();
    
    document.getElementById('restartPuzzleBtn')?.addEventListener('click', () => puzzleGame.restart());
  }
});

// Export for global access
window.BalloonGame = BalloonGame;
window.MemoryGame = MemoryGame;
window.PuzzleGame = PuzzleGame;
