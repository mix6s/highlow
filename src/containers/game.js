'use strict';

import React, { Component, StyleSheet, View, TouchableHighlight  , Text, Animated, Easing, InteractionManager, LayoutAnimation, PixelRatio} from 'react-native';
import {bindActionCreators} from 'redux';

import UIManager from 'UIManager';
import Dimensions from 'Dimensions';

import * as actions from '../actions/gameActions';
import { connect } from 'react-redux';
import Card from '../components/Card';
import * as CardTypes from '../components/CardTypes.js';
import TimerMixin from 'react-timer-mixin';

UIManager.setLayoutAnimationEnabledExperimental &&   UIManager.setLayoutAnimationEnabledExperimental(true);

const pixelRatio = Math.max(1, Math.min(2, PixelRatio.get()));
const viewHeight = Dimensions.get('window').height;
const viewWidth = Dimensions.get('window').width;

var styles = StyleSheet.create({
	toolbar:{
		//backgroundColor:'#fff',
		paddingTop:10,
		paddingBottom:10,
		flexDirection:'row',
		justifyContent:'center',
		alignItems: 'stretch',
		flexWrap:'nowrap'
	},
	upToolbar: {
		backgroundColor:'#000',
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
		paddingBottom: 3,
		paddingRight: 3,
		paddingLeft: 9,
		marginLeft:5,
		marginRight:5,
		flexDirection:'column',
		justifyContent:'center',
		alignItems: 'center',
		flexWrap:'nowrap'
	},
	infoSub: {
		paddingTop: 4,
		paddingLeft: 6,
		paddingRight: 6
	},
	infoSubText: {
		fontWeight: 'bold',
		margin:0,
		padding:0,
		marginTop:0,
		textAlign:'center',
		color: '#D73837'
	},
	infoText: {
		fontWeight: 'bold',
		margin:0,
		marginRight: 5,
		marginLeft: 5,
		padding:0,
		textAlign:'center',
		color: '#A9A7A9'
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
		backgroundColor:'#19BD9B',
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
		backgroundColor: '#11A182'
	},
	pickupButton: {
		paddingTop: 10,
		paddingBottom: 10,
		paddingLeft: 20,
		paddingRight: 20,
		borderBottomRightRadius: 5,
		borderBottomLeftRadius: 5,
		marginLeft:20,
		marginRight:20,
		marginBottom: 5,
		backgroundColor: 'rgba(253, 99, 99, 0.7)'
	},
	buttonText: {
		fontWeight:'bold',
		margin:0,
		padding:0,
		textAlign:'center',
		color: 'white'
	},
	fontBiggest: {
		fontFamily: 'notosans',
		fontSize: 20 * pixelRatio
	},
	fontBig: {
		fontFamily: 'notosans',
		fontSize: 14 * pixelRatio
	},
	fontMain: {
		fontFamily: 'notosans',
		fontSize: 12 * pixelRatio
	},
	fontSmall: {
		fontFamily: 'notosans',
		fontSize: 6 * pixelRatio
	}
});

