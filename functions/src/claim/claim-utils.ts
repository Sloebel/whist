export enum CARDS {
	SPADE = 'SPADE',
	HART = 'HART',
	DIAMOND = 'DIAMOND',
	CLUB = 'CLUB',
	NT = 'NT'
}

export enum CARDS_SHORT {
	C = 'C',
	D = 'D',
	H = 'H',
	S = 'S'
}

export const CardsType: Record<string, string> = {
	[CARDS.CLUB]: CARDS_SHORT.C,
	[CARDS.DIAMOND]: CARDS_SHORT.D,
	[CARDS.HART]: CARDS_SHORT.H,
	[CARDS.SPADE]: CARDS_SHORT.S,
	[CARDS.NT]: 'NT'
};

export const parseCard = (card: string) => {
	const parts = card.split('-');
	return { number: +parts[0], suit: parts[1] };
};

export const groupBySuit = (cards: string[]): { [suit: string]: number[] } => {
	const groups: { [suit: string]: number[] } = {};
	for (const card of cards) {
		const { number, suit } = parseCard(card);

		if (!groups[suit]) groups[suit] = [];

		groups[suit].push(number);
	}

	return groups;
};

export const allCardsHighestInEachSuit = (
	playerBySuit: { [suit: string]: number[] },
	opponentBySuit: { [suit: string]: number[] }
): boolean => {
	for (const suit of Object.keys(playerBySuit)) {
		const opponentSuitCards = opponentBySuit[suit];

		if (!opponentSuitCards || opponentSuitCards.length === 0) continue;

		if (Math.min(...playerBySuit[suit]) <= Math.max(...opponentSuitCards)) {
			return false;
		}
	}

	return true;
};

/**
 * Determines whether the claiming player is guaranteed to win all remaining
 * cards.
 *
 * The strategy assumes the player leads optimally: trump leads first to extract
 * opponent trumps, then non-trump winners. Valid when:
 *  1. Player's lowest trump beats every opponent's highest trump
 *  2. No single opponent holds more trumps than the player (so T trump leads
 *     exhaust all opponent trumps)
 *  3. Player's non-trump cards are the highest remaining in each suit they hold
 *
 * For NT games only condition 3 applies.
 */
export const canClaimRemainingCards = (
	claimingPlayerCards: string[],
	allPlayersCards: { [playerIndex: number]: string[] },
	claimingPlayer: number,
	trump: CARDS | string
): boolean => {
	if (claimingPlayerCards.length === 0) return false;

	const isNT = trump === CARDS.NT;
	const trumpShort = isNT ? null : CardsType[trump as CARDS];

	const opponentCards: string[] = [];

	for (const [playerIndex, playerCards] of Object.entries(allPlayersCards)) {
		if (+playerIndex !== claimingPlayer) {
			opponentCards.push(...playerCards);
		}
	}

	if (!isNT) {
		const isTrump = (card: string) => parseCard(card).suit === trumpShort;

		const playerTrumpNumbers = claimingPlayerCards.filter(isTrump).map(c => parseCard(c).number);
		const allOpponentTrumpNumbers = opponentCards.filter(isTrump).map(c => parseCard(c).number);

		if (allOpponentTrumpNumbers.length > 0) {
			if (playerTrumpNumbers.length === 0) return false;

			if (Math.min(...playerTrumpNumbers) <= Math.max(...allOpponentTrumpNumbers)) {
				return false;
			}

			for (const [playerIndex, playerCards] of Object.entries(allPlayersCards)) {
				if (+playerIndex !== claimingPlayer) {
					const opponentTrumpCount = playerCards.filter(isTrump).length;
					if (opponentTrumpCount > playerTrumpNumbers.length) return false;
				}
			}
		}

		const playerNonTrumpBySuit = groupBySuit(claimingPlayerCards.filter(c => !isTrump(c)));
		const opponentNonTrumpBySuit = groupBySuit(opponentCards.filter(c => !isTrump(c)));

		return allCardsHighestInEachSuit(playerNonTrumpBySuit, opponentNonTrumpBySuit);
	}

	const playerBySuit = groupBySuit(claimingPlayerCards);
	const opponentBySuit = groupBySuit(opponentCards);

	return allCardsHighestInEachSuit(playerBySuit, opponentBySuit);
};
