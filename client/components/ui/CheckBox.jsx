import React from 'react';
import PropTypes from 'prop-types';

import './CheckBox.styl';

const KEY_SPACEBAR = 32;

class CheckBox extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			checked: props.value
		};
		this.handleCheck = this.handleCheck.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.value !== this.props.value) {
			this.setState({ checked: nextProps.value });
		}
	}

	handleCheck(e) {
		// if it is not click, then just spacebar toggles it
		if (this.props.disabled || (e.type !== 'click' && e.keyCode !== KEY_SPACEBAR)) {
			return;
		}
		e.preventDefault();
		this.setState((state) => {
			const newChecked = !state.checked;
			this.props.onCheck(newChecked);
			return { checked: newChecked };
		});
	}

	render() {
		const { checked } = this.state;
		const { label, disabled } = this.props;
		const className = `check-box${checked ? ' checked' : ''}${disabled ? ' disabled' : ''}`;
		return (
			<div
				role="checkbox"
				className={className}
				onClick={this.handleCheck}
				onKeyDown={this.handleCheck}
				aria-checked={checked}
				tabIndex={0}
			>
				<label>{label}</label>
			</div>
		);
	}
}

CheckBox.propTypes = {
	value: PropTypes.bool,
	disabled: PropTypes.bool,
	onCheck: PropTypes.func,
	label: PropTypes.string.isRequired
};

CheckBox.defaultProps = {
	value: false,
	disabled: false,
	onCheck: () => {}
};

export default CheckBox;
