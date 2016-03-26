import * as types from '../actions/gameActionTypes.js';
import {card} from './card';


const gameState = {
	screen: 'POPUP', //[START_SCREEN, ATTEMPT_SCREEN, RESULT_SCREEN
	settingsParams: {
		bet: 10
	},
	calculatedParams: {
		result: undefined, // [MORE, LESS, EQUAL]
		prizes: {
			MORE: 0,
			LESS: 0,
			EQUAL: 0
		},
		probabilities: {
			MORE: 0,
			LESS: 0,
			EQUAL: 0
		}
	},
	attemptCount: 0,
	bank: 0,
	cards: [],
	userBalance: 1000,
	animationManager: {
		frameNum: 0,
		animationsCount: 0,
		timeout: undefined
	}
};

export function game(state = gameState, action = {}) {
	var newState, cards = {};
	switch (action.type) {
		case types.CHANGE_SCREEN:
			return {
				...state,
				screen: action.payload.screen
			};
		case types.START_ATTEMPT:
			newState = {
				...state,
				screen: undefined,
				bank: 0,
				attemptCount: 0
			};
			return newState;
		case types.CONTINUE_ATTEMPT:
			newState = {
				...state,
				attemptCount: state.attemptCount++
			};
			return newState;
		case types.CALCULATE_GAME:
			newState = {
				...state,
				calculatedParams: {
					result: undefined, // [MORE, LESS, EQUAL]
					probabilities: {
						MORE: (12 - state.cards[0].card.value) * 4 / 51,
						LESS: (state.cards[0].card.value) * 4 / 51,
						EQUAL: 3/51
					},
					prizes: {
						MORE: 0,
						LESS: 0,
						EQUAL: 0
					}
				}
			};
			if (state.cards[1].card.value > state.cards[0].card.value) {
				newState.calculatedParams.result = 'MORE';
			} else if (state.cards[1].card.value < state.cards[0].card.value) {
				newState.calculatedParams.result = 'LESS';
			} else {
				newState.calculatedParams.result = 'EQUAL';
			}

			['MORE', 'LESS', 'EQUAL'].map((result, index) => {
				newState.calculatedParams.prizes[result] = newState.calculatedParams.probabilities[result] == 0
					? 0
				 	: Math.round(newState.settingsParams.bet / newState.calculatedParams.probabilities[result]);
			});
			return newState;
		/*case 'CHANGE_BET':
			return {
				...state,
				bet: action.payload.bet
			};*/
		case types.MAKE_BET:
			return {
				...state,
				userBalance: state.userBalance - state.settingsParams.bet
			};
		case types.CHANGE_BET:
			return {
				...state,
				settingsParams: {bet: action.payload.bet}
			};
		case types.DEAL_CARDS:
			return {
				...state,
				cards: [
					card(undefined, {
						payload: {
							card: action.payload.cards[0],
							position: 'left',
							callback: action.payload.callback
						}, type: 'DEAL_CARD'
					}),
					card(undefined, {
						payload: {
							card: action.payload.cards[1],
							position: 'right',
							callback: action.payload.callback
						}, type: 'DEAL_CARD'
					})
				]
			};
		case types.WIN:
			return {
				...state,
				bank: state.bank + action.payload.prize
			};
		case types.PICK_UP:
			return {
				...state,
				userBalance: state.userBalance + action.payload.prize,
				bank: state.bank - action.payload.prize
			};
		case types.LOOSE:
			return {
				...state,
				bank: 0
				//screen: 'RESULT_SCREEN'
			};
		/*case 'END_GAME':
			return {
				...state,
				userBalance: state.userBalance + state.bank,
				bank: 0
			};*/
		case types.REMOVE_CARDS:
			return {
				...state,
				cards: state.cards.map(t => {
					return card(t, {
						type: 'REMOVE_CARD',
						payload: {action: action.type, callback: action.payload.callback}
					})
				})
			};
		case 'REMOVE_ANIMATION':
			return {
				...state,
				animationManager: {
					animationsCount: state.animationManager.animationsCount - 1,
					frameNum: state.animationManager.frameNum
				}
			};
		case 'CHECK_ANIMATION':
			return {
				...state,
				animationManager: {
					animationsCount: state.animationManager.animationsCount,
					frameNum: state.animationManager.frameNum + 1
				}
			};
		case 'ADD_ANIMATION':
			return {
				...state,
				animationManager: {
					animationsCount: state.animationManager.animationsCount + 1,
					frameNum: state.animationManager.frameNum
				}
			};
		case 'FLIP_CARD':
			cards = state.cards.map(t => {
				if (t.id == action.payload.id) {
					return card(t, {
						type: 'CARD_DO_ACTION',
						payload: {action: action.type, callback: action.payload.callback}
					})
				}
				return t;
			});
			return {
				...state,
				cards: cards
			};
		default:
			return state;
	}
}