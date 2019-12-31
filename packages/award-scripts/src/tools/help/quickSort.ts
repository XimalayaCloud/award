export default function quickSort(arr: any): any {
  if (arr.length <= 1) {
    return arr;
  }

  const pivotIndex = Math.floor(arr.length / 2);

  const pivot = arr.splice(pivotIndex, 1)[0];

  const left = [];

  const right = [];

  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < arr.length; i++) {
    // eslint-disable-next-line radix
    if (parseInt(arr[i]) < parseInt(pivot)) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }

  return quickSort(left).concat([pivot], quickSort(right));
}
