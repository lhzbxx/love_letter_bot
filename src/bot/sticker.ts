import { Card } from 'core/card';

const stickers = {
  Princess: 'CAADBQADFQADpv68GVdxGp-gt56IFgQ',
  Countess: 'CAADBQADEAADpv68GSRXwWyfRyazFgQ',
  King: 'CAADBQADEwADpv68GdQta3YgO4LXFgQ',
  Prince: 'CAADBQADFAADpv68GT6MBsxTeuYpFgQ',
  Handmaid: 'CAADBQADDwADpv68GR3rMJmDA5BSFgQ',
  Baron: 'CAADBQADEQADpv68GSmxdUM_qGwIFgQ',
  Priest: 'CAADBQADDgADpv68GX2EcbDQJxO2FgQ',
  Guard: 'CAADBQADEgADpv68GdOAm5J_B6SvFgQ',
};

const greyStickers = {
  Princess: 'CAADBQADHQADpv68GQABWDcenNtVCxYE',
  Countess: 'CAADBQADHAADpv68GeEKaWnEtx7OFgQ',
  King: 'CAADBQADGwADpv68GRIxjlIPXkb_FgQ',
  Prince: 'CAADBQADGgADpv68GZ2ZsLZk_8OBFgQ',
  Handmaid: 'CAADBQADGQADpv68GSZQC3C2HjkXFgQ',
  Baron: 'CAADBQADGAADpv68GRb2VXeWUOIQFgQ',
  Priest: 'CAADBQADFwADpv68GWUcBNDEkHUyFgQ',
  Guard: 'CAADBQADFgADpv68GX9MraQuQsAtFgQ',
};

const getSticker = (card: Card, mask = false) => {
  return mask ? greyStickers[card.id] : stickers[card.id];
};

export { getSticker };
