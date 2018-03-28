import React from 'react';
import PropTypes from 'prop-types';

import strings from '../../../shared/strings';

import './ModeSelect.styl';

const ModeSelect = ({ mode, onSelect }) => (
	<select onChange={e => onSelect(e.target.value)} className="mode-select" value={mode}>
		<optgroup label={strings.normalDay}>
			<option value="">{strings.hourEntryMode}</option>
		</optgroup>
		<optgroup label={strings.specialDay}>
			<option value="medical">{strings.specialDays.medical}</option>
			<option value="birthdayLeave">{strings.specialDays.birthdayLeave}</option>
		</optgroup>
	</select>
);

ModeSelect.propTypes = {
	mode: PropTypes.string,
	onSelect: PropTypes.func
};

ModeSelect.defaultProps = {
	mode: '',
	onSelect: () => {}
};

export default ModeSelect;
