import React from 'react';
import PropTypes from 'prop-types';

import TimeField from './TimeField';
import { timeIsValid } from '../../shared/utils';

import '../styles/time.css';

const randomId = String(Math.random());
const getClassName = props =>
	`time-group ${props.emphasis ? 'emphasis' : ''}`;

export default class TimeGroup extends React.Component {
	constructor() {
		super();

		this.onChangeTime = this.onChangeTime.bind(this);

		this.state = {
			hours: {
				isFocused: false,
				value: null
			},
			minutes: {
				isFocused: false,
				value: null
			}
		};
	}

	onChangeTime(mode) {
		return (dummy, suggestion) => {
			const valueToSet = {
				[mode]: {
					...this.state[mode],
					value: suggestion
				}
			};
			const callbackAfterSet = () => {
				const { hours, minutes } = this.state;
				const timeToCheck = {
					hours: hours.value,
					minutes: minutes.value
				};
				if (timeIsValid(timeToCheck)) {
					this.props.onSet(hours.value, minutes.value);
				}
			};

			this.setState(valueToSet, callbackAfterSet);
		};
	}

	render() {
		const { referenceHour, time, label } = this.props;
		return (
			<div className={getClassName(this.props)}>
				<label htmlFor={`${randomId}_h`}>{label}</label>
				<TimeField
					mode="hours"
					value={time.hours}
					referenceHour={referenceHour}
					onChange={this.onChangeTime('hours')}
				/>
				<span className="separator">:</span>
				<TimeField
					mode="minutes"
					value={time.minutes}
					onChange={this.onChangeTime('minutes')}
				/>
			</div>
		);
	}
}

TimeGroup.propTypes = {
	onSet: PropTypes.func,
	referenceHour: PropTypes.number,
	time: PropTypes.object.isRequired,
	label: PropTypes.string
};

TimeGroup.defaultProps = {
	onSet: () => {},
	referenceHour: 9,
	label: ''
};
