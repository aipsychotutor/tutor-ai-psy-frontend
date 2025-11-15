import { useState, useRef, useEffect } from 'react';

/**
 * Hook kustom untuk mengelola perekaman audio dan ekstraksi fitur prosodi
 * di sisi klien.
 */
export const useProsodyAnalyzer = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);

  // Efek cleanup untuk membereskan timer atau context saat komponen unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const startRecording = async () => {
    try {
      console.log("Starting recording...");
      setError(null);
      setAudioBlob(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone access granted.");

      const mimeTypes = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/webm', 'audio/ogg'];
      const options = { mimeType: mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || undefined };
      console.log("Using MediaRecorder options:", options);

      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      // 🛑 DIHAPUS: .onstop handler dipindahkan ke stopRecording()
      // untuk menangani promise-based flow.

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      setError('Tidak dapat mengakses microphone. Pastikan permission diberikan.');
      console.error("Microphone access error:", err);
    }
  };

  // 🛑 DIUBAH: stopRecording sekarang mengembalikan Promise<Blob>
  const stopRecording = () => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && isRecording) {
        console.log("Stopping recording (async)...");

        // Definisikan onstop DI SINI untuk me-resolve promise
        mediaRecorderRef.current.onstop = () => {
          console.log("MediaRecorder: stopped (async callback)");
          const blob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current.mimeType || 'audio/webm' });
          console.log(`Audio blob created. Type: ${blob.type}, Size: ${blob.size} bytes`);
          
          setAudioBlob(blob); // Tetap set state untuk referensi
          
          // Matikan stream
          if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
          }

          resolve(blob); // Selesaikan promise DENGAN blob baru
        };

        // Hentikan recorder, yang akan memicu onstop
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

      } else {
        // Jika tidak sedang merekam, selesaikan promise dengan null
        resolve(null);
      }
    });
  };


  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log(`File uploaded. Name: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`);
      setAudioBlob(file);
      setError(null);
    }
  };

  /**
   * Fungsi internal untuk kalkulasi fitur.
   */
  const calculateProsodyFeatures = (channelData, sampleRate, duration) => {
    // Energy/RMS calculation
    const frameSize = Math.floor(sampleRate * 0.025); // 25ms frames
    const hopSize = Math.floor(sampleRate * 0.010); // 10ms hop
    const frames = [];
    
    for (let i = 0; i < channelData.length - frameSize; i += hopSize) {
      let sum = 0;
      for (let j = 0; j < frameSize; j++) {
        sum += channelData[i + j] * channelData[i + j];
      }
      frames.push(Math.sqrt(sum / frameSize));
    }

    const energyMean = frames.reduce((a, b) => a + b, 0) / frames.length;
    const energyStd = Math.sqrt(
      frames.reduce((sum, val) => sum + Math.pow(val - energyMean, 2), 0) / frames.length
    );

    // Silence detection
    const threshold = energyMean * 0.1;
    const silentFrames = frames.filter(e => e < threshold).length;
    const silenceRatio = silentFrames / frames.length;

    // Pause detection
    let pauses = 0;
    let inPause = false;
    frames.forEach(energy => {
      if (energy < threshold && !inPause) {
        pauses++;
        inPause = true;
      } else if (energy >= threshold) {
        inPause = false;
      }
    });

    // Zero crossing rate (proxy for speaking rate)
    let zeroCrossings = 0;
    for (let i = 1; i < channelData.length; i++) {
      if ((channelData[i] >= 0 && channelData[i - 1] < 0) ||
          (channelData[i] < 0 && channelData[i - 1] >= 0)) {
        zeroCrossings++;
      }
    }
    const zcr = zeroCrossings / channelData.length;
    const speakingRate = (zcr * sampleRate / 2) / 100;

    return {
      duration: duration.toFixed(2),
      speaking_rate: speakingRate.toFixed(2),
      tempo: (100 + Math.random() * 40).toFixed(2), // Tempo masih placeholder
      energy_std: energyStd.toFixed(4),
      energy_variance: (energyStd * energyStd).toFixed(6),
      silence_ratio: silenceRatio.toFixed(3),
      avg_pause_duration: (silenceRatio * duration / Math.max(pauses, 1)).toFixed(3),
      num_pauses: pauses,
      max_pause_duration: (silenceRatio * duration * 0.3).toFixed(3)
    };
  };

  /**
   * 🛑 DIUBAH: Fungsi ini sekarang menerima blob sebagai argumen
   * untuk menghindari race condition dengan state.
   */
  const getProsodyData = async (blobToAnalyze) => {
    if (!blobToAnalyze) {
      setError("Audio blob tidak ditemukan untuk dianalisis.");
      console.log("Extraction failed: No audio blob provided.");
      return null;
    }

    console.log("Extracting prosody features from provided blob...");
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        console.log("File read, decoding audio data...");
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioContext;

        try {
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const channelData = audioBuffer.getChannelData(0);
          const sampleRate = audioBuffer.sampleRate;
          const duration = audioBuffer.duration;
          console.log(`Audio decoded. SampleRate: ${sampleRate}, Duration: ${duration}s`);

          const features = calculateProsodyFeatures(channelData, sampleRate, duration);
          console.log("Prosody features calculated (client-side):", features);
          resolve(features); // Mengembalikan data fitur
        } catch (err) {
          console.error('Error decoding audio:', err);
          setError(`Gagal memproses file audio. Format tidak didukung atau file corrupt. Error: ${err.message}`);
          resolve(null); // Gagal
        }
      };
      reader.onerror = () => {
        console.error('File reading error');
        setError('Gagal membaca file.');
        resolve(null);
      };
      reader.readAsArrayBuffer(blobToAnalyze); // 👈 Gunakan argumen
    });
  };

  /**
   * Fungsi untuk membersihkan audio blob setelah dikirim.
   */
  const clearAudioData = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };

  // Mengembalikan state dan fungsi untuk digunakan oleh komponen
  return {
    isRecording,
    recordingTime,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    handleFileUpload,
    getProsodyData, // Fungsi utama untuk dipanggil saat 'send'
    clearAudioData,
  };
};