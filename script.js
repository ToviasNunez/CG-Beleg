// Import the necessary THREE.js library
import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.js";
import {
  dataArray,
  getAverageAmplitude,
  getByteFrequencyData,
  getMusic,
  setupAudio,
  setupUIButtons,
} from "./audio.js";

// Declare global variables
let camera, scene, renderer, particles;
let clock = new THREE.Clock(true);
let container;
let waveAmplitude = 1000,
  horizontalWaveAmplitude = 1000,
  sphereRadius = 500;
let averageAmplitude;
let elapsedTime;
// Declare a variable for the ringParticles
let ringParticles;
let bars; // Variable to store the bars
let beatStrength = 0;
let rotationSpeedRing = 0.005; // Set a base rotation speed
// Initialize the scene and start the animation loop

let sandParticles; // Declare a variable for the sand particles
//let playlist;
let nucleus;
let sandParticlesGroup;
let wavesTexture;
const light = new THREE.PointLight(0xee5b48, 1, 50000);

init();
animate();

// Function to initialize the scene
function init() {
  // Create a container div and append it to the document body
  container = document.createElement("div");
  container.id = "music-animation-frequence";
  document.body.appendChild(container);

  // Create a perspective camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.z = 1000;

  // Create a new THREE scene
  scene = new THREE.Scene();

  scene.add(light);

  getMusic();
  createBarsAndNucleusParticles();
  // Set the start time for transition

  // Create a WebGLRenderer
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // renderer.setClearColor(new THREE.Color("black")); // Set background color
  container.appendChild(renderer.domElement);
  // Set up a gradient background
  const gradientTexture = new THREE.Texture(generateGradientWithGalaxy());
  gradientTexture.needsUpdate = true;
  scene.background = gradientTexture;

  // Add event listener for window resize
  window.addEventListener("resize", onWindowResize);

  createParticles();
  setupAudio(setupUIButtons());

  createBasePlatform();
  createSandParticlePlatform();
  createOceanWithSandParticles();
}

// Animation loop function
function animate() {
  // Start the performance profiling session
  console.profile("animationFrame");

  // Request the next animation frame
  requestAnimationFrame(animate);

  // Get elapsed time and audio frequency data
  elapsedTime = clock.getElapsedTime();
  //analyser.getByteFrequencyData(dataArray);
  getByteFrequencyData();

  // Calculate average amplitude and beat strength
  averageAmplitude = getAverageAmplitude();
  const beatStrength = mapRange(averageAmplitude, 0, 255, 0, 1);

  updateBars(beatStrength);

  updateSphere_bar_Particle();
  updateNucleus(beatStrength);
  /*
  // Move the camera in a circular motion around the scene
  const radius = 1000; // Adjust the radius as needed
  const cameraSpeed = 0.1; // Adjust the speed of the camera motion
  const angle = elapsedTime * cameraSpeed;
  const cameraX = radius * Math.cos(angle);
  const cameraZ = radius * Math.sin(angle);
  camera.position.set(cameraX, 0, cameraZ);*/
  camera.lookAt(scene.position);

  // Move the waves texture over time
  wavesTexture.offset.x = elapsedTime * 0.5;
  wavesTexture.offset.y = elapsedTime * 0.5;

  // Rotate the ocean to simulate waves
  sandParticlesGroup.rotation.z = Math.sin(elapsedTime * 0.5) * 0.05;

  // Render the scene
  renderer.render(scene, camera);
}

// Event handler for window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Function to map a value from one range to another
function mapRange(value, inputMin, inputMax, outputMin, outputMax) {
  return (
    ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin) +
    outputMin
  );
}

