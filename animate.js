// --- 1. DROPDOWN MENU with portal ---
(function(){
    const dropdownBtn = document.querySelector('.dropdown-btn');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    if (!dropdownBtn || !dropdownMenu) return;

    // store original parent to restore later
    const originalParent = dropdownMenu.parentNode;
    const originalNext = dropdownMenu.nextSibling;

    let portalOpen = false;

    function positionMenu(menu, button) {
        const rect = button.getBoundingClientRect();
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;
        
        const top = rect.bottom + scrollY + 10; 
        const menuWidth = menu.offsetWidth || 160; 
        const screenWidth = window.innerWidth;
        let left = rect.left + scrollX;

        if (left + menuWidth > screenWidth) {
            left = (rect.right + scrollX) - menuWidth;
        }
        if (left < 10) { 
            left = 10; 
        }

        menu.style.position = 'absolute';
        menu.style.top = top + 'px';
        menu.style.left = left + 'px';
        menu.style.zIndex = '99999';
    }

    function openPortal() {
        if (portalOpen) return;
        document.body.appendChild(dropdownMenu);
        dropdownMenu.classList.add('open');
        dropdownMenu.classList.add('portal-open');
        positionMenu(dropdownMenu, dropdownBtn);
        portalOpen = true;
        window.addEventListener('scroll', onWindowChange, {passive:true});
        window.addEventListener('resize', onWindowChange);
    }

    function closePortal() {
        if (!portalOpen) return;
        dropdownMenu.classList.remove('open');
        dropdownMenu.classList.remove('portal-open');
        dropdownMenu.style.position = '';
        dropdownMenu.style.top = '';
        dropdownMenu.style.left = '';
        dropdownMenu.style.minWidth = '';
        dropdownMenu.style.zIndex = '';
        
        if (originalNext && originalNext.parentNode === originalParent) {
            originalParent.insertBefore(dropdownMenu, originalNext);
        } else {
            originalParent.appendChild(dropdownMenu);
        }
        portalOpen = false;
        window.removeEventListener('scroll', onWindowChange);
        window.removeEventListener('resize', onWindowChange);
    }

    function onWindowChange(){
        if (!portalOpen) return;
        positionMenu(dropdownMenu, dropdownBtn);
    }

    dropdownBtn.addEventListener('click', function(e){
        e.stopPropagation();
        if (portalOpen) closePortal(); else openPortal();
    });

    dropdownMenu.addEventListener('click', function(e){
        if (e.target.tagName === 'A') {
            closePortal();
        }
    });

    document.addEventListener('click', function(e){
        const isInsideBtn = !!e.target.closest('.dropdown-btn');
        const isInsideMenu = !!e.target.closest('.dropdown-menu');
        if (!isInsideBtn && !isInsideMenu) closePortal();
    });

    document.addEventListener('keydown', function(e){
        if (e.key === 'Escape') closePortal();
    });
})();

// --- 2. NPC & SPARKLES ---
const npc = document.getElementById('npc-follower');
let isMouseMoveThrottle = false; 

document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;

    if (npc) {
            npc.style.left = (x + 25) + 'px';
            npc.style.top = (y + 25) + 'px';
    }

    if (!isMouseMoveThrottle) {
        createSparkle(x, y);
        isMouseMoveThrottle = true;
        setTimeout(() => isMouseMoveThrottle = false, 50);
    }
});

function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');
    document.body.appendChild(sparkle);

    sparkle.style.left = (x + 50) + 'px';
    sparkle.style.top = (y + 50) + 'px';
    const randomX = (Math.random() - 0.5) * 60; 
    sparkle.style.setProperty('--random-x', randomX + 'px');

    setTimeout(() => {
        sparkle.remove();
    }, 1000); 
}

