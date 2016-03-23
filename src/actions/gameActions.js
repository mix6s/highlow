import * as types from './gameActionTypes.js';

export function startAttempt(payload = {bet}) {
	return {
		type: types.START_ATTEMPT,
		payload
	};
}

export function continueAttempt() {
	return {
		type: types.CONTINUE_ATTEMPT
	};
}


export function calculateGame() {
	return {
		type: types.CALCULATE_GAME
	};
}


export function makeBet() {
	return {
		type: types.MAKE_BET
	};
}


export function win(payload = {prize}) {
	return {
		type: types.WIN,
		payload
	};
}

export function loose() {
	return {
		type: types.LOOSE
	};
}

export function dealCards(payload = {cards, callback}) {
	return {
		type: types.DEAL_CARDS,
		payload
	};
}

export function flipCard(payload = {id, callback}) {
	return {
		type: types.FLIP_CARD,
		payload
	};
}

export function removeCards(payload = {callback}) {
	return {
		type: types.REMOVE_CARDS,
		payload
	};
}

export function changeScreen(payload = {screen}) {
	return {
		type: types.CHANGE_SCREEN,
		payload
	};
}

export function checkAnimation() {
	return {
		type: 'CHECK_ANIMATION'
	};
}

export function removeAnimation() {
	return {
		type: 'REMOVE_ANIMATION'
	};
}

export function addAnimation() {
	return {
		type: 'ADD_ANIMATION'
	};
}





