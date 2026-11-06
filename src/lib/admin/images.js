/* Przygotowanie zdjęć w przeglądarce: zmniejszenie i konwersja do WebP (z zachowaniem przezroczystości).
   Gdy przeglądarka nie umie zapisać WebP, zapisujemy JPEG (bez przezroczystości) albo PNG (z nią). */

/** @param {File|Blob} file @returns {Promise<ImageBitmap | HTMLImageElement>} */
async function decode(file) {
	if ('createImageBitmap' in window) {
		try {
			return await createImageBitmap(file, { imageOrientation: 'from-image' });
		} catch {
			/* starsze przeglądarki — niżej przez <img> */
		}
	}
	const url = URL.createObjectURL(file);
	try {
		const img = new Image();
		img.src = url;
		await img.decode();
		return img;
	} finally {
		URL.revokeObjectURL(url);
	}
}

/**
 * @param {File|Blob} file
 * @param {{maxWidth: number, quality?: number, alpha?: boolean}} opts
 * @returns {Promise<{blob: Blob, width: number, height: number, ext: 'webp'|'jpg'|'png'}>}
 */
export async function convertImage(file, { maxWidth, quality = 0.8, alpha = false }) {
	const src = await decode(file);
	const sw = 'naturalWidth' in src ? src.naturalWidth : src.width;
	const sh = 'naturalHeight' in src ? src.naturalHeight : src.height;
	const width = Math.min(sw, maxWidth);
	const height = Math.round((sh * width) / sw);
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
	ctx.imageSmoothingQuality = 'high';
	ctx.drawImage(src, 0, 0, width, height);
	if ('close' in src) src.close();

	/** @param {string} type */
	const toBlob = (type) => new Promise((res) => canvas.toBlob((b) => res(b), type, quality));
	let blob = /** @type {Blob|null} */ (await toBlob('image/webp'));
	if (blob && blob.type === 'image/webp') return { blob, width, height, ext: 'webp' };
	if (alpha) {
		blob = /** @type {Blob} */ (await toBlob('image/png'));
		return { blob, width, height, ext: 'png' };
	}
	/* JPEG nie ma przezroczystości — tło ciemne jak strona */
	const flat = document.createElement('canvas');
	flat.width = width;
	flat.height = height;
	const fctx = /** @type {CanvasRenderingContext2D} */ (flat.getContext('2d'));
	fctx.fillStyle = '#07090e';
	fctx.fillRect(0, 0, width, height);
	fctx.drawImage(canvas, 0, 0);
	blob = /** @type {Blob} */ (await new Promise((res) => flat.toBlob((b) => res(b), 'image/jpeg', quality)));
	return { blob, width, height, ext: 'jpg' };
}

export const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,image/gif';
