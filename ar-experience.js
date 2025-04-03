
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
        // Get initial position
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
    
    // Get the current target position
    this.targetPosition.copy(this.el.object3D.position);
    
    // Apply smoothing
    this.currentPosition.lerp(this.targetPosition, this.data.factor);
    
    // Update the position
    this.el.object3D.position.copy(this.currentPosition);
  }
});

// Artwork info component for display and narration
// Modified artwork-info component to use audio files instead of TTS
AFRAME.registerComponent('artwork-info', {
  schema: {
    targetIndex: {type: 'number', default: 0}
  },
  
  init: function () {
    // State for info panel
    this.showingMoreInfo = false;
    
    // Get target index from the mindar-image-target entity
    const targetEl = this.el.closest('[mindar-image-target]');
    if (targetEl) {
      this.data.targetIndex = targetEl.getAttribute('mindar-image-target').targetIndex;
      console.log(`Target index: ${this.data.targetIndex}`);
    }
    
    // Audio file paths for different artworks
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
      10: "https://cdn.glitch.global/efbdd796-2226-4f2d-842a-2b1ca1ca40af/Tranquil%20tones.mp3?v=1743722604645",
      // Add more as needed
    };
    
    // Wait for scene to load
    this.el.sceneEl.addEventListener('loaded', () => { 
      console.log("A-Frame Loaded!");
      
      // Get elements
      const igButton = document.querySelector(`#ig-link-${this.data.targetIndex}`);
      const webButton = document.querySelector(`#web-link-${this.data.targetIndex}`);
      const twitterButton = document.querySelector(`#twitter-link-${this.data.targetIndex}`);
      const youtubeButton = document.querySelector(`#youtube-link-${this.data.targetIndex}`);
      const audioButton = document.querySelector(`#audio-button-${this.data.targetIndex}`);
      const infoButton = document.querySelector(`#more-info-button-${this.data.targetIndex}`);
      const infoPanel = document.querySelector(`#expanded-info-${this.data.targetIndex}`);
      
      // Set up social media buttons
      this.setupButton(igButton, "https://www.instagram.com/as0maniii/");
      this.setupButton(webButton, "https://nanaasomani.com/");
      this.setupButton(twitterButton, "https://twitter.com/as0mani");
      this.setupButton(youtubeButton, "https://www.behance.net/nanaasomani");
      
      // Set up audio button
      if (audioButton) {
        audioButton.classList.add("clickable");
        audioButton.addEventListener('click', () => {
          console.log("Audio button clicked");
          this.toggleAudio();
        });
      }
      
      // Set up more info button
      if (infoButton && infoPanel) {
        infoButton.classList.add("clickable");
        infoButton.addEventListener('click', () => {
          console.log("More info button clicked");
          this.showingMoreInfo = !this.showingMoreInfo;
          
          // Toggle visibility
          infoPanel.setAttribute('visible', this.showingMoreInfo);
          
          // Change button text
          const infoButtonText = document.querySelector(`#more-info-text-${this.data.targetIndex}`);
          if (infoButtonText) {
            infoButtonText.setAttribute('value', this.showingMoreInfo ? 'Hide Info' : 'More Info');
          }
        });
      }
    });
    
    // Audio state
    this.isPlaying = false;
    this.audioElement = null;
    
    // Create audio element
    this.createAudioElement();
  },
  
  createAudioElement: function() {
    // Create HTML audio element
    this.audioElement = document.createElement('audio');
    this.audioElement.id = `audio-narration-${this.data.targetIndex}`;
    
    // Set audio file based on target index
    const audioSrc = this.audioFiles[this.data.targetIndex] || "";
    if (audioSrc) {
      this.audioElement.src = audioSrc;
    }
    
    // Add event listeners
    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false;
      const audioButtonPic = document.querySelector(`#audio-button-pic-${this.data.targetIndex}`);
      if (audioButtonPic) {
        audioButtonPic.setAttribute("src", "https://cdn.glitch.global/9b643d33-8eab-444c-bfc4-185db20906b5/play%20(1).png?v=1741624616933");
      }
    });
    
    // Add the audio element to the DOM (hidden)
    document.body.appendChild(this.audioElement);
  },
  
  setupButton: function(button, url) {
    if (button) {
      button.classList.add("clickable");
      button.addEventListener('click', () => {
        console.log("Button clicked: " + url);
        window.open(url, "_blank");
      });
    }
  },
  
  toggleAudio: function() {
    // Make sure we have an audio element
    if (!this.audioElement) {
      this.createAudioElement();
    }
    
    const audioButtonPic = document.querySelector(`#audio-button-pic-${this.data.targetIndex}`);
    
    if (!this.isPlaying) {
      // Start playing
      this.audioElement.play()
        .then(() => {
          this.isPlaying = true;
          if (audioButtonPic) {
            audioButtonPic.setAttribute("src", "https://cdn.glitch.global/9b643d33-8eab-444c-bfc4-185db20906b5/pause.png?v=1741624608643");
          }
        })
        .catch(error => {
          console.error("Error playing audio:", error);
          // If audio file can't be loaded, provide feedback
          alert("Couldn't play audio narration. Make sure the audio file exists.");
        });
    } else {
      // Pause playing
      this.audioElement.pause();
      this.isPlaying = false;
      if (audioButtonPic) {
        audioButtonPic.setAttribute("src", "https://cdn.glitch.global/9b643d33-8eab-444c-bfc4-185db20906b5/play%20(1).png?v=1741624616933");
      }
    }
  },
  
  // Clean up when component is removed
  remove: function() {
    if (this.audioElement) {
      this.audioElement.pause();
      if (this.audioElement.parentNode) {
        this.audioElement.parentNode.removeChild(this.audioElement);
      }
    }
  }
});

