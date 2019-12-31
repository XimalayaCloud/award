import * as async from 'async';
import * as inquirer from 'inquirer';
import evaluate from '../utils/evaluate';

const promptMapping: any = {
  string: 'input',
  boolean: 'confirm'
};

const ask = (prompts: any, data: any, done: any) => {
  async.eachSeries(
    Object.keys(prompts),
    (key: any, next: any) => {
      prompt(data, key, prompts[key], next);
    },
    done
  );
};

function prompt(data: any, key: any, prompt: any, done: any) {
  if (prompt.when && !evaluate(prompt.when, data)) {
    return done();
  }

  let promptDefault = prompt.default;
  if (typeof prompt.default === 'function') {
    promptDefault = function(this: any) {
      return prompt.default.bind(this)(data);
    };
  }

  inquirer
    .prompt([
      {
        type: promptMapping[prompt.type] || prompt.type,
        name: key,
        message: prompt.message || prompt.label || key,
        default: promptDefault,
        choices: prompt.choices || [],
        validate: prompt.validate || (() => true)
      }
    ])
    .then((answers: any) => {
      if (Array.isArray(answers[key])) {
        data[key] = {};
        answers[key].forEach((multiChoiceAnswer: any) => {
          data[key][multiChoiceAnswer] = true;
        });
      } else if (typeof answers[key] === 'string') {
        data[key] = answers[key].replace(/"/g, '\\"');
      } else {
        data[key] = answers[key];
      }
      done();
    })
    .catch(done);
}

export default function askQuestions(prompts: any): Function {
  return (files: any, metalsmith: any, done: any) => {
    ask(prompts, metalsmith.metadata(), done);
  };
}
