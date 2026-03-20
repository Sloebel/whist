import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { canClaimRemainingCards } from './claim-utils';

interface ValidateClaimData {
	gameKey: string;
	round: number;
	trickWinnerIndex: number;
	gamePath: string;
	players: { key: string }[];
	trump: string;
}

export const validateClaim = functions.https.onCall(async (data: ValidateClaimData, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated to validate a claim.');
	}

	const { gameKey, round, trickWinnerIndex, gamePath, players, trump } = data;

	if (!gameKey || !round || trickWinnerIndex == null || !gamePath || !players || !trump) {
		throw new functions.https.HttpsError('invalid-argument', 'Missing required fields.');
	}

	const db = admin.database();

	const snapshot = await db.ref(`cardsByGame/${gameKey}/round${round}/cardsState`).once('value');

	const cardsState = snapshot.val() as {
		[uid: string]: (string | null)[] | { [index: string]: string };
	} | null;

	if (!cardsState) {
		console.log('EXIT: cardsState is null');
		return { claimApproved: false };
	}

	const allPlayersCards: { [playerIndex: number]: string[] } = {};

	players.forEach((player, index) => {
		const raw = cardsState[player.key];

		console.log(`player[${index}] key=${player.key} raw=`, JSON.stringify(raw));

		if (!raw) return;

		let cards: string[];

		if (Array.isArray(raw)) {
			cards = raw.filter((c): c is string => c !== null);
		} else if (typeof raw === 'object') {
			cards = Object.values(raw).filter((c): c is string => typeof c === 'string');
		} else {
			return;
		}

		if (cards.length > 0) {
			allPlayersCards[index] = cards;
		}
	});

	console.log('allPlayersCards:', JSON.stringify(allPlayersCards));
	console.log('Player Winner Index:', trickWinnerIndex);
	console.log('Trump:', trump);

	const claimingPlayerCards = allPlayersCards[trickWinnerIndex] || [];

	if (claimingPlayerCards.length === 0) {
		console.log('EXIT: claimingPlayerCards is empty');
		return { claimApproved: false };
	}

	const isValid = canClaimRemainingCards(claimingPlayerCards, allPlayersCards, trickWinnerIndex, trump);

	console.log('claim isValid:', isValid);

	const roundRef = db.ref(`${gamePath}/rounds/${round - 1}`);

	if (isValid) {
		await roundRef.update({
			claimApproved: { player: trickWinnerIndex }
		});
	} else {
		const existing = await roundRef.child('claimApproved').once('value');
		if (existing.val() !== null) {
			await roundRef.child('claimApproved').remove();
		}
	}

	return { claimApproved: isValid };
});
