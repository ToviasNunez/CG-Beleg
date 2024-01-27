let currentTrackIndex = 0;
let playlist = [];
let audioElement;
let analyser;
export let dataArray = [];

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

export async function setupAudio(source) {
  if (audioElement) {
    audioElement.pause();
    audioElement.currentTime = 0;
  }

  audioElement = new Audio(source);
  setupAudioListeners();
  setupAnalyser();
}

export async function setupUIButtons() {
  const playPauseButton = document.getElementById("playPauseButton");
  const nextButton = document.getElementById("nextButton");

  playPauseButton.addEventListener("click", togglePlayPause);
  nextButton.addEventListener("click", playNextTrack);

  playlist = await getMusic();
  console.log("Initialized audio from playlist", playlist);

  if (playlist.length > 0) {
    initializeAudioElement(playlist[currentTrackIndex]);
    return playlist;
  }
}

function initializeAudioElement(source) {
  audioElement.pause();
  audioElement.currentTime = 0;
  audioElement.src = source;
  setupAudioListeners();
  setupAnalyser();
}

function setupAudioListeners() {
  audioElement.addEventListener("play", () =>
    console.log("Audio started playing")
  );
  audioElement.addEventListener("pause", () => console.log("Audio paused"));
  audioElement.addEventListener("ended", () => playNextTrack());
  audioElement.addEventListener("error", (event) =>
    handleAudioError(event, audioElement.src)
  );
}

function setupAnalyser() {
  const audioSource = audioContext.createMediaElementSource(audioElement);
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  dataArray = new Uint8Array(analyser.frequencyBinCount);
  audioSource.connect(analyser);
  analyser.connect(audioContext.destination);
}

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

      console.log("Playing next track:", nextTrackSource);
      initializeAudioElement(nextTrackSource);
      await audioElement.play();
      updatePlaylistUI();
    }
  } catch (error) {
    console.error("Error playing next track:", error);
  }
}

function handleAudioError(event, source) {
  console.error("Error playing audio:", event);
  console.error("Source:", source);
}

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

export async function getMusic() {
  try {
    const apiUrl = "http://localhost:3001/api/music";
    const response = await fetch(apiUrl);
    const data = await response.json();
    const fetchedPlaylist = data.files;
    console.log("Playlist:", fetchedPlaylist);
    return fetchedPlaylist;
  } catch (error) {
    console.error("Error fetching music list:", error);
    return [];
  }
}

export function getByteFrequencyData() {
  analyser.getByteFrequencyData(dataArray);
}

export function getAverageAmplitude() {
  const sum = dataArray.reduce((acc, value) => acc + value, 0);
  return sum / dataArray.length;
}
