import React from 'react';
import PropTypes from 'prop-types';

import SuggestionBox from './SuggestionBox';
import { checkValidity } from '../../../shared/utils';

export default class TimeField extends React.Component {
	constructor(props) {
		super(props);

		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.onChooseSuggestion = this.onChooseSuggestion.bind(this);

		this.state = {
			isFocused: false
		};

		this.randomId = `${props.mode}_${String(Math.random())}`;
		this.input = null;
		this.timeoutId = null;
	}

	componentWillReceiveProps(nextProps) {
		const { shouldHaveFocus } = this.props;
		if (!shouldHaveFocus && nextProps.shouldHaveFocus) {
			this.input.focus();
		}
	}

	componentWillUnmount() {
		window.clearTimeout(this.timeoutId);
	}

	onFocus() {
		return () => {
			this.props.onFocus(this.props.mode);
			this.setState({
				isFocused: true
			});
			this.input.select();
		};
	}

	onBlur() {
		const _this = this;
		return () => {
			_this.timeoutId = setTimeout(() => {
				this.setState({
					isFocused: false
				});
			}, 200);
		};
	}

	onChangeValue() {
		return (event) => {
			this._changeTime(event.target.value);
		};
	}

	onChooseSuggestion(suggestion) {
		this._changeTime(suggestion);
	}

	_isInputValid(value) {
		if (value) {
			const modeString = this._isHoursInput() ? 'hours' : 'minutes';
			return checkValidity(modeString, value);
		}
		return true;
	}

	_changeTime(valueRaw) {
		const value = !this._isInputValid(valueRaw) ? 0 : valueRaw;
		this.props.onChange(this.props.mode, value);
	}

	_getPlaceholder() {
		return this._isHoursInput() ? '0' : '00';
	}

	_getMaxValue() {
		return this._isHoursInput() ? '23' : '59';
	}

	_isHoursInput() {
		return this.props.mode === 'hours';
	}

	render() {
		const {
			mode,
			referenceHour,
			value,
			tabIndex,
			disabled
		} = this.props;

		const { isFocused } = this.state;

		return (
			<div className="field">
				<input
					type="number"
					value={value === null ? '' : value}
					min={0}
					disabled={disabled}
					max={this._getMaxValue()}
					tabIndex={tabIndex + 1}
					placeholder={this._getPlaceholder()}
					id={this.randomId}
					className={mode}
					onChange={this.onChangeValue()}
					onFocus={this.onFocus()}
					onBlur={this.onBlur()}
					ref={(input) => { this.input = input; }}
					onKeyUp={this.props.handleKeyPress}
				/>
				<SuggestionBox
					mode={mode}
					show={isFocused}
					referenceHour={referenceHour}
					onChoose={this.onChooseSuggestion}
				/>
			</div>
		);
	}
}

TimeField.propTypes = {
	mode: PropTypes.oneOf(['hours', 'minutes']).isRequired,
	value: PropTypes.oneOfType([
		PropTypes.number,
		PropTypes.string
	]),
	shouldHaveFocus: PropTypes.bool,
	onChange: PropTypes.func,
	referenceHour: PropTypes.number,
	onFocus: PropTypes.func.isRequired,
	tabIndex: PropTypes.number,
	disabled: PropTypes.bool,
	handleKeyPress: PropTypes.func
};

TimeField.defaultProps = {
	referenceHour: 9,
	onChange: () => {},
	value: '',
	shouldHaveFocus: false,
	tabIndex: 0,
	disabled: false,
	handleKeyPress: () => {}
};
