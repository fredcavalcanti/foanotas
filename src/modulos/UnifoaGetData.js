var request = require("request").defaults({ jar: true });
const cheerio = require('cheerio');


let getSession = (cookieJar) => {
	return new Promise( (resolve,reject) =>{
		try{
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
				if(error){
					reject(error);
				}
				let $ = cheerio.load(body);
				let viewStateGenerator = $('#__VIEWSTATEGENERATOR').map( (i,elem) =>elem.attribs.value)[0];
				let viewState = $('#__VIEWSTATE').map( (i,elem) => elem.attribs.value)[0];
				let eventValidation = $('#__EVENTVALIDATION').map( (i,elem) => elem.attribs.value)[0];
				resolve({ viewStateGenerator:encodeURIComponent(viewStateGenerator) , viewState:encodeURIComponent(viewState) , eventValidation:encodeURIComponent(eventValidation) })
			})
		}catch(err){
			reject(err);
		}
	});
}



let loginPage = (attribs,cookieJar) => {
	return new Promise( (resolve,reject) =>{
		try{
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
			}, (error, response, body) => {
				if(error){
					reject(error);
				}
				resolve(response)
			})
		}catch(err){
			reject(err);
		}
	});
}


let getHomePage = (cookieJar) => {
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
				uri:'https://portal.unifoa.edu.br/PortalSagres/Login.ashx',
			}, (error, response, body) => {
				if(error){
					reject(error);
				}
				resolve(body)
			})
		}catch(err){
			reject(err);
		}
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
				if(error){
					reject(error);
				}
				let objeto = {};
				let $ = cheerio.load(body);
				let materias = $('.boletim-item-info > span.boletim-item-titulo').map( (i,elemA) => {
					var notas = [];
					let boletins = $(`#ctl00_MasterPlaceHolder_ucRepeater_ctl0${i}_ucItemBoletim_divDetalhamentoNotas tbody td.txt-center > span`).map( (i,elemB) => notas.push(elemB.children[0].data));
					objeto[elemA.children[0].data] = notas;
				});
				resolve(objeto)
			})
		}catch(err){
			reject(err);
		}
	});
}



let start = (login,senha) =>{
	return new Promise((resolve,reject) =>{
		let cookieJar = request.jar();
		getSession(cookieJar)
		.then( attribs =>{
			attribs.login = encodeURIComponent(login);
			attribs.senha = encodeURIComponent(senha);
			loginPage(attribs,cookieJar)
			.then( a => {
				getHomePage(cookieJar)
				.then( b => {
					getBoletim(cookieJar)
					.then( c => {
						resolve(c)
					})
				})
			})
		})
	})
}

module.exports = { start }

// start('201700557','29011997')
// .then( a => console.log(a))
