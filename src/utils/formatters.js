// formatters.js
export const formatTraits = (traits) => {
  if (!traits || traits.length === 0) {
    return "Tidak ada deskripsi traits.";
  }
  return traits
    .slice(0, 2)
    .map((trait) => trait.charAt(0).toUpperCase() + trait.slice(1))
    .join(", ");
};