// Function to create the particle system
function createParticles() {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const colors = [];
  const particleCount = 500;

  // Generate random vertices and colors for particles
  for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    const x = sphereRadius * Math.sin(phi) * Math.cos(theta);
    const y = sphereRadius * Math.sin(phi) * Math.sin(theta);
    const z = sphereRadius * Math.cos(phi);

    vertices.push(x, y, z);

    const color = new THREE.Color(Math.random(), Math.random(), Math.random());
    colors.push(color.r, color.g, color.b);
  }

  // Set position and color attributes for the geometry
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  // Load texture with higher resolution
  const texture = new THREE.TextureLoader().load("./texture/gold.png");

  // Enable mipmapping and anisotropic filtering for better definition
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  // Use MeshStandardMaterial for shading
  const material = new THREE.PointsMaterial({
    size: 10,
    vertexColors: true,
    transparent: true,
    flatShading: true, // Flat shading for a stylized look
    emissive: 0xaaaaaa, // Set the emissive color
    emissiveIntensity: 0.5, // Adjust the emissive intensity
    roughness: 0.5, // Adjust the roughness for the material
    metalness: 0.5, // Adjust the metalness for the material
    // Texture
    map: texture, // Replace with your texture path
  });

  // Create the particles using the geometry and material
  particles = new THREE.Points(geometry, material);
  scene.add(particles);
}

function createBarsAndNucleusParticles() {
  bars = new THREE.Group(); // Create a group to hold the bars
  const barCount = 100; // Number of bars
  const barWidth = 10; // Width of each bar
  const barHeight = 10; // Initial height of each bar

  const nucleusGeometry = createHeartGeometry();

  const nucleusVertices = [];
  const nucleusColors = [];
  const nucleusParticleCount = 5000;

  for (let i = 0; i < nucleusParticleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const particleRadius = Math.random() * 5;

    const x = particleRadius * Math.sin(theta) * Math.cos(phi);
    const y = particleRadius * Math.sin(theta) * Math.sin(phi);
    const z = particleRadius * Math.cos(theta);

    nucleusVertices.push(x, y, z);

    // Set rainbow colors based on particle position
    const hue = (i / nucleusParticleCount) * 360;
    const color = new THREE.Color(`hsl(${hue}, 100%, 50%)`);
    nucleusColors.push(color.r, color.g, color.b);
  }

  nucleusGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(nucleusVertices, 3)
  );
  nucleusGeometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(nucleusColors, 3)
  );

  // Create the material for the nucleus
  const nucleusMaterial = new THREE.MeshBasicMaterial({
    emissive: 0xff4d06,
    emissiveIntensity: 0.5, // Adjust the intensity based on your preference
    transparent: true,
    map: generateGradientTextureNucleus(),
    opacity: 0.8,
  });

  // Create the heart-shaped nucleus
  nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
  scene.add(nucleus);

  // Create bars around the sphere
  for (let i = 0; i < barCount; i++) {
    const geometry = new THREE.BoxGeometry(barWidth, barHeight, barWidth);
    const hue = (i / barCount) * 360;
    const color = new THREE.Color(`hsl(${hue}, 100%, 50%)`);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const bar = new THREE.Mesh(geometry, material);

    // Position each bar around the sphere
    const angle = (i / barCount) * Math.PI * 2;
    const radius = sphereRadius + barHeight / 2; // Adjust the radius if needed

    bar.position.x = radius * Math.sin(angle);
    bar.position.y = 0; // Center of the sphere
    bar.position.z = radius * Math.cos(angle);

    bars.add(bar); // Add each bar to the group
  }

  scene.add(bars); // Add the group of bars to the scene
}

function createHeartGeometry() {
  const heartShape = new THREE.Shape();

  heartShape.moveTo(25, 25);
  heartShape.bezierCurveTo(25, 25, 20, 0, 0, 0);
  heartShape.bezierCurveTo(-30, 0, -30, 35, -30, 35);
  heartShape.bezierCurveTo(-30, 55, -10, 77, 25, 95);
  heartShape.bezierCurveTo(60, 77, 80, 55, 80, 35);
  heartShape.bezierCurveTo(80, 35, 80, 0, 50, 0);
  heartShape.bezierCurveTo(35, 0, 25, 25, 25, 25);

  const extrudeSettings = {
    steps: 2,
    depth: 20,
    bevelEnabled: true,
    bevelThickness: 2,
    bevelSize: 2,
    bevelSegments: 5,
  };

  return new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
}

