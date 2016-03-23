import React, { Component} from 'react-native';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';

import Game from './game';

import {game} from '../reducers/game';
const store = createStore(game);

export default class App extends Component {
	render() {
		return (
			<Provider store={store}>
				<Game/>
			</Provider>
		);
	}
}