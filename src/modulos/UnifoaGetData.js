var request = require("request").defaults({ jar: true });
const cheerio = require('cheerio');

let getSession = (cookieJar) => {
	return new Promise( (resolve,reject) =>{
		request({
			method:'GET',
			headers:{
				"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
				"accept-language":"pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
				"cache-control":"max-age=0",
				"sec-fetch-mode":"navigate",
				"sec-fetch-site":"same-origin",
				"sec-fetch-user":"?1",
				"upgrade-insecure-requests":"1"
			},
			jar:cookieJar,
			uri:'https://portal.unifoa.edu.br/PortalSagres/Acesso.aspx',
			rejectUnauthorized: false
		}, (error, response, body) => {
			if(error) reject(error);
			let $ = cheerio.load(body);
			let viewStateGenerator = $('#__VIEWSTATEGENERATOR').map( (i,elem) =>elem.attribs.value)[0];
			let viewState = $('#__VIEWSTATE').map( (i,elem) => elem.attribs.value)[0];
			let eventValidation = $('#__EVENTVALIDATION').map( (i,elem) => elem.attribs.value)[0];
			resolve({ viewStateGenerator:encodeURIComponent(viewStateGenerator) , viewState:encodeURIComponent(viewState) , eventValidation:encodeURIComponent(eventValidation) })
		})
	});
}


let loginPage = (attribs,cookieJar) => {
	return new Promise( (resolve,reject) =>{
		request({
			method:'POST',
			headers:{
				"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
				"accept-language":"pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
				"Cache-Control": "no-cache",
				"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
				"Sec-Fetch-Mode": "cors",
				"Sec-Fetch-Site": "same-origin",
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36",
				"X-MicrosoftAjax": "Delta=true",
				"X-Requested-With": "XMLHttpRequest"
			},
			jar:cookieJar,
			uri:'https://portal.unifoa.edu.br/PortalSagres/Acesso.aspx',
			rejectUnauthorized: false,
			body:`__EVENTTARGET=&__EVENTARGUMENT=&__VIEWSTATE=${attribs.viewState}&__VIEWSTATEGENERATOR=${attribs.viewStateGenerator}&__EVENTVALIDATION=${attribs.eventValidation}&ctl00%24PageContent%24LoginPanel%24UserName=${attribs.login}&ctl00%24PageContent%24LoginPanel%24Password=${attribs.senha}&ctl00%24PageContent%24LoginPanel%24LoginButton=Entrar`
		}, (error, response, body) => error ? reject(error) : resolve(response));
	});
}


let getHomePage = (cookieJar) => {
	return new Promise( (resolve,reject) =>{
		request({
			headers:{
				"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
				"Accept-Language": "en-US,en;q=0.9",
				"Cache-Control": "max-age=0",
				"Host": "portal.unifoa.edu.br",
				"Referer": "https://portal.unifoa.edu.br/PortalSagres/Acesso.aspx",
				"Sec-Fetch-Mode": "navigate",
				"Sec-Fetch-Site": "same-origin",
				"Sec-Fetch-User": "?1",
				"Upgrade-Insecure-Requests": "1",
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
			},
			jar:cookieJar,
			strictSSL: false,
			uri:'https://portal.unifoa.edu.br/PortalSagres/Login.ashx',
		}, (error, response, body) => error ? reject(error) : resolve(response));
	});
}


let getBoletim = (cookieJar) => {
	return new Promise( (resolve,reject) =>{
		try{
			request({
				headers:{
					"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
					"Accept-Language": "en-US,en;q=0.9",
					"Cache-Control": "max-age=0",
					"Host": "portal.unifoa.edu.br",
					"Referer": "https://portal.unifoa.edu.br/PortalSagres/Acesso.aspx",
					"Sec-Fetch-Mode": "navigate",
					"Sec-Fetch-Site": "same-origin",
					"Sec-Fetch-User": "?1",
					"Upgrade-Insecure-Requests": "1",
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
				},
				jar:cookieJar,
				strictSSL: false,
				uri:'https://portal.unifoa.edu.br/PortalSagres/Modules/Diario/Aluno/Relatorio/Boletim.aspx?op=notas',
			}, (error, response, body) => {
				if(error) reject(error);
				let objeto = {};
				let $ = cheerio.load(body);
				let suasFaltas = $('[id*="_lblValorTotalFaltas"]').map( (index,elemento) => elemento.children[0].data).get();
				let faltasTotais = $('[id*="_lblValorLimiteFaltas"]').map( (index,elemento) => elemento.children[0].data).get();
				let materias = $('.boletim-item-info > span.boletim-item-titulo').map( (i,elemA) => {
					var notas = [];
					let boletins = $(`#ctl00_MasterPlaceHolder_ucRepeater_ctl0${i}_ucItemBoletim_divDetalhamentoNotas tbody td.txt-center > span`).map( (i,elemB) => notas.push(elemB.children[0].data));
					objeto[elemA.children[0].data] = { notas };
					(objeto[elemA.children[0].data]).faltas = `${suasFaltas[i]} / ${faltasTotais[i]}`;	
				});
				resolve(objeto)
			})
		}catch(err){
			reject(err);
		}
	});
}