// Function to create a base platform
function createBasePlatform() {
  const planeGeometry = new THREE.PlaneGeometry(2000, 2000); // Adjust the size as needed
  const planeMaterial = new THREE.MeshBasicMaterial({
    //color: 0xaaaaaa, // Adjust the color as needed
    side: THREE.DoubleSide, // Ensure the plane is visible from both sides
    map: generateGradientTextureBasePlatfrom(),
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);

  // Rotate the plane to be parallel to the ground
  plane.rotation.x = -Math.PI / 2;

  // Set the position of the plane to be below the sphere
  plane.position.y = -500; // Adjust the height as needed

  // Receive shadows on the plane
  plane.receiveShadow = true;

  scene.add(plane);
}

// Modify the createBasePlatform function
function createSandParticlePlatform() {
  sandParticlesGroup = new THREE.Group(); // Create a group for sand particles
  const sandGeometry = new THREE.BufferGeometry();
  const sandMaterial = new THREE.PointsMaterial({
    size: 3,
    vertexColors: true,
    transparent: true,
    flatShading: true, // Flat shading for a stylized look
    emissive: 0xaaaaaa, // Set the emissive color
    emissiveIntensity: 0.5, // Adjust the emissive intensity
    roughness: 0.5, // Adjust the roughness for the material
    //metalness: 0.5, // Adjust the metalness for the material
  });

  const sandParticlesCount = 200000;
  const sandVertices = [];
  const sandColors = [];

  for (let i = 0; i < sandParticlesCount; i++) {
    const x = Math.random() * 2000 - 1000;
    const y = Math.random() * 200 - 100;
    const z = Math.random() * 2000 - 1000;

    // Modify Y position based on a sine wave
    const frequency = 0.01; // Adjust the frequency of the wave
    const amplitude = 20; // Adjust the amplitude of the wave
    const offsetY = Math.sin(x * frequency) * amplitude;

    sandVertices.push(x, y + offsetY, z);
    const sandColor = new THREE.Color(0xeeee99);
    // Set colors based on particle position or any other logic
    const hue = (x + 1000) / 20; // Map x-coordinate to hue
    const saturation = 1;
    const lightness = 0.9 - Math.abs(y / 205) * 0.2; // Adjust lightness based on Y position
    const color = new THREE.Color().setHSL(hue, saturation, lightness);
    //sandColors.push(color.r, color.g, color.b);
    sandColors.push(sandColor.r, sandColor.g, sandColor.b);
  }

  sandGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(sandVertices, 3)
  );
  sandGeometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(sandColors, 3)
  );

  sandParticles = new THREE.Points(sandGeometry, sandMaterial);
  sandParticlesGroup.add(sandParticles);

  sandParticlesGroup.position.set(0, -550, 0);

  scene.add(sandParticlesGroup);
}

function createOceanWithSandParticles() {
  sandParticlesGroup = new THREE.Group(); // Create a group for sand particles
  ///const sandGeometry = new THREE.BufferGeometry();

  const sandGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
  sandGeometry.rotateX(-Math.PI / 3);

  // Load waves texture
  const textureLoader = new THREE.TextureLoader();
  wavesTexture = textureLoader.load("./texture/gold.png");
  wavesTexture.wrapS = THREE.RepeatWrapping;
  wavesTexture.wrapT = THREE.RepeatWrapping;
  wavesTexture.repeat.set(10, 10);

  // Enable mipmapping and anisotropic filtering for better definition
  wavesTexture.minFilter = THREE.LinearMipmapLinearFilter;
  wavesTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const sandMaterial = new THREE.PointsMaterial({
    size: 10,
    vertexColors: true,
    transparent: true,
    flatShading: true, // Flat shading for a stylized look
    emissive: 0xaaaaaa, // Set the emissive color
    emissiveIntensity: 0.5, // Adjust the emissive intensity
    roughness: 0.5, // Adjust the roughness for the material
    metalness: 0.5, // Adjust the metalness for the material
    // Texture
    map: wavesTexture,
  });

  const sandParticlesCount = 50000;
  const sandVertices = [];
  const sandColors = [];

  for (let i = 0; i < sandParticlesCount; i++) {
    const x = Math.random() * 2000 - 1000;
    const y = Math.random() * 200 - 100;
    const z = Math.random() * 2000 - 1000;

    sandVertices.push(x, y, z);

    // Set colors based on particle position or any other logic
    const hue = (x + 1000) / 2000; // Map x-coordinate to hue
    const saturation = 1;
    const lightness = 0.9 - Math.abs(y / 205) * 0.2; // Adjust lightness based on Y position
    const color = new THREE.Color().setHSL(hue, saturation, lightness);
    sandColors.push(color.r, color.g, color.b);
  }

  sandGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(sandVertices, 3)
  );
  sandGeometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(sandColors, 3)
  );

  sandParticles = new THREE.Points(sandGeometry, sandMaterial);
  sandParticlesGroup.add(sandParticles);

  sandParticlesGroup.position.set(0, -450, 0);

  scene.add(sandParticlesGroup);
}

