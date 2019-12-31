import chalk from 'chalk';

export default function evaluate(exp: any, data: any) {
  const fn = new Function('data', 'with (data) { return ' + exp + '}');
  try {
    return fn(data);
  } catch (e) {
    console.error((chalk as any).red('Error when evaluating filter condition: ' + exp));
  }
}
