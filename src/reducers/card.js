import * as CardTypes from '../components/CardTypes.js';

let nextCardId = 0;
function cardState() {
	return {
		id: nextCardId++,
		card: {
			type: CardTypes.CLUBS,
			value: 0
		},
		position: 'left',
		action: {
			id:0
		}
	};
}

export function card(state = cardState(), action = {}) {
	switch (action.type) {
		case 'CARD_DO_ACTION':
			return {
				...state,
				action: {
					id: state.action.id + 1,
					name: action.payload.action,
					callback: action.payload.callback
				}
			};
		case 'FLIP_CARD':
		case 'REMOVE_CARD':
			return card(state, {type: 'CARD_DO_ACTION', payload: {action: action.type, callback: action.payload.callback}});
		case 'DEAL_CARD':
			var newCard = action.payload.card;
			var defState = cardState();
			var newState = {
				...defState,
				...newCard,
				position: action.payload.position
			};
			return card(newState, {type: 'CARD_DO_ACTION', payload: {action: 'DEAL_CARD', callback: action.payload.callback}});
		default:
			return state;
	}
}