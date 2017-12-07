const logger = require('./logger');

const dummyData = {
	cookie: 'dummyCookie',
	auth_user: 'dummyUsername',
	auth_pw: 'dummyPassword'
};

const dummyServer = (app) => {
	app.get('/dummy/index.php', (req, res) => {
		if (!req.query || !req.query.atklogout) {
			if (!req.cookies || !req.cookies.achievo) {
				res.cookie('achievo', dummyData.cookie);
				logger.info('Setting achievo cookie for the first time');
			} else {
				logger.info('You already have a cookie!!!');
			}
		} else {
			if (!req.cookies || req.cookies.achievo !== dummyData.cookie) {
				res.json({ success: false });
				return;
			}

			res.clearCookie('achievo');
			logger.info('Logged out!!!');
		}

		res.send('<form action="/index.php" method="post"></form>');
	});

	app.post('/dummy/index.php', (req, res) => {
		if (!req.cookies || req.cookies.achievo !== dummyData.cookie) {
			res.json({ success: false });
			return;
		}

		if (req.body.achievo === dummyData.cookie &&
				req.body.auth_user === dummyData.auth_user &&
				req.body.auth_pw === dummyData.auth_pw) {
			res.send('<frameset rows="80,*" frameborder="0" border="0"><noframes><body bgcolor="#CCCCCC" text="#000000"><p>Your browser doesnt support frames</p></body></noframes></frameset>');
			return;
		}

		res.send('Username and/or password are incorrect. Please try again.');
	});
};

module.exports = dummyServer;
