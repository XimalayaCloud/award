import React from 'react'

const app = (props) => {
  return <> 
  <p>{props.id}</p> 
  <ul>{items()}</ul>
  </>
}

const items = () => {
  var out = new Array(10000)
  for (let i = 0; i < out.length; i++) {
    out[i] = <li key={i}>This is row {i + 1}</li>
  }
  return out
}

app.getInitialProps = async () => {
  return {
    id: Math.random()
  }
}

export default app