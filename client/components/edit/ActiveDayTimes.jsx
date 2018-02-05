import React from 'react';
import PropTypes from 'prop-types';

import TimeGroup from './TimeGroup';
import CheckBox from '../ui/CheckBox';

import strings from '../../../shared/strings';

const referenceHours = [9, 12, 13, 17];


class ActiveDayTimes extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			focusedField: null,
			shouldHaveFocus: null,
			pauseIsEnabled: props.isHoliday
		};

		this.onChangeTime = this.onChangeTime.bind(this);
		this._onFieldFocus = this._onFieldFocus.bind(this);
		this._getNextField = this._getNextField.bind(this);
		this._shouldHaveFocus = this._shouldHaveFocus.bind(this);
		this.togglePause = this.togglePause.bind(this);
	}

	componentWillReceiveProps(props) {
		const storedPausesHaveChanged = [1, 2].map(key => props.storedTimes[key] && (
			(props.storedTimes[key].hours !== this.props.storedTimes[key].hours) ||
			(props.storedTimes[key].minutes !== this.props.storedTimes[key].minutes)));
		const storedPausesHaveNoTimeInfo = [1, 2].map(key => !props.storedTimes[key].hours &&
			!props.storedTimes[key].minutes);

		if (storedPausesHaveChanged[0] || storedPausesHaveChanged[1]) {
			if (storedPausesHaveNoTimeInfo[0] && storedPausesHaveNoTimeInfo[1]) {
				this.setState({ pauseIsEnabled: false });
				return;
			}
			this.setState({ pauseIsEnabled: true });
		}
	}

	/**
	 * Sends time change to the parent component (Edit)
	 * ALSO checks if, on change, focus needs to be changed as well (when the lenght is == 2)
	 * @param {*} index
	 */
	onChangeTime(index) {
		return (hours = 0, minutes = 0) => {
			const composedTime = { hours, minutes };
			if (this.state.focusedField) {
				this.checksForAutotabNeed(composedTime);
			}

			this.props.onTimeChange(index)(hours, minutes);
		};
	}

	checksForAutotabNeed(composedTime) {
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

	togglePause(checkValue) {
		this.setState({
			pauseIsEnabled: !checkValue
		});
		if (checkValue) {
			[1, 2].forEach(key => this.onChangeTime(key)(0, 0));
		}
	}

	render() {
		const {
			disabled,
			isHoliday,
			storedTimes,
			tabIndex
		} = this.props;

		const shouldHideTimeGroup = index => (!this.state.pauseIsEnabled || isHoliday) &&
			(index === 1 || index === 2);

		return (
			<div className="active-day-times">
				<div className="no-pause">
					<CheckBox
						label={strings.noLunchPause}
						onCheck={this.togglePause}
						value={!this.state.pauseIsEnabled}
						disabled={disabled}
					/>
				</div>
				{referenceHours.map((refHour, index) => (
					<TimeGroup
						key={refHour}
						label={strings.times[index].label}
						emphasis={index === 0 || index === 3}
						tabIndexes={tabIndex + 2 + (index * 2)}
						referenceHour={refHour}
						time={storedTimes[index] || '00'}
						shouldHaveFocus={this._shouldHaveFocus(index)}
						onSet={this.onChangeTime(index)}
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
