import React from 'react';
import PropTypes from 'prop-types';

import TimeField from './TimeField';

import '../../styles/time.css';

const randomId = String(Math.random());
const getClassName = props =>
	`time-group ${props.emphasis ? 'emphasis' : ''}`;

export default class TimeGroup extends React.Component {
	constructor(props) {
		super(props);

		this.onChangeTime = this.onChangeTime.bind(this);
	}

	onChangeTime(mode) {
		return (dummy, suggestion) => {
			const newtime = { ...this.props.time };
			newtime[mode] = suggestion;
			this.props.onSet(newtime.hours, newtime.minutes);
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
					shouldHaveFocus={this.props.shouldHaveFocus === 'hours'}
					onChange={this.onChangeTime('hours')}
					onFocus={this.props.onFocus}
				/>
				<span className="separator">:</span>
				<TimeField
					mode="minutes"
					value={time.minutes}
					shouldHaveFocus={this.props.shouldHaveFocus === 'minutes'}
					onChange={this.onChangeTime('minutes')}
					onFocus={this.props.onFocus}
				/>
			</div>
		);
	}
}

TimeGroup.propTypes = {
	onSet: PropTypes.func,
	referenceHour: PropTypes.number,
	time: PropTypes.object,
	label: PropTypes.string,
	shouldHaveFocus: PropTypes.oneOfType([
		PropTypes.oneOf(['hours', 'minutes']),
		PropTypes.bool
	]),
	onFocus: PropTypes.func.isRequired
};

TimeGroup.defaultProps = {
	onSet: () => {},
	referenceHour: 9,
	label: '',
	shouldHaveFocus: false,
	time: { hours: 0, minutes: 0 }
};
