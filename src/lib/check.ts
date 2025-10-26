export const requiredWords = [
  "Tired", "University", "Books", "Sleepless", "Stress", "Midnight", "Coffee", "Assignment", "Brain", "Overwhelmed"
];

export const avoidWords = ["study", "studying", "subject"];

export function countWords(s: string) {
  return s.trim() ? s.trim().split(/\s+/).length : 0;
}

export function checkWords(text: string) {
  const meetsRequiredWords = requiredWords.some(word => text.includes(word));
  const meetsAvoidWords = !avoidWords.some(word => text.includes(word));
  return { meetsRequiredWords, meetsAvoidWords };
}
