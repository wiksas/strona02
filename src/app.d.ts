// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	/** Ścieżka bazowa strony (np. "" albo "/strona02"), wstawiana podczas budowania. */
	const __BASE_PATH__: string;
	namespace App {}
}

export {};
