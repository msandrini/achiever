import React from 'react';
import PropTypes from 'prop-types';

// import Icon from './Icon';
import Modal from '../Modal';
import strings from '../../../../shared/strings';

const AlertModal = props => (
	<Modal
		active={props.active}
		title={props.title ? props.title : strings.warning}
		content={props.content}
		buttons={[
			{ action: props.onClose, label: strings.ok }
		]}
	/>
);

AlertModal.propTypes = {
	active: PropTypes.bool,
	title: PropTypes.string,
	content: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.element
	]),
	onClose: PropTypes.func
};

AlertModal.defaultProps = {
	active: false,
	title: '',
	content: '',
	onClose: () => {}
};

export default AlertModal;
