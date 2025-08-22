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

// API Base URL (Mock or Real)
const API_BASE = 'https://api.framic.dev';
let userCount = 1042; // Fallback

// Dark Mode
const setDarkMode = (isDark) => {
  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
    darkModeToggle.textContent = '🌙';
    localStorage.setItem('darkMode', 'enabled');
  } else {
    document.documentElement.removeAttribute('data-theme');
    darkModeToggle.textContent = '🌞';
    localStorage.setItem('darkMode', 'disabled');
  }
};

// Toggle dark mode
darkModeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'dark';
  setDarkMode(isDark);
});

// Check saved preference
if (localStorage.getItem('darkMode') === 'enabled') {
  setDarkMode(true);
}

// Validation
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Update UI with count
const updateUserCount = (count) => {
  userCountEl.textContent = `${count.toLocaleString()} people`;
};

// Fetch user count
const fetchUserCount = async () => {
  try {
    const res = await axios.get(`${API_BASE}/users/count`, { timeout: 5000 });
    if (res.data && typeof res.data.count === 'number') {
      userCount = res.data.count;
      updateUserCount(userCount);
    }
  } catch (err) {
    console.warn('Using fallback count (API unreachable)');
    updateUserCount(userCount);
  }
};

// On load
fetchUserCount();
setInterval(fetchUserCount, 10000); // Refresh every 10s

// Form Submit
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

  // Disable & show loading
  ctaText.style.display = 'none';
  ctaLoading.style.display = 'inline';
  form.querySelectorAll('input').forEach(i => i.disabled = true);

  // Simulate API call or POST
  try {
    await axios.post(`${API_BASE}/signup`, { email, name }, { timeout: 5000 });
    userCount++;
    updateUserCount(userCount);
    showSuccess();
  } catch (err) {
    // Mock success after failure (UX)
    console.warn('API failed – using mock success');
    setTimeout(() => {
      userCount++;
      updateUserCount(userCount);
      showSuccess();
    }, 1500);
  }
});

function showSuccess() {
  ctaText.style.display = 'inline';
  ctaLoading.style.display = 'none';
  document.querySelector('.landing').style.display = 'none';
  successScreen.style.display = 'block';
}

backButton.addEventListener('click', () => {
  successScreen.style.display = 'none';
  document.querySelector('.landing').style.display = 'flex';
  form.reset();
  form.querySelectorAll('input').forEach(i => i.disabled = false);
});