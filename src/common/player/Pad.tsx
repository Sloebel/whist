import React from 'react';
import { Spade, Hart, Diamond, Club } from '../cards/Icons';
import Css, { CSS_TRANSITIONS } from '../transition/Css';
import { CARDS } from '../../constants/cards';
import { TrumpBiddingEntry } from '../../models/IGameModel';

import './Pad.scss';

const TRUMP_ICONS: Partial<Record<CARDS, React.FC>> = {
	SPADE: Spade,
	HART: Hart,
	DIAMOND: Diamond,
	CLUB: Club
};

interface PlayerPadProps {
	name: string;
	bid?: number;
	won?: number;
	score?: number;
	trumpBiddingEntry?: TrumpBiddingEntry | null;
}

const PlayerPad: React.FC<PlayerPadProps> = ({ name, bid, won, score, trumpBiddingEntry }) => {
	const renderBidLine = () => {
		if (trumpBiddingEntry === null) {
			return <div className="pad-bid-won">&mdash;</div>;
		}

		if (trumpBiddingEntry) {
			if ('passed' in trumpBiddingEntry && trumpBiddingEntry.passed) {
				return <div className="pad-bid-won trump-bid-pass">Pass</div>;
			}
			if ('trump' in trumpBiddingEntry) {
				const TrumpIcon = TRUMP_ICONS[trumpBiddingEntry.trump as CARDS];

				return (
					<div className="pad-bid-won trump-bid-info">
						{trumpBiddingEntry.number} {TrumpIcon ? <TrumpIcon /> : trumpBiddingEntry.trump}
					</div>
				);
			}
		}

		return (
			<div className="pad-bid-won">
				Bid: {typeof bid === 'number' ? bid : ' '} Won: {won}
			</div>
		);
	};

	return (
		<div className="player-pad">
			<div className="pad-name">
				{name}&nbsp;
				{score !== undefined && (
					<span className="pad-score">
						[<Css type={CSS_TRANSITIONS.SLIDE_UP}>{score}</Css>]
					</span>
				)}
			</div>
			{renderBidLine()}
		</div>
	);
};

export default PlayerPad;
