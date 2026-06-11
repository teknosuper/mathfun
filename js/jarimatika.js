// MathFun Indonesia - Jarimatika Module
// Interactive Hand-based Math Learning

class JarimatikaGame {
  constructor() {
    this.currentNumber = 0;
    this.operation = null;
    this.step = 0;
    this.fingers = [];
    this.leftHand = [];
    this.rightHand = [];
    this.isAnimating = false;
  }

  init() {
    this.leftHandEl = document.getElementById('leftHand');
    this.rightHandEl = document.getElementById('rightHand');
    this.displayNumber = document.getElementById('displayNumber');
    this.instructionText = document.getElementById('instructionText');
    this.explanationBox = document.getElementById('explanationBox');
    
    this.setupHands();
  }

  setupHands() {
    // Create fingers for left hand (1-5)
    this.leftHand = [
      { el: document.getElementById('l-thumb'), value: 1 },
      { el: document.getElementById('l-index'), value: 2 },
      { el: document.getElementById('l-middle'), value: 3 },
      { el: document.getElementById('l-ring'), value: 4 },
      { el: document.getElementById('l-pinky'), value: 5 }
    ];

    // Create fingers for right hand (6-10)
    this.rightHand = [
      { el: document.getElementById('r-thumb'), value: 6 },
      { el: document.getElementById('r-index'), value: 7 },
      { el: document.getElementById('r-middle'), value: 8 },
      { el: document.getElementById('r-ring'), value: 9 },
      { el: document.getElementById('r-pinky'), value: 10 }
    ];

    this.fingers = [...this.leftHand, ...this.rightHand];
  }

  // Show number using jarimatika hand gestures
  showNumber(num) {
    this.currentNumber = num;
    this.resetHands();

    if (this.displayNumber) {
      this.displayNumber.textContent = num;
    }

    // Animate showing fingers based on number
    const openCount = Math.min(num, 10);
    
    for (let i = 0; i < openCount; i++) {
      if (this.fingers[i]) {
        this.animateFingerOpen(this.fingers[i].el);
      }
    }

    if (app && app.speak) {
      app.speak(`Angka ${num}`);
    }
  }

  // Addition using jarimatika
  startAddition(num1, num2) {
    this.operation = 'addition';
    this.num1 = num1;
    this.num2 = num2;
    this.step = 0;
    
    this.showInstruction('Langkah 1: Tunjukkan angka ' + num1);
    this.showNumber(num1);
    
    if (app && app.speak) {
      app.speak(`Tunjukkan angka ${num1} dengan jarimu`);
    }
  }

  stepAddition() {
    this.step++;
    
    if (this.step === 1) {
      // Show num2
      this.showInstruction('Langkah 2: Tambahkan ' + num2);
      
      const total = this.num1 + this.num2;
      const currentOpen = Math.min(this.num1, 10);
      const toAdd = Math.min(this.num2, Math.max(0, 10 - this.num1));
      
      // Open additional fingers
      for (let i = 0; i < toAdd; i++) {
        const fingerIndex = currentOpen + i;
        if (this.fingers[fingerIndex]) {
          setTimeout(() => {
            this.animateFingerOpen(this.fingers[fingerIndex].el);
          }, i * 300);
        }
      }
      
      if (app && app.speak) {
        app.speak(`Tambahkan ${num2}. Berapa jarimu sekarang?`);
      }
      
    } else if (this.step === 2) {
      // Show result
      const result = this.num1 + this.num2;
      this.showInstruction('Langkah 3: Hasilnya adalah ' + result);
      this.showNumber(Math.min(result, 10));
      
      if (result > 10) {
        this.showExplanation(`Jadi ${this.num1} + ${this.num2} = ${result}`, 'addition');
      } else {
        this.showExplanation(`Kita punya ${this.num1} apel, lalu ditambah ${this.num2} apel. Sekarang jumlahnya menjadi ${result} apel.`, 'addition');
      }
      
      if (app && app.speak) {
        app.speak(`Hasilnya adalah ${result}`);
      }
    }
  }

  // Subtraction using jarimatika
  startSubtraction(num1, num2) {
    this.operation = 'subtraction';
    this.num1 = num1;
    this.num2 = num2;
    this.step = 0;
    
    this.showInstruction('Langkah 1: Tunjukkan angka ' + num1);
    this.showNumber(num1);
    
    if (app && app.speak) {
      app.speak(`Tunjukkan angka ${num1} dengan jarimu`);
    }
  }

  stepSubtraction() {
    this.step++;
    
    if (this.step === 1) {
      // Show num2 to subtract
      this.showInstruction('Langkah 2: Kurangi dengan ' + num2);
      
      if (app && app.speak) {
        app.speak(`Kurangi ${num2} dengan menutup jari-jari yang sesuai`);
      }
      
    } else if (this.step === 2) {
      // Show result after closing fingers
      const result = this.num1 - this.num2;
      this.showInstruction('Langkah 3: Sisa jari adalah ' + result);
      
      // Animate closing fingers
      const toClose = Math.min(this.num2, this.num1);
      for (let i = 0; i < toClose; i++) {
        const fingerIndex = this.num1 - 1 - i;
        if (this.fingers[fingerIndex]) {
          setTimeout(() => {
            this.animateFingerClose(this.fingers[fingerIndex].el);
          }, i * 300);
        }
      }
      
      setTimeout(() => {
        this.showExplanation(`Awalnya ada ${this.num1} jari terbuka. Ditutup ${this.num2} jari. Sisa ${result} jari terbuka.`, 'subtraction');
      }, toClose * 300 + 500);
      
      if (app && app.speak) {
        app.speak(`Sisa jarinya adalah ${result}`);
      }
    }
  }

