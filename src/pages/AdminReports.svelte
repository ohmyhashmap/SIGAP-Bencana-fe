<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '#lib/auth.svelte';
	import { disasterCategory } from '#lib/disaster';

	interface Report {
		id: number;
		category: string;
		severity: string;
		description: string;
		image_data: string;
		lat: number;
		lon: number;
		created_at: string;
	}

	interface Topup {
		id: number;
		username: string;
		name: string;
		amount_idr: number;
		credits: number;
		payment_reference: string;
		created_at: string;
	}

	let reports = $state<Report[]>([]);
	let topups = $state<Topup[]>([]);
	let error = $state('');
	let loading = $state(true);
	let reviewing = $state<number | null>(null);

	const loadQueue = async () => {
		loading = true;
		error = '';
		try {
			[reports, topups] = await Promise.all([
				api<Report[]>('/reports/pending'),
				api<Topup[]>('/ai/admin/topups')
			]);
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Gagal memuat antrean admin.';
		} finally {
			loading = false;
		}
	};

	const reviewReport = async (id: number, status: 'verified' | 'rejected') => {
		reviewing = id;
		error = '';
		try {
			await api(`/reports/${id}/status`, { method: 'PUT', body: { status } });
			reports = reports.filter((report) => report.id !== id);
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Gagal memverifikasi laporan.';
		} finally {
			reviewing = null;
		}
	};

	const reviewTopup = async (id: number, status: 'approved' | 'rejected') => {
		reviewing = id;
		error = '';
		try {
			await api(`/ai/admin/topups/${id}`, { method: 'PUT', body: { status } });
			topups = topups.filter((topup) => topup.id !== id);
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Gagal meninjau pembayaran.';
		} finally {
			reviewing = null;
		}
	};

	onMount(loadQueue);
</script>

<svelte:head>
	<title>Verifikasi Admin | SIGAP Bencana</title>
	<meta name="description" content="Tinjau dan verifikasi laporan bencana warga." />
</svelte:head>

<main class="mx-auto max-w-5xl px-4 py-12">
	<h1 class="text-3xl font-extrabold text-white">Panel Verifikasi Admin</h1>
	<p class="mt-2 mb-8 text-slate-400">
		Laporan baru hanya diterbitkan ke forum dan peta setelah diverifikasi.
	</p>

	{#if error}
		<p role="alert" class="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300"
			>{error}</p
		>
	{/if}

	<section class="mb-12">
		<h2 class="mb-4 text-xl font-bold text-white">Laporan menunggu ({reports.length})</h2>
		{#if loading}
			<p class="text-slate-400">Memuat antrean laporan…</p>
		{:else if reports.length === 0}
			<p class="rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-400">
				Tidak ada laporan yang menunggu verifikasi.
			</p>
		{:else}
			<div class="space-y-4">
				{#each reports as report (report.id)}
					{@const category = disasterCategory(report.category)}
					<article class="rounded-2xl border border-slate-800 bg-slate-900 p-5">
						<div class="mb-3 flex flex-wrap items-center justify-between gap-3">
							<h3 class="font-bold text-white">{category.icon} {category.label} · {report.severity}</h3>
							<time class="text-xs text-slate-400"
								>{new Date(report.created_at).toLocaleString('id-ID')}</time
							>
						</div>
						<p class="whitespace-pre-wrap text-slate-300">{report.description}</p>
						<p class="mt-3 font-mono text-xs text-slate-400">
							{report.lat.toFixed(5)}, {report.lon.toFixed(5)}
						</p>
						{#if report.image_data}
							<img
								src={report.image_data}
								alt={`Bukti foto laporan ${category.label}`}
								class="mt-4 max-h-80 rounded-xl object-cover"
							/>
						{/if}
						<div class="mt-5 flex flex-wrap gap-3">
							<button
								type="button"
								disabled={reviewing === report.id}
								onclick={() => reviewReport(report.id, 'verified')}
								class="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
							>
								Verifikasi & Tampilkan
							</button>
							<button
								type="button"
								disabled={reviewing === report.id}
								onclick={() => reviewReport(report.id, 'rejected')}
								class="rounded-lg border border-red-500/40 px-4 py-2 font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-60"
							>
								Tolak
							</button>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</section>

	<section>
		<h2 class="mb-4 text-xl font-bold text-white">Pembayaran kredit AI menunggu ({topups.length})</h2>
		{#if topups.length === 0}
			<p class="rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-400">
				Tidak ada pembayaran yang menunggu tinjauan.
			</p>
		{:else}
			<div class="space-y-3">
				{#each topups as topup (topup.id)}
					<article
						class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4"
					>
						<div>
							<p class="font-semibold text-white">{topup.name} (@{topup.username})</p>
							<p class="text-sm text-slate-400">
								Rp {topup.amount_idr.toLocaleString('id-ID')} · {topup.credits} kredit · Referensi:
								{topup.payment_reference}
							</p>
						</div>
						<div class="flex gap-2">
							<button
								type="button"
								disabled={reviewing === topup.id}
								onclick={() => reviewTopup(topup.id, 'approved')}
								class="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
								>Setujui</button
							>
							<button
								type="button"
								disabled={reviewing === topup.id}
								onclick={() => reviewTopup(topup.id, 'rejected')}
								class="rounded-lg border border-red-500/40 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-60"
								>Tolak</button
							>
						</div>
					</article>
				{/each}
			</div>
		{/if}
		<button
			type="button"
			onclick={loadQueue}
			class="mt-4 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
			>Muat Ulang Antrean</button
		>
	</section>
</main>
