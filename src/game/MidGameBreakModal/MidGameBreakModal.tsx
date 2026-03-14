import React from 'react';
import { Modal, Button } from 'antd';
import { CoffeeOutlined } from '@ant-design/icons';

import './MidGameBreakModal.scss';

interface MidGameBreakModalProps {
	visible: boolean;
	onClose: () => void;
	onContinue: () => void;
	getContainer: () => HTMLElement;
	showContinue?: boolean;
}

const MidGameBreakModal: React.FC<MidGameBreakModalProps> = ({ visible, onClose, onContinue, getContainer, showContinue = true }) => {
	const footer = [
		<Button key="close" onClick={onClose}>
			Close
		</Button>
	];

	if (showContinue) {
		footer.push(
			<Button key="continue" type="primary" onClick={onContinue}>
				Continue
			</Button>
		);
	}

	return (
		<Modal
			visible={visible}
			maskClosable={false}
			closable={false}
			getContainer={getContainer}
			footer={footer}
		>
			<div className="mid-game-break-content">
				<CoffeeOutlined className="mid-game-break-icon" />
				<h2>Mid Game Break</h2>
			</div>
		</Modal>
	);
};

export default MidGameBreakModal;