function updateSphere_bar_Particle() {
  // Apply rotation based on audio data
  const rotationSpeed = mapRange(averageAmplitude, 0, 255, 0, 0.002);

  // Rotate the ringParticles in the animation loop
  if (ringParticles) {
    // Adjust rotation speed based on beat
    const rotationSpeedMultiplier = 5; // Adjust the multiplier for more visible effect
    // Use the beatStrength to modify the rotation speed
    rotationSpeedRing =
      rotationSpeedRing + beatStrength * rotationSpeedMultiplier;

    ringParticles.rotation.y += rotationSpeedRing;
  }

  // Rotate the particle bars in the animation loop
  if (bars) {
    bars.rotation.y += rotationSpeed;
  }
  const verticalWave = mapRange(averageAmplitude, 0, 255, 0, waveAmplitude);
  const horizontalWave = mapRange(
    averageAmplitude,
    0,
    255,
    0,
    horizontalWaveAmplitude
  );

  particles.rotation.x += Math.sin(rotationSpeed);
  particles.rotation.y += Math.sin(rotationSpeed);

  // Update particle positions and colors based on audio data
  const positions = particles.geometry.attributes.position.array;
  const colors = particles.geometry.attributes.color.array;

  for (let i = 0, j = 0; i < dataArray.length; i++, j += 3) {
    const scale = Math.cos(dataArray[i] / 10);

    positions[j] *= scale;
    positions[j + 1] *= scale + verticalWave * Math.sin(elapsedTime);
    positions[j + 2] *= scale + horizontalWave * Math.sin(elapsedTime);

    const hue = (i / dataArray.length) * 360;
    const rgbColor = new THREE.Color(`hsl(${hue}, 100%, 50%)`);
    colors[j] = rgbColor.r;
    colors[j + 1] = rgbColor.g;
    colors[j + 2] = rgbColor.b;
  }

  // Update particle attributes
  particles.geometry.attributes.position.needsUpdate = true;
  particles.geometry.attributes.color.needsUpdate = true;
}

function updateNucleus(beatStrength) {
  // Update nucleus rotation and size based on audio data
  const rotationSpeedNucleus = mapRange(averageAmplitude, 0, 255, 0, 0.02);
  nucleus.rotation.x += rotationSpeedNucleus;
  nucleus.rotation.y += rotationSpeedNucleus;

  // Dynamically change the size of the nucleus
  const sizeChangeSpeed = rotationSpeedNucleus * 100;
  const maxSize = 100;
  const minSize = 30;

  nucleus.scale.x += sizeChangeSpeed * Math.sin(elapsedTime);
  nucleus.scale.y += sizeChangeSpeed * Math.sin(elapsedTime);
  nucleus.scale.z += sizeChangeSpeed * Math.sin(elapsedTime);

  // Ensure the nucleus size stays within the specified range
  nucleus.scale.x = Math.min(maxSize, Math.max(minSize, nucleus.scale.x));
  nucleus.scale.y = Math.min(maxSize, Math.max(minSize, nucleus.scale.y));
  nucleus.scale.z = Math.min(maxSize, Math.max(minSize, nucleus.scale.z));

  // Update light position based on nucleus position
  light.position.copy(nucleus.position);

  const hue = mapRange(beatStrength, 0, 1, 0, 360);
  const color = new THREE.Color(`hsl(${hue}, 100%, 50%)`);
  nucleus.material.color = color;
}

