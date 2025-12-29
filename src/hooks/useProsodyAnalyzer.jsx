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

  const stopRecording = () => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && isRecording) {
        console.log("Stopping recording (async)...");

        mediaRecorderRef.current.onstop = () => {
          console.log("MediaRecorder: stopped (async callback)");
          const blob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current.mimeType || 'audio/webm' });
          console.log(`Audio blob created. Type: ${blob.type}, Size: ${blob.size} bytes`);
          
          setAudioBlob(blob); // Tetap set state untuk referensi
          
          if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
          }

          resolve(blob); // Selesaikan promise DENGAN blob baru
        };

        mediaRecorderRef.current.stop();
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

      } else {
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
   * fitur yang benar-benar kita gunakan di backend.
   */
  const calculateProsodyFeatures = (channelData, sampleRate, duration) => {
    
    // --- Perhitungan Inti ---

    // 1. Energy/RMS
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

    // 2. Silence/Pause
    const threshold = energyMean * 0.1;
    const silentFrames = frames.filter(e => e < threshold).length;
    
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

    // 3. Speaking Rate (Proxy)
    let zeroCrossings = 0;
    for (let i = 1; i < channelData.length; i++) {
      if ((channelData[i] >= 0 && channelData[i - 1] < 0) ||
          (channelData[i] < 0 && channelData[i - 1] >= 0)) {
        zeroCrossings++;
      }
    }
    const zcr = zeroCrossings / channelData.length;

    // --- Data yang Dikembalikan  ---

    return {
      // 1. Durasi Total (Digunakan di Agregasi)
      duration: duration.toFixed(2),
      
      // 2. Kecepatan Bicara (Digunakan di Agregasi)
      speaking_rate: (zcr * sampleRate / 2 / 100).toFixed(2),
      
      // 3. Variabilitas Energi (Digunakan di Agregasi)
      energy_std: Math.sqrt(
        frames.reduce((sum, val) => sum + Math.pow(val - energyMean, 2), 0) / frames.length
      ).toFixed(4),

      // 4. Rasio Hening (Digunakan di Agregasi)
      silence_ratio: (silentFrames / frames.length).toFixed(3),
      
      // 5. Jumlah Jeda (Digunakan di Agregasi)
      num_pauses: pauses, 
    };
  };

  /**
   * Fungsi utama yang diekspos oleh hook untuk mengekstrak prosodi
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
      reader.readAsArrayBuffer(blobToAnalyze); 
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