  animateFingerOpen(fingerEl) {
    if (!fingerEl) return;
    
    fingerEl.classList.remove('closed');
    fingerEl.style.transform = 'rotate(0deg)';
    fingerEl.style.opacity = '1';
    
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(fingerEl, 
        { rotation: 90, opacity: 0.5 },
        { rotation: 0, opacity: 1, duration: 0.3, ease: 'back' }
      );
    }
    
    if (app) app.playSound('click');
  }

  animateFingerClose(fingerEl) {
    if (!fingerEl) return;
    
    if (typeof gsap !== 'undefined') {
      gsap.to(fingerEl, {
        rotation: 90,
        opacity: 0.5,
        duration: 0.3,
        ease: 'power2'
      });
    } else {
      fingerEl.classList.add('closed');
    }
    
    if (app) app.playSound('click');
  }

  resetHands() {
    this.fingers.forEach(finger => {
      if (finger.el) {
        finger.el.classList.add('closed');
        finger.el.style.transform = 'rotate(90deg)';
        finger.el.style.opacity = '0.5';
      }
    });
  }

  showInstruction(text) {
    if (this.instructionText) {
      this.instructionText.textContent = text;
      
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(this.instructionText, 
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.3 }
        );
      }
    }
  }

  showExplanation(text, type) {
    if (this.explanationBox) {
      const icon = type === 'addition' ? '➕' : '➖';
      this.explanationBox.innerHTML = `
        <h4>${icon} Penjelasan</h4>
        <p>${text}</p>
      `;
      
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(this.explanationBox,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5 }
        );
      }
    }
  }

  // Generate random practice question
  generateQuestion(type = 'mixed') {
    const num1 = Math.floor(Math.random() * 9) + 1;
    let num2;
    
    if (type === 'addition') {
      num2 = Math.floor(Math.random() * (10 - num1)) + 1;
    } else if (type === 'subtraction') {
      num2 = Math.floor(Math.random() * num1) + 1;
    } else {
      if (Math.random() > 0.5) {
        num2 = Math.floor(Math.random() * (10 - num1)) + 1;
        type = 'addition';
      } else {
        num2 = Math.floor(Math.random() * num1) + 1;
        type = 'subtraction';
      }
    }

    return {
      num1,
      num2,
      type,
      answer: type === 'addition' ? num1 + num2 : num1 - num2
    };
  }

  startPractice() {
    const question = this.generateQuestion();
    
    if (question.type === 'addition') {
      this.startAddition(question.num1, question.num2);
    } else {
      this.startSubtraction(question.num1, question.num2);
    }

    return question;
  }
}

// Jarimatika Tutorial Class
class JarimatikaTutorial {
  constructor() {
    this.slides = [
      {
        title: 'Mengenal Jarimatika',
        content: 'Jarimatika adalah cara berhitung menggunakan jari tangan. Dengan jarimatika, kita bisa menghitung dari 0 sampai 99!',
        image: '✋'
      },
      {
        title: 'Jari Tangan Kiri (1-5)',
        content: 'Tangan kiri kita bisa menunjukkan angka 1 sampai 5. Jari kelingking = 1, jari manis = 2, jari tengah = 3, jari telunjuk = 4, dan ibu jari = 5.',
        image: '🤚'
      },
      {
        title: 'Jari Tangan Kanan (6-10)',
        content: 'Tangan kanan menunjukkan angka 6 sampai 10. Ibu jari kanan = 6, jari telunjuk = 7, jari tengah = 8, jari manis = 9, dan jari kelingking = 10.',
        image: '✋'
      },
      {
        title: 'Penjumlahan',
        content: 'Untuk menambah, buka jari sesuai angka pertama, lalu buka jari tambahan untuk angka kedua. Hitung semua jari yang terbuka!',
        image: '➕'
      },
      {
        title: 'Pengurangan',
        content: 'Untuk mengurang, buka jari sesuai angka pertama, lalu tutup jari untuk angka yang dikurangi. Hitung sisa jari yang terbuka!',
        image: '➖'
      }
    ];
    this.currentSlide = 0;
  }

  renderSlide() {
    const slide = this.slides[this.currentSlide];
    return `
      <div class="tutorial-slide">
        <div class="tutorial-icon">${slide.image}</div>
        <h3>${slide.title}</h3>
        <p>${slide.content}</p>
        <div class="tutorial-nav">
          <button onclick="jarimatikaTutorial.prevSlide()" class="btn-mathfun btn-primary-mathfun" ${this.currentSlide === 0 ? 'disabled' : ''}>
            ← Sebelumnya
          </button>
          <span>${this.currentSlide + 1} / ${this.slides.length}</span>
          <button onclick="jarimatikaTutorial.nextSlide()" class="btn-mathfun btn-primary-mathfun" ${this.currentSlide === this.slides.length - 1 ? 'disabled' : ''}>
            Selanjutnya →
          </button>
        </div>
      </div>
    `;
  }

  nextSlide() {
    if (this.currentSlide < this.slides.length - 1) {
      this.currentSlide++;
      this.updateTutorial();
    }
  }

  prevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.updateTutorial();
    }
  }

  updateTutorial() {
    const container = document.getElementById('tutorialContainer');
    if (container) {
      container.innerHTML = this.renderSlide();
    }
  }
}

// Global instances
let jarimatikaGame;
let jarimatikaTutorial;

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('jarimatikaContainer')) {
    jarimatikaGame = new JarimatikaGame();
    jarimatikaGame.init();
  }
  
  if (document.getElementById('tutorialContainer')) {
    jarimatikaTutorial = new JarimatikaTutorial();
    jarimatikaTutorial.updateTutorial();
  }
});

// Export for global access
window.JarimatikaGame = JarimatikaGame;
window.JarimatikaTutorial = JarimatikaTutorial;