class Game extends Component {
	mixins = TimerMixin;
	static timeout = undefined;
	actionLock = false;
	bankScale = new Animated.Value(1);
	balanceScale = new Animated.Value(1);
	betScale = new Animated.Value(1);
	winBank = 0;
	screen = null;
	popupAnimation = {
		opacity: new Animated.Value(1),
		popupTop: new Animated.Value(0)
	};
	button = {
		pressed: false
	};
	on = {
		screenChange: (event) => {
			if (event.screen == 'POPUP') {
				this.showPopup();
			}
		}
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
		this.winBank = 0;
		actions.startAttempt({bet: 10});
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

	pickUp() {
		const { state, actions} = this.props;
		this.winBank = state.bank;
		actions.changeScreen({screen: 'POPUP'});
		this.increaseBalance(state.bank, Math.round(state.bank/5));
	}

	increaseBalance(prize, step) {
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
			actions.pickUp({prize: step});
			actions.addAnimation();
			_this.balanceScale.setValue(_this.balanceScale._value + 0.2);
			if (_this.balanceScale._value > 1.3) {
				_this.balanceScale.setValue(1.3);
			}
			Animated.timing(
				_this.balanceScale,
				{
					toValue: 1,
					duration: 100
				}
			).start((status) => {
					actions.removeAnimation();
				});
			_this.increaseBalance(prize, step);
		}, 100);
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
					actions.changeScreen({screen: 'POPUP'});
				}});
			}, 600);
		}});
	}

	changeBet() {
		const { state, actions} = this.props;
		var _this = this;
		const inc = 10;
		let bet = state.settingsParams.bet + inc;
		if (bet > 100) {
			bet = 10;
		}
		actions.changeBet({bet});
		actions.addAnimation();
		_this.betScale.setValue(_this.bankScale._value + 0.2);
		if (_this.betScale._value > 1.3) {
			_this.betScale.setValue(1.3);
		}
		Animated.timing(
			_this.betScale,
			{
				toValue: 1,
				duration: 100
			}
		).start((status) => {
				actions.removeAnimation();
			});
	}

	showPopup() {
		const { state, actions} = this.props;
		var _this = this;
		actions.addAnimation();
		_this.popupAnimation.opacity.setValue(0);
		_this.popupAnimation.popupTop.setValue(-viewHeight);
		Animated.sequence([
			Animated.parallel([
				Animated.timing(
					_this.popupAnimation.opacity,
					{
						toValue: 1,
						duration: 300
					}
				),
				Animated.timing(
					_this.popupAnimation.popupTop,
					{
						easing:Easing.linear,
						toValue: 0,
						duration: 300
					}
				)
			])
		]).start((status) => {
			actions.removeAnimation();
		});
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
			case 'ATTEMPT_SCREEN':
				return ['less', 'more'];
			default:
				return [];
		}
	}

	handleScreenChange(screen) {
		if (this.screen != screen) {
			this.screen = screen;
			(this.on.screenChange) && this.on.screenChange({screen});
		}
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

	componentDidMount() {
		this.handleScreenChange(this.props.state.screen);
	}

	componentWillUpdate() {

	}

	componentDidUpdate() {
		this.checkAction();
		this.handleScreenChange(this.props.state.screen);
	}

	render() {
		const { state, actions} = this.props;
		if (this.showPopup === null) {
			this.showPopup = true;
		}
		const buttons = {
			start: (
				<TouchableHighlight  key={'start'} onPress={() => {
						if (this.actionLock) {
							return;
						}
						this.startAttempt();
					}} style={styles.button}>
					<Text style={[styles.buttonText, styles.fontMain]}>Start</Text>
				</TouchableHighlight>
			),
			less: (
				<TouchableHighlight key={'more'} underlayColor={state.calculatedParams.prizes['LESS'] == 0 ? '#16B392' : '#2AD4B3'}  onPress={() => {
						if (state.calculatedParams.prizes['LESS'] == 0 || this.actionLock) {
							return;
						}
						this.less()
					}} style={[styles.button, {transform: [{scale:1}]}, state.calculatedParams.prizes['LESS'] == 0 ? {backgroundColor: '#16B392'} : {}]}>
					<View>
						<Text style={[styles.buttonText, styles.fontMain]}>${state.calculatedParams.prizes['LESS']}</Text>
						<Text style={[styles.buttonText, styles.fontSmall]}>МЕНЬШЕ</Text>
					</View>
				</TouchableHighlight>
			),
			more: (
				<TouchableHighlight key={'less'} underlayColor={state.calculatedParams.prizes['MORE'] == 0 ? '#16B392' : '#2AD4B3'} onPress={() => {
						if (state.calculatedParams.prizes['MORE'] == 0 || this.actionLock) {
							return;
						}
						this.more()
					}} style={[styles.button, state.calculatedParams.prizes['MORE'] == 0 ? {backgroundColor: '#16B392'} : {}]}>
					<View>
						<Text style={[styles.buttonText, styles.fontMain]}>${state.calculatedParams.prizes['MORE']}</Text>
						<Text style={[styles.buttonText, styles.fontSmall]}>БОЛЬШЕ</Text>
					</View>
				</TouchableHighlight>
			)
		};
		const toolbarButtons = Game.resolveToolbarButtons(state.screen);
		const showPopup = (state.screen == 'POPUP');
		return (
			<View style={{flex:1}}>
			<View  style={styles.mainContainer}>
				<View style={styles.content}>
					{state.cards.map(card =>
							<Card key={card.id} {...card}/>
					)}
				</View>
				<View style={[styles.upToolbar, {backgroundColor: '#FFF'}]}>
					<View  style={styles.info}>
						<View style={styles.infoSub}>
							<Text style={[styles.infoSubText, styles.fontMain]}>${state.settingsParams.bet}</Text>
						</View>
						<View>
							<Text style={[styles.infoText, styles.fontSmall]}>СТАВКА</Text>
						</View>
					</View>
					<View  style={styles.info}>
						<View style={[styles.infoSub]}>
							<Text renderToHardwareTextureAndroid={true}
								  style={[styles.infoSubText, styles.fontMain, {transform: [{scale: this.bankScale._value}]}]}>${state.bank}</Text>
						</View>
						<View>
							<Text style={[styles.infoText, styles.fontSmall]}>БАНК</Text>
						</View>
					</View>
					<View style={styles.info}>
						<View style={styles.infoSub}>
							<Text style={[styles.infoSubText, styles.fontMain]}>${state.userBalance}</Text>
						</View>
						<View>
							<Text style={[styles.infoText, styles.fontSmall]}>БАЛАНС</Text>
						</View>
					</View>
				</View>
				<View style={{flex:1, flexDirection: 'column', justifyContent: 'flex-start'}}>
					{ (state.bank>0 && 'ATTEMPT_SCREEN' == state.screen) ?
						<View
							style={{flex:1, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start'}}>
							<TouchableHighlight style={[styles.pickupButton]} onPress={() => {
														if (this.actionLock) {
															return;
														}
														this.pickUp()}} underlayColor={'rgba(253, 99, 99, 0.3)'}>
								<View>
									<Text style={[styles.buttonText, styles.fontSmall]}>ЗАБРАТЬ</Text>
								</View>
							</TouchableHighlight>
						</View>
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
				{
					(showPopup) ?
						<View style={{backgroundColor: 'rgba(0,0,0, 0.6)', position:'absolute', top: 0, left:0, right:0, bottom:0, opacity: this.popupAnimation.opacity._value}}>
							<View style={{position:'absolute', top: this.popupAnimation.popupTop._value, left:0, right:0, bottom: 0-this.popupAnimation.popupTop._value}}>
								<View style={{
										backgroundColor: '#FFF',
										margin: 30, flex:1,
										borderRadius:10,
										flexDirection: 'column',
										justifyContent: 'center',
										alignItems: 'stretch',
										opacity: this.popupAnimation.opacity._value
										}}>
									{
										(this.winBank > 0) ?
											<View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'stretch'}}>
												<View style={styles.info}>
													<View style={styles.infoSub}>
														<Text style={[styles.infoSubText, styles.fontBig]}>+ ${this.winBank}</Text>
													</View>
													<View>
														<Text style={[styles.infoText, styles.fontSmall]}>ВЫИГРЫШ</Text>
													</View>
												</View>
											</View>
											: undefined
									}

									<View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'stretch', marginBottom: 40}}>
										<View style={[styles.info]}>
											<View style={[styles.infoSub]}>
												<Text style={[styles.infoSubText, styles.fontBiggest, {transform: [{scale: this.balanceScale._value}]}]}>${state.userBalance}</Text>
											</View>
											<View>
												<Text style={[styles.infoText, styles.fontSmall]}>БАЛАНС</Text>
											</View>
										</View>
									</View>
									<View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'stretch'}}>
										<TouchableHighlight style={[{
																paddingTop: 10,
																paddingBottom: 10,
																paddingLeft: 10,
																paddingRight: 10,
																borderBottomLeftRadius: 5,
																borderTopLeftRadius: 5,
																marginLeft:20,
																marginBottom: 5,
																marginTop: 5,
																flex:0.7,
																backgroundColor: '#81BD7F'
															}]}
															underlayColor={'#90CE8E'}
														onPress={() => {
															if (this.actionLock) {
																return;
															}
															this.startAttempt();
														}}>
											<Text style={[styles.buttonText, styles.fontMain]}>Ставка</Text>
										</TouchableHighlight>
										<TouchableHighlight style={[{
																paddingTop: 10,
																paddingBottom: 10,
																paddingLeft: 10,
																paddingRight: 10,
																borderBottomRightRadius: 5,
																borderTopRightRadius: 5,
																marginRight:20,
																marginBottom: 5,
																marginTop: 5,
																flex:0.2,
																backgroundColor: '#6DA06B'
															}]}
															underlayColor={'#6DA06B'}
															onPress={() => {
															if (this.actionLock) {
																return;
															}
															this.changeBet();
														}}>
											<Text style={[styles.buttonText, styles.fontMain, {transform: [{scale:this.betScale._value}]}]}>${state.settingsParams.bet}</Text>
										</TouchableHighlight>
									</View>
									<View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'stretch'}}>
										<TouchableHighlight style={[{
																paddingTop: 10,
																paddingBottom: 10,
																paddingLeft: 10,
																paddingRight: 10,
																borderRadius: 5,
																marginRight:20,
																marginLeft:20,
																marginBottom: 5,
																marginTop: 5,
																flex:1,
																backgroundColor: '#81D4DC'
															}]}
															underlayColor={'#81D4DC'}
															onPress={() => {}}>
											<Text style={[styles.buttonText, styles.fontMain]}>Настройки</Text>
										</TouchableHighlight>
									</View>
								</View>
							</View>
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