import React from 'react';
import { Switch } from 'antd';
import { ForwardOutlined } from '@ant-design/icons';

import './Pass.scss';

interface PassButtonProps {
	checked: boolean;
	onChange: () => void;
}

const PassButton: React.FC<PassButtonProps> = ({ checked, onChange }) => {
	return (
		<div className="pass-btn">
			<Switch
				className="pass-switch"
				checked={checked}
				onChange={onChange}
				checkedChildren={
					<>
						<ForwardOutlined /> Unpass
					</>
				}
				unCheckedChildren={
					<>
						<ForwardOutlined /> Pass
					</>
				}
			/>
		</div>
	);
};

export default PassButton;
