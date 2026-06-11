// MathFun Indonesia - Main Application JavaScript
// Version: 1.0.0

class MathFunApp {
  constructor() {
    this.userData = this.loadUserData();
    this.currentLevel = this.userData.level || 1;
    this.currentXP = this.userData.xp || 0;
    this.streak = this.userData.streak || 0;
    this.totalCorrect = this.userData.totalCorrect || 0;
    this.totalWrong = this.userData.totalWrong || 0;
    this.stars = this.userData.stars || 0;
    this.achievements = this.userData.achievements || [];
    
    this.init();
  }

  init() {
    this.registerServiceWorker();
    this.setupPWA();
    this.initAnimations();
    this.initSound();
    this.updateUI();
    this.initMascot();
    this.initNavigation();
    this.initTextToSpeech();
  }

  // LocalStorage Management
  loadUserData() {
    const data = localStorage.getItem('mathfun_user');
    return data ? JSON.parse(data) : {
      level: 1,
      xp: 0,
      streak: 0,
      totalCorrect: 0,
      totalWrong: 0,
      stars: 0,
      achievements: [],
      practiceHistory: [],
      masteredTopics: []
    };
  }

  saveUserData() {
    localStorage.setItem('mathfun_user', JSON.stringify(this.userData));
  }

  // XP and Level System
  addXP(amount) {
    this.currentXP += amount;
    this.checkLevelUp();
    this.userData.xp = this.currentXP;
    this.saveUserData();
    this.updateUI();
  }

  addCorrect() {
    this.totalCorrect++;
    this.userData.totalCorrect = this.totalCorrect;
    this.streak++;
    this.userData.streak = this.streak;
    this.addXP(10);
    this.checkStreakReward();
    this.saveUserData();
  }

  addWrong() {
    this.totalWrong++;
    this.userData.totalWrong = this.totalWrong;
    this.streak = 0;
    this.userData.streak = this.streak;
    this.saveUserData();
  }

  checkLevelUp() {
    const xpNeeded = this.getXPForLevel(this.currentLevel + 1);
    if (this.currentXP >= xpNeeded) {
      this.currentLevel++;
      this.userData.level = this.currentLevel;
      this.showLevelUpAnimation();
      this.speak('Level up! Selamat naik ke level ' + this.currentLevel);
    }
  }

  getXPForLevel(level) {
    return level * 100;
  }

  checkStreakReward() {
    if (this.streak === 5) {
      this.stars++;
      this.userData.stars = this.stars;
      this.showToast('Bonus! +1 Bintang!', 'success');
      this.speak('Hebat! Lima jawaban benar berturut-turut! Kamu mendapat bintang bonus!');
    } else if (this.streak === 10) {
      this.unlockAchievement('streak_master');
      this.showToast('Achievement Ter Unlock!', 'success');
    }
    this.saveUserData();
  }

  unlockAchievement(achievementId) {
    if (!this.achievements.includes(achievementId)) {
      this.achievements.push(achievementId);
      this.userData.achievements = this.achievements;
      this.saveUserData();
      this.showAchievementModal(achievementId);
    }
  }

