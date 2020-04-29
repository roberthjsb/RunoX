import { Deck } from "./deck.model";
import { PlayersGroup } from "./players-group.model";
import { Turn } from "./turn.model";
import { Stack } from "./stack.model";
import { GameDirection } from "./game-direction.model";
import { Card } from "./card.model";
import { Player } from "./player.model";
import { AfterTakeCardsEvent } from "../events/after-take-cards.event";
import { GameEvents } from "../events/game-events";
import { Hand } from "./hand.model";

/** Clase que representa el estado del juego */
export class GameState {
  readonly deck: Deck;
  readonly stack: Stack;
  readonly playersGroup: PlayersGroup;
  readonly turn: Turn;
  readonly events: GameEvents;

  gameDirection: GameDirection;
  cardsToGive: number;
  unoYellers: { [id: string]: boolean };

  constructor() {
    this.deck = new Deck();
    this.stack = new Stack();
    this.playersGroup = new PlayersGroup();
    this.turn = new Turn();
    this.events = GameEvents.getInstance();

    this.gameDirection = GameDirection.CLOCKWISE;
    this.cardsToGive = 0;
    this.unoYellers = {};
  }

  get nextPlayerToPlay() {
    // es el primer turno, entonces elegimos el primer jugador
    if (!this.turn.player) {
      return this.playersGroup.players[0];
    }

    let currentPlayerIndex = this.playersGroup.players.findIndex(
      player => player.id === this.turn.player?.id
    );

    const nextPlayerIndex = currentPlayerIndex + 1;

    // no ha terminado la vuelta, entonces elegimos el proximo en la lista
    if (nextPlayerIndex < this.playersGroup.players.length) {
      return this.playersGroup.players[nextPlayerIndex];
    }

    // ya ha jugado el ultimo, entonces comienza nuevamente desde el primero
    return this.playersGroup.players[0];
  }

  changeDirection() {
    const newDirection =
      this.gameDirection === GameDirection.CLOCKWISE
        ? GameDirection.COUNTER_CLOCKWISE
        : GameDirection.CLOCKWISE;

    this.gameDirection = newDirection;

    this.playersGroup.players.reverse();
  }

  giveCards(quantity: number, toPlayer: Player) {
    // numero de cartas disponibles entre mazo y pila
    const availableCards =
      this.deck.cards.length + (this.stack.cards.length - 1);

    while (quantity > availableCards) {
      throw new Error("No se puede dar más cartas que las jugables");
    }

    if (quantity > this.deck.cards.length) {
      this.addStackCardsToDeck();
    }

    let newCards: Card[] = [];

    for (let index = 0; index < quantity; index++) {
      newCards = [...newCards, this.deck.takeCard() as Card];
    }

    toPlayer.hand.addCards(newCards);

    console.log(`Se entregaron ${quantity} cartas al jugador ${toPlayer.name}`);

    return newCards;
  }

  addStackCardsToDeck() {
    const newDeckCards = this.stack.cards.filter(
      card => card.id === this.stack.cardOnTop?.id
    );

    this.deck.addCards(newDeckCards);

    const cardOnTopTheStack = this.stack.cardOnTop;

    if (!cardOnTopTheStack) {
      throw new Error("No se pudo obtener la carta de la cima del stack");
    }

    this.stack.empty();

    this.stack.addCard(cardOnTopTheStack);

    this.deck.shuffle();
  }

  parseObjects(array: any[]) {
    return array.map(element => {
      return element.parseObject();
    });
  }

  parseState() {
    const state = {
      deck: {
        cards: this.parseObjects(this.deck.cards)
      },
      stack: {
        cards: this.parseObjects(this.stack.cards)
      },
      playersGroup: this.playersGroup.players,
      turn: {
        player: this.turn.player
          ? {
              ...this.turn.player,
              hand: {
                cards: this.turn.player.hand.cards
              }
            }
          : null
      }
    };
    return state;
  }

  populateData(state: any) {
    try {
      this.deck.cards = state.deck.cards.map((card: any) => {
        return new Card(card.value, card.color);
      });
  
      this.stack.cards = state.stack.cards.map((card: any) => {
        return new Card(card.value, card.color);
      });
      this.playersGroup.players = state.playersGroup.map((player: any) => {
        const pl = new Player(player.id, player.name, player.pic);

        pl.hand.cards = player.hand.cards;
        return pl;
      });
      // debugger;
      this.turn.player = new Player(
        state.turn.player.id,
        state.turn.player.name,
        state.turn.player.pic
      );
      
      this.turn.player.hand.addCards(state.turn.player.hand.cards);
  
      console.log(this.playersGroup);
    } catch (e) {
      console.log('todavia no esta listo');
    }
  }
}