// Function to update the bar heights based on beat strength
function updateBars(beatStrength) {
  if (bars) {
    // Iterate over each bar and update its Y-position based on beat strength
    bars.children.forEach((bar, index) => {
      const scaleMultiplier = 1 + beatStrength * 25;
      const scaleY =
        Math.sin(Date.now() * 0.005 + index * 0.1) * scaleMultiplier;
      bar.scale.y = Math.max(0.1, scaleY); // Ensure bars don't shrink too much
    });

    //analyser.getByteFrequencyData(dataArray);
    getByteFrequencyData();

    bars.children.forEach((bar, index) => {
      const hue = (index / bars.children.length) * 360;
      const color = new THREE.Color(
        `hsl(${hue}, 100%, ${50 + beatStrength * 50}%)`
      );
      bar.material.color = color;
    });
  }
}

// Function to generate a gradient texture with stars and nebulae
function generateGradientWithGalaxy() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  // Set canvas size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Create gradient
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#00072D"); // Dark color
  gradient.addColorStop(0.4, "#0A2472"); // Dark color
  gradient.addColorStop(1, "#ff4400"); // Light color

  // Fill the canvas with the gradient
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Add stars
  const numStars = 500;
  for (let i = 0; i < numStars; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 3;

    context.fillStyle = "white";
    context.fillRect(x, y, size, size);
  }

  // Add planet-like nebulae
  const numNebulae = 10;
  for (let i = 0; i < numNebulae; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 100; // Adjust the size range
    const color = `rgb(${Math.random() * 155 + 100}, ${
      Math.random() * 155 + 100
    }, ${Math.random() * 155 + 100})`;
    const borderSize = 5;

    context.beginPath();
    context.arc(x, y, size, 0, 2 * Math.PI);
    context.fillStyle = color;
    context.fill();

    // Add a border to enhance the planet-like appearance
    context.lineWidth = borderSize;
    context.strokeStyle = "rgba(255, 255, 255, 0.3)";
    context.stroke();
  }

  return canvas;
}

// Function to generate a gradient texture
function generateGradientTextureBasePlatfrom() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  // Set canvas size
  const width = 256;
  const height = 256;
  canvas.width = width;
  canvas.height = height;

  // Create gradient
  const gradient = context.createLinearGradient(0, 0, width, height);

  gradient.addColorStop(0.1, "#ff4400"); // Start color
  gradient.addColorStop(1, "#00076f"); // between color
  gradient.addColorStop(1, "#ff4400"); // End color

  // Fill the canvas with the gradient
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  // Create and return a texture
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function generateGradientTextureNucleus() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  // Set canvas size
  const width = 256;
  const height = 256;
  canvas.width = width;
  canvas.height = height;

  // Create gradient
  const gradient = context.createLinearGradient(0, 0, width, height);

  gradient.addColorStop(0, "#f75e25"); // Start color
  gradient.addColorStop(1, "#f54021"); // End color

  // Fill the canvas with the gradient
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  // Create and return a texture
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// set Audio