  // Service Worker & PWA
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Service Worker registered'))
        .catch(err => console.log('SW registration failed:', err));
    }
  }

  setupPWA() {
    let deferredPrompt;
    const installBtn = document.getElementById('installBtn');

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (installBtn) installBtn.classList.remove('hidden');
    });

    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
            installBtn.classList.add('hidden');
          }
          deferredPrompt = null;
        }
      });
    }
  }

  // Animations with GSAP
  initAnimations() {
    if (typeof gsap !== 'undefined') {
      const heroTitle = document.querySelector('.hero-title');
      const menuCards = document.querySelectorAll('.menu-card');
      if (heroTitle) gsap.from(heroTitle, { duration: 1, y: -50, opacity: 0, ease: 'bounce' });
      if (menuCards.length) gsap.from(menuCards, { duration: 0.8, scale: 0, stagger: 0.1, ease: 'back' });
    }
  }

  // Sound Effects
  initSound() {
    this.sounds = {
      correct: new Audio('/assets/audio/correct.mp3'),
      wrong: new Audio('/assets/audio/wrong.mp3'),
      click: new Audio('/assets/audio/click.mp3'),
      levelUp: new Audio('/assets/audio/levelup.mp3'),
      star: new Audio('/assets/audio/star.mp3')
    };

    this.sounds.correct.volume = 0.5;
    this.sounds.wrong.volume = 0.3;
    this.sounds.click.volume = 0.4;
  }

  playSound(soundName) {
    if (this.sounds && this.sounds[soundName]) {
      this.sounds[soundName].currentTime = 0;
      this.sounds[soundName].play().catch(() => {});
    }
  }

  // Text to Speech
  initTextToSpeech() {
    this.synth = window.speechSynthesis;
    this.voice = null;
    
    if (this.synth) {
      const loadVoices = () => {
        const voices = this.synth.getVoices();
        this.voice = voices.find(v => v.lang.includes('id')) || voices[0];
      };
      loadVoices();
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  speak(text) {
    if (this.synth && this.voice) {
      this.synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = this.voice;
      utterance.lang = 'id-ID';
      utterance.rate = 0.9;
      this.synth.speak(utterance);
    }
  }

  // Mascot - Bimo Si Pintar
  initMascot() {
    this.mascotMessages = {
      welcome: [
        'Halo! Aku Bimo Si Pintar! Mari belajar matematika!',
        'Hai teman-teman! Siap untuk belajar bersama aku?',
        'Selamat datang! Ayo kita belajar berhitung!'
      ],
      correct: [
        'Hebat sekali! Kamu pintar!',
        'Benar! Kerja bagus!',
        'Ya! Kamu sangat pintar!',
        'Mantap! Terus belajarnya!'
      ],
      wrong: [
        'Tidak apa-apa, coba lagi ya!',
        'Belajar dari kesalahan itu bagus!',
        'Ayo coba lagi, kamu pasti bisa!',
        'Tetap semangat!'
      ],
      levelup: [
        'Level up! Kamu hebat!',
        'Selamat! Kamu semakin pintar!',
        ' luar biasa! Level baru!'
      ]
    };
  }

  showMascotMessage(type) {
    const messages = this.mascotMessages[type];
    if (messages && messages.length > 0) {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      const speechBubble = document.querySelector('.mascot-speech');
      if (speechBubble) {
        speechBubble.textContent = randomMessage;
        if (typeof gsap !== 'undefined') {
          gsap.fromTo(speechBubble, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3 });
        }
      }
      this.speak(randomMessage);
    }
  }

  // Navigation
  initNavigation() {
    document.querySelectorAll('a.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        this.playSound('click');
      });
    });
  }

  // UI Updates
  updateUI() {
    const levelBadge = document.querySelector('.level-badge');
    if (levelBadge) {
      levelBadge.innerHTML = `⭐ Level ${this.currentLevel}`;
    }

    const progressBar = document.querySelector('.progress-bar-mathfun');
    if (progressBar) {
      const xpNeeded = this.getXPForLevel(this.currentLevel + 1);
      const xpInLevel = this.currentXP % xpNeeded;
      const progress = (xpInLevel / xpNeeded) * 100;
      progressBar.style.width = progress + '%';
    }

    const starsDisplay = document.querySelector('.stars-display');
    if (starsDisplay) {
      starsDisplay.textContent = '⭐'.repeat(Math.min(this.stars, 5));
    }
  }

  // Toast Notifications
  showToast(message, type = 'info') {
    const container = document.querySelector('.toast-container') || this.createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(toast, { x: 100, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3 });
    }

    setTimeout(() => {
      gsap.to(toast, { x: 100, opacity: 0, duration: 0.3, onComplete: () => toast.remove() });
    }, 3000);
  }

  createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  }

  // Animations
  showConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    const colors = ['#FFD54F', '#4CAF50', '#2196F3', '#E91E63', '#9C27B0', '#FF9800'];
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 2 + 's';
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
      container.appendChild(confetti);
    }

    setTimeout(() => container.remove(), 5000);
  }

  showLevelUpAnimation() {
    this.showConfetti();
    this.playSound('levelUp');
    if (typeof gsap !== 'undefined') {
      gsap.fromTo('.level-badge', { scale: 1.5, duration: 0.5, ease: 'elastic' });
    }
  }

  showAchievementModal(achievementId) {
    const achievements = {
      'first_step': { title: 'Langkah Pertama', icon: '🎉' },
      'streak_master': { title: 'Rajin Berlatih', icon: '🔥' },
      'math_wizard': { title: 'Wizard Matematika', icon: '🧙' },
      'perfect_score': { title: 'Nilai Sempurna', icon: '💯' },
      'speed_demon': { title: 'Cepat Tepat', icon: '⚡' }
    };

    const achievement = achievements[achievementId];
    if (achievement) {
      this.showToast(`Achievement: ${achievement.icon} ${achievement.title}`, 'success');
    }
  }

  // Star Rating Animation
  animateStars(count) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
      if (index < count) {
        setTimeout(() => {
          star.classList.add('active');
          this.playSound('star');
        }, index * 200);
      }
    });
  }

  resetStars() {
    document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
  }
}

// Question Generator Class
class QuestionGenerator {
  constructor(level = 1) {
    this.level = level;
  }

