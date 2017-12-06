import React from 'react';
import PropTypes from 'prop-types';

import SuggestionBox from './SuggestionBox';
import { checkValidity } from '../../shared/utils';

import '../styles/time.css';

export default class TimeField extends React.Component {
	constructor(props) {
		super(props);

		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.onChooseSuggestion = this.onChooseSuggestion.bind(this);

		this.state = {
			isFocused: false,
			value: null
		};

		this.randomId = `${props.mode}_${String(Math.random())}`;
	}

	componentWillMount() {
		this.setState({ value: this.props.value || '' });
	}

	componentWillReceiveProps({ value }) {
		if (this.state.value !== value) {
			this._changeTime(value);
		}
	}

	onFocus() {
		return () => {
			this.setState({
				isFocused: true
			});
		};
	}

	onBlur() {
		return () => {
			setTimeout(() => {
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
		const modeString = this._isHoursInput() ? 'hours' : 'minutes';
		return checkValidity[modeString](value);
	}

	_changeTime(valueRaw) {
		const value = !this._isInputValid(parseInt(valueRaw, 10)) ? 0 : valueRaw;
		this.props.onChange(this.props.mode, value);
		this.setState({ value });
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
		const { mode, referenceHour } = this.props;
		const { isFocused, value } = this.state;
		return (
			<div className="field">
				<input
					type="number"
					value={value}
					min={0}
					max={this._getMaxValue()}
					placeholder={this._getPlaceholder()}
					id={this.randomId}
					className={mode}
					onChange={this.onChangeValue()}
					onFocus={this.onFocus()}
					onBlur={this.onBlur()}
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
	onChange: PropTypes.func,
	referenceHour: PropTypes.number
};

TimeField.defaultProps = {
	referenceHour: 9,
	onChange: () => {},
	value: 0
};
