import React, { useState, useLayoutEffect, useRef } from 'react';
import './ThrownCard.scss';

export type ThrownCardType = 'top' | 'left' | 'right' | 'bottom';

export interface IThrownCardProps {
	card?: string;
	thrownType: ThrownCardType;
	from?: { top: number; left: number };
	to: { top: number; left: number };
	hasWinner?: boolean;
}

const ThrownCard = (props: IThrownCardProps) => {
	const { card, thrownType, from, to, hasWinner } = props;
	const [style, setStyle] = useState(from ?? to);
	const ref = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		if (ref.current) {
			void ref.current.offsetHeight;
		}
		setStyle(to);
	}, [to.top, to.left]);

	return (
		<div ref={ref} className={`thrown-card ${thrownType} ${hasWinner ? 'has-winner' : ''}`} style={{ ...style }}>
			{card && <img src={require(`../../images/playCards/${card}.svg`)} alt="" style={{ width: '90px' }} />}
		</div>
	);
};

export default ThrownCard;
