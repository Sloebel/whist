import React from 'react';
import { Tag } from 'antd';

import './Pass.scss';

interface PassTagProps {
	visible: boolean;
}

const PassTag: React.FC<PassTagProps> = ({ visible }) => {
	if (!visible) return null;

	return (
		<Tag className="pass-tag fade-in" color="orange">
			Pass
		</Tag>
	);
};

export default PassTag;
