export enum CARDS {
  SPADE = 'SPADE',
  HART = 'HART',
  DIAMOND = 'DIAMOND',
  CLUB = 'CLUB',
  NT = 'NT',
}


export enum CARDS_SHORT {
  C = 'C',
  D = 'D',
  H = 'H',
  S = 'S',
}

export const CardsType = {
  [CARDS.CLUB]: CARDS_SHORT.C,
  [CARDS.DIAMOND]: CARDS_SHORT.D,
  [CARDS.HART]: CARDS_SHORT.H,
  [CARDS.SPADE]: CARDS_SHORT.S,
  [CARDS.NT]: 'NT',
};

export const DrawCardsType = {
  [CARDS.CLUB]: CARDS_SHORT.C,
  [CARDS.DIAMOND]: CARDS_SHORT.D,
  [CARDS.HART]: CARDS_SHORT.H,
  [CARDS.SPADE]: CARDS_SHORT.S
};

export const TRUMP_RANK: Record<string, number> = {
  [CARDS.CLUB]: 0,
  [CARDS.DIAMOND]: 1,
  [CARDS.HART]: 2,
  [CARDS.SPADE]: 3,
  [CARDS.NT]: 4,
};