  generateAddition() {
    let max;
    switch(this.level) {
      case 1: max = 10; break;
      case 2: max = 20; break;
      case 3: max = 50; break;
      case 4: max = 100; break;
      case 5: max = 100; break;
      case 6: max = 100; break;
      default: max = 10;
    }

    const a = Math.floor(Math.random() * max) + 1;
    const b = Math.floor(Math.random() * max) + 1;
    
    return {
      type: 'addition',
      num1: a,
      num2: b,
      answer: a + b,
      question: `${a} + ${b} = ?`,
      visualItems: { item1: a, item2: b, symbol: '+' }
    };
  }

  generateSubtraction() {
    let max;
    switch(this.level) {
      case 1: max = 10; break;
      case 2: max = 20; break;
      case 3: max = 50; break;
      case 4: max = 100; break;
      case 5: max = 100; break;
      case 6: max = 100; break;
      default: max = 10;
    }

    let a = Math.floor(Math.random() * max) + 1;
    let b = Math.floor(Math.random() * a) + 1;
    
    return {
      type: 'subtraction',
      num1: a,
      num2: b,
      answer: a - b,
      question: `${a} - ${b} = ?`,
      visualItems: { item1: a, item2: b, symbol: '-' }
    };
  }

  generateColumnAddition() {
    const a = Math.floor(Math.random() * 50) + 10;
    const b = Math.floor(Math.random() * 50) + 10;
    
    return {
      type: 'column_addition',
      num1: a,
      num2: b,
      answer: a + b,
      question: `${a} + ${b}`,
      visualItems: { item1: a, item2: b, symbol: '+' },
      showSteps: true
    };
  }

  generateColumnSubtraction() {
    let a = Math.floor(Math.random() * 90) + 10;
    let b = Math.floor(Math.random() * Math.min(a - 1, 50)) + 10;
    
    return {
      type: 'column_subtraction',
      num1: a,
      num2: b,
      answer: a - b,
      question: `${a} - ${b}`,
      visualItems: { item1: a, item2: b, symbol: '-' },
      showSteps: true
    };
  }

  generateRandom() {
    const types = ['addition', 'subtraction'];
    if (this.level >= 5) types.push('column_addition', 'column_subtraction');
    
    const type = types[Math.floor(Math.random() * types.length)];
    
    switch(type) {
      case 'addition': return this.generateAddition();
      case 'subtraction': return this.generateSubtraction();
      case 'column_addition': return this.generateColumnAddition();
      case 'column_subtraction': return this.generateColumnSubtraction();
      default: return this.generateAddition();
    }
  }

  generateWrongAnswers(correctAnswer, count = 3) {
    const wrongs = new Set();
    while (wrongs.size < count) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const wrong = correctAnswer + (offset === 0 ? 1 : offset);
      if (wrong >= 0 && wrong !== correctAnswer) {
        wrongs.add(wrong);
      }
    }
    return Array.from(wrongs);
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// Visual Item Renderer
class VisualRenderer {
  constructor() {
    this.items = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🍒', '🥝', '🍌', '🍉'];
  }

  getRandomItem() {
    return this.items[Math.floor(Math.random() * this.items.length)];
  }

  renderItems(count, container, item = null) {
    container.innerHTML = '';
    const visualItem = item || this.getRandomItem();
    
    for (let i = 0; i < count; i++) {
      const span = document.createElement('span');
      span.className = 'visual-item';
      span.textContent = visualItem;
      span.style.animationDelay = (i * 0.1) + 's';
      container.appendChild(span);
    }

    return visualItem;
  }

  animateMerge(container1, container2, resultContainer, callback) {
    if (typeof gsap !== 'undefined') {
      const items1 = container1.querySelectorAll('.visual-item');
      const items2 = container2.querySelectorAll('.visual-item');
      
      gsap.to(items2, { 
        x: 200, 
        y: -50, 
        opacity: 0, 
        duration: 0.8, 
        stagger: 0.05,
        onComplete: () => {
          callback();
        }
      });
    } else {
      setTimeout(callback, 800);
    }
  }

  animateRemove(container, count, callback) {
    if (typeof gsap !== 'undefined') {
      const items = container.querySelectorAll('.visual-item');
      const toRemove = Array.from(items).slice(-count);
      
      gsap.to(toRemove, {
        y: -100,
        opacity: 0,
        scale: 0,
        duration: 0.5,
        stagger: 0.1,
        onComplete: callback
      });
    } else {
      setTimeout(callback, count * 100);
    }
  }
}

// Practice Session Manager
class PracticeSession {
  constructor(level, type = 'mixed') {
    this.level = level;
    this.type = type;
    this.questionGen = new QuestionGenerator(level);
    this.visualRenderer = new VisualRenderer();
    this.questions = [];
    this.currentIndex = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.isComplete = false;
  }

