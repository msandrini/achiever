import React from 'react';
import PropTypes from 'prop-types';

import ReportModal from './ReportModal';
import PasswordChangeModal from './PasswordChangeModal';

export default class UserOptions extends React.Component {
	constructor() {
		super();
		this.state = {
			showReportModal: false,
			showPasswordChangeModal: false,
			showPasswordChangeConfirmation: false
		};

		this.showModal = this.showModal.bind(this);
		this.hideModals = this.hideModals.bind(this);
		this.handleChooseReport = this.handleChooseReport.bind(this);
		this.handleChangePassword = this.handleChangePassword.bind(this);
	}

	showModal(type) {
		return () => {
			this.setState({
				[`show${type}Modal`]: true
			});
		};
	}

	hideModals() {
		this.setState({
			showReportModal: false,
			showPasswordChangeModal: false,
			showPasswordChangeConfirmation: false
		});
	}

	/* eslint-disable class-methods-use-this */

	handleChooseReport(monthData) {
		this.props.reportCall(monthData);
	}

	handleChangePassword(passwordData) {
		this.props.passwordCall(passwordData);
	}

	/* eslint-enable class-methods-use-this */

	render() {
		return (
			<React.Fragment>
				<ReportModal
					active={this.state.showReportModal}
					onCallForModal={this.showModal('Report')}
					onCancel={this.hideModals}
					onChoose={this.handleChooseReport}
				/>
				<PasswordChangeModal
					active={this.state.showPasswordChangeModal}
					activeConfirmation={this.state.showPasswordChangeConfirmation}
					onCallForModal={this.showModal('PasswordChange')}
					onCancel={this.hideModals}
					onConfirm={this.handleChangePassword}
				/>
			</React.Fragment>
		);
	}
}

UserOptions.propTypes = {
	reportCall: PropTypes.func,
	passwordCall: PropTypes.func
};

UserOptions.defaultProps = {
	reportCall: () => {},
	passwordCall: () => {}
};
