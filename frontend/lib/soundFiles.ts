'use client';

/**
 * Generates a WAV Data URI (16-bit PCM, 22050Hz) for authentic animal sound effects
 */
function createWavDataUri(
  durationSec: number,
  sampleGenerator: (t: number, sampleRate: number) => number
): string {
  if (typeof window === 'undefined') return '';

  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = new Int16Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.max(-1, Math.min(1, sampleGenerator(t, sampleRate)));
    buffer[i] = Math.floor(sample * 32767);
  }

  // 44-byte WAV header
  const dataSize = numSamples * 2;
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + dataSize, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // "fmt " chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // "data" chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataSize, true);

  // Combine header and buffer into Base64
  const wavBytes = new Uint8Array(header.byteLength + buffer.byteLength);
  wavBytes.set(new Uint8Array(header), 0);
  wavBytes.set(new Uint8Array(buffer.buffer), 44);

  let binary = '';
  const len = wavBytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(wavBytes[i]);
  }

  return 'data:audio/wav;base64,' + (typeof window !== 'undefined' && window.btoa ? window.btoa(binary) : '');
}

// 🐶 Real Dog Bark Acoustic Model (Woof-Woof!)
export const DOG_BARK_WAV = createWavDataUri(0.45, (t) => {
  // First bark: 0.0s to 0.16s
  if (t < 0.16) {
    const p = t / 0.16;
    const f0 = 340 - 180 * Math.pow(p, 0.7);
    const amp = Math.sin(Math.PI * Math.pow(p, 0.4)) * 0.75;
    const voice = Math.sin(2 * Math.PI * f0 * t) + 0.4 * Math.sin(4 * Math.PI * f0 * t) + 0.25 * Math.sin(6 * Math.PI * f0 * t);
    const breath = (Math.random() * 2 - 1) * 0.15 * Math.exp(-p * 8);
    return (voice + breath) * amp;
  }
  // Second bark: 0.22s to 0.42s
  if (t >= 0.22 && t < 0.42) {
    const p = (t - 0.22) / 0.2;
    const f0 = 380 - 200 * Math.pow(p, 0.7);
    const amp = Math.sin(Math.PI * Math.pow(p, 0.4)) * 0.8;
    const voice = Math.sin(2 * Math.PI * f0 * t) + 0.45 * Math.sin(4 * Math.PI * f0 * t) + 0.3 * Math.sin(6 * Math.PI * f0 * t);
    const breath = (Math.random() * 2 - 1) * 0.15 * Math.exp(-p * 8);
    return (voice + breath) * amp;
  }
  return 0;
});

// 🐱 Real Cat Meow Acoustic Model (Meowww)
export const CAT_MEOW_WAV = createWavDataUri(0.7, (t) => {
  if (t > 0.65) return 0;
  const p = t / 0.65;
  let f0 = 560;
  if (p < 0.35) {
    f0 = 560 + (880 - 560) * Math.sin((p / 0.35) * (Math.PI / 2));
  } else {
    f0 = 880 - (880 - 620) * Math.sin(((p - 0.35) / 0.65) * (Math.PI / 2));
  }

  const vibrato = 1 + 0.03 * Math.sin(2 * Math.PI * 6 * t);
  const freq = f0 * vibrato;

  let env = 0;
  if (p < 0.1) env = p / 0.1;
  else if (p < 0.7) env = 1;
  else env = 1 - (p - 0.7) / 0.3;

  const wave =
    Math.sin(2 * Math.PI * freq * t) * 0.6 +
    Math.sin(4 * Math.PI * freq * t) * 0.3 +
    Math.sin(6 * Math.PI * freq * t) * 0.15 +
    Math.sin(8 * Math.PI * freq * t) * 0.08;

  return wave * env * 0.7;
});

// 🐦 Real Bird Chirp Acoustic Model (Songbird Canary)
export const BIRD_CHIRP_WAV = createWavDataUri(0.4, (t) => {
  if (t < 0.12) {
    const p = t / 0.12;
    const freq = 1900 + 1000 * Math.sin(p * Math.PI);
    const env = Math.sin(p * Math.PI);
    return Math.sin(2 * Math.PI * freq * t) * env * 0.75;
  }
  if (t >= 0.16 && t < 0.32) {
    const p = (t - 0.16) / 0.16;
    const freq = 2100 + 1200 * Math.sin(p * Math.PI);
    const env = Math.sin(p * Math.PI);
    return Math.sin(2 * Math.PI * freq * t) * env * 0.8;
  }
  return 0;
});

// 🐟 Real Fish Bubble Acoustic Model
export const FISH_BUBBLE_WAV = createWavDataUri(0.35, (t) => {
  const pops = [
    { start: 0, dur: 0.08, fStart: 900, fEnd: 300 },
    { start: 0.1, dur: 0.08, fStart: 1000, fEnd: 340 },
    { start: 0.2, dur: 0.08, fStart: 800, fEnd: 260 },
  ];

  for (const pop of pops) {
    if (t >= pop.start && t < pop.start + pop.dur) {
      const p = (t - pop.start) / pop.dur;
      const freq = pop.fStart * Math.pow(pop.fEnd / pop.fStart, p);
      const env = Math.exp(-p * 5);
      return Math.sin(2 * Math.PI * freq * t) * env * 0.8;
    }
  }
  return 0;
});

// 🐹 Real Hamster Squeak Acoustic Model
export const HAMSTER_SQUEAK_WAV = createWavDataUri(0.25, (t) => {
  if (t < 0.18) {
    const p = t / 0.18;
    const freq = 2300 + 1100 * Math.sin(p * Math.PI);
    const env = Math.sin(p * Math.PI);
    return (Math.sin(2 * Math.PI * freq * t) + 0.3 * Math.sin(4 * Math.PI * freq * t)) * env * 0.65;
  }
  return 0;
});

// 🐍 Real Reptile Hiss Acoustic Model
export const REPTILE_HISS_WAV = createWavDataUri(0.4, (t) => {
  if (t < 0.35) {
    const p = t / 0.35;
    const env = Math.sin(p * Math.PI);
    const noise = Math.random() * 2 - 1;
    const tone = Math.sin(2 * Math.PI * (280 - 120 * p) * t);
    return (noise * 0.6 + tone * 0.4) * env * 0.5;
  }
  return 0;
});

// 🐾 Generic Pet Chirp Acoustic Model
export const PET_CHIRP_WAV = createWavDataUri(0.3, (t) => {
  if (t < 0.22) {
    const p = t / 0.22;
    const freq = 500 + 300 * Math.sin(p * Math.PI);
    const env = Math.sin(p * Math.PI);
    return Math.sin(2 * Math.PI * freq * t) * env * 0.7;
  }
  return 0;
});
