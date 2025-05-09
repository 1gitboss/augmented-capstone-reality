
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

// Advanced position stabilization with low-pass filtering
AFRAME.registerComponent('ar-stabilizer', {
  schema: {
    // Higher values mean more smoothing but more lag
    positionSmoothing: { type: 'number', default: 0.95 },
    rotationSmoothing: { type: 'number', default: 0.92 },
    // How many previous positions to average (higher = smoother but more lag)
    bufferSize: { type: 'int', default: 5 }
  },
  
  init: function() {
    // Position variables
    this.positionBuffer = [];
    this.rawPosition = new THREE.Vector3();
    this.filteredPosition = new THREE.Vector3();
    
    // Rotation variables
    this.rotationBuffer = [];
    this.rawRotation = new THREE.Euler();
    this.filteredRotation = new THREE.Euler();
    
    // Tracking state
    this.isTracking = false;
    this.resetBuffers = true;
    this.lastVisible = false;
    
    // Target entity for events
    const targetEntity = this.el.closest('[mindar-image-target]');
    if (targetEntity) {
      targetEntity.addEventListener('targetFound', () => {
        this.isTracking = true;
        this.resetBuffers = true;
        console.log('AR Stabilizer: Target found');
      });
      
      targetEntity.addEventListener('targetLost', () => {
        this.isTracking = false;
        console.log('AR Stabilizer: Target lost');
      });
    }
  },
  
  tick: function() {
    // Only run when tracking
    if (!this.isTracking) return;
    
    const obj = this.el.object3D;
    
    // Handle visibility changes
    if (obj.visible !== this.lastVisible) {
      if (obj.visible) this.resetBuffers = true;
      this.lastVisible = obj.visible;
    }
    
    // Initialize buffers or reset if needed
    if (this.resetBuffers) {
      this.initializeBuffers(obj);
      this.resetBuffers = false;
      return;
    }
    
    // Store current raw position and rotation
    this.rawPosition.copy(obj.position);
    this.rawRotation.copy(obj.rotation);
    
    // Apply position filtering
    this.updatePositionBuffer(this.rawPosition);
    this.applyPositionFilter();
    obj.position.copy(this.filteredPosition);
    
    // Apply rotation filtering
    this.updateRotationBuffer(this.rawRotation);
    this.applyRotationFilter();
    obj.rotation.copy(this.filteredRotation);
  },
  
  initializeBuffers: function(obj) {
    // Reset position buffer
    this.positionBuffer = [];
    for (let i = 0; i < this.data.bufferSize; i++) {
      this.positionBuffer.push(obj.position.clone());
    }
    this.filteredPosition.copy(obj.position);
    
    // Reset rotation buffer
    this.rotationBuffer = [];
    for (let i = 0; i < this.data.bufferSize; i++) {
      this.rotationBuffer.push(new THREE.Euler(
        obj.rotation.x,
        obj.rotation.y,
        obj.rotation.z,
        obj.rotation.order
      ));
    }
    this.filteredRotation.copy(obj.rotation);
  },
  
  updatePositionBuffer: function(newPosition) {
    this.positionBuffer.push(newPosition.clone());
    if (this.positionBuffer.length > this.data.bufferSize) {
      this.positionBuffer.shift();
    }
  },
  
  updateRotationBuffer: function(newRotation) {
    this.rotationBuffer.push(new THREE.Euler(
      newRotation.x,
      newRotation.y,
      newRotation.z,
      newRotation.order
    ));
    if (this.rotationBuffer.length > this.data.bufferSize) {
      this.rotationBuffer.shift();
    }
  },
  
  applyPositionFilter: function() {
    // Low-pass filter implementation for position
    const alpha = this.data.positionSmoothing;
    
    // Exponential moving average
    this.filteredPosition.x = alpha * this.filteredPosition.x + (1 - alpha) * this.rawPosition.x;
    this.filteredPosition.y = alpha * this.filteredPosition.y + (1 - alpha) * this.rawPosition.y;
    this.filteredPosition.z = alpha * this.filteredPosition.z + (1 - alpha) * this.rawPosition.z;
    
    // Additional buffer average for more stability
    if (this.data.bufferSize > 1) {
      const bufferAvg = new THREE.Vector3();
      this.positionBuffer.forEach(pos => bufferAvg.add(pos));
      bufferAvg.divideScalar(this.positionBuffer.length);
      
      // Blend filtered position with buffer average
      this.filteredPosition.lerp(bufferAvg, 0.3);
    }
  },
  
  applyRotationFilter: function() {
    // Low-pass filter implementation for rotation
    const alpha = this.data.rotationSmoothing;
    
    // Exponential moving average for each axis
    this.filteredRotation.x = alpha * this.filteredRotation.x + (1 - alpha) * this.rawRotation.x;
    this.filteredRotation.y = alpha * this.filteredRotation.y + (1 - alpha) * this.rawRotation.y;
    this.filteredRotation.z = alpha * this.filteredRotation.z + (1 - alpha) * this.rawRotation.z;
  }
});

