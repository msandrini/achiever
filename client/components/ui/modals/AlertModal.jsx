import React from 'react';
import PropTypes from 'prop-types';

import Modal from '../Modal';
import strings from '../../../../shared/strings';

const AlertModal = ({
	active,
	title,
	content,
	onClose
}) => (
	<Modal
		active={active}
		title={title}
		content={content}
		buttons={[
			{ action: onClose, label: strings.ok }
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
	title: strings.warning,
	content: '',
	onClose: () => {}
};

export default AlertModal;
