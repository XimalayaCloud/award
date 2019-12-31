import { useState } from "react";
import { start } from "award";
import fetch from "award-fetch";

import "./index.scss";

function app(props: any) {
  const [info, setInfo] = useState({ name: "Award" });
  return (
    <>
      <h1
        onClick={() => {
          setInfo(null);
        }}
      >
        Hello {info.name}
      </h1>
      <p onClick={props.reloadInitialProps}>点击试试看: {props.num}</p>
    </>
  );
}

app.getInitialProps = async () => {
  const data = await fetch("/api/list");
  return {
    num: data.num
  };
};

function error({ message }) {
  return <p>ErrorMessage: {message}</p>;
}

start(app, error);