let getDayAula = (cookieJar) => {
	return new Promise( (resolve,reject) =>{
		try{
			request({
				headers:{
					"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
					"Accept-Language": "en-US,en;q=0.9",
					"Cache-Control": "max-age=0",
					"Host": "portal.unifoa.edu.br",
					"Referer": "https://portal.unifoa.edu.br/PortalSagres/Acesso.aspx",
					"Sec-Fetch-Mode": "navigate",
					"Sec-Fetch-Site": "same-origin",
					"Sec-Fetch-User": "?1",
					"Upgrade-Insecure-Requests": "1",
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
				},
				jar:cookieJar,
				strictSSL: false,
				uri:'https://portal.unifoa.edu.br/PortalSagres/Modules/Diario/Aluno/Default.aspx',
			}, (error, response, body) => {
				if(error) reject(error);
				let objeto = {};
				let $ = cheerio.load(body);
				let aulas = {
					0: ($('[id*="_ucHorario_grdHorarios"] tbody tr td:nth-child(8)').map( (index,elemento) => elemento.attribs.title ? (elemento.attribs.title).split('<br />')[0] : "" ).get()).filter(a => a),
					1: ($('[id*="_ucHorario_grdHorarios"] tbody tr td:nth-child(2)').map( (index,elemento) => elemento.attribs.title ? (elemento.attribs.title).split('<br />')[0] : "" ).get()).filter( a => a),
					2: ($('[id*="_ucHorario_grdHorarios"] tbody tr td:nth-child(3)').map( (index,elemento) => elemento.attribs.title ? (elemento.attribs.title).split('<br />')[0] : "" ).get()).filter(a => a),
					3: ($('[id*="_ucHorario_grdHorarios"] tbody tr td:nth-child(4)').map( (index,elemento) => elemento.attribs.title ? (elemento.attribs.title).split('<br />')[0] : "" ).get()).filter(a => a),
					4: ($('[id*="_ucHorario_grdHorarios"] tbody tr td:nth-child(5)').map( (index,elemento) => elemento.attribs.title ? (elemento.attribs.title).split('<br />')[0] : "" ).get()).filter(a => a),
					5: ($('[id*="_ucHorario_grdHorarios"] tbody tr td:nth-child(6)').map( (index,elemento) => elemento.attribs.title ? (elemento.attribs.title).split('<br />')[0] : "" ).get()).filter(a => a),
					6: ($('[id*="_ucHorario_grdHorarios"] tbody tr td:nth-child(7)').map( (index,elemento) => elemento.attribs.title ? (elemento.attribs.title).split('<br />')[0] : "" ).get()).filter(a => a)
				}
				resolve(aulas)
			})
		}catch(err){
			reject(err);
		}
	});
}


