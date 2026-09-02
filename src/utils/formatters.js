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