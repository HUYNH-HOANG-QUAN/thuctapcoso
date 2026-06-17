// =====================================================
// components/Particles.jsx – Hiệu ứng tuyết rơi + sao băng
// Canvas animation: snowflakes + shooting stars
// =====================================================

import { useEffect, useRef } from "react";

const Particles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationId;
    let particles = [];
    let shootingStars = [];

    // Resize canvas to window
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Snowflake class
    class Snowflake {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -canvas.height;
        this.size = Math.random() * 2.5 + 0.8;
        this.speedY = Math.random() * 0.8 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.6;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.radius = Math.random() * 1.5 + 0.5;
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
        this.twinklePhase = Math.random() * Math.PI * 2;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.y * 0.01) * 0.2;
        this.twinklePhase += this.twinkleSpeed;

        if (this.y > canvas.height + 10) {
          this.reset();
          this.y = -10;
        }
      }

      draw() {
        const twinkle = (Math.sin(this.twinklePhase) + 1) / 2;
        const currentOpacity = this.opacity * (0.5 + twinkle * 0.5);
        const currentSize = this.size * (0.8 + twinkle * 0.4);

        ctx.save();
        ctx.globalAlpha = currentOpacity;

        // Glow
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, currentSize * 3
        );
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.6)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        ctx.restore();
      }
    }

    // Shooting star class
    class ShootingStar {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width * 0.7;
        this.y = Math.random() * canvas.height * 0.4;
        this.length = Math.random() * 120 + 60;
        this.speed = Math.random() * 8 + 4;
        this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;
        this.opacity = 0;
        this.maxOpacity = Math.random() * 0.6 + 0.4;
        this.fadeIn = true;
        this.life = 0;
        this.maxLife = Math.random() * 60 + 40;
        this.active = true;
      }

      update() {
        this.life++;

        if (this.fadeIn) {
          this.opacity = Math.min(this.opacity + 0.08, this.maxOpacity);
          if (this.opacity >= this.maxOpacity) this.fadeIn = false;
        }

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        if (this.life > this.maxLife * 0.6) {
          this.opacity = Math.max(0, this.opacity - 0.04);
        }

        if (this.life > this.maxLife || this.x > canvas.width || this.y > canvas.height) {
          this.active = false;
        }
      }

      draw() {
        if (!this.active || this.opacity <= 0) return;

        const tailX = this.x - Math.cos(this.angle) * this.length;
        const tailY = this.y - Math.sin(this.angle) * this.length;

        const gradient = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
        gradient.addColorStop(0, "rgba(255, 92, 0, 0)");
        gradient.addColorStop(0.4, "rgba(255, 140, 50, 0.4)");
        gradient.addColorStop(0.8, "rgba(255, 200, 100, 0.7)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 1)");

        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(255, 92, 0, 0.5)";

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();

        // Head glow
        const headGradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, 4
        );
        headGradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        headGradient.addColorStop(0.5, "rgba(255, 200, 100, 0.6)");
        headGradient.addColorStop(1, "rgba(255, 92, 0, 0)");

        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = headGradient;
        ctx.fill();

        ctx.restore();
      }
    }

    // Initialize snowflakes
    const SNOWFLAKE_COUNT = 60;
    for (let i = 0; i < SNOWFLAKE_COUNT; i++) {
      const s = new Snowflake();
      s.y = Math.random() * canvas.height;
      particles.push(s);
    }

    // Shoot star periodically
    const spawnStar = () => {
      if (shootingStars.length < 3) {
        shootingStars.push(new ShootingStar());
      }
    };

    let lastStarTime = 0;
    const STAR_INTERVAL = 4000; // every 4s

    // Animation loop
    const animate = (timestamp) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn shooting stars
      if (timestamp - lastStarTime > STAR_INTERVAL) {
        spawnStar();
        lastStarTime = timestamp;
      }

      // Update and draw snowflakes
      for (const p of particles) {
        p.update();
        p.draw();
      }

      // Update and draw shooting stars
      shootingStars = shootingStars.filter((s) => s.active);
      for (const star of shootingStars) {
        star.update();
        star.draw();
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="particles-canvas"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
};

export default Particles;
