import React from 'react';
import { Modal, Button } from 'antd';
import { CoffeeOutlined } from '@ant-design/icons';

import './MidGameBreakModal.scss';

interface MidGameBreakModalProps {
	visible: boolean;
	onClose: () => void;
	onContinue: () => void;
	getContainer: () => HTMLElement;
}

const MidGameBreakModal: React.FC<MidGameBreakModalProps> = ({ visible, onClose, onContinue, getContainer }) => {
	return (
		<Modal
			visible={visible}
			maskClosable={false}
			closable={false}
			getContainer={getContainer}
			footer={[
				<Button key="close" onClick={onClose}>
					Close
				</Button>,
				<Button key="continue" type="primary" onClick={onContinue}>
					Continue
				</Button>
			]}
		>
			<div className="mid-game-break-content">
				<CoffeeOutlined className="mid-game-break-icon" />
				<h2>Mid Game Break</h2>
			</div>
		</Modal>
	);
};

export default MidGameBreakModal;
