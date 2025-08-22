// DOM Elements
const form = document.getElementById('waitlistForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const emailError = document.getElementById('emailError');
const ctaText = document.querySelector('.cta .text');
const ctaLoading = document.querySelector('.cta .loading');
const successScreen = document.getElementById('successScreen');
const backButton = document.getElementById('backButton');
const userCountEl = document.getElementById('userCount');
const darkModeToggle = document.getElementById('darkModeToggle');
const scrollToFormBtn = document.getElementById('scrollToForm');

// API Base URL (Trimmed)
const API_BASE = 'https://api.framic.dev'; // Removed extra spaces
let userCount = 1042; // Fallback count

// ====== DARK MODE TOGGLE ======
// Dark Mode
const setDarkMode = (isDark) => {
  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
    // No need to change text — SVG handles it
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
};

// Toggle dark mode
darkModeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'dark';
  setDarkMode(isDark);
});

// Check saved preference or system preference
if (localStorage.getItem('darkMode') === 'enabled') {
  setDarkMode(true);
} else if (localStorage.getItem('darkMode') === 'disabled') {
  setDarkMode(false);
} else {
  // Respect OS preference if not set
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setDarkMode(prefersDark);
}

// ====== SCROLL TO HERO SECTION ======
if (scrollToFormBtn) {
  scrollToFormBtn.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.hero-section').scrollIntoView({ behavior: 'smooth' });
  });
}

// ====== EMAIL VALIDATION ======
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// ====== UPDATE USER COUNT UI ======
const updateUserCount = (count) => {
  if (userCountEl) {
    userCountEl.textContent = `${count.toLocaleString()} people`;
  }
};

// ====== FETCH USER COUNT FROM API ======
const fetchUserCount = async () => {
  try {
    const res = await axios.get(`${API_BASE}/users/count`, { timeout: 5000 });
    if (res.data && typeof res.data.count === 'number') {
      userCount = res.data.count;
      updateUserCount(userCount);
    }
  } catch (err) {
    console.warn('API unreachable – using fallback count', err.message);
    updateUserCount(userCount);
  }
};

// ====== INITIALIZE ON LOAD ======
if (userCountEl) {
  updateUserCount(userCount); // Show initial fallback
  fetchUserCount(); // Try to fetch real count
  setInterval(fetchUserCount, 10000); // Refresh every 10s
}

// ====== FORM SUBMISSION ======
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  emailError.style.display = 'none';

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();

  if (!isValidEmail(email)) {
    emailError.textContent = 'Please enter a valid email.';
    emailError.style.display = 'block';
    return;
  }

  // Disable inputs & show loading
  ctaText.style.display = 'none';
  ctaLoading.style.display = 'inline';
  form.querySelectorAll('input').forEach(input => {
    input.disabled = true;
  });

  try {
    // Attempt real API call
    await axios.post(`${API_BASE}/signup`, { email, name }, { timeout: 5000 });
    userCount++;
    updateUserCount(userCount);
    showSuccess();
  } catch (err) {
    // Fallback: simulate success after delay (UX)
    console.warn('Signup failed – using mock success for UX', err.message);
    setTimeout(() => {
      userCount++;
      updateUserCount(userCount);
      showSuccess();
    }, 1500);
  }
});

// ====== SHOW SUCCESS SCREEN ======
function showSuccess() {
  ctaText.style.display = 'inline';
  ctaLoading.style.display = 'none';
  document.querySelector('.hero-section').style.display = 'none';
  successScreen.style.display = 'block';
}

// ====== BACK TO FORM ======
backButton.addEventListener('click', () => {
  successScreen.style.display = 'none';
  document.querySelector('.hero-section').style.display = 'flex';
  form.reset();
  form.querySelectorAll('input').forEach(input => {
    input.disabled = false;
  });
});

