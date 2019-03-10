import React from 'react';
import { Spin } from 'antd';

const Loader = () => <div className="full-view loader"><Spin size="large" style={{ width: '100%', position: 'relative', top: '50%' }} /></div>;

export default Loader;