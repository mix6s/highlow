'use strict';

import React, { Component, StyleSheet, View, TouchableHighlight, TouchableWithoutFeedback  , Text, Animated, Easing, InteractionManager } from 'react-native';
import {bindActionCreators} from 'redux';

import * as actions from '../actions/gameActions';
import { connect } from 'react-redux';
import Card from '../components/Card';
import * as CardTypes from '../components/CardTypes.js';
import TimerMixin from 'react-timer-mixin';

var styles = StyleSheet.create({
	toolbar:{
		backgroundColor:'#D6E7D4',
		paddingTop:10,
		paddingBottom:10,
		flexDirection:'row',
		justifyContent:'center',
		alignItems: 'stretch',
		flexWrap:'nowrap'
	},
	upToolbar: {
		backgroundColor:'#14B29B',
		paddingTop:5,
		paddingBottom:5,
		flexDirection:'row',
		justifyContent:'space-between',
		alignItems: 'flex-start',
		flexWrap:'nowrap'
	},
	infoButton: {
		paddingTop: 3,
		paddingBottom: 3,
		paddingRight: 3,
		paddingLeft: 9,
		borderRadius: 9,
		marginTop: 5,
		marginBottom: 5,
		marginLeft:5,
		marginRight:5,
		backgroundColor: 'rgba(255,255,255, 1)',
		flexDirection:'row',
		justifyContent:'flex-start',
		alignItems: 'center',
		flexWrap:'nowrap'
	},
	info: {
		paddingTop: 3,
		paddingBottom: 3,
		paddingRight: 3,
		paddingLeft: 9,
		borderRadius: 9,
		marginTop: 5,
		marginBottom: 5,
		marginLeft:5,
		marginRight:5,
		backgroundColor: 'rgba(255,255,255, 1)',
		flexDirection:'row',
		justifyContent:'flex-start',
		alignItems: 'center',
		flexWrap:'nowrap'
	},
	infoSub: {
		backgroundColor: '#E35F53',
		paddingTop: 4,
		paddingBottom: 4,
		paddingLeft: 6,
		paddingRight: 6,
		borderRadius: 7,
		marginLeft:5,
		marginRight:0,
		marginTop: 0,
		marginBottom: 0
	},
	infoSubText: {
		fontWeight: 'bold',
		margin:0,
		padding:0,
		marginTop:0,
		textAlign:'center',
		color: '#FFF',
		fontSize: 10
	},
	infoText: {
		fontWeight: 'bold',
		margin:0,
		marginRight: 5,
		marginLeft: 5,
		padding:0,
		paddingBottom:0,
		textAlign:'center',
		color: '#44606E',
		fontSize: 8
	},
	toolbarButton:{
		width: 50,
		color:'#44606E',
		textAlign:'center',
		flex:1
	},
	toolbarTitle:{
		color:'#44606E',
		textAlign:'center',
		fontWeight:'bold',
		flex:1
	},
	mainContainer:{
		flex:1,
		margin:0
	},
	content:{
		backgroundColor:'#14B29B',
		position: 'absolute',
		top: 0,
		bottom:0,
		left:0,
		right:0,
		justifyContent:'center',
		alignItems: 'center',
		margin:0,
		flexDirection:'row',
		flexWrap:'nowrap',
		padding: 0
	},
	button: {
		flex:1,
		paddingTop: 10,
		paddingBottom: 10,
		paddingLeft: 20,
		paddingRight: 20,
		borderRadius: 5,
		marginLeft:20,
		marginRight:20,
		marginTop: 5,
		marginBottom: 5,
		backgroundColor: '#44606E'
	},
	pickupButton: {
		paddingTop: 10,
		paddingBottom: 10,
		paddingLeft: 20,
		paddingRight: 20,
		borderRadius: 5,
		backgroundColor: '#E8B331'
	},
	buttonText: {
		fontWeight:'bold',
		margin:0,
		padding:0,
		textAlign:'center',
		color: 'white',
		fontSize: 16
	}
});

class Game extends Component {
	mixins = TimerMixin;
	static timeout = undefined;
	actionLock = false;
	bankScale = new Animated.Value(1);

	button = {
		pressed: false
	};

	static randomCard() {
		return {
			card: {
				type: CardTypes.CARDS[1][Math.floor(Math.random() * 4)],
				value: Math.floor(Math.random() * 13)
			}
		};
	}

	static getCards() {
		var cardA = Game.randomCard();
		var cardB = Game.randomCard();
		if (cardB.card.type == cardA.card.type && cardB.card.value == cardA.card.value) {
			if (cardB.card.value == 0) {
				cardB.card.value = 1;
			} else {
				cardB.card.value = cardB.card.value - 1;
			}
		}
		return [cardA, cardB];
	}

	more() {
		this.processAttempt('MORE');
	}

	less() {
		this.processAttempt('LESS')
	}

	startAttempt() {
		this.actionLock = true;
		var _this = this;
		const { state, actions} = this.props;
		actions.startAttempt({bet: 100});
		actions.makeBet();
		actions.dealCards({
			cards: Game.getCards(),
			callback: () => {
				actions.changeScreen({screen: 'ATTEMPT_SCREEN'});
				_this.actionLock = false;
			}
		});
		actions.calculateGame();
	}

	continueAttempt() {
		this.actionLock = true;
		var _this = this;
		const { state, actions} = this.props;
		actions.continueAttempt();
		actions.dealCards({
			cards: Game.getCards(),
			callback: () => {
				actions.changeScreen({screen: 'ATTEMPT_SCREEN'});
				_this.actionLock = false;
			}
		});
		actions.calculateGame();
	}

