<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '#lib/auth.svelte';

	interface CreditPackage {
		id: string;
		amountIdr: number;
		credits: number;
	}

	interface Citation {
		key: string;
		content: string;
	}

	interface Answer {
		question: string;
		answer: string;
		citations: Citation[];
	}

	let balance = $state(0);
	let packages = $state<CreditPackage[]>([]);
	let paymentInstructions = $state('');
	let payments = $state<any[]>([]);
	let selectedPackage = $state('');
	let paymentReference = $state('');
	let question = $state('');
	let householdProfile = $state('');
	let answers = $state<Answer[]>([]);
	let loading = $state(false);
	let error = $state('');
	let notice = $state('');

	const refreshCredits = async () => {
		const result = await api<{
			balance: number;
			packages: CreditPackage[];
			paymentInstructions: string;
			payments: any[];
		}>('/ai/credits');
		balance = result.balance;
		packages = result.packages;
		paymentInstructions = result.paymentInstructions;
		payments = result.payments;
		selectedPackage ||= result.packages[0]?.id ?? '';
	};

	const ask = async (event: SubmitEvent) => {
		event.preventDefault();
		loading = true;
		error = '';
		notice = '';
		try {
			const result = await api<Omit<Answer, 'question'> & { creditsRemaining: number }>('/ai/ask', {
				method: 'POST',
				body: { question, profile: householdProfile }
			});
			answers = [{ question, answer: result.answer, citations: result.citations }, ...answers];
			balance = result.creditsRemaining;
			question = '';
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Gagal meminta panduan AI.';
		} finally {
			loading = false;
		}
	};

	const requestTopup = async (event: SubmitEvent) => {
		event.preventDefault();
		error = '';
		notice = '';
		try {
			await api('/ai/topups', {
				method: 'POST',
				body: { packageId: selectedPackage, paymentReference }
			});
			paymentReference = '';
			notice = 'Permintaan isi ulang tercatat. Kredit masuk setelah admin mengonfirmasi pembayaran.';
			await refreshCredits();
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Gagal membuat permintaan pembayaran.';
		}
	};

	onMount(async () => {
		try {
			await refreshCredits();
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Gagal memuat kredit AI.';
		}
	});
</script>

<svelte:head>
	<title>Asisten AI Personal | SIGAP Bencana</title>
	<meta name="description" content="Panduan kebencanaan personal berbasis laporan, statistik, dan berita." />
</svelte:head>

<main class="mx-auto max-w-5xl px-4 py-12">
	<div class="mb-8 flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="text-3xl font-extrabold text-white">Asisten AI Personal</h1>
			<p class="mt-2 text-slate-400">
				Jawaban mengambil konteks dari laporan terverifikasi, statistik, dan berita SIGAP.
			</p>
		</div>
		<div class="rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3">
			<span class="text-sm text-slate-300">Kredit tersedia</span>
			<strong class="ml-2 text-lg text-orange-400">{balance}</strong>
		</div>
	</div>

	{#if error}
		<p role="alert" class="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300"
			>{error}</p
		>
	{/if}
	{#if notice}
		<p
			role="status"
			class="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300"
			>{notice}</p
		>
	{/if}

	<section class="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-7">
		<h2 class="mb-4 text-xl font-bold text-white">Tanyakan kondisi dan kesiapsiagaan</h2>
		<form onsubmit={ask} class="space-y-4">
			<div>
				<label for="household-profile" class="mb-2 block text-sm font-semibold text-slate-300">
					Konteks personal (opsional)
				</label>
				<textarea
					id="household-profile"
					bind:value={householdProfile}
					maxlength="1000"
					rows="2"
					placeholder="Contoh: keluarga dengan anak kecil, tinggal dekat sungai"
					class="w-full rounded-xl border border-slate-700 bg-slate-950/50 p-3 text-white placeholder:text-slate-500"
				></textarea>
			</div>
			<div>
				<label for="ai-question" class="mb-2 block text-sm font-semibold text-slate-300"
					>Pertanyaan</label
				>
				<textarea
					id="ai-question"
					bind:value={question}
					minlength="3"
					maxlength="1000"
					required
					rows="3"
					placeholder="Tanyakan ringkasan situasi atau langkah kesiapsiagaan yang relevan"
					class="w-full rounded-xl border border-slate-700 bg-slate-950/50 p-3 text-white placeholder:text-slate-500"
				></textarea>
			</div>
			<button
				type="submit"
				disabled={loading || balance < 1}
				class="rounded-xl bg-orange-600 px-5 py-3 font-bold text-white hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{loading ? 'Menyusun jawaban…' : 'Tanyakan Asisten (1 kredit)'}
			</button>
		</form>
		<p class="mt-4 text-xs leading-relaxed text-slate-400">
			Panduan AI, bukan arahan resmi. Jawaban terbatas pada data yang tersedia dan tidak menggantikan
			arahan BMKG, BNPB, atau BPBD. Konteks personal hanya dikirim untuk menjawab permintaan ini.
		</p>
	</section>

	{#each answers as item, index (index)}
		<article class="mb-5 rounded-2xl border border-slate-800 bg-slate-900 p-5">
			<h2 class="font-semibold text-orange-300">{item.question}</h2>
			<p class="my-4 whitespace-pre-wrap leading-relaxed text-slate-200">{item.answer}</p>
			{#if item.citations.length}
				<h3 class="mb-2 text-xs font-bold tracking-wide text-slate-400 uppercase">Sumber konteks</h3>
				<ul class="space-y-2">
					{#each item.citations as citation (citation.key)}
						<li class="rounded-lg bg-slate-950/60 p-3 text-xs leading-relaxed text-slate-400">
							{citation.content}
						</li>
					{/each}
				</ul>
			{/if}
		</article>
	{/each}

	<section class="rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-7">
		<h2 class="mb-2 text-xl font-bold text-white">Paket kredit AI</h2>
		<p class="mb-4 whitespace-pre-wrap text-sm text-slate-400">{paymentInstructions}</p>
		<form onsubmit={requestTopup} class="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
			<label class="sr-only" for="credit-package">Pilih paket kredit</label>
			<select
				id="credit-package"
				bind:value={selectedPackage}
				required
				class="rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-3 text-white"
			>
				{#each packages as item (item.id)}
					<option value={item.id}>
						{item.credits} kredit · Rp {item.amountIdr.toLocaleString('id-ID')}
					</option>
				{/each}
			</select>
			<label class="sr-only" for="payment-reference">Referensi pembayaran</label>
			<input
				id="payment-reference"
				bind:value={paymentReference}
				minlength="4"
				maxlength="120"
				required
				placeholder="Referensi pembayaran"
				class="rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-3 text-white placeholder:text-slate-500"
			/>
			<button
				type="submit"
				class="rounded-xl border border-orange-500/40 px-4 py-3 font-semibold text-orange-300 hover:bg-orange-500/10"
				>Minta Isi Ulang</button
			>
		</form>
		<p class="mt-3 text-xs text-slate-500">
			Kredit baru diberikan setelah admin mencocokkan pembayaran. Integrasi payment gateway otomatis
			belum diaktifkan.
		</p>
		{#if payments.length}
			<h3 class="mt-6 mb-2 font-semibold text-slate-200">Riwayat permintaan pembayaran</h3>
			<ul class="space-y-2">
				{#each payments as payment (payment.id)}
					<li class="flex justify-between gap-3 text-sm text-slate-400">
						<span>{payment.payment_reference} · {payment.credits} kredit</span>
						<span class="capitalize">{payment.status}</span>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</main>
