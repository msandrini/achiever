import React from 'react';
import PropTypes from 'prop-types';

import Modal from '../Modal';
import strings from '../../../../shared/strings';

const ConfirmModal = props => (
	<Modal
		active={props.active}
		title={props.title ? props.title : strings.confirmation}
		content={props.content}
		buttons={[
			{ action: props.onCancel, label: strings.no },
			{ action: props.onConfirm, label: strings.yes }
		]}
	/>
);

ConfirmModal.propTypes = {
	active: PropTypes.bool,
	title: PropTypes.string,
	content: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.element
	]).isRequired,
	onCancel: PropTypes.func,
	onConfirm: PropTypes.func.isRequired
};

ConfirmModal.defaultProps = {
	active: false,
	title: '',
	onCancel: () => {}
};

export default ConfirmModal;
