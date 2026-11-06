<script>
	import { REPO } from '#lib/config.js';
	import { cms } from './cms.svelte.js';

	let token = $state('');
	let remember = $state(false);
	let error = $state('');
	let working = $state(false);

	/** @param {SubmitEvent} e */
	async function submit(e) {
		e.preventDefault();
		if (!token.trim()) {
			error = 'Wklej token.';
			return;
		}
		working = true;
		error = '';
		try {
			await cms.login(token, remember);
		} catch (err) {
			error = /** @type {Error} */ (err).message;
		} finally {
			working = false;
		}
	}
</script>

<main class="login">
	<div class="login-card">
		<p class="brand-mark">Harris Piano Jazz Bar</p>
		<h1>Panel treści</h1>
		<p>Zaloguj się tokenem z GitHuba, żeby zmieniać koncerty, teksty, zdjęcia i karty menu.</p>

		<form onsubmit={submit} novalidate>
			<div class="f" class:f--error={!!error}>
				<label for="token">Token GitHub</label>
				<input id="token" type="password" autocomplete="off" spellcheck="false" bind:value={token} aria-invalid={!!error} aria-describedby={error ? 'token-err' : undefined} placeholder="github_pat_…" />
				{#if error}<p class="f-error" id="token-err" role="alert">{error}</p>{/if}
			</div>
			<label class="check"><input type="checkbox" bind:checked={remember} /> Zapamiętaj na tym urządzeniu</label>
			<p class="f-help">Zaznacz tylko na własnym komputerze. Bez zaznaczenia wylogujesz się po zamknięciu karty.</p>
			<button class="btn btn--wide" type="submit" disabled={working}>{working ? 'Sprawdzam…' : 'Zaloguj się'}</button>
		</form>

		<details class="howto">
			<summary>Skąd wziąć token? (jednorazowo, ok. 2 minuty)</summary>
			<ol>
				<li>Zaloguj się na GitHub kontem, które ma dostęp do repozytorium <strong>{REPO.owner}/{REPO.name}</strong>.</li>
				<li>Otwórz <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">tworzenie nowego tokena</a>.</li>
				<li>Nazwa: np. „Panel Harris”. Ważność: np. 1 rok.</li>
				<li>„Repository access” → <strong>Only select repositories</strong> → wybierz <strong>{REPO.name}</strong>.</li>
				<li>„Permissions” → „Repository permissions” → <strong>Contents: Read and write</strong>.</li>
				<li>Kliknij „Generate token”, skopiuj go i wklej powyżej. Nie udostępniaj go nikomu.</li>
			</ol>
		</details>
	</div>
</main>
