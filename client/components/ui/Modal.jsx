import React from 'react';
import PropTypes from 'prop-types';

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

const handleLayerClick = cancel => (event) => {
	event.stopPropagation();
	if (cancel && event.target.className.includes('modal-layer')) {
		cancel();
	}
};

/* ESLint directives below commented out to allow for the Modal layer to be clickable */
/* eslint-disable jsx-a11y/no-static-element-interactions,
	jsx-a11y/click-events-have-key-events */

const Modal = props => (
	<div
		className={`modal-layer ${props.active ? 'active' : ''}`}
		onClick={handleLayerClick(props.cancel)}
	>
		<div className="modal">
			{props.cancel ?
				<button className="close" onClick={props.cancel}>&times;</button> : ''
			}
			<div className="title">
				{props.title}
			</div>
			<div className="content">
				{props.content}
			</div>
			{props.hasButtons ?
				showButtons(props.buttons) : ''
			}
		</div>
	</div>
);

export default Modal;

Modal.propTypes = {
	active: PropTypes.bool,
	title: PropTypes.string,
	cancel: PropTypes.func,
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
	cancel: null,
	title: '',
	content: '',
	hasButtons: true,
	buttons: [{ action: () => {}, label: strings.ok }]
};
