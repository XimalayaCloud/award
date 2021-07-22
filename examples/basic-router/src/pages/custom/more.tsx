import * as React from 'react';
import { Link } from 'react-router-dom';

export default class extends React.Component<any> {
  public static getInitialProps(ctx) {
    console.log('show', ctx);
    console.log('12333');
    return {
      id: ctx.match.params.id
    };
  }

  public render() {
    const { id } = this.props;
    return (
      <div>
        <Link to={`/custom/${id}/more/1`}>/custom/{id}/more/1</Link>
        <br />
        <Link to={`/custom/${id}/more/2`}>/custom/{id}/more/2</Link>
        <br />
        <Link to={`/custom/${id}/more/3`}>/custom/{id}/more/3</Link>
        <br />
        <Link to={`/custom/${id}/more/4`}>/custom/{id}/more/4</Link>
        <br />
      </div>
    );
  }
}
