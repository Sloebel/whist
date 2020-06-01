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
