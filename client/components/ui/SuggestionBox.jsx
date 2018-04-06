import React from 'react';
import PropTypes from 'prop-types';

import './SuggestionBox.styl';

const withLeadingZero = number => (number < 10 ? `0${number}` : String(number));

class SuggestionBox extends React.Component {
	constructor(props) {
		super(props);

		if (props.mode === 'minutes') {
			this.valueList = [
				0,
				15,
				30,
				45
			];
		} else {
			this.valueList = [];
			const refHour = props.referenceHour;
			for (let r = refHour - 2; r <= refHour + 2; r += 1) {
				this.valueList.push(String(r));
			}
		}

		this._actionCall = this._actionCall.bind(this);
		this._individualSuggestion = this._individualSuggestion.bind(this);
	}

	_actionCall(value) {
		return () => {
			const valueToSend = this.mode === 'hours' ? value : withLeadingZero(value);
			this.props.onChoose(valueToSend);
		};
	}

	_individualSuggestion(value) {
		return (
			<li key={value}>
				<button type="button" onClick={this._actionCall(value)} tabIndex="-1">
					{this.mode === 'hours' ? value : withLeadingZero(value)}
				</button>
			</li>
		);
	}

	render() {
		const { show, mode } = this.props;
		if (!show) {
			return null;
		}
		return (
			<ul className={`suggestion-box ${mode}`}>
				{this.valueList.map(this._individualSuggestion)}
			</ul>
		);
	}
}

export default SuggestionBox;

SuggestionBox.propTypes = {
	show: PropTypes.bool,
	mode: PropTypes.oneOf(['minutes', 'hours']).isRequired,
	onChoose: PropTypes.func,
	referenceHour: PropTypes.number
};

SuggestionBox.defaultProps = {
	show: false,
	onChoose: () => {},
	referenceHour: 9
};
