/**
 * 标记是否渲染main组件
 */

let isRender = true;

const set = (render: any) => {
  isRender = render;
};

const get = () => isRender;

export default {
  set,
  get
};
