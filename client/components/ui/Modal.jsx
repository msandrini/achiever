import React from 'react';
import PropTypes from 'prop-types';

// import Icon from './Icon';
import strings from '../../../shared/strings';

import '../../styles/modal.styl';

const Modal = props => (
	<div className={`modal-layer ${props.active ? 'active' : ''}`}>
		<div className="modal">
			<div className="title">
				{props.title}
			</div>
			<div className="content">
				{props.content}
			</div>
			<div className="buttons">
				{props.buttons.map(button => (
					<button
						key={button.label}
						type="button"
						onClick={button.action}
					>
						{button.label}
					</button>
				))}
			</div>
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
	]).isRequired,
	buttons: PropTypes.arrayOf(PropTypes.objectOf({
		action: PropTypes.func,
		label: PropTypes.string
	}))
};

Modal.defaultProps = {
	active: false,
	title: '',
	buttons: [{ action: () => {}, label: strings.ok }]
};
