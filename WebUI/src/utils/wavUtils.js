export function encodeWAV(chunksL, chunksR, length, sampleRate, bitDepth = 32) {
  const isFloat = bitDepth === 32;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = 2 * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, isFloat ? 3 : 1, true); // Format tag (1 = PCM, 3 = IEEE float)
  view.setUint16(22, 2, true); // Channels
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let c = 0; c < chunksL.length; c++) {
    const left = chunksL[c];
    const right = chunksR[c];
    for (let i = 0; i < left.length; i++) {
      if (isFloat) {
        view.setFloat32(offset, left[i], true); offset += 4;
        view.setFloat32(offset, right[i], true); offset += 4;
      } else {
        const smpL = Math.max(-1, Math.min(1, left[i]));
        const smpR = Math.max(-1, Math.min(1, right[i]));
        view.setInt16(offset, smpL < 0 ? smpL * 0x8000 : smpL * 0x7FFF, true); offset += 2;
        view.setInt16(offset, smpR < 0 ? smpR * 0x8000 : smpR * 0x7FFF, true); offset += 2;
      }
    }
  }

  return new Blob([view], { type: 'audio/wav' });
}
