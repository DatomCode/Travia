    lucide.createIcons();

    // Image Slider Logic
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }
    setInterval(nextSlide, 5000);

    // Form Logic
    let userRole = 'farmer';

    function pickRole(role) {
        userRole = role;
        const btn = document.getElementById('final-btn');
        const regTitle = document.getElementById('reg-title');
        
        if(role === 'buyer') {
            btn.classList.add('buyer-theme');
            regTitle.textContent = "Create Buyer Account";
            document.getElementById('buyer-extra').style.display = 'block';
            document.getElementById('farmer-extra').style.display = 'none';
        } else {
            btn.classList.remove('buyer-theme');
            regTitle.textContent = "Create Farmer Account";
            document.getElementById('buyer-extra').style.display = 'none';
            document.getElementById('farmer-extra').style.display = 'block';
        }
        nextStep('step-personal');
    }

    function nextStep(stepId) {
        const active = document.querySelector('.step.active');
        active.classList.add('exit');
        
        setTimeout(() => {
            active.classList.remove('active', 'exit');
            const next = document.getElementById(stepId);
            next.classList.add('active');
        }, 400);
    }

    function goBack(stepId) {
        const active = document.querySelector('.step.active');
        active.classList.remove('active');
        document.getElementById(stepId).classList.add('active');
    }

    // Custom Dropdown Logic
    function toggleSelect(id) {
        // Close others
        document.querySelectorAll('.select-options').forEach(el => {
            if(el.id !== id) el.classList.remove('show');
        });
        document.getElementById(id).classList.toggle('show');
    }

    function selectOption(type, val) {
        document.getElementById(type + 'Value').innerHTML = val + ' <i data-lucide="chevron-down" size="16"></i>';
        lucide.createIcons();
    }

    // Close dropdowns when clicking outside
    window.onclick = function(event) {
        if (!event.target.closest('.custom-select')) {
            document.querySelectorAll('.select-options').forEach(el => el.classList.remove('show'));
        }
    }
function switchContact(type) {
    const emailWrap = document.getElementById('email-input-wrap');
    const phoneWrap = document.getElementById('phone-input-wrap');
    const emailTab = document.getElementById('tab-email');
    const phoneTab = document.getElementById('tab-phone');

    if (type === 'email') {
        emailWrap.style.display = 'block';
        phoneWrap.style.display = 'none';
        emailTab.style.background = 'rgba(255,255,255,0.1)';
        emailTab.style.color = 'white';
        phoneTab.style.background = 'transparent';
        phoneTab.style.color = 'rgba(245,238,216,0.4)';
    } else {
        emailWrap.style.display = 'none';
        phoneWrap.style.display = 'block';
        phoneTab.style.background = 'rgba(255,255,255,0.1)';
        phoneTab.style.color = 'white';
        emailTab.style.background = 'transparent';
        emailTab.style.color = 'rgba(245,238,216,0.4)';
    }
}

function validateAndContinue() {
    const name = document.getElementById('fullName').value;
    const email = document.getElementById('userEmail').value;
    const phone = document.getElementById('userPhone').value;
    
    // Basic check: Name must exist, and EITHER email or phone must have a value
    if (!name) {
        alert("Please enter your full name.");
        return;
    }
    
    if (!email && !phone) {
        alert("Please provide either an email address or a phone number.");
        return;
    }

    nextStep('step-details');
}
function showToast(message, type = 'error') {
    const container = document.getElementById('toast-wrapper');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Choose icon based on type
    const icon = type === 'success' ? 'check-circle' : (type === 'warning' ? 'alert-triangle' : 'x-circle');
    
    toast.innerHTML = `
        <i data-lucide="${icon}" size="18"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Update your validation function to use this:
function validateAndContinue() {
    const name = document.getElementById('fullName').value;
    const email = document.getElementById('userEmail').value;
    const phone = document.getElementById('userPhone').value;
    
    if (!name) {
        showToast("Please enter your full name", "error");
        return;
    }
    
    if (!email && !phone) {
        showToast("Provide an email or phone number", "warning");
        return;
    }

    nextStep('step-details');
}
    function handleReset() {
        const email = document.getElementById('resetEmail').value;
        if (!email) {
            showToast("Please enter your email address", "error");
            return;
        }

        // Simulate API call
        document.getElementById('reset-form-container').style.display = 'none';
        document.getElementById('reset-success').style.display = 'block';
        document.getElementById('sent-to').textContent = email;
        
        showToast("Reset link sent successfully!", "success");
        lucide.createIcons();
    }
function handleGoogleSignIn() {
    console.log("Google Sign-In Triggered");
    // Integrate Google Auth logic here
}