import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import strings from '../../../shared/strings';
import Modal from '../ui/Modal';

const selectOptions = () => {
	const monthsToList = [];
	for (let x = 0; x < 12; x += 1) {
		const monthMoment = moment().subtract(x, 'months');
		monthsToList.push({
			value: { month: monthMoment.month() + 1, year: monthMoment.year() },
			label: monthMoment.format('MMMM YYYY')
		});
	}

	return monthsToList.map(month =>
		<option key={month.label} value={JSON.stringify(month.value)}>{month.label}</option>);
};

const handleChange = onChoose => (event) => {
	onChoose(event.target.value);
};

const reportForm = onChoose => (
	<form>
		<div className="modal-field">
			<select name="report" onChange={handleChange(onChoose)}>
				<option value="">{strings.selectMonth}</option>
				{selectOptions()}
			</select>
		</div>
	</form>
);

const ReportModal = ({
	active,
	onCallForModal,
	onCancel,
	onChoose
}) => (
	<React.Fragment>
		<li>
			<button className="report" onClick={onCallForModal}>
				{strings.reportDownload}
			</button>
		</li>
		<Modal
			active={active}
			title={strings.reportDownload}
			content={reportForm(onChoose)}
			cancel={onCancel}
			buttons={[]}
		/>
	</React.Fragment>
);

ReportModal.propTypes = {
	active: PropTypes.bool,
	onCallForModal: PropTypes.func,
	onCancel: PropTypes.func,
	onChoose: PropTypes.func
};

ReportModal.defaultProps = {
	active: false,
	onCallForModal: () => {},
	onCancel: () => {},
	onChoose: () => {}
};

export default ReportModal;
