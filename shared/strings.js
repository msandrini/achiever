const strings = {
	times: [
		{
			label: 'Entrada',
			cliKeywords: [
				'entrada', 'entrando', 'entrei',
				'chegada', 'chegando', 'cheguei',
				'arrival'
			]
		}, {
			label: 'Ida para almoço',
			cliKeywords: [
				'ida', 'indo',
				'lunch', 'gone-lunch',
				'almoco', 'ida-almoco', 'indo-almoco',
				'fui-almoco', 'partiu-almoco'
			]
		}, {
			label: 'Volta do almoço',
			cliKeywords: [
				'volta', 'voltando', 'voltei',
				'back', 'back-from-lunch',
				'retorno', 'retornando', 'retornei',
				'volta-almoco', 'voltando-almoco', 'voltei-almoco',
				'chegada-almoco', 'chegando-almoco', 'cheguei-almoco'
			]
		}, {
			label: 'Saída',
			cliKeywords: [
				'saida', 'saindo', 'sai',
				'fui', 'fui-casa', 'partiu-casa',
				'leave', 'left', 'gone-home',
				'ida-casa', 'indo-casa'
			]
		}
	],
	clearCliKeywords: [
		'clear', 'clean', 'reset', 'apaga'
	],
	multipleCliKeywords: [
		'multi', 'multiplos', 'varios'
	],
	sendCallFeedbacks: {
		error: 'Erro ao executar api call para inserir horas:',
		success: 'Api call para inserir horas executada com sucesso!'
	},
	thisTime: 'esta hora',
	hoursLabouredOnThisDay: 'Horas trabalhadas no dia:',
	hoursBalanceOnWeekUpToNow: 'Na semana até esse dia',
	hoursBalanceOnWeekUpToNowSurplus: '{0} a mais',
	hoursBalanceOnWeekUpToNowDebt: 'devendo {0}',
	hoursBalanceForToday: 'Balanço de horas atual:',
	storedSuccessfully: 'gravada com sucesso',
	morningPeriod: 'Período da manhã',
	afternoonPeriod: 'Período da tarde',
	weeklyCalendar: 'Calendário da semana',
	total: 'Total',
	send: 'Enviar',
	update: 'Atualizar',
	ok: 'OK',
	cancel: 'Cancelar',
	yes: 'Sim',
	no: 'Não',
	loading: 'Carregando...',
	noTimesProvided: 'nenhuma hora foi fornecida',
	otherTimesIgnored: 'as outras horas fornecidas foram ignoradas',
	timesFlushed: 'As entradas de tempo foram apagadas',
	cannotInsertDisconnectedTime: ' não pode ser inserida sem o(s) horário(s) anterior(es)',
	cannotSelectFutureTime: 'Uma data futura não pode ser selecionada',
	markConfirm: 'Quer marcar agora a',
	markNow: 'Marcar agora a',
	timeSentToday: 'As horas de hoje já foram enviadas',
	clearConfirm: 'Quer mesmo apagar o arquivo temporário de horas pra hoje?',
	cliConfirmationAllowed: 'Digite "s" ou "n"',
	cancelled: 'Cancelado',
	todayPage: 'Horas de hoje',
	editPage: 'Editar horários',
	timeEntryPage: 'Apontamento de horas',
	selectedDate: 'Dia selecionado',
	dateBeingEdited: 'Dia sendo editado',
	todayDate: 'Dia de hoje',
	login: 'Entrada',
	logout: 'Sair',
	logoutConfirm: 'Quer mesmo sair do sistema?',
	username: 'Usuário',
	password: 'Senha',
	vacation: 'Férias',
	authenticationError: 'Credenciais inválidas.',
	pageNotFound: 'Página não encontrada',
	pageLoading: 'Carregando...',
	confirmSave: 'Existem alterações não salvas. Deseja enviar?',
	invalidTime: 'Horários inválidos',
	invalidAddTime: 'Não é possível marcar presença em um horário anterior',
	submitTimeSuccess: 'Horas registradas com sucesso!',
	goBack: 'Voltar',
	helloName: 'Olá ',
	warning: 'Atenção',
	confirmation: 'Confirmação',
	projectPhase: 'Projeto/fase',
	activity: 'Atividade',
	noLunchPause: 'Sem pausa para almoço',
	normalDay: 'Dia normal',
	hourEntryMode: 'Entrada de horas',
	specialDay: 'Dia especial',
	specialDays: {
		medical: 'Dispensa médica',
		birthdayLeave: 'O-tanjoubi'
	},
	success: '👍',
	error: 'Erro!',
	passwordChange: 'Mudar senha',
	reportDownload: 'Relatório mensal',
	oldPassword: 'Senha antiga',
	newPassword: 'Nova senha',
	reportMonth: 'Mês do relatório',
	selectMonth: 'selecione o mês...',
	insertNewPassword: 'insira a nova senha',
	confirmNewPassword: 'confirme a nova senha',
	passwordChangeSuccessful: 'A senha foi alterada com sucesso!'
};

module.exports = strings;
