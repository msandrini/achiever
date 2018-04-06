import React from 'react';
import PropTypes from 'prop-types';
import SuggestionBox from './SuggestionBox';

const _getUnit = (mode, value) => value ? value.split(':')[mode === 'hours' ? 0 : 1] : '';

const _merge = (mode, value, changedUnitValue) => {
	const cutValue = (String(changedUnitValue).length > 2) ?
		String(changedUnitValue).substr(0, 2) : changedUnitValue;
	if (mode === 'hours') return `${cutValue}:${_getUnit('minutes', value)}`;
	if (mode === 'minutes') return `${_getUnit('hours', value)}:${cutValue}`;
	return '';
};

class InputTimeGroup extends React.Component {
	constructor() {
		super();

		this.state = {
			focused: false
		};

		this.handleFocus = this.handleFocus.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
	}

	handleFocus() {
		this.setState({ focused: true });
	}

	handleBlur() {
		setTimeout(() => this.setState({ focused: false }), 100);
	}

	render() {
		const {
			mode,
			value,
			disabled,
			onChangeTime,
			referenceHour
		} = this.props;

		return [
			<input
				key={0}
				type="number"
				value={_getUnit(mode, value)}
				min={0}
				max={mode === 'minutes' ? 59 : 23}
				placeholder={mode === 'minutes' ? '00' : '0'}
				onFocus={this.handleFocus}
				onBlur={this.handleBlur}
				disabled={disabled}
				onChange={event => onChangeTime(_merge(mode, value, event.target.value))}
			/>,
			<SuggestionBox
				key={1}
				show={this.state.focused}
				mode={mode}
				onChoose={chosenValue => onChangeTime(_merge(mode, value, chosenValue))}
				referenceHour={referenceHour}
			/>
		];
	}
}

export default InputTimeGroup;

InputTimeGroup.propTypes = {
	mode: PropTypes.oneOf(['hours', 'minutes']),
	value: PropTypes.string,
	disabled: PropTypes.bool,
	onChangeTime: PropTypes.func,
	referenceHour: PropTypes.number
};

InputTimeGroup.defaultProps = {
	value: '0:00',
	mode: 'minutes',
	disabled: false,
	onChangeTime: () => {},
	referenceHour: null
};
