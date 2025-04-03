// artwork-components.js
// Make sure to include this file AFTER aframe.min.js and any required extensions (like mindar)

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
    
    // Audio narrations for different artworks
    this.narrations = {
      0: "The Presence is a photography project that explores the relationship between humans and the idea of a 'higher spiritual presence' in our lives. In a country like Ghana which is heavily religious, a lot of people base their decision making on the influence of a 'higher' intangible power which serves as a guide to them.",
      1: "Otema is essentially an ode to my friend Otema (subject of the image) celebrating her strength and growth especially in the tech space.",
      2: "Reflection explores the need as human being to ponder over life decision and experiences to better shape our existence.",
      3: "In her void highlights the strength of women in a predominantly male dominated society. This sometimes isolate women in decision making however their unique strengths shine through.",
      4: "Wade in Water explores the relationship between water and human existence. Since time immemorial, water has played a vital role in the formation of civilization and trade.",
      5: "This shoot explores the interaction between brown tones and the human physique. In our part of the world, the colour brown plays a pivotal role in our culture from our skin to our landscapes.",
      6: "Ajabeng was shot during a fitting for the collaboration between Ajabeng x Okuntakinte.",
      7: "Nsuo mu Nsem, similar to Wade in water, explores the relationship between humans and water but this touches more on the spiritual impact of the element. This project was in collaboration with another photographer Joseph Awumee.",
      8: "Ocean view is essentially an interplay of light and shadow on the human physique with the ocean serving as a backdrop.",
      9: "Extra terrestrial Presence similar to The Presence tries to explore the idea of life and the 'influence' of external intangible forces be it spiritual, supernatural or even paranormal.",
      10: "Tranquil tones essentially pays homage to nature and how it is an extension of our lives and pays an important role in our existence.",
      // 11: "Fourth artwork description. This would be the narration for another piece in your collection."
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
    // Cancel any currently playing speech
    speechSynthesis.cancel();
    
    // Create audio element if it doesn't exist
    if (!this.audioElement) {
      this.audioElement = new SpeechSynthesisUtterance();
      this.audioElement.lang = 'en-US';
      this.audioElement.onend = () => {
        this.isPlaying = false;
        const audioButtonPic = document.querySelector(`#audio-button-pic-${this.data.targetIndex}`);
        if (audioButtonPic) audioButtonPic.setAttribute("src", "https://cdn.glitch.global/9b643d33-8eab-444c-bfc4-185db20906b5/play%20(1).png?v=1741624616933");
      };
    }
    
    // Get narration based on target index
    const narration = this.narrations[this.data.targetIndex] || "No description available for this artwork.";
    this.audioElement.text = narration;
    
    // Toggle audio state
    this.isPlaying = !this.isPlaying;
    const audioButtonPic = document.querySelector(`#audio-button-pic-${this.data.targetIndex}`);
    
    if (this.isPlaying) {
      speechSynthesis.speak(this.audioElement);
      if (audioButtonPic) audioButtonPic.setAttribute("src", "https://cdn.glitch.global/9b643d33-8eab-444c-bfc4-185db20906b5/pause.png?v=1741624608643");
    } else {
      speechSynthesis.cancel();
      if (audioButtonPic) audioButtonPic.setAttribute("src", "https://cdn.glitch.global/9b643d33-8eab-444c-bfc4-185db20906b5/play%20(1).png?v=1741624616933");
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