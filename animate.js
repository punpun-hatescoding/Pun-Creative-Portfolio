
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
            
            // 1. Calculate default top position (under the button)
            const top = rect.bottom + scrollY + 10; 

            // 2. Get Widths
            const menuWidth = menu.offsetWidth || 160; // Fallback if 0
            const screenWidth = window.innerWidth;

            // 3. Default: Align Left edge of menu with Left edge of button
            let left = rect.left + scrollX;

            // 4. COLLISION CHECK: Does it go off the right side?
            if (left + menuWidth > screenWidth) {
                // If yes, align the Right edge of menu with Right edge of button instead
                left = (rect.right + scrollX) - menuWidth;
            }

            // 5. SAFETY CHECK: Does it go off the left side now? (Too far left)
            if (left < 10) { 
                left = 10; // Keep at least 10px from left edge
            }

            // Apply styles
            menu.style.position = 'absolute';
            menu.style.top = top + 'px';
            menu.style.left = left + 'px';
            menu.style.zIndex = '99999';
        }

        function openPortal() {
            if (portalOpen) return;
            // move to body so it's not clipped
            document.body.appendChild(dropdownMenu);
            dropdownMenu.classList.add('open');
            dropdownMenu.classList.add('portal-open');
            positionMenu(dropdownMenu, dropdownBtn);
            portalOpen = true;
            // reposition on scroll/resize
            window.addEventListener('scroll', onWindowChange, {passive:true});
            window.addEventListener('resize', onWindowChange);
        }

        function closePortal() {
            if (!portalOpen) return;
            dropdownMenu.classList.remove('open');
            dropdownMenu.classList.remove('portal-open');
            // restore inline styles
            dropdownMenu.style.position = '';
            dropdownMenu.style.top = '';
            dropdownMenu.style.left = '';
            dropdownMenu.style.minWidth = '';
            dropdownMenu.style.zIndex = '';
            // restore to original parent in the same place
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

        // Toggle via button click
        dropdownBtn.addEventListener('click', function(e){
            e.stopPropagation();
            if (portalOpen) closePortal(); else openPortal();
        });

        // Close when a link inside is clicked
        dropdownMenu.addEventListener('click', function(e){
            if (e.target.tagName === 'A') {
                closePortal();
            }
        });

        // Close when clicking outside the button or the menu
        document.addEventListener('click', function(e){
            const isInsideBtn = !!e.target.closest('.dropdown-btn');
            const isInsideMenu = !!e.target.closest('.dropdown-menu');
            if (!isInsideBtn && !isInsideMenu) closePortal();
        });

        // Close on Escape key
        document.addEventListener('keydown', function(e){
            if (e.key === 'Escape') closePortal();
        });
    })();

   // --- 2. NPC & SPARKLES ---
    const npc = document.getElementById('npc-follower');
    let isMouseMoveThrottle = false; // Variable defined correctly

    // FIX: Removed the incorrect "})();" from the end
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;

        // Update NPC position
        if (npc) {
             npc.style.left = (x + 25) + 'px';
             npc.style.top = (y + 25) + 'px';
        }

        // Throttle the sparkles
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
    // --- 3. TABS ---  
document.addEventListener('DOMContentLoaded', () => {
        const tabs = document.querySelectorAll('.tab-btn');
        const contents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // 1. Remove active class from all tabs and contents
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));

                // 2. Add active class to clicked tab
                tab.classList.add('active');

                // 3. Show the corresponding content
                const targetId = tab.getAttribute('data-target');
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    });
    
// --- 4. DRAGGABLE RPG CHARACTER CARD ---
document.addEventListener('DOMContentLoaded', () => {
        const card = document.querySelector('.character-card');
        const header = document.querySelector('.window-header');
        
        // Find the container (the section) that the card lives inside
        const container = document.querySelector('.about-section');

        let isDragging = false;
        let shiftX, shiftY;

        header.addEventListener('mousedown', (e) => {
            // STOP if on mobile (screen smaller than 768px)
            if (window.innerWidth <= 768) return;

            isDragging = true;
            
            // 1. Calculate the distance between the mouse and the card's top-left corner
            const rect = card.getBoundingClientRect();
            shiftX = e.clientX - rect.left;
            shiftY = e.clientY - rect.top;

            // 2. Change cursor to look like it's gripping
            header.style.cursor = 'grabbing';
            
            // 3. Prevent text selection while dragging
            e.preventDefault(); 
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            // 4. Get the container's position on the screen
            // We need this to subtract it from the math, so the card stays inside the section
            const containerRect = container.getBoundingClientRect();

            // 5. Calculate new position
            // Mouse Position - Container Position - The initial Offset (Shift)
            let newLeft = e.clientX - containerRect.left - shiftX;
            let newTop = e.clientY - containerRect.top - shiftY;

            // 6. Apply the new position
            card.style.left = `${newLeft}px`;
            card.style.top = `${newTop}px`;
            
            // Override flexbox centering
            card.style.transform = 'none'; 
            card.style.margin = '0';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            header.style.cursor = 'grab';
        });
    });

    document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.querySelector('.close-btn');
    const popup = document.getElementById('retro-popup');
    const okBtn = document.querySelector('.ok-btn');

    // 1. Open Popup on X click
    if(closeBtn && popup) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Stop click from affecting other things
            popup.classList.add('active');
            
            // Optional: Play a sound effect here if you want!
            // new Audio('error.mp3').play();
        });
    }

    // 2. Close Popup on OK click
    if(okBtn && popup) {
        okBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            popup.classList.remove('active');
        });
    }
    
    // 3. Close if clicking outside (optional)
    document.addEventListener('click', (e) => {
        if(popup.classList.contains('active') && !popup.contains(e.target)) {
             popup.classList.remove('active');
        }
    });
});

// --- END OF animate.js ---
        