export function isEqual(obj1: Object, obj2: Object) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}
export function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}
export default function debounce(func: any, timeout = 300) {
  let timer: NodeJS.Timeout;
  let isRunning = false;
  return (...args) => {
    if (isRunning) {
      console.log("There's a function running");
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      console.log('Is running marked to TRUE');
      isRunning = true;
      Promise.resolve(func.apply(this, args))
        .then((e) => {
          console.log('Is running marked to FALSE');
          isRunning = false;
          return e;
        })
        .catch(() => (isRunning = false));
    }, timeout);
  };
}
