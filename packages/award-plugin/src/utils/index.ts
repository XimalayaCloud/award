export const parseAsync = (name: string) => {
  const split = name.split(' ');
  // 解析函数类型和名称
  let fnName = name;
  let fnType = 'async';
  if (split.length === 2) {
    fnName = split[1];
    fnType = split[0];
  }
  return { name: fnName, type: fnType };
};
