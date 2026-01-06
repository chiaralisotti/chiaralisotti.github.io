// Interactive Starry Background with Drift
class InteractiveStars {

    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.init();
    }

    init() {
        // Setup canvas

        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.pointerEvents = 'none';
        document.body.appendChild(this.canvas);
        
        this.isFirstLoad = true; 
        
        this.resize();
        var nstars = prompt();
        this.createStars(nstars);
            
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        if (!this.isFirstLoad) {
            this.createStars(nstars, true);
        }
        this.isFirstLoad = false;
    }
    
    createStars(count, skipSettling = false) {
        this.stars = [];
        for (let i = 0; i < count; i++) {
            const baseX = Math.random() * this.canvas.width;
            const baseY = Math.random() * this.canvas.height;
            
            this.stars.push({
                x: skipSettling ? baseX : Math.random() * this.canvas.width,  // If skipping, start at base position
                y: skipSettling ? baseY : Math.random() * this.canvas.height,
                baseX: baseX,
                baseY: baseY,
                size: Math.random() * 0.2 + 0.8,
                opacity: Math.random() * 0.01 + 0.3,
                twinkleSpeed: Math.random() * 0.01 + 0.01,
                driftX: (Math.random() - 0.5) * 0.2,
                driftY: (Math.random() - 0.5) * 0.2,
                settled: skipSettling  // If skipping, mark as already settled
            });
        }
    }

    
    animate() {

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.stars.forEach(star => {
            // Initial settling animation
            if (!star.settled) {
                star.x += (star.baseX - star.x) * 0.05;
                star.y += (star.baseY - star.y) * 0.05;
                
                const distanceToBase = Math.sqrt(
                    Math.pow(star.baseX - star.x, 2) + 
                    Math.pow(star.baseY - star.y, 2)
                );
                
                if (distanceToBase < 1) {
                    star.settled = true;
                    star.x = star.baseX;
                    star.y = star.baseY;
                }
            } else {
                // Apply gentle drift to base position
                star.baseX += star.driftX;
                star.baseY += star.driftY;
                
                // Wrap around edges
                if (star.baseX < 0) star.baseX = this.canvas.width;
                if (star.baseX > this.canvas.width) star.baseX = 0;
                if (star.baseY < 0) star.baseY = this.canvas.height;
                if (star.baseY > this.canvas.height) star.baseY = 0;
                
                // Calculate distance from mouse
                const dx = this.mouseX - star.baseX;
                const dy = this.mouseY - star.baseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 100; // Influence radius
                
                // Apply subtle force that changes drift direction near mouse
                if (distance < maxDistance) {
                    const force = (maxDistance - distance) / maxDistance;
                    const angle = Math.atan2(dy, dx);
                    
                    // Instead of moving the star, change its drift velocity
                    const forceStrength = 0.8; // How much the mouse affects drift

                    // circular drift around mouse (counterclockwise)
                    star.driftX += Math.cos(angle+Math.PI/2) * force * forceStrength;
                    star.driftY += Math.sin(angle+Math.PI/2) * force * forceStrength;

                    // attract towards mouse
                    // star.driftX += Math.cos(angle) * force * forceStrength;
                    // star.driftY += Math.sin(angle) * force * forceStrength;
                    
                    // Clamp drift speed to prevent stars from going too fast
                    const maxDrift = 1;
                    const driftMagnitude = Math.sqrt(star.driftX ** 2 + star.driftY ** 2);
                    if (driftMagnitude > maxDrift) {
                        star.driftX = (star.driftX / driftMagnitude) * maxDrift;
                        star.driftY = (star.driftY / driftMagnitude) * maxDrift;
                    }
                } else {
                    // Gradually return to original gentle drift speed
                    star.driftX *= 0.99;
                    star.driftY *= 0.99;

                }
                
                star.x = star.baseX;
                star.y = star.baseY;
            }
            
            // Twinkle effect
            star.opacity += star.twinkleSpeed;
            if (star.opacity >= 1 || star.opacity <= 0.6) {
                star.twinkleSpeed *= -1;
            }
            
            // Draw star
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    new InteractiveStars();
});