export function isEqual(obj1: Object, obj2: Object) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}
export function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}