// Target detection and UI visibility component
AFRAME.registerComponent('mytarget', {
  init: function () {
    let visibilityTimeout = null;
    
    this.el.addEventListener('targetFound', () => {
      console.log("Artwork detected!");

      // Clear any hiding timeout
      if (visibilityTimeout) {
        clearTimeout(visibilityTimeout);
        visibilityTimeout = null;
      }

      // Get the target index
      const targetIndex = this.el.getAttribute('mindar-image-target').targetIndex;

      // Show the elements with the correct IDs
      document.querySelector(`#title-panel-${targetIndex}`).setAttribute("visible", "true");
      document.querySelector(`#controls-panel-${targetIndex}`).setAttribute("visible", "true");
      document.querySelector(`#expanded-info-${targetIndex}`).setAttribute("visible", "false");
    });

    this.el.addEventListener('targetLost', () => {
      console.log("Artwork lost!");

      // Get the target index
      const targetIndex = this.el.getAttribute('mindar-image-target').targetIndex;

      // Add a small delay before hiding
      visibilityTimeout = setTimeout(() => {
        document.querySelector(`#title-panel-${targetIndex}`).setAttribute("visible", "false");
        document.querySelector(`#controls-panel-${targetIndex}`).setAttribute("visible", "false");
        document.querySelector(`#expanded-info-${targetIndex}`).setAttribute("visible", "false");
      }, 300);
    });
  }
});

// Damped movement component
AFRAME.registerComponent('damped-movement', {
  schema: {
    positionDamping: {type: 'number', default: 0.9},
    rotationDamping: {type: 'number', default: 0.8},
    threshold: {type: 'number', default: 0.005}
  },
  
  init: function() {
    this.lastPosition = new THREE.Vector3();
    this.lastRotation = new THREE.Euler();
    this.velocity = new THREE.Vector3();
    this.isTracking = false;
    
    // Setup tracking state monitors
    const targetEntity = this.el.closest('[mindar-image-target]');
    if (targetEntity) {
      targetEntity.addEventListener('targetFound', () => {
        this.isTracking = true;
        this.lastPosition.copy(this.el.object3D.position);
        this.lastRotation.copy(this.el.object3D.rotation);
        this.velocity.set(0, 0, 0);
      });
      
      targetEntity.addEventListener('targetLost', () => {
        this.isTracking = false;
      });
    }
  },
  
  tick: function() {
    if (!this.isTracking) return;
    
    // Get current values
    const currentPos = this.el.object3D.position;
    const currentRot = this.el.object3D.rotation;
    
    // Calculate new velocity with damping
    this.velocity.x = (currentPos.x - this.lastPosition.x) * (1 - this.data.positionDamping);
    this.velocity.y = (currentPos.y - this.lastPosition.y) * (1 - this.data.positionDamping);
    this.velocity.z = (currentPos.z - this.lastPosition.z) * (1 - this.data.positionDamping);
    
    // Apply threshold filter (ignore very small movements)
    if (this.velocity.length() < this.data.threshold) {
      this.velocity.set(0, 0, 0);
    }
    
    // Apply damped position
    const dampedPos = new THREE.Vector3(
      this.lastPosition.x + this.velocity.x,
      this.lastPosition.y + this.velocity.y,
      this.lastPosition.z + this.velocity.z
    );
    
    // Apply rotation damping (simpler approach)
    const dampedRot = new THREE.Euler(
      this.lastRotation.x + (currentRot.x - this.lastRotation.x) * (1 - this.data.rotationDamping),
      this.lastRotation.y + (currentRot.y - this.lastRotation.y) * (1 - this.data.rotationDamping),
      this.lastRotation.z + (currentRot.z - this.lastRotation.z) * (1 - this.data.rotationDamping)
    );
    
    // Update the entity with damped values
    this.el.object3D.position.copy(dampedPos);
    this.el.object3D.rotation.copy(dampedRot);
    
    // Save current values for next frame
    this.lastPosition.copy(dampedPos);
    this.lastRotation.copy(dampedRot);
  }
});