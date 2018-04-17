import React from 'react';
import PropTypes from 'prop-types';

import strings from '../../../shared/strings';
import Modal from '../ui/Modal';
import AlertModal from '../ui/modals/AlertModal';

class PasswordChangeModal extends React.Component {
	constructor() {
		super();
		this.state = {
			oldPassword: '',
			newPassword: '',
			confirmation: ''
		};
		this.handleFieldChange = this.handleFieldChange.bind(this);
	}

	handleFieldChange(field) {
		return (event) => {
			this.setState({ [field]: event.target.value });
		};
	}

	fieldsAreValid() {
		return this.state.oldPassword && this.state.newPassword &&
			(this.state.newPassword === this.state.confirmation);
	}

	validateAndConfirm(event) {
		const formData = new FormData(event.target);
		const passwords = {};
		['old', 'new', 'confirmation'].forEach((key) => {
			passwords[key] = formData.get(key);
		});
		if (passwords.old && passwords.new &&
			(passwords.new === passwords.confirmation)) {
			delete passwords.confirmation;
			this.props.onConfirm(passwords);
		}
		event.preventDefault();
	}

	renderForm() {
		return (
			<form onSubmit={this.validateAndConfirm}>
				<div className="modal-field">
					<label htmlFor="old">{strings.oldPassword}</label>
					<input
						type="password"
						required
						minLength={6}
						name="old"
						onChange={this.handleFieldChange('oldPassword')}
					/>
				</div>
				<div className="modal-field">
					<label htmlFor="new">{strings.newPassword}</label>
					<input
						type="password"
						required
						minLength={6}
						name="new"
						onChange={this.handleFieldChange('newPassword')}
						placeholder={strings.insertNewPassword}
					/>
					<input
						type="password"
						required
						minLength={6}
						name="confirmation"
						onChange={this.handleFieldChange('confirmation')}
						placeholder={strings.confirmNewPassword}
					/>
				</div>
				<div className="buttons">
					<button
						className="submit"
						type="submit"
						disabled={!this.fieldsAreValid()}
					>
						{strings.ok}
					</button>
				</div>
			</form>
		);
	}

	render() {
		const {
			active,
			activeConfirmation,
			onCallForModal,
			onCancel
		} = this.props;

		return (
			<React.Fragment>
				<li>
					<button className="password" onClick={onCallForModal}>
						{strings.passwordChange}
					</button>
				</li>
				<Modal
					active={active}
					title={strings.passwordChange}
					content={this.renderForm()}
					cancel={onCancel}
					buttons={[]}
				/>
				<AlertModal
					active={activeConfirmation}
					title={strings.reportDownload}
					content={strings.passwordChangeSuccessful}
					onClose={onCancel}
				/>
			</React.Fragment>
		);
	}
}

PasswordChangeModal.propTypes = {
	active: PropTypes.bool,
	activeConfirmation: PropTypes.bool,
	onCallForModal: PropTypes.func,
	onCancel: PropTypes.func,
	onConfirm: PropTypes.func
};

PasswordChangeModal.defaultProps = {
	active: false,
	activeConfirmation: false,
	onCallForModal: () => {},
	onCancel: () => {},
	onConfirm: () => {}
};

export default PasswordChangeModal;