// --- 3. MAIN LOGIC (Popup, Draggable, Tabs) ---
// We combine these into ONE event listener to avoid conflicts
document.addEventListener('DOMContentLoaded', () => {
    
    // --- A. DRAGGABLE CARD LOGIC ---
    const card = document.querySelector('.character-card');
    const header = document.querySelector('.window-header');
    const container = document.querySelector('.about-section');
    
    if (card && header && container) {
        let isDragging = false;
        let shiftX, shiftY;

        header.addEventListener('mousedown', (e) => {
            if (window.innerWidth <= 768) return;
            isDragging = true;
            const rect = card.getBoundingClientRect();
            shiftX = e.clientX - rect.left;
            shiftY = e.clientY - rect.top;
            header.style.cursor = 'grabbing';
            e.preventDefault(); 
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const containerRect = container.getBoundingClientRect();
            let newLeft = e.clientX - containerRect.left - shiftX;
            let newTop = e.clientY - containerRect.top - shiftY;
            card.style.left = `${newLeft}px`;
            card.style.top = `${newTop}px`;
            card.style.transform = 'none'; 
            card.style.margin = '0';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            header.style.cursor = 'grab';
        });
    }

    // --- B. RETRO POPUP LOGIC ---
    const closeBtn = document.querySelector('.close-btn'); 
    const popup = document.getElementById('retro-popup');
    const cancelBtn = document.querySelector('.cancel-btn'); 
    const xPopup = document.getElementById('x'); // <-- Updated as per your request

    function openPopup() {
        if (popup) popup.classList.add('active');
    }

    function closePopup() {
        if (popup) popup.classList.remove('active');
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openPopup();
        });
    }

    if (cancelBtn) cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closePopup();
    });
    
    if (xPopup) xPopup.addEventListener('click', (e) => {
        e.preventDefault();
        closePopup();
    });

    // Close if clicking outside
    document.addEventListener('click', (e) => {
        if (popup && popup.classList.contains('active')) {
            if (!closeBtn.contains(e.target) && !popup.contains(e.target)) {
                closePopup();
            }
        }
    });


    // --- C. TAB LOGIC ---
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    if (tabs.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // 1. Remove 'active' from ALL tabs and contents
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                
                // 2. Add 'active' to the ONE you clicked
                tab.classList.add('active');
                
                // 3. Find the matching content ID (e.g., "skills") and show it
                const targetId = tab.getAttribute('data-target');
                const targetContent = document.getElementById(targetId);
                
                if (targetContent) {
                    targetContent.classList.add('active');
                    console.log(`Switched to tab: ${targetId}`); // Debugging check
                } else {
                    console.error(`Could not find content for id: ${targetId}`);
                }
            });
        });
    }
});


// --- D. LEVEL SELECT HOVER LOGIC ---
    const worldCards = document.querySelectorAll('.world-card');
    const briefTitle = document.getElementById('brief-title');
    const briefDesc = document.getElementById('brief-desc');
    const briefLoot = document.getElementById('brief-loot');

    if (worldCards.length > 0) {
        worldCards.forEach(card => {
            // When mouse enters a card
            card.addEventListener('mouseenter', () => {
                // Get data from the HTML attributes
                const title = card.getAttribute('data-title');
                const desc = card.getAttribute('data-desc');
                const loot = card.getAttribute('data-loot');

                // Update the text box
                briefTitle.innerText = title;
                briefDesc.innerText = desc;
                briefLoot.innerText = loot;
                
                // Optional: Change color slightly to show activity
                briefTitle.style.color = '#fff';
            });

            // When mouse leaves (reset to default)
            card.addEventListener('mouseleave', () => {
                briefTitle.innerText = "SELECT A WORLD...";
                briefDesc.innerText = "Hover over a map to view details.";
                briefLoot.innerText = "---";
                briefTitle.style.color = 'var(--yellowgreen)'; // Reset color
            });
        });
    }


    // --- E. SEND EMAIL LOGIC ---
    const sendBtn = document.getElementById('send-btn');
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            // 1. Change cursor to hourglass
            document.body.style.cursor = 'wait';
            
            // 2. Change Text
            const originalText = sendBtn.innerHTML;
            sendBtn.innerHTML = `<span>Sending...</span>`;
            
            // 3. Fake delay
            setTimeout(() => {
                alert("✨ Message delivered via Magic Cat Mail! 🐱 📨");
                
                // Reset
                sendBtn.innerHTML = originalText;
                document.body.style.cursor = 'default';
                
                // Clear inputs
                document.querySelector('.retro-input').value = '';
                document.querySelector('.retro-textarea').value = '';
                
            }, 1500);
        });
    }
    