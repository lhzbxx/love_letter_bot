import strictEventEmitterTypes from 'strict-event-emitter-types';
import { EventEmitter } from 'events';
import { Game } from '../core/game';
import { Player } from '../core/player';
import { Card } from '../core/card';

interface Events {
  gameInfo: (game: Game) => void;
  gameSuspend: (game: Game, player: Player) => void;
  gameOver: (game: Game) => void;
  playerWaiting: (player: Player) => void;
  selectPlayer: (game: Game) => void;
  selectNumber: (game: Game) => void;
  takeEffect: (card: Card, after: () => void) => void;
}

const ee: strictEventEmitterTypes<EventEmitter, Events> = new EventEmitter();

export { ee };
