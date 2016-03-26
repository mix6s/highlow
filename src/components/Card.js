import React, { Component, View, Image, Animated, StyleSheet, Easing} from 'react-native';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';
import Dimensions from 'Dimensions';

import * as CardTypes from './CardTypes.js';
import * as actions from '../actions/gameActions';

var styles = StyleSheet.create({
	card: {
		resizeMode: 'contain',
		height: 200,
		transform: [{rotateZ: '20deg'}]
	}
});

const viewHeight = Dimensions.get('window').height;
const viewWidth = Dimensions.get('window').width;

export default class Card extends Component {
	static getPath(card) {
		return 'cover_' + card.type.toLowerCase() + '_' + CardTypes.CARDS[0][card.value].toLowerCase();
	}

	animated = false;
	cover = {uri: 'cover'};
	actionId = 0;
	rotateY = new Animated.Value(0);
	translate = new Animated.ValueXY();
	path = '';
	covers = {};

	resolveCover(value) {
		var angle = value - parseInt(value / 360) * 360;
		var cover = this.covers.up;
		if (angle < 90) {
			cover = this.covers.up;
		} else if (angle < 270) {
			cover = this.covers.down;
		}
		return cover
	}

	constructor(props) {
		super(props);
		this.path = Card.getPath(props.card);
		this.covers = {
			up: {uri: this.path},
			down: {uri: 'cover'}
		};
		let defAngleY = props.position == 'left' ? 0 : 180;
		this.cover = this.resolveCover(defAngleY);
		this.rotateY = new Animated.Value(defAngleY);
		this.translate = new Animated.ValueXY();
		this.rotateY.addListener(({value}) => {
			let cover = this.resolveCover(value);
			if (this.cover != cover) {
				this.cover = cover;
				this.forceUpdate();
			}
		});
	}

	dealCard(callback) {
		this.props.actions.addAnimation();
		this.translate.setValue({y: viewHeight, x: 0});
		Animated.timing(
			this.translate,
			{
				toValue: {y: 0, x: 0},
				duration: 600
			}
		).start((status) => {
				this.props.actions.removeAnimation();
				this.animated = false;
				callback && callback();
			});
	}

	removeCard(callback) {
		this.props.actions.addAnimation();
		let radian = (10 - (this.props.position == 'left' ? -14 : 14)) * (Math.PI / 180),
			destX = -1 * Math.cos(radian) * (viewWidth * 1.5),
			destY = -1 * Math.sin(radian) * (viewWidth * 1.5);
		Animated.timing(
			this.translate,
			{
				toValue: {x: destX, y: destY},
				duration: 300
			}
		).start((status) => {
				this.props.actions.removeAnimation();
				this.animated = false;
				callback && callback();
			});
	}

	flip(callback) {
		this.props.actions.addAnimation();
		Animated.timing(
			this.rotateY,
			{
				toValue: this.rotateY._value + 180,
				easing: Easing.linear,
				duration: 400
			}
		).start((status) => {
				this.props.actions.removeAnimation();
				this.animated = false;
				callback && callback();
			});
	}

	componentWillUpdate() {
		this.resolveAction(this.props.action);
	}

	resolveAction(action) {
		if (action.id != this.actionId && this.animated == false) {
			this.animated = true;
			this.actionId = action.id;
			switch (action.name) {
				case "FLIP_CARD":
					this.flip(action.callback);
					break;
				case "DEAL_CARD":
					this.dealCard(action.callback);
					break;
				case "REMOVE_CARD":
					this.removeCard(action.callback);
					break;
			}
		}
	}

	render() {
		const state = this.props;
		var scale = 0.6;
		return (
			<View renderToHardwareTextureAndroid={true} style={{flex:1, alignItems: 'stretch',
								transform: [
									{rotateZ: state.position == 'left' ? '-14deg' : '14deg'},
									{translateX: this.translate.x._value},
									{translateY: this.translate.y._value}
								]
							}}>
				<Image renderToHardwareTextureAndroid={true} source={this.cover} style={{
				width: viewWidth/2,
				height:  viewWidth/2 *380/255,
				resizeMode: 'cover',
				transform: [{ rotateY: this.rotateY._value + 'deg' }, {scale: scale}]
			}}/>
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
)(Card);