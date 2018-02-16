import React from 'react';
import PropTypes from 'prop-types';

// import Icon from './Icon';
import strings from '../../../shared/strings';

import './Modal.styl';


const showButtons = buttons => (
	<div className="buttons">
		{buttons.map(button => (
			<button
				key={button.label}
				type="button"
				onClick={button.action}
			>
				{button.label}
			</button>
		))}
	</div>
);

const Modal = props => (
	<div className={`modal-layer ${props.active ? 'active' : ''}`}>
		<div className="modal">
			<div className="title">
				{props.title}
			</div>
			<div className="content">
				{props.content}
			</div>
			{props.hasButtons ?
				showButtons(props.buttons) :
				''
			}
		</div>
	</div>
);

export default Modal;

Modal.propTypes = {
	active: PropTypes.bool,
	title: PropTypes.string,
	content: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.element
	]),
	hasButtons: PropTypes.bool,
	buttons: PropTypes.arrayOf(PropTypes.shape({
		action: PropTypes.func,
		label: PropTypes.string
	}))
};

Modal.defaultProps = {
	active: false,
	title: '',
	content: '',
	hasButtons: true,
	buttons: [{ action: () => {}, label: strings.ok }]
};
