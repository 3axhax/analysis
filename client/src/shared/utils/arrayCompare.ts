export const arrayCompare = (
  arr1: Array<string | number>,
  arr2: Array<string | number>,
) => {
  if (arr1.length === arr2.length) {
    const compareArr1 = [...arr1].sort();
    const compareArr2 = [...arr2].sort();
    return compareArr1.every((value, i) => value === compareArr2[i]);
  }
  return false;
};
