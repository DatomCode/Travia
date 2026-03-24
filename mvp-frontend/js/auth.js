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
