/* <html lang> i klasa <body> zależą od trasy (route.id nie zawiera ścieżki bazowej):
   /en/… = angielski; podstrony tekstowe (koncerty, polityka prywatności, 404) mają class="page". */

/** @type {import('@sveltejs/kit/hooks').Handle} */
export const handle = async ({ event, resolve }) => {
	const id = (event.route.id ?? '').replace(/\/\([^)]+\)/g, ''); // bez grup tras, np. „(site)”
	const lang = id === '/en' || id.startsWith('/en/') ? 'en' : 'pl';
	const isTextPage = /^\/(en\/)?(koncerty|concerts|polityka-prywatnosci|privacy-policy)|^\/404\.html/.test(id) || id === '/en/concerts' || id.startsWith('/en/concerts/') || id.startsWith('/en/privacy-policy');
	const isAdmin = id.startsWith('/admin');
	return resolve(event, {
		transformPageChunk: ({ html }) => {
			let out = html.replace('%lang%', lang).replace('%bodyattrs%', isTextPage ? ' class="page"' : '');
			/* panel jest renderowany w przeglądarce — noindex musi być w HTML od razu */
			if (isAdmin) out = out.replace('</head>', '\t<meta name="robots" content="noindex, nofollow" />\n\t</head>');
			return out;
		}
	});
};
