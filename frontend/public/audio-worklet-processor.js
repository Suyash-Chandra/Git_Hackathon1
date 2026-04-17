// AudioWorklet processor for rolling buffer capture
// This runs on the audio rendering thread for zero-latency processing

class RollingBufferProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // 60 seconds at 44100 Hz sample rate
    this.maxSamples = 44100 * 60;
    this.buffer = new Float32Array(this.maxSamples);
    this.writeIndex = 0;
    this.samplesWritten = 0;

    this.port.onmessage = (event) => {
      if (event.data.type === "capture") {
        // Send the current buffer contents back to main thread
        const totalSamples = Math.min(this.samplesWritten, this.maxSamples);
        const captureBuffer = new Float32Array(totalSamples);

        if (this.samplesWritten >= this.maxSamples) {
          // Buffer has wrapped around
          const firstPart = this.buffer.slice(this.writeIndex);
          const secondPart = this.buffer.slice(0, this.writeIndex);
          captureBuffer.set(firstPart, 0);
          captureBuffer.set(secondPart, firstPart.length);
        } else {
          captureBuffer.set(this.buffer.slice(0, totalSamples));
        }

        this.port.postMessage({
          type: "captureData",
          buffer: captureBuffer,
          sampleRate: sampleRate,
        });
      } else if (event.data.type === "clear") {
        this.buffer.fill(0);
        this.writeIndex = 0;
        this.samplesWritten = 0;
      }
    };
  }

  process(inputs) {
    const input = inputs[0];
    if (input && input.length > 0) {
      const channelData = input[0];
      const len = channelData.length;

      // Compute energy level for VAD
      let energy = 0;
      for (let i = 0; i < len; i++) {
        energy += channelData[i] * channelData[i];
      }
      energy = Math.sqrt(energy / len);

      // Write to circular buffer
      for (let i = 0; i < len; i++) {
        this.buffer[this.writeIndex] = channelData[i];
        this.writeIndex = (this.writeIndex + 1) % this.maxSamples;
      }
      this.samplesWritten += len;

      // Send energy level and buffer status to main thread every ~100ms
      if (this.samplesWritten % (4410) < len) {
        this.port.postMessage({
          type: "levels",
          energy: energy,
          bufferSeconds: Math.min(this.samplesWritten / sampleRate, 60),
          waveformChunk: Array.from(channelData),
        });
      }
    }
    return true;
  }
}

registerProcessor("rolling-buffer-processor", RollingBufferProcessor);
