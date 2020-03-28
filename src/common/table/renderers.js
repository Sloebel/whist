import React from "react";
import Icon from "@ant-design/icons";
import { Spade, Hart, Diamond, Club } from "../cards/Icons";
import { CARDS } from "../../constants/cards";

export const cardsRenderer = text => {
  let card;
  switch (text) {
    case CARDS.SPADE:
      card = <Icon component={Spade} />;
      break;
    case CARDS.HART:
      card = <Icon component={Hart} />;
      break;
    case CARDS.DIAMOND:
      card = <Icon component={Diamond} />;
      break;
    case CARDS.CLUB:
      card = <Icon component={Club} />;
      break;
    case CARDS.NT:
      card = "NT";
      break;
  }
  return {
    children: card
  };
};
