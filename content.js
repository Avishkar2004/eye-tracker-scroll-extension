// Content script to handle scrolling based on eye movement
let scrollTimeout = null;
let isScrolling = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scroll') {
        handleScroll(request.direction, request.amount);
        sendResponse({ success: true });
    }
    return true;
});

function handleScroll(direction, amount) {
    // Debounce rapid scroll commands
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    
    if (isScrolling) {
        return;
    }
    
    isScrolling = true;
    
    const scrollStep = Math.min(amount, 50); // Limit max scroll per step
    const scrollDuration = 100; // ms
    
    if (direction === 'down') {
        smoothScrollDown(scrollStep, scrollDuration);
    } else if (direction === 'up') {
        smoothScrollUp(scrollStep, scrollDuration);
    }
    
    scrollTimeout = setTimeout(() => {
        isScrolling = false;
    }, scrollDuration + 50);
}

function smoothScrollDown(amount, duration) {
    const start = window.pageYOffset;
    const distance = amount;
    let startTime = null;
    
    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeInOutQuad(timeElapsed, start, distance, duration);
        window.scrollTo(0, run);
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }
    
    requestAnimationFrame(animation);
}

function smoothScrollUp(amount, duration) {
    const start = window.pageYOffset;
    const distance = -amount;
    let startTime = null;
    
    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeInOutQuad(timeElapsed, start, distance, duration);
        window.scrollTo(0, run);
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }
    
    requestAnimationFrame(animation);
}

// Easing function for smooth scrolling
function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
}

