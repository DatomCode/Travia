// Landing Page Script

    lucide.createIcons();
document.addEventListener('DOMContentLoaded', () => {
    let currentStep = 1;
    const totalSteps = 4;
    const stepInterval = 5000;
    const bgOverlay = document.getElementById('splashBg');

function updateSplash() {
    const cards = document.querySelectorAll('.process-card');
    const segments = document.querySelectorAll('.progress-segment');

    // Reset states
    cards.forEach(card => card.classList.remove('active'));
    segments.forEach(seg => {
        seg.classList.remove('active');
        seg.style.animation = 'none';
        seg.offsetHeight; 
        seg.style.animation = null;
    });

    // Activate New Step
    const activeCard = document.getElementById(`step-${currentStep}`);
    const activeSegment = document.querySelector(`.progress-segment[data-step="${currentStep}"]`);
    
    activeCard.classList.add('active');
    activeSegment.classList.add('active');

    // CHANGE BACKGROUND IMAGE
    const newBg = activeCard.getAttribute('data-bg');
    if (newBg) {
        bgOverlay.style.backgroundImage = `url('${newBg}')`;
    }

    // Increment
    currentStep = currentStep >= totalSteps ? 1 : currentStep + 1;

    if (window.lucide) lucide.createIcons();
}

// Initialize first background
updateSplash();

// Start interval
setInterval(updateSplash, stepInterval);
});

const observerOptions = {
threshold: 0.2
};

const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
    if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
    }
});
}, observerOptions);

document.querySelectorAll('.feature-row').forEach(row => {
observer.observe(row);
});
function switchTab(type, element) {
// Hide all contents
document.querySelectorAll('.tab-content-wrapper').forEach(content => {
    content.style.display = 'none';
    content.classList.remove('active');
});

// Remove active state from buttons
document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

// Show selected content
const activeTab = document.getElementById(`tab-${type}`);
activeTab.style.display = 'block';
element.classList.add('active');

// Refresh icons and animations
lucide.createIcons();
}