  start() {
    this.generateQuestions(10);
    this.currentIndex = 0;
    return this.getCurrentQuestion();
  }

  generateQuestions(count) {
    this.questions = [];
    for (let i = 0; i < count; i++) {
      let question;
      switch(this.type) {
        case 'addition': question = this.questionGen.generateAddition(); break;
        case 'subtraction': question = this.questionGen.generateSubtraction(); break;
        default: question = this.questionGen.generateRandom();
      }
      this.questions.push(question);
    }
  }

  getCurrentQuestion() {
    if (this.currentIndex >= this.questions.length) {
      this.isComplete = true;
      return null;
    }
    return this.questions[this.currentIndex];
  }

  checkAnswer(answer) {
    const question = this.questions[this.currentIndex];
    const isCorrect = parseInt(answer) === question.answer;
    
    if (isCorrect) {
      this.correctCount++;
      app.addCorrect();
    } else {
      this.wrongCount++;
      app.addWrong();
    }

    this.currentIndex++;
    return {
      isCorrect,
      correctAnswer: question.answer,
      explanation: this.generateExplanation(question)
    };
  }

  generateExplanation(question) {
    if (question.type === 'addition') {
      return `Kita punya ${question.num1} lalu ditambah ${question.num2}. Sekarang jumlahnya menjadi ${question.answer}.`;
    } else {
      return `Awalnya ada ${question.num1}. Diambil ${question.num2}. Sisa ${question.answer}.`;
    }
  }

  getResults() {
    const percentage = Math.round((this.correctCount / this.questions.length) * 100);
    let stars = 0;
    if (percentage >= 100) stars = 3;
    else if (percentage >= 70) stars = 2;
    else if (percentage >= 50) stars = 1;

    return {
      total: this.questions.length,
      correct: this.correctCount,
      wrong: this.wrongCount,
      percentage,
      stars,
      level: this.level
    };
  }
}

// Dashboard Manager
class DashboardManager {
  constructor() {
    this.data = app.userData;
  }

  getStats() {
    return {
      totalPractice: this.data.totalCorrect + this.data.totalWrong,
      correctRate: this.data.totalWrong > 0 
        ? Math.round((this.data.totalCorrect / (this.data.totalCorrect + this.data.totalWrong)) * 100)
        : 100,
      currentLevel: this.data.level,
      totalXP: this.data.xp,
      stars: this.data.stars,
      streak: this.data.streak,
      achievements: this.data.achievements.length,
      masteredTopics: this.data.masteredTopics.length
    };
  }

  renderDashboard() {
    const stats = this.getStats();
    
    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid) {
      statsGrid.innerHTML = `
        <div class="stat-card">
          <div class="stat-icon">📚</div>
          <div class="stat-value">${stats.totalPractice}</div>
          <div class="stat-label">Total Latihan</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-value">${stats.correctRate}%</div>
          <div class="stat-label">Nilai Rata-rata</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-value">${stats.totalXP}</div>
          <div class="stat-label">Total XP</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-value">${stats.currentLevel}</div>
          <div class="stat-label">Level Saat Ini</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🌟</div>
          <div class="stat-value">${stats.stars}</div>
          <div class="stat-label">Bintang</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔥</div>
          <div class="stat-value">${stats.streak}</div>
          <div class="stat-label">Streak Terbaik</div>
        </div>
      `;
    }
  }

  exportToPDF() {
    const stats = this.getStats();
    const content = `
      LAPORAN BELAJAR MATHFUN INDONESIA
      ================================
      
      Tanggal: ${new Date().toLocaleDateString('id-ID')}
      
      Statistik:
      - Total Latihan: ${stats.totalPractice}
      - Nilai Rata-rata: ${stats.correctRate}%
      - Total XP: ${stats.totalXP}
      - Level Saat Ini: ${stats.currentLevel}
      - Bintang: ${stats.stars}
      - Streak Terbaik: ${stats.streak}
      - Pencapaian: ${stats.achievements}
      - Materi Dikuasai: ${stats.masteredTopics}
      
      ================================
      MathFun Indonesia
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'laporan-mathfun.txt';
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Global instances
let app;
let dashboardManager;

document.addEventListener('DOMContentLoaded', () => {
  app = new MathFunApp();
  dashboardManager = new DashboardManager();
  
  // Initialize dashboard if on dashboard page
  if (document.querySelector('.dashboard-page')) {
    dashboardManager.renderDashboard();
  }
});

// Export for use in other modules
window.MathFunApp = MathFunApp;
window.QuestionGenerator = QuestionGenerator;
window.VisualRenderer = VisualRenderer;
window.PracticeSession = PracticeSession;
window.DashboardManager = DashboardManager;
