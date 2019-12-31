import * as React from 'react';
import { start, Consumer, setAward, removeAward } from 'award';

setAward({ abc: 123 });

setAward({});

removeAward('abc');

start(
  <Consumer>
    {(award: any) => {
      return (
        <>
          <h1
            onClick={() => {
              setAward({ name: 'world' });
            }}
          >
            hello {award.name}
          </h1>
          <p
            onClick={() => {
              removeAward('name');
              setAward({ age: 20 });
            }}
          >
            {award.age}
          </p>
        </>
      );
    }}
  </Consumer>
);
