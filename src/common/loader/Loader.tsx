import React from 'react';
import { Spin } from 'antd';

interface ILoaderProps {
  className?: string;
}

const Loader = (props: ILoaderProps) => (
  <div className={`full-view loader ${props.className ? props.className : ''}`}>
    <Spin
      size="large"
      style={{ width: '100%', position: 'relative', top: '50%' }}
    />
  </div>
);

export default Loader;
