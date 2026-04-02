import React, { useState, useCallback, useRef, useEffect } from 'react';
import Lottie from 'lottie-react';
import trophyAnimation from '../../assets/animations/trophy-animation.json';

import './WinnerCelebration.scss';

const APPEAR_DELAY_MS = 500;
const LINGER_AFTER_COMPLETE_MS = 2000;

interface WinnerCelebrationProps {
	winnerNickname: string;
	onDismiss: () => void;
}

const WinnerCelebration: React.FC<WinnerCelebrationProps> = ({ winnerNickname, onDismiss }) => {
	const [visible, setVisible] = useState(false);
	const [fadingOut, setFadingOut] = useState(false);
	const lingerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		const id = setTimeout(() => setVisible(true), APPEAR_DELAY_MS);

		return () => {
			clearTimeout(id);
			if (lingerTimer.current) clearTimeout(lingerTimer.current);
		};
	}, []);

	const dismiss = useCallback(() => {
		if (fadingOut) return;
		if (lingerTimer.current) clearTimeout(lingerTimer.current);

		setFadingOut(true);
		setTimeout(onDismiss, 400);
	}, [fadingOut, onDismiss]);

	const handleAnimationComplete = useCallback(() => {
		lingerTimer.current = setTimeout(dismiss, LINGER_AFTER_COMPLETE_MS);
	}, [dismiss]);

	if (!visible) {
		return <div className="winner-celebration-overlay" style={{ background: 'transparent' }} />;
	}

	const overlayClass = `winner-celebration-overlay${fadingOut ? ' fading-out' : ''}`;

	return (
		<div className={overlayClass} onClick={dismiss}>
			<div className="winner-celebration-content" onClick={e => e.stopPropagation()}>
				<Lottie
					animationData={trophyAnimation}
					loop={false}
					onComplete={handleAnimationComplete}
					style={{ width: 220, height: 220 }}
				/>
				<div className="winner-name">{winnerNickname}</div>
				<div className="winner-subtitle">wins the league!</div>
			</div>
		</div>
	);
};

export default WinnerCelebration;