let getNumberMaterias = (cookieJar) => {
	return new Promise( (resolve,reject) =>{
		try{
			request({
				headers:{
					"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
					"Accept-Language": "en-US,en;q=0.9",
					"Cache-Control": "max-age=0",
					"Host": "portal.unifoa.edu.br",
					"Referer": "https://portal.unifoa.edu.br/PortalSagres/Acesso.aspx",
					"Sec-Fetch-Mode": "navigate",
					"Sec-Fetch-Site": "same-origin",
					"Sec-Fetch-User": "?1",
					"Upgrade-Insecure-Requests": "1",
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
				},
				jar:cookieJar,
				strictSSL: false,
				uri:'https://portal.unifoa.edu.br/PortalSagres/Modules/Diario/Aluno/Default.aspx',
			}, (error, response, body) => {
				if(error) reject(error);
				let objeto = {};
				let $ = cheerio.load(body);
				let eventValidation = $('#__EVENTVALIDATION').map( (i,elem) => elem.attribs.value)[0];
				let vState = $('#__VSTATE').map( (i,elem) => elem.attribs.value)[0];
				let arrayNumber = $('[id*="_ucInfoTurmaAluno_btAulas"]').map( a => true).get();
				resolve({eventValidation , vState , arrayNumber })
			})
		}catch(err){
			reject(err);
		}
	});
}

let accessMateria = (cookieJar,response,number) => {
	return new Promise( (resolve,reject) =>{
		try{
			request({
				method:'POST',
				followAllRedirects: true,
				headers:{
					"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
					"Accept-Language": "en-US,en;q=0.9",
					"Cache-Control": "max-age=0",
					"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
					"Host": "portal.unifoa.edu.br",
					"Referer": "https://portal.unifoa.edu.br/PortalSagres/Modules/Diario/Aluno/Default.aspx",
					"Sec-Fetch-Mode": "navigate",
					"Sec-Fetch-Site": "same-origin",
					"Sec-Fetch-User": "?1",
					"Upgrade-Insecure-Requests": "1",
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
				},
				jar:cookieJar,
				strictSSL: false,
				uri:'https://portal.unifoa.edu.br/PortalSagres/Modules/Diario/Aluno/Default.aspx',
				body:`__EVENTTARGET=ctl00$MasterPlaceHolder$ucListaInfoTurmaAluno$Repeater$ctl00$ucInfoTurmaAluno$btAulas&__EVENTARGUMENT=&__LASTFOCUS=&__VSTATE=${response.vState}&__VIEWSTATE=&__EVENTVALIDATION=${response.eventValidation}&ctl00$MasterPlaceHolder$ucListaInfoTurmaAluno$ddPeriodosLetivos$ddPeriodosLetivos=4000003444`
			}, (error, response, body) => {
				if(error) reject(error);
				resolve(true);
			})
		}catch(err){
			reject(err);
		}
	});
}

let consultaAulas = (cookieJar) => {
	return new Promise( (resolve,reject) =>{
		try{
			request({
				headers:{
					"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
					"Accept-Language": "en-US,en;q=0.9",
					"Cache-Control": "max-age=0",
					"Host": "portal.unifoa.edu.br",
					"Referer": "https://portal.unifoa.edu.br/PortalSagres/Acesso.aspx",
					"Sec-Fetch-Mode": "navigate",
					"Sec-Fetch-Site": "same-origin",
					"Sec-Fetch-User": "?1",
					"Upgrade-Insecure-Requests": "1",
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
				},
				jar:cookieJar,
				strictSSL: false,
				uri:'https://portal.unifoa.edu.br/PortalSagres/Modules/Diario/Aluno/Classe/ConsultaAulas.aspx',
			}, (error, response, body) => {
				if(error) reject(error);
				//console.log(body);
			})
		}catch(err){
			reject(err);
		}
	});
}


let start = (login,senha) =>{
	return new Promise( async (resolve,reject) =>{
		try{
			let cookieJar = request.jar();
			let attribs = await getSession(cookieJar);
			attribs.login = encodeURIComponent(login);
			attribs.senha = encodeURIComponent(senha);
			await loginPage(attribs,cookieJar);
			await resolve( await Promise.all([getDayAula(cookieJar),getBoletim(cookieJar)]))
		}catch(err){
			await reject(err);
		}
		
	})
}

let syncMaterial = (login,senha) => {
	return new Promise( async (resolve,reject) =>{
		try{
			//console.log('obj');
			let cookieJar = request.jar();
			let attribs = await getSession(cookieJar);
			attribs.login = encodeURIComponent(login);
			attribs.senha = encodeURIComponent(senha);
			await loginPage(attribs,cookieJar);
			let response = await getNumberMaterias(cookieJar)
			await accessMateria(cookieJar,response,'10');
			await consultaAulas(cookieJar);
		}catch(err){
			await reject(err);
		}
		
	})
}

module.exports = { start, syncMaterial }