let toastTimer = null;

function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#0f3d2e] text-[#beedd7] px-6 py-3 rounded-full opacity-0 pointer-events-none transition-all duration-300 z-[9999] shadow-2xl font-manrope font-semibold transform translate-y-4';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    
    // Show toast
    toast.style.opacity = '1';
    toast.style.transform = 'translate(-50%, 0)';
    
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, 16px)';
    }, 2800);
}

document.addEventListener('DOMContentLoaded', () => {
    // Cart logic
    const cartItems = document.querySelectorAll('#cartItemsContainer > div');
    const subtotalEls = document.querySelectorAll('.font-semibold.text-primary, .font-extrabold.text-primary');
    
    document.querySelectorAll('[data-icon="delete"]').forEach(btn => {
        const row = btn.closest('.flex.items-center.justify-between');
        if (row) {
            btn.parentElement.addEventListener('click', () => {
                row.remove();
                showToast('Item removed from cart');
                // Fake update subtotal
                if(document.querySelectorAll('#cartItemsContainer > div').length === 0) {
                    const container = document.getElementById('cartItemsContainer');
                    if(container) {
                        container.innerHTML = '<div class="text-center py-12"><span class="material-symbols-outlined text-6xl text-slate-300 mb-4" data-icon="shopping_basket">shopping_basket</span><h3 class="text-xl font-bold text-primary mb-2">Your Cart is Empty</h3><p class="text-slate-500 mb-6">Looks like you haven\\'t added any fresh produce to your cart yet.</p><a href="buyers-dashboard.html" class="px-6 py-3 bg-primary text-white font-bold rounded-full">Continue Shopping</a></div>';
                    }
                }
            });
        }
    });

    // Favourite Farms logic
    document.querySelectorAll('[title="Remove from favourites"]').forEach(btn => {
        const card = btn.closest('.bg-surface-container-lowest');
        if (card) {
            btn.addEventListener('click', () => {
                card.remove();
                showToast('Farm removed from favourites');
            });
        }
    });
});
