import React from 'react';
import PropTypes from 'prop-types';

import TimeGroup from './TimeGroup';

import strings from '../../../shared/strings';


const referenceHours = [9, 12, 13, 17];


class ActiveDayTimes extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			focusedField: null,
			shouldHaveFocus: null
		};

		this._onTimeChangeMaybeChangeFocus = this._onTimeChangeMaybeChangeFocus.bind(this);
		this._onFieldFocus = this._onFieldFocus.bind(this);
		this._getNextField = this._getNextField.bind(this);
		this._shouldHaveFocus = this._shouldHaveFocus.bind(this);
	}

	/**
	 * Check if on change change focus need to be changed (when the lenght is == 2)
	 * @param {*} index
	 */
	_onTimeChangeMaybeChangeFocus(index) {
		return (hours = 0, minutes = 0) => {
			const composedTime = { hours, minutes };
			if (this.state.focusedField) {
				const modeBeingChanged = this.state.focusedField.fieldMode;
				const valueBeingChanged = composedTime[modeBeingChanged];

				if (String(valueBeingChanged).length === 2) {
					const nextField = this._getNextField();
					this.setState({
						shouldHaveFocus: nextField
					});
				} else {
					this.setState({
						shouldHaveFocus: false
					});
				}
			}

			this.props.onTimeChange(index)(hours, minutes);
		};
	}

	_onFieldFocus(index) {
		return (fieldMode) => {
			this.setState({ focusedField: { index, fieldMode } });
		};
	}

	_getNextField() {
		const { focusedField } = this.state;
		if (focusedField.fieldMode === 'hours') {
			return {
				index: focusedField.index,
				fieldMode: 'minutes'
			};
		}
		if (focusedField.fieldMode === 'minutes' && focusedField.index === 3) {
			this.props.focusOnSubmit();
		}
		return {
			index: focusedField.index + 1,
			fieldMode: 'hours'
		};
	}

	_shouldHaveFocus(index) {
		const { shouldHaveFocus } = this.state;
		if (shouldHaveFocus && shouldHaveFocus.index === index) {
			return shouldHaveFocus.fieldMode;
		}
		return false;
	}

	render() {
		const {
			disabled,
			isHoliday,
			storedTimes,
			tabIndex
		} = this.props;

		const shouldHideTimeGroup = index => isHoliday && (index === 1 || index === 2);

		return (
			<div className="active-day-times">
				{referenceHours.map((refHour, index) => (
					<TimeGroup
						key={refHour}
						label={strings.times[index].label}
						emphasis={index === 0 || index === 3}
						tabIndexes={tabIndex + 2 + (index * 2)}
						referenceHour={refHour}
						time={storedTimes[index] || '00'}
						shouldHaveFocus={this._shouldHaveFocus(index)}
						onSet={this._onTimeChangeMaybeChangeFocus(index)}
						onFocus={this._onFieldFocus(index)}
						hidden={shouldHideTimeGroup(index)}
						disabled={disabled}
					/>
				))}
			</div>
		);
	}
}

ActiveDayTimes.propTypes = {
	disabled: PropTypes.bool,
	focusOnSubmit: PropTypes.func,
	isHoliday: PropTypes.bool,
	onTimeChange: PropTypes.func.isRequired,
	storedTimes: PropTypes.array,
	tabIndex: PropTypes.number
};

ActiveDayTimes.defaultProps = {
	disabled: false,
	focusOnSubmit: () => {},
	isHoliday: false,
	storedTimes: [{}, {}, {}, {}],
	tabIndex: 3
};

export default ActiveDayTimes;
