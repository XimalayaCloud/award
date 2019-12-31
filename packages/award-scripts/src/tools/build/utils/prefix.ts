export default (s: string, t = 3) => {
  return (
    Array.from(Array(t - s.length < 0 ? 0 : t - s.length))
      .map(() => '0')
      .join('') + s
  );
};
