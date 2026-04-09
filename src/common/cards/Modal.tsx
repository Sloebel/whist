import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal } from 'antd';
import Icon, { QuestionOutlined } from '@ant-design/icons';
import { Spade, Hart, Diamond, Club } from './Icons';
import { CARDS } from '../../constants/cards';
import './Modal.scss';

type TrumpKey = CARDS | string;

interface CardsModalProps {
	trump?: TrumpKey;
	onChange: (value: string) => void;
	disabled?: boolean;
	visible?: boolean;
}

const trumpIconMap: Record<string, React.FC> = {
	SPADE: Spade,
	HART: Hart,
	DIAMOND: Diamond,
	CLUB: Club
};

const CardsModal: React.FC<CardsModalProps> = ({ trump, onChange, disabled, visible: visibleProp }) => {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (visibleProp !== undefined && visibleProp !== visible) {
			setVisible(visibleProp);
		}
	}, [visibleProp, visible]);

	const onTrumpSelect = useCallback(
		(value: string) => {
			onChange(value);
			setVisible(false);
		},
		[onChange]
	);

	return (
		<div className="cards-modal">
			trump
			<Button ghost className="card-btn" onClick={() => setVisible(true)} disabled={disabled}>
				{trump ? trump === 'NT' ? 'NT' : <Icon component={trumpIconMap[trump]} /> : <QuestionOutlined />}
			</Button>
			<Modal footer={null} visible={visible} onCancel={() => setVisible(false)} className="cards-modal-dialog">
				{Object.values(CARDS).map(card => (
					<Button key={card} className="card-btn" onClick={() => onTrumpSelect(card)}>
						{trumpIconMap[card] ? <Icon component={trumpIconMap[card]} /> : card}
					</Button>
				))}
			</Modal>
		</div>
	);
};

export default CardsModal;
