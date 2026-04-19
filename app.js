const TOTAL_STEPS = 5; // not counting result screen
let currentScreen = 1;

const answers = {
  q1: null,
  q2: null,
  q3: [],
  q4: [],
  q5: null
};

// Initialize
updateProgressAndHeader();

// ================================
// NAVIGATION
// ================================
function goTo(n) {
  const prev = document.getElementById(`screen-${currentScreen}`);
  let nextId = n === 'result' ? 'screen-result' : `screen-${n}`;
  const next = document.getElementById(nextId);
  
  if (!prev || !next) return;

  const goingForward = (n === 'result' || n > currentScreen);

  // Setup transition
  next.style.transition = 'none';
  next.style.transform = goingForward ? 'translateX(60px)' : 'translateX(-60px)';
  next.style.opacity = '0';

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // Exit current
      prev.style.transition = 'opacity 0.28s cubic-bezier(0.4,0,0.2,1), transform 0.28s cubic-bezier(0.4,0,0.2,1)';
      prev.style.opacity = '0';
      prev.style.transform = goingForward ? 'translateX(-60px)' : 'translateX(60px)';

      // Enter next
      next.style.transition = 'opacity 0.28s cubic-bezier(0.4,0,0.2,1), transform 0.28s cubic-bezier(0.4,0,0.2,1)';
      next.classList.add('active');
      next.style.opacity = '1';
      next.style.transform = 'translateX(0)';

      setTimeout(() => {
        prev.classList.remove('active');
        prev.style.transform = '';
        prev.style.opacity = '';
        prev.style.transition = '';
        next.style.transition = '';
        currentScreen = n;
        updateProgressAndHeader();
      }, 300);
    });
  });
}

function goBack() {
  if (currentScreen > 1 && currentScreen !== 'result') {
    goTo(currentScreen - 1);
  }
}

function updateProgressAndHeader() {
  const backBtn = document.getElementById('global-back');
  const progFill = document.getElementById('global-progress');
  
  if (currentScreen === 'result') {
    backBtn.classList.remove('visible');
    progFill.style.width = '100%';
    return;
  }

  // Show/hide back button
  if (currentScreen > 1) {
    backBtn.classList.add('visible');
  } else {
    backBtn.classList.remove('visible');
  }

  // Update progress
  const percentage = (currentScreen / TOTAL_STEPS) * 100;
  progFill.style.width = `${percentage}%`;
}


// ================================
// SELECTION
// ================================
function selectSingleAndNext(el, qKey) {
  const parent = el.closest('.choices');
  // Clear others
  parent.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
  // Select this
  el.classList.add('selected');
  answers[qKey] = el.dataset.value;

  // Auto-advance
  setTimeout(() => {
    const nextStep = currentScreen === TOTAL_STEPS ? 'result' : currentScreen + 1;
    if (nextStep === 'result') {
       calculateResult();
    }
    goTo(nextStep);
  }, 250);
}

function toggleMulti(el) {
  el.classList.toggle('selected');
  
  const parent = el.closest('.choices');
  const screenNum = parseInt(parent.closest('.screen').dataset.step);
  const qKey = `q${screenNum}`;

  answers[qKey] = Array.from(parent.querySelectorAll('.choice-card.selected'))
                       .map(c => c.dataset.value);

  // Enable/disable continue button
  const btn = document.getElementById(`btn-s${screenNum}`);
  if (btn) {
    btn.disabled = answers[qKey].length === 0;
  }
}

// ================================
// RESULT LOGIC
// ================================
function calculateResult() {
    let baseCal = answers.q2 === 'male' ? 2200 : 1800;
    
    if (answers.q5 === 'sedentary') baseCal -= 200;
    if (answers.q5 === 'moderate') baseCal += 200;
    if (answers.q5 === 'very') baseCal += 400;
    
    if (answers.q1 === 'confident') baseCal -= 300;

    const types = {
        sedentary: 'Slow metabolizer',
        light: 'Balanced',
        moderate: 'Active burner',
        very: 'High performer'
    };

    document.getElementById('res-calories').textContent = baseCal + ' kcal';
    document.getElementById('res-type').textContent = types[answers.q5] || 'Balanced';
}