// Component to stabilize content while keeping the tracking anchor aligned
AFRAME.registerComponent('content-stabilizer', {
  schema: {
    transitionSpeed: { type: 'number', default: 0.08 }
  },
  
  init: function() {
    // Don't create a new container or move children
    // Instead, just track and compensate for movement
    
    // Target state tracking
    this.isTracking = false;
    this.targetVisible = false;
    this.lastPosition = new THREE.Vector3();
    this.lastRotation = new THREE.Euler();
    this.lerpPosition = new THREE.Vector3();
    this.lerpRotation = new THREE.Euler();
    
    // Track child entities we need to stabilize
    this.childEntities = {
      titlePanel: this.el.querySelector(`#title-panel-${this.getTargetIndex()}`),
      controlsPanel: this.el.querySelector(`#controls-panel-${this.getTargetIndex()}`),
      expandedInfo: this.el.querySelector(`#expanded-info-${this.getTargetIndex()}`)
    };
    
    // Store original positions
    this.originalPositions = {};
    for (const [key, entity] of Object.entries(this.childEntities)) {
      if (entity) {
        this.originalPositions[key] = new THREE.Vector3().copy(entity.object3D.position);
      }
    }
    
    // Setup tracking state monitors
    const targetEntity = this.el.closest('[mindar-image-target]');
    if (targetEntity) {
      targetEntity.addEventListener('targetFound', () => {
        this.isTracking = true;
        this.targetVisible = true;
        this.lastPosition.copy(this.el.object3D.position);
        this.lastRotation.copy(this.el.object3D.rotation);
        this.lerpPosition.copy(this.lastPosition);
        this.lerpRotation.copy(this.lastRotation);
      });
      
      targetEntity.addEventListener('targetLost', () => {
        this.targetVisible = false;
        setTimeout(() => {
          if (!this.targetVisible) {
            this.isTracking = false;
          }
        }, 300);
      });
    }
  },
  
  getTargetIndex: function() {
    const targetEntity = this.el.closest('[mindar-image-target]');
    return targetEntity ? targetEntity.getAttribute('mindar-image-target').targetIndex : 0;
  },
  
  tick: function() {
    if (!this.isTracking) return;
    
    // Calculate the delta movement
    const currentPos = this.el.object3D.position;
    const currentRot = this.el.object3D.rotation;
    const deltaPos = new THREE.Vector3().subVectors(currentPos, this.lastPosition);
    
    // Update lerp targets
    this.lerpPosition.add(deltaPos);
    
    // Smooth angles carefully to avoid gimbal lock issues
    this.lerpRotation.x += this.angleDifference(currentRot.x, this.lastRotation.x);
    this.lerpRotation.y += this.angleDifference(currentRot.y, this.lastRotation.y);
    this.lerpRotation.z += this.angleDifference(currentRot.z, this.lastRotation.z);
    
    // Apply compensation to each child entity that needs stabilization
    for (const [key, entity] of Object.entries(this.childEntities)) {
      if (entity) {
        // Calculate compensation position (inverse of parent movement)
        const inversePos = new THREE.Vector3().copy(this.lerpPosition).sub(currentPos);
        
        // Apply to original position
        const originalPos = this.originalPositions[key];
        const stabilizedPos = new THREE.Vector3().copy(originalPos).add(inversePos);
        
        // Update entity position
        entity.object3D.position.copy(stabilizedPos);
      }
    }
    
    // Store current position and rotation for next frame
    this.lastPosition.copy(currentPos);
    this.lastRotation.copy(currentRot);
    
    // Gradually move lerp target toward actual position to avoid drift
    this.lerpPosition.lerp(currentPos, this.data.transitionSpeed);
    
    // Smooth rotation blending
    this.lerpRotation.x = this.approachAngle(this.lerpRotation.x, currentRot.x, this.data.transitionSpeed);
    this.lerpRotation.y = this.approachAngle(this.lerpRotation.y, currentRot.y, this.data.transitionSpeed);
    this.lerpRotation.z = this.approachAngle(this.lerpRotation.z, currentRot.z, this.data.transitionSpeed);
  },
  
  // Helper function to find the smallest angle difference
  angleDifference: function(a, b) {
    let diff = ((a - b + Math.PI) % (Math.PI * 2)) - Math.PI;
    return diff < -Math.PI ? diff + Math.PI * 2 : diff;
  },
  
  // Helper function to smoothly approach an angle
  approachAngle: function(current, target, speed) {
    const diff = this.angleDifference(target, current);
    return current + diff * speed;
  }
});