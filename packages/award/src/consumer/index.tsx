import * as React from 'react';
import AwardContext from 'award-utils/AwardContext';

/**
 * 获取award context数据
 
 ```
<Consumer>
  {(award)=>{
    // setAward的数据传递到这里
    console.log(award);
  }}
</Consumer>
 ```
 */
export default class Consumer extends React.Component<any> {
  public shouldComponentUpdate() {
    return false;
  }

  public render() {
    return (
      <AwardContext.Consumer>
        {(award: any) => {
          return (this.props as any).children(award);
        }}
      </AwardContext.Consumer>
    );
  }
}