/*
// Function to set up audio elements
function setupAudio(source) {
  // If audioElement already exists, pause and reset it
  if (audioElement) {
    audioElement.pause();
    audioElement.currentTime = 0;
  }

  // Create an audio element and set up the audio context
  audioElement = new Audio(source);
  audioElement.addEventListener("play", () =>
    console.log("Audio started playing")
  );
  audioElement.addEventListener("pause", () => console.log("Audio paused"));
  audioElement.addEventListener("ended", () => {
    console.log("Audio ended");
    // You can add logic here to play the next track if needed
    playNextTrack();
  });
  audioElement.addEventListener("error", (event) => {
    console.error("Error playing audio:", event);
    console.error("Source:", source);
  });

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const audioSource = audioContext.createMediaElementSource(audioElement);

  // Set up the audio analyser
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  dataArray = new Uint8Array(analyser.frequencyBinCount);

  // Connect audio elements to the analyser and destination
  audioSource.connect(analyser);
  analyser.connect(audioContext.destination);

  // Handle errors and log additional information
  audioElement.addEventListener("error", (event) => {
    console.error("Error loading audio:", event);
    console.error("Source:", source);
  });
}

// Function to set up UI buttons
async function setupUIButtons() {
  const playPauseButton = document.getElementById("playPauseButton");
  const nextButton = document.getElementById("nextButton");

  playPauseButton.addEventListener("click", togglePlayPause);
  nextButton.addEventListener("click", playNextTrack);

  // Initialize the audio element with the first track
  playlist = await getMusic();
  console.log("Initialized audio from playlist", playlist);
  if (playlist.length > 0) {
    initializeAudioElement(playlist[currentTrackIndex]); // here is the
  }
}

function initializeAudioElement(source) {
  if (audioElement) {
    audioElement.pause();
    audioElement.currentTime = 0;
  }

  audioElement = new Audio(source);
  audioElement.addEventListener("play", () =>
    console.log("Audio started playing")
  );
  audioElement.addEventListener("pause", () => console.log("Audio paused"));
  audioElement.addEventListener("ended", () => console.log("Audio ended"));
  audioElement.addEventListener("error", (event) =>
    console.error("Error playing audio:", event)
  );

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const audioSource = audioContext.createMediaElementSource(audioElement);

  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  dataArray = new Uint8Array(analyser.frequencyBinCount);

  audioSource.connect(analyser);
  analyser.connect(audioContext.destination);
  // Handle errors and log additional information
  audioElement.addEventListener("error", (event) => {
    console.error("Error loading audio:", event);
    console.error("Source:", source);
  });
}

// Function to toggle play/pause
function togglePlayPause() {
  if (audioElement.paused) {
    audioElement.play();
  } else {
    audioElement.pause();
  }
}

async function playNextTrack() {
  try {
    if (playlist.length > 0) {
      currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
      const nextTrackSource = playlist[currentTrackIndex];

      console.log("playing next track:", nextTrackSource);
      setupAudio(nextTrackSource);

      // Add an event listener for the "ended" event
      audioElement.addEventListener("ended", onAudioEnded);

      await audioElement.play();

      // Update the playlist display
      updatePlaylistUI();
    }
  } catch (error) {
    console.error("Error playing next track:", error);

    // Optionally, you can handle the error here (e.g., skip to the next track)
    // playNextTrack();
  }
}

// Event handler for the "ended" event
function onAudioEnded() {
  console.log("Audio ended");
  // Remove the event listener to avoid multiple bindings
  audioElement.removeEventListener("ended", onAudioEnded);
  // Play the next track
  playNextTrack();
}


// Function to calculate average amplitude from audio data
function getAverageAmplitude(dataArray) {
  const sum = dataArray.reduce((acc, value) => acc + value, 0);
  return sum / dataArray.length;
}

// Function to update the playlist display
function updatePlaylistUI() {
  const playlistContainer = document.getElementById("playlist-container");
  playlistContainer.innerHTML = "";

  playlist.forEach((track, index) => {
    const trackElement = document.createElement("div");
    trackElement.textContent = track.title;
    trackElement.className = index === currentTrackIndex ? "current-track" : "";
    playlistContainer.appendChild(trackElement);
  });
}

async function getMusic() {
  return new Promise((resolve, reject) => {
    // Update the URL to point to your proxy server
    const apiUrl = "http://localhost:3001/api/music";

    // Fetch data using the proxy server
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        const playlist = data.files;
        console.log("Playlist:", playlist);
        resolve(playlist);
      })
      .catch((error) => {
        console.error("Error fetching music list:", error);
        reject(error);
      });
  });
}

*/
