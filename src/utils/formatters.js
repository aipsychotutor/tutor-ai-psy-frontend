// formatters.js
export const formatTraits = (traits) => {
  if (!traits || traits.length === 0) {
    return "Tidak ada deskripsi traits.";
  }

  let traitsArray = traits;
  if (typeof traits === "string") {
    try {
      traitsArray = JSON.parse(traits);
      if (!Array.isArray(traitsArray)) {
        traitsArray = [traits];
      }
    } catch (e) {
      traitsArray = traits.split(",").map(t => t.trim());
    }
  }

  if (!Array.isArray(traitsArray) || traitsArray.length === 0) {
    return "Tidak ada deskripsi traits.";
  }

  return traitsArray
    .slice(0, 2)
    .map((trait) => {
      const strTrait = String(trait);
      return strTrait.charAt(0).toUpperCase() + strTrait.slice(1);
    })
    .join(", ");
};

/**
 * Memformat selisih start_time dan end_time menjadi string durasi yang mudah dibaca (e.g. "5m 24s", "1j 12m", "< 1m").
 * @param {string|Date} startTime - Waktu mulai sesi
 * @param {string|Date} endTime - Waktu selesai sesi
 * @returns {string} Durasi yang diformat
 */
export const formatSessionDuration = (startTime, endTime) => {
  if (!startTime) return "-";
  const start = new Date(startTime).getTime();
  if (isNaN(start)) return "-";
  
  const end = endTime ? new Date(endTime).getTime() : Date.now();
  if (isNaN(end)) return "-";

  const diffInSeconds = Math.max(0, Math.floor((end - start) / 1000));
  const hours = Math.floor(diffInSeconds / 3600);
  const minutes = Math.floor((diffInSeconds % 3600) / 60);
  const seconds = diffInSeconds % 60;

  if (hours > 0) {
    return `${hours}j ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};