	increase(prize, step) {
		const { state, actions} = this.props;
		var _this = this;
		if (prize <= 0) {
			return;
		}
		if (prize < step) {
			step = prize;
		}
		prize = prize - step;
		this.mixins.setTimeout(() => {
			actions.win({prize: step});
			actions.addAnimation();

			_this.bankScale.setValue(_this.bankScale._value + 0.2);
			if (_this.bankScale._value > 1.3) {
				_this.bankScale.setValue(1.3);
			}
			Animated.timing(
				_this.bankScale,
				{
					toValue: 1,
					duration: 100
				}
			).start((status) => {
					actions.removeAnimation();
				});
			_this.increase(prize, step);
		}, 100);
	}

	processWin(prize) {
		this.actionLock = true;
		var _this = this;
		const { state, actions} = _this.props;
		actions.flipCard({id: state.cards[1].id, callback: () => {
			_this.increase(prize, Math.round(prize/5));
			this.mixins.setTimeout(function () {
				actions.removeCards({callback: () => {
					_this.actionLock = false;
					_this.continueAttempt();
				}});
			}, 600);
		}});
	}

	processFail() {
		this.actionLock = true;
		var _this = this;
		const { state, actions} = _this.props;
		actions.flipCard({id: state.cards[1].id, callback: () => {
			actions.loose();
			this.mixins.setTimeout(function () {
				actions.removeCards({callback: () => {
					_this.actionLock = false;
					actions.changeScreen({screen: 'RESULT_SCREEN'});
				}});
			}, 600);
		}});
	}

	processAttempt(result) {
		const { state, actions} = this.props;
		if (state.calculatedParams.result == result) {
			this.processWin(state.calculatedParams.prizes[state.calculatedParams.result]);
		} else {
			this.processFail()
		}
		actions.changeScreen({screen: undefined});
	}

	static resolveToolbarButtons(screen) {
		switch (screen) {
			case 'START_SCREEN':
				return ['start'];
			case 'ATTEMPT_SCREEN':
				return ['more', 'less'];
			case 'RESULT_SCREEN':
				return ['start'];
			default:
				return [];
		}
	}

	componentDidUpdate() {
		this.checkAction();
	}

	checkAction() {
		var _this = this;
		if (_this.props.state.animationManager.animationsCount > 0 && Game.timeout == undefined) {
			Game.timeout = requestAnimationFrame(() => {
				Game.timeout = undefined;
				_this.props.actions.checkAnimation();
			});
		}
	}

	render() {
		const { state, actions} = this.props;
		const buttons = {
			start: (
				<TouchableHighlight  key={'start'} onPress={() => {
						if (this.actionLock) {
							return;
						}
						this.startAttempt();
					}} style={styles.button}>
					<Text style={styles.buttonText}>START</Text>
				</TouchableHighlight>
			),
			more: (
				<TouchableHighlight key={'more'}  onPress={() => {
						if (this.actionLock) {
							return;
						}
						this.less()
					}} style={styles.button}>
					<Text style={styles.buttonText}>LOW ${state.calculatedParams.prizes['LESS']}</Text>
				</TouchableHighlight>
			),
			less: (
				<TouchableHighlight key={'less'}  onPress={() => {
						if (this.actionLock) {
							return;
						}
						this.more()
					}} style={styles.button}>
					<Text style={styles.buttonText}>HIGH ${state.calculatedParams.prizes['MORE']}</Text>
				</TouchableHighlight>
			)
		};
		const toolbarButtons = Game.resolveToolbarButtons(state.screen);

		return (
			<View  style={styles.mainContainer}>
				<View style={styles.content}>
					{state.cards.map(card =>
							<Card key={card.id} {...card}/>
					)}
				</View>
				<View style={styles.upToolbar}>
					<View  style={styles.info}>
						<View>
							<Text style={styles.infoText}>BET:</Text>
						</View>
						<View style={styles.infoSub}>
							<Text style={styles.infoSubText}>${state.settingsParams.bet}</Text>
						</View>
					</View>
					<View  style={styles.infoButton}>
						<View>
							<Text style={styles.infoText}>BANK:</Text></View>
						<View   style={styles.infoSub}>
							<Text renderToHardwareTextureAndroid={true}  style={{
								fontWeight: 'bold',
								margin:0,
								padding:0,
								marginTop:0,
								textAlign:'center',
								color: '#FFF',
								fontSize: 10,
								transform: [{scale: this.bankScale._value}]}}>${state.bank}</Text>
						</View>
					</View>
					<View style={styles.info}>
						<View>
							<Text style={styles.infoText}>BALANCE:</Text>
						</View>
						<View style={styles.infoSub}>
							<Text style={styles.infoSubText}>${state.userBalance}</Text>
						</View>
					</View>
				</View>
				<View style={{flex:1, backgroundColor: 'rgba(0,0,0,0)', flexDirection: 'column', justifyContent: 'flex-start'}}>
					{
						(state.screen == 'RESULT_SCREEN') ?
							<Text style={styles.infoText}>YOU WON: ${state.bank}</Text>
							: undefined
					}
				</View>
				{
					(toolbarButtons.length > 0) ?
						<View style={styles.toolbar}>
							{toolbarButtons.map(button =>
									buttons[button]
							)}
						</View>
						: undefined
				}

			</View>
		);
	}
}

export default connect(state => ({
		state: state
	}),
	(dispatch) => ({
		actions: bindActionCreators(actions, dispatch)
	})
)(Game);