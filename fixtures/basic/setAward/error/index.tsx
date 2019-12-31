import * as React from 'react';
import { start, Consumer, setAward, removeAward } from 'award';

start(
  <Consumer>
    {(award: any) => {
      return (
        <>
          <h1
            onClick={() => {
              setAward('abc');
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
