/**
 * ====================================================================
 * SHUBHAM MHASKE PORTFOLIO - 3D INTERACTIVE & ROBOT PERSONALITY ENGINE
 * Python Full Stack Developer | BE CSE Graduate
 * ====================================================================
 */

(function () {
  'use strict';

  /* --------------------------------------------------
   * 1. AUDIO SYNTHESIZER (Web Audio API - No external assets needed!)
   * -------------------------------------------------- */
  class SoundFX {
    constructor() {
      this.enabled = true;
      this.ctx = null;
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      return this.enabled;
    }

    playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.05) {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    }

    // Sound Presets
    hover() {
      this.playTone(520, 'sine', 0.05, 0.02);
    }
    click() {
      this.playTone(880, 'triangle', 0.08, 0.04);
    }
    robotChirp() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.12);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.22);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } catch (e) {}
    }
    robotCurious() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.linearRampToValueAtTime(750, now + 0.15);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } catch (e) {}
    }
    success() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C
        notes.forEach((freq, idx) => {
          setTimeout(() => {
            this.playTone(freq, 'triangle', 0.25, 0.05);
          }, idx * 80);
        });
      } catch (e) {}
    }
  }

  const soundFX = new SoundFX();

  /* --------------------------------------------------
   * 2. THEME CONTROLLER
   * -------------------------------------------------- */
  const THEMES = [
    { name: 'Neon Crimson', primary: '#ff004f', glow: 'rgba(255, 0, 79, 0.4)', rgb: '255, 0, 79' },
    { name: 'Cyber Cyan', primary: '#00e5ff', glow: 'rgba(0, 229, 255, 0.4)', rgb: '0, 229, 255' },
    { name: 'Electric Violet', primary: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', rgb: '168, 85, 247' },
    { name: 'Matrix Emerald', primary: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', rgb: '16, 185, 129' },
    { name: 'Solar Gold', primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', rgb: '245, 158, 11' }
  ];

  let currentThemeIdx = 0;

  function applyTheme(idx) {
    currentThemeIdx = idx % THEMES.length;
    const theme = THEMES[currentThemeIdx];
    document.documentElement.style.setProperty('--primary', theme.primary);
    document.documentElement.style.setProperty('--primary-glow', theme.glow);
    document.documentElement.style.setProperty('--primary-rgb', theme.rgb);
    localStorage.setItem('shubham_theme_idx', currentThemeIdx);
    
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.setAttribute('title', `Theme: ${theme.name} (Click to switch)`);
    }

    if (window.updateThreeTheme) {
      window.updateThreeTheme(theme.primary);
    }
  }

  /* --------------------------------------------------
   * 3. THREE.JS 3D BACKGROUND ENGINE
   * -------------------------------------------------- */
  function initThreeBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle Swarm
    const particleCount = 750;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 80;
      positions[i + 1] = (Math.random() - 0.5) * 80;
      positions[i + 2] = (Math.random() - 0.5) * 60;
      scales[i / 3] = Math.random() * 1.5 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    const pMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(THEMES[currentThemeIdx].primary),
      size: 0.55,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, pMaterial);
    scene.add(particles);

    // Floating 3D Geometric Polyhedra
    const shapesGroup = new THREE.Group();
    const shapeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(THEMES[currentThemeIdx].primary),
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });

    const icosahedron = new THREE.Mesh(new THREE.IcosahedronGeometry(4, 1), shapeMaterial);
    icosahedron.position.set(-18, 10, -5);
    shapesGroup.add(icosahedron);

    const torus = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.8, 8, 24), shapeMaterial);
    torus.position.set(20, -10, -8);
    shapesGroup.add(torus);

    const octahedron = new THREE.Mesh(new THREE.OctahedronGeometry(3, 0), shapeMaterial);
    octahedron.position.set(16, 12, -10);
    shapesGroup.add(octahedron);

    scene.add(shapesGroup);

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.updateThreeTheme = function (colorHex) {
      const col = new THREE.Color(colorHex);
      pMaterial.color = col;
      shapeMaterial.color = col;
    };

    let clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      targetX += (mouseX * 4 - targetX) * 0.05;
      targetY += (mouseY * 4 - targetY) * 0.05;
      camera.position.x = targetX;
      camera.position.y = targetY;
      camera.lookAt(scene.position);

      particles.rotation.y = time * 0.04;
      particles.rotation.x = time * 0.02;

      icosahedron.rotation.x += 0.008;
      icosahedron.rotation.y += 0.01;
      torus.rotation.x += 0.005;
      torus.rotation.y += 0.008;
      octahedron.rotation.y += 0.012;

      icosahedron.position.y = 10 + Math.sin(time * 1.2) * 1.5;
      torus.position.y = -10 + Math.cos(time * 1.4) * 1.5;

      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  /* --------------------------------------------------
   * 4. PROCEDURAL 3D ROBOT ASSISTANT (Hero Canvas & Widget)
   * -------------------------------------------------- */
  function initHero3DRobot() {
    const container = document.getElementById('robot-hero-canvas');
    if (!container || typeof THREE === 'undefined') return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 340;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xff004f, 2, 20);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x00e5ff, 1.5, 20);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    const robotGroup = new THREE.Group();
    scene.add(robotGroup);

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x181824,
      metalness: 0.8,
      roughness: 0.25
    });

    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xeef2ff,
      metalness: 0.3,
      roughness: 0.1
    });

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(THEMES[currentThemeIdx].primary)
    });

    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x050508,
      roughness: 0.1,
      metalness: 0.9
    });

    // 1. Robot Head
    const headGroup = new THREE.Group();
    const headGeo = new THREE.SphereGeometry(1.6, 32, 32);
    headGeo.scale(1, 0.9, 1);
    const head = new THREE.Mesh(headGeo, whiteMat);
    headGroup.add(head);

    const visorGeo = new THREE.SphereGeometry(1.4, 32, 16, 0, Math.PI);
    visorGeo.scale(1.05, 0.65, 0.8);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.rotation.y = Math.PI / 2;
    visor.position.set(0, 0.1, 0.55);
    headGroup.add(visor);

    const eyeGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const leftEye = new THREE.Mesh(eyeGeo, glowMaterial);
    leftEye.position.set(-0.48, 0.15, 1.42);
    leftEye.scale.set(1.4, 0.7, 0.4);
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, glowMaterial);
    rightEye.position.set(0.48, 0.15, 1.42);
    rightEye.scale.set(1.4, 0.7, 0.4);
    headGroup.add(rightEye);

    const antPoleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 12);
    const antPole = new THREE.Mesh(antPoleGeo, bodyMaterial);
    antPole.position.set(0, 1.7, 0);
    headGroup.add(antPole);

    const antTipGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const antTip = new THREE.Mesh(antTipGeo, glowMaterial);
    antTip.position.set(0, 2.1, 0);
    headGroup.add(antTip);

    const podGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.35, 24);
    const leftPod = new THREE.Mesh(podGeo, bodyMaterial);
    leftPod.rotation.z = Math.PI / 2;
    leftPod.position.set(-1.6, 0.1, 0);
    headGroup.add(leftPod);

    const rightPod = new THREE.Mesh(podGeo, bodyMaterial);
    rightPod.rotation.z = Math.PI / 2;
    rightPod.position.set(1.6, 0.1, 0);
    headGroup.add(rightPod);

    robotGroup.add(headGroup);

    // 2. Robot Body (Floating Torso)
    const torsoGroup = new THREE.Group();
    const torsoGeo = new THREE.CylinderGeometry(1.1, 0.75, 1.8, 32);
    const torso = new THREE.Mesh(torsoGeo, whiteMat);
    torso.position.set(0, -1.5, 0);
    torsoGroup.add(torso);

    const coreGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 24);
    const core = new THREE.Mesh(coreGeo, glowMaterial);
    core.rotation.x = Math.PI / 2;
    core.position.set(0, -1.3, 0.95);
    torsoGroup.add(core);

    const handGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const leftHand = new THREE.Mesh(handGeo, whiteMat);
    leftHand.position.set(-1.8, -1.4, 0.4);
    torsoGroup.add(leftHand);

    const rightHand = new THREE.Mesh(handGeo, whiteMat);
    rightHand.position.set(1.8, -1.4, 0.4);
    torsoGroup.add(rightHand);

    const thrusterGeo = new THREE.TorusGeometry(0.65, 0.12, 16, 32);
    const thruster = new THREE.Mesh(thrusterGeo, glowMaterial);
    thruster.rotation.x = Math.PI / 2;
    thruster.position.set(0, -2.4, 0);
    torsoGroup.add(thruster);

    robotGroup.add(torsoGroup);

    let targetRotY = 0;
    let targetRotX = 0;
    let isWaving = false;
    let waveStartTime = 0;

    window.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);

      targetRotY = Math.max(-0.6, Math.min(0.6, dx * 0.8));
      targetRotX = Math.max(-0.4, Math.min(0.4, dy * 0.6));
    });

    container.style.cursor = 'pointer';
    container.addEventListener('click', () => {
      isWaving = true;
      waveStartTime = performance.now();
      soundFX.robotChirp();
      showSparkySpeech("Hello! I'm Sparky, Shubham's AI Companion! 🐍✨");
    });

    const originalUpdate = window.updateThreeTheme;
    window.updateThreeTheme = function (colorHex) {
      if (originalUpdate) originalUpdate(colorHex);
      const col = new THREE.Color(colorHex);
      glowMaterial.color = col;
      pointLight.color = col;
    };

    let clock = new THREE.Clock();

    function renderRobot() {
      requestAnimationFrame(renderRobot);
      const time = clock.getElapsedTime();

      headGroup.rotation.y += (targetRotY - headGroup.rotation.y) * 0.1;
      headGroup.rotation.x += (targetRotX - headGroup.rotation.x) * 0.1;

      robotGroup.position.y = Math.sin(time * 2.2) * 0.22;
      robotGroup.rotation.y = Math.sin(time * 0.8) * 0.08;

      leftHand.position.y = -1.4 + Math.sin(time * 2.5) * 0.12;
      rightHand.position.y = -1.4 + Math.cos(time * 2.5) * 0.12;

      if (isWaving) {
        const elapsed = (performance.now() - waveStartTime) / 1000;
        if (elapsed < 2.0) {
          rightHand.position.set(1.9, -0.6 + Math.sin(elapsed * 12) * 0.3, 0.8);
          headGroup.rotation.z = Math.sin(elapsed * 8) * 0.15;
        } else {
          isWaving = false;
          rightHand.position.set(1.8, -1.4, 0.4);
          headGroup.rotation.z = 0;
        }
      }

      const blinkCycle = time % 4;
      if (blinkCycle > 3.85) {
        leftEye.scale.y = 0.05;
        rightEye.scale.y = 0.05;
      } else {
        leftEye.scale.y = 0.7;
        rightEye.scale.y = 0.7;
      }

      renderer.render(scene, camera);
    }

    renderRobot();

    window.addEventListener('resize', () => {
      const newW = container.clientWidth || 320;
      const newH = container.clientHeight || 340;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    });
  }

  /* --------------------------------------------------
   * 5. SPARKY ROBOT PERSONALITY & INTERACTIVE COMPANION WIDGET
   * -------------------------------------------------- */
  const DIALOGUES = [
    { trigger: 'welcome', text: "👋 Hi there! I'm Sparky, Shubham's AI Assistant. Ready to explore his Python Full Stack projects and skills?", emotion: 'happy' },
    { trigger: 'skills', text: "⚡ Shubham is proficient in Python (95%), Java (70%), Django/Flask, RESTful APIs & modern databases!", emotion: 'idea' },
    { trigger: 'projects', text: "🚀 Check out the AI Crop Disease Detection platform & Hospital Management System!", emotion: 'celebrate' },
    { trigger: 'education', text: "🎓 Shubham has completed his Bachelor of Engineering in Computer Science (BE CSE) from ICEEM!", emotion: 'scan' },
    { trigger: 'contact', text: "💬 Looking for a Python Full Stack Developer? Drop a message below to connect right away!", emotion: 'happy' },
    { trigger: 'joke', text: "🤖 Why do Python programmers have low eyesight? Because they don't C#! 😂🐍", emotion: 'wink' },
    { trigger: 'funfact', text: "💡 Fun fact: Shubham loves writing clean Pythonic code, building robust APIs, and optimizing database queries!", emotion: 'idea' }
  ];

  let isTourRunning = false;

  function showSparkySpeech(text, emotion = 'happy') {
    const bubble = document.getElementById('sparky-bubble-text');
    const bubbleWrapper = document.getElementById('sparky-speech-bubble');
    const widgetAvatar = document.getElementById('sparky-widget-avatar');

    if (bubble && bubbleWrapper) {
      bubble.textContent = text;
      bubbleWrapper.classList.add('visible');
      
      if (widgetAvatar) {
        widgetAvatar.dataset.mood = emotion;
      }

      soundFX.robotCurious();

      clearTimeout(window.sparkySpeechTimeout);
      if (!isTourRunning) {
        window.sparkySpeechTimeout = setTimeout(() => {
          bubbleWrapper.classList.remove('visible');
        }, 8000);
      }
    }
  }

  function startGuidedTour() {
    if (isTourRunning) return;
    isTourRunning = true;
    soundFX.robotChirp();

    const steps = [
      { id: 'header', text: "🚀 Welcome! Let's start the guided tour of Shubham's Python Full Stack Portfolio!", emotion: 'celebrate' },
      { id: 'about', text: "👨‍💻 Shubham is a Python Full Stack Developer with a completed BE in Computer Science.", emotion: 'happy' },
      { id: 'skills', text: "⚡ Core stack: Python (95%), Java (70%), Django/Flask, REST APIs, PostgreSQL/MySQL & Web tools.", emotion: 'idea' },
      { id: 'projects', text: "🏆 Explore standout projects: AI Crop Disease Detection & Hospital Management System!", emotion: 'celebrate' },
      { id: 'education', text: "🎓 Academic background: BE in Computer Science Engineering (Completed).", emotion: 'scan' },
      { id: 'contact', text: "📬 Ready to collaborate or hire Shubham? Send a message or download his resume!", emotion: 'happy' }
    ];

    let currentStep = 0;

    function runStep() {
      if (currentStep >= steps.length) {
        isTourRunning = false;
        showSparkySpeech("🎉 Tour complete! Feel free to explore freely or ask me anything!", 'celebrate');
        if (typeof confetti === 'function') {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.8 } });
        }
        return;
      }

      const step = steps[currentStep];
      const targetEl = document.getElementById(step.id);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        showSparkySpeech(step.text, step.emotion);
      }

      currentStep++;
      setTimeout(runStep, 4500);
    }

    runStep();
  }

  function initSparkyWidget() {
    const triggerBtn = document.getElementById('sparky-trigger-btn');
    const panel = document.getElementById('sparky-panel');
    const closeBtn = document.getElementById('sparky-close-btn');
    const quickPrompts = document.querySelectorAll('.sparky-prompt-btn');

    if (triggerBtn && panel) {
      triggerBtn.addEventListener('click', () => {
        panel.classList.toggle('active');
        soundFX.robotChirp();
        if (panel.classList.contains('active')) {
          showSparkySpeech("How can I assist you today?", 'happy');
        }
      });
    }

    if (closeBtn && panel) {
      closeBtn.addEventListener('click', () => {
        panel.classList.remove('active');
        soundFX.click();
      });
    }

    quickPrompts.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        soundFX.click();

        switch (action) {
          case 'tour':
            startGuidedTour();
            break;
          case 'skills':
            document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' });
            showSparkySpeech(DIALOGUES.find(d => d.trigger === 'skills').text, 'idea');
            break;
          case 'projects':
            document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
            showSparkySpeech(DIALOGUES.find(d => d.trigger === 'projects').text, 'celebrate');
            break;
          case 'joke':
            showSparkySpeech(DIALOGUES.find(d => d.trigger === 'joke').text, 'wink');
            break;
          case 'funfact':
            showSparkySpeech(DIALOGUES.find(d => d.trigger === 'funfact').text, 'idea');
            break;
          case 'contact':
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            showSparkySpeech(DIALOGUES.find(d => d.trigger === 'contact').text, 'happy');
            break;
          case 'theme':
            applyTheme(currentThemeIdx + 1);
            showSparkySpeech(`🎨 Switched theme to ${THEMES[currentThemeIdx].name}!`, 'celebrate');
            soundFX.success();
            break;
          case 'sound':
            const state = soundFX.toggle();
            showSparkySpeech(`🔊 Sound effects are now ${state ? 'ON' : 'OFF'}!`, 'happy');
            break;
        }
      });
    });

    setTimeout(() => {
      showSparkySpeech(DIALOGUES[0].text, 'happy');
    }, 1500);
  }

  /* --------------------------------------------------
   * 6. 3D CARD TILT & SPECULAR HIGHLIGHT
   * -------------------------------------------------- */
  function init3DCardTilt() {
    const cards = document.querySelectorAll('.tilt-card, .skill-card, .card, .education-card');

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    });
  }

  /* --------------------------------------------------
   * 7. DYNAMIC TYPEWRITER EFFECT (Python Full Stack Roles)
   * -------------------------------------------------- */
  function initTypewriter() {
    const el = document.getElementById('typewriter-text');
    if (!el) return;

    const phrases = [
      'Python Full Stack Developer',
      'Django & Flask / REST API Specialist',
      'Full Stack Web Engineer',
      'BE CSE Graduate & Problem Solver'
    ];

    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
      const currentPhrase = phrases[phraseIdx];

      if (isDeleting) {
        el.textContent = currentPhrase.substring(0, charIdx - 1);
        charIdx--;
        typingSpeed = 50;
      } else {
        el.textContent = currentPhrase.substring(0, charIdx + 1);
        charIdx++;
        typingSpeed = 110;
      }

      if (!isDeleting && charIdx === currentPhrase.length) {
        typingSpeed = 1800;
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        typingSpeed = 400;
      }

      setTimeout(type, typingSpeed);
    }

    type();
  }

  /* --------------------------------------------------
   * 8. SKILLS FILTER & PROGRESS BARS
   * -------------------------------------------------- */
  function initSkillsFilters() {
    const filterBtns = document.querySelectorAll('.skill-filter-btn');
    const skillCards = document.querySelectorAll('.skill-card');

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        soundFX.click();

        const filter = btn.dataset.filter;

        skillCards.forEach((card) => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = 'block';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            }, 50);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }

  /* --------------------------------------------------
   * 9. PROJECT MODAL & INTERACTION
   * -------------------------------------------------- */
  const PROJECT_DETAILS = {
    hospital: {
      title: 'Hospital Management System',
      badge: 'Python & Full-Stack Architecture',
      desc: 'A comprehensive, role-based medical management platform architected for hospitals and clinics. Built with granular security and role permissions for Hospital Administrators, Doctors, and Patients.',
      features: [
        '🔐 Multi-tier Authentication & Role-Based Access Control (RBAC)',
        '📅 Real-time Doctor Appointment Scheduling & Slot Booking',
        '📁 Electronic Patient Medical Records (EMR) & Diagnosis History',
        '📊 Administrative Analytics: Patient census, revenue & billing modules',
        '⚡ Relational Database with normalized schema design and optimized queries'
      ],
      tech: ['Python / Django / Flask', 'MySQL / PostgreSQL', 'HTML5/CSS3', 'JavaScript', 'REST APIs'],
      github: 'https://github.com/Shubham976722/Hospital_Management'
    },
    crop: {
      title: 'AI Crop Disease Detection System',
      badge: 'Python, Deep Learning & Web Platform',
      desc: 'An intelligent agricultural platform engineered to detect and classify plant leaf diseases from images using deep learning models. Provides real-time diagnosis, severity analysis, and preventative treatment guidelines.',
      features: [
        '🌿 Deep Convolutional Neural Network (CNN) for accurate multi-class crop disease detection',
        '⚡ High-speed Python Flask inference pipeline with OpenCV image pre-processing',
        '📊 Interactive Web Dashboard generating automated diagnostic health reports & remedies',
        '🛡️ Broad multi-crop support (Tomato, Potato, Corn, Wheat, Apple, Grape)',
        '💾 Database logging for historical field scans and disease trend analytics'
      ],
      tech: ['Python', 'Deep Learning / CNN', 'OpenCV', 'Flask / Web', 'HTML5/CSS3', 'JavaScript', 'SQLite / MySQL'],
      github: 'https://github.com/Shubham976722/Crop_Disease_Detection_System'
    }
  };

  function initProjectModal() {
    const modal = document.getElementById('project-modal');
    const modalClose = document.getElementById('modal-close-btn');
    const modalTriggers = document.querySelectorAll('.project-modal-trigger');

    if (!modal) return;

    modalTriggers.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const projKey = btn.dataset.project;
        const data = PROJECT_DETAILS[projKey];
        if (!data) return;

        soundFX.click();

        document.getElementById('modal-proj-title').textContent = data.title;
        document.getElementById('modal-proj-badge').textContent = data.badge;
        document.getElementById('modal-proj-desc').textContent = data.desc;

        const featList = document.getElementById('modal-proj-features');
        featList.innerHTML = data.features.map(f => `<li>${f}</li>`).join('');

        const techList = document.getElementById('modal-proj-tech');
        techList.innerHTML = data.tech.map(t => `<span class="tech-tag">${t}</span>`).join('');

        const ghLink = document.getElementById('modal-proj-github');
        ghLink.href = data.github;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
      soundFX.click();
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  /* --------------------------------------------------
   * 10. SCROLL OBSERVER & ACTIVE NAVIGATION
   * -------------------------------------------------- */
  function initScrollObserver() {
    const sections = document.querySelectorAll('section, div[id]');
    const navLinks = document.querySelectorAll('nav ul li a, .mobile-nav-link');
    const reveals = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );

    reveals.forEach((el) => revealObserver.observe(el));

    window.addEventListener('scroll', () => {
      let currentSectionId = '';
      const scrollPos = window.scrollY + 200;

      sections.forEach((sec) => {
        if (sec.offsetTop <= scrollPos && sec.offsetTop + sec.offsetHeight > scrollPos) {
          currentSectionId = sec.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    });
  }

  /* --------------------------------------------------
   * 11. MOBILE MENU & QUICK ACTIONS
   * -------------------------------------------------- */
  function initMobileMenu() {
    const hamburger = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-nav-drawer');
    const closeBtn = document.getElementById('mobile-close-btn');
    const links = document.querySelectorAll('.mobile-nav-link');

    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        mobileMenu.classList.add('open');
        soundFX.click();
      });
    }

    function closeMenu() {
      if (mobileMenu) mobileMenu.classList.remove('open');
    }

    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    links.forEach((link) => link.addEventListener('click', closeMenu));
  }

  /* --------------------------------------------------
   * 12. COPY TO CLIPBOARD & CONTACT FORM
   * -------------------------------------------------- */
  function initContactHelpers() {
    const copyBtns = document.querySelectorAll('.copy-btn');
    copyBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const textToCopy = btn.dataset.copy;
        navigator.clipboard.writeText(textToCopy).then(() => {
          soundFX.success();
          const origText = btn.innerHTML;
          btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
          showSparkySpeech(`📋 Copied ${textToCopy} to your clipboard!`, 'celebrate');
          setTimeout(() => {
            btn.innerHTML = origText;
          }, 2500);
        });
      });
    });

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      const sheetURL = "https://script.google.com/macros/s/AKfycbxw52r2xvGBFCSa1aN1LYoVppk2udZFtOrlSW3Ow4qAGpwLEJyMthmE2t0ZmQEicLWm/exec";
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Transmitting...';
        }

        const formData = new FormData(contactForm);

        fetch(sheetURL, {
          method: 'POST',
          body: formData
        })
          .then((res) => {
            soundFX.success();
            if (typeof confetti === 'function') {
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
            }
            showSparkySpeech("🎉 Message sent successfully! Shubham will get back to you shortly!", 'celebrate');
            showToast("Message sent successfully! 🚀", "success");
            contactForm.reset();
          })
          .catch((err) => {
            console.error('Error!', err.message);
            showToast("Message transmission failed. Please try emailing directly!", "error");
          })
          .finally(() => {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = 'Send Message ➤';
            }
          });
      });
    }
  }

  function showToast(msg, type = "success") {
    const toast = document.createElement('div');
    toast.className = `cyber-toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i> ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  /* --------------------------------------------------
   * 13. TABS (ABOUT SECTION)
   * -------------------------------------------------- */
  window.opentab = function (tabname, event) {
    const tablinks = document.getElementsByClassName("tab-links");
    const tabcontents = document.getElementsByClassName("tab-contents");

    for (let tablink of tablinks) {
      tablink.classList.remove("active-link");
    }
    for (let tabcontent of tabcontents) {
      tabcontent.classList.remove("active-tab");
    }

    if (event && event.currentTarget) {
      event.currentTarget.classList.add("active-link");
    }
    const target = document.getElementById(tabname);
    if (target) target.classList.add("active-tab");
    soundFX.hover();
  };

  /* --------------------------------------------------
   * INITIALIZE EVERYTHING ON DOM READY
   * -------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('shubham_theme_idx');
    if (savedTheme !== null) {
      applyTheme(parseInt(savedTheme, 10));
    } else {
      applyTheme(0);
    }

    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        applyTheme(currentThemeIdx + 1);
        soundFX.success();
      });
    }

    const soundBtn = document.getElementById('sound-toggle-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const state = soundFX.toggle();
        soundBtn.innerHTML = state ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
        soundFX.hover();
      });
    }

    initThreeBackground();
    initHero3DRobot();
    initSparkyWidget();
    init3DCardTilt();
    initTypewriter();
    initSkillsFilters();
    initProjectModal();
    initScrollObserver();
    initMobileMenu();
    initContactHelpers();
  });

})();
