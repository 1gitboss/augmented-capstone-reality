// Button animation component for hover and click effects
AFRAME.registerComponent('button-animation', {
  init: function() {
    this.el.addEventListener('mouseenter', () => {
      // Scale up and increase opacity on hover
      this.el.setAttribute('scale', '1.1 1.1 1.1');
      this.el.setAttribute('material', 'opacity', 1.0);
    });

    this.el.addEventListener('mouseleave', () => {
      // Reset scale and opacity
      this.el.setAttribute('scale', '1 1 1');
      this.el.setAttribute('material', 'opacity', 0.9);
    });

    this.el.addEventListener('click', () => {
      // Brief scale down for click feedback
      this.el.setAttribute('scale', '0.9 0.9 0.9');
      setTimeout(() => {
        this.el.setAttribute('scale', '1 1 1');
      }, 100);
    });
  }
});

// Smooth position component for AR targets
AFRAME.registerComponent('smooth-position', {
  schema: {
    factor: { type: 'number', default: 0.2 }
  },
  
  init: function() {
    this.targetPosition = new THREE.Vector3();
    this.currentPosition = new THREE.Vector3();
    this.isTracking = false;
    
    // Listen for target found/lost events
    const targetEntity = this.el.closest('[mindar-image-target]');
    if (targetEntity) {
      targetEntity.addEventListener('targetFound', () => {
        this.isTracking = true;
        this.targetPosition.copy(this.el.object3D.position);
        this.currentPosition.copy(this.el.object3D.position);
      });
      
      targetEntity.addEventListener('targetLost', () => {
        this.isTracking = false;
      });
    }
  },
  
  tick: function() {
    if (!this.isTracking) return;
    
    this.targetPosition.copy(this.el.object3D.position);
    this.currentPosition.lerp(this.targetPosition, this.data.factor);
    this.el.object3D.position.copy(this.currentPosition);
  }
});

// Artwork info component for display and narration
AFRAME.registerComponent('artwork-info', {
  schema: {
    targetIndex: {type: 'number', default: 0}
  },
  
  init: function () {
    this.showingMoreInfo = false;
    
    const targetEl = this.el.closest('[mindar-image-target]');
    if (targetEl) {
      this.data.targetIndex = targetEl.getAttribute('mindar-image-target').targetIndex;
      console.log(`Target index: ${this.data.targetIndex}`);
    }
    
    this.audioFiles = {
      0: "https://cdn.glitch.global/efbdd796-2226-4f2d-842a-2b1ca1ca40af/The%20Prescence.mp3?v=1743723335478",
      1: "https://cdn.glitch.global/efbdd796-2226-4f2d-842a-2b1ca1ca40af/Otema.mp3?v=1743722546250",
      2: "https://cdn.glitch.global/efbdd796-2226-4f2d-842a-2b1ca1ca40af/Reflection.mp3?v=1743722600927",
      3: "https://cdn.glitch.global/efbdd796-2226-4f2d-842a-2b1ca1ca40af/In%20her%20void.mp3?v=1743722581704",
      4: "https://cdn.glitch.global/efbdd796-2226-4f2d-842a-2b1ca1ca40af/Wade%20in%20Water.mp3?v=1743722614948",
      5: "https://cdn.glitch.global/efbdd796-2226-4f2d-842a-2b1ca1ca40af/Beige-tones.mp3?v=1743722568269",
      6: "https://cdn.glitch.global/efbdd796-2226-4f2d-842a-2b1ca1ca40af/Ajabeng.mp3?v=1743722563296",
      7: "https://cdn.glitch.global/efbdd796-2226-4f2d-842a-2b1ca1ca40af/Nsuo%20mu%20Nsem.mp3?v=1743722591145",
      8: "https://cdn.glitch.global/efbdd796-2226-4f2d-842a-2b1ca1ca40af/Ocean%20view.mp3?v=1743722595401",
      9: "https://cdn.glitch.global/efbdd796-2226-4f2d-842a-2b1ca1ca40af/Extra%20Terrestrial%20Presence.mp3?v=1743722576457",
      10: "https://cdn.glitch.global/efbdd796-2226-4f2d-842a-2b1ca1ca40af/Tranquil%20tones.mp3?v=1743722604645"
    };
    
    // Play welcome audio on page load
    this.el.sceneEl.addEventListener('loaded', () => {
      console.log("A-Frame Loaded!");
      
      const welcomeAudio = document.querySelector('#welcome-audio');
      if (welcomeAudio) {
        welcomeAudio.play().catch(error => {
          console.error("Error playing welcome audio:", error);
        });
      }
      
      const igButton = document.querySelector(`#ig-link-${this.data.targetIndex}`);
      const webButton = document.querySelector(`#web-link-${this.data.targetIndex}`);
      const twitterButton = document.querySelector(`#twitter-link-${this.data.targetIndex}`);
      const youtubeButton = document.querySelector(`#youtube-link-${this.data.targetIndex}`);
      const audioButton = document.querySelector(`#audio-button-${this.data.targetIndex}`);
      const infoButton = document.querySelector(`#more-info-button-${this.data.targetIndex}`);
      const infoPanel = document.querySelector(`#expanded-info-${this.data.targetIndex}`);
      
      this.setupButton(igButton, "https://www.instagram.com/as0maniii/");
      this.setupButton(webButton, "https://nanaasomani.com/");
      this.setupButton(twitterButton, "https://twitter.com/as0mani");
      this.setupButton(youtubeButton, "https://www.behance.net/nanaasomani");
      
      if (audioButton) {
        audioButton.classList.add("clickable");
        audioButton.addEventListener('click', () => {
          console.log("Audio button clicked");
          this.toggleAudio();
        });
      }
      
      if (infoButton && infoPanel) {
        infoButton.classList.add("clickable");
        infoButton.addEventListener('click', () => {
          console.log("More info button clicked");
          this.showingMoreInfo = !this.showingMoreInfo;
          infoPanel.setAttribute('visible', this.showingMoreInfo);
          const infoButtonText = document.querySelector(`#more-info-text-${this.data.targetIndex}`);
          if (infoButtonText) {
            infoButtonText.setAttribute('value', this.showingMoreInfo ? 'Hide Info' : 'More Info');
          }
        });
      }
    });
    
    this.isPlaying = false;
    this.audioElement = null;
    this.createAudioElement();
  },
  
  createAudioElement: function() {
    this.audioElement = document.createElement('audio');
    this.audioElement.id = `audio-narration-${this.data.targetIndex}`;