<script lang="ts">
	import { auth, jsonHeaders } from '#lib/auth.svelte';
	import DisasterCategoryPicker from '#lib/DisasterCategoryPicker.svelte';
	import { disasterCategory } from '#lib/disaster';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	const API_BASE = import.meta.env.VITE_API_URL || '';

	let reports = $state<any[]>([]);
	let isLoading = $state(true);
	let isSubmitting = $state(false);

	// State Form
	let description = $state('');
	let category = $state('lainnya');
	let severity = $state('sedang'); // rendah, sedang, tinggi
	let location = $state<{ lat: number; lon: number } | null>(null);
	let isLocating = $state(true);
	let showCreateReport = $state(false);
	let imageData = $state('');
	let imageName = $state('');

	const fetchReports = async () => {
		try {
			const res = await fetch(`${API_BASE}/api/v1/reports`);
			const json = await res.json();
			if (json.success) reports = json.data;
		} catch (e) {
			console.error(e);
		} finally {
			isLoading = false;
		}
	};

	const handleImage = (event: Event) => {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		imageName = file.name;
		const reader = new FileReader();
		reader.onload = () => {
			imageData = typeof reader.result === 'string' ? reader.result : '';
		};
		reader.readAsDataURL(file);
	};

	const submitReport = async () => {
		if (!description.trim() || !location) return;
		isSubmitting = true;
		try {
			const response = await fetch(`${API_BASE}/api/v1/reports`, {
				method: 'POST',
				headers: jsonHeaders(),
				body: JSON.stringify({
					lat: location.lat,
					lon: location.lon,
					description: description,
					category: category,
					severity: severity,
					imageData
				})
			});
			const result = await response.json();
			if (!response.ok || !result.success) {
				throw new Error(result.error || 'Gagal mengirim laporan');
			}
			description = '';
			imageData = '';
			imageName = '';
			showCreateReport = false;
			await fetchReports(); // Refresh feed
			alert('Laporan terkirim dan menunggu verifikasi admin.');
		} catch (e) {
			alert(e instanceof Error ? e.message : 'Gagal mengirim laporan');
		} finally {
			isSubmitting = false;
		}
	};

	onMount(() => {
		fetchReports();
		// Ambil lokasi user
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(pos) => {
					location = { lat: pos.coords.latitude, lon: pos.coords.longitude };
					isLocating = false;
				},
				() => {
					location = { lat: 3.5952, lon: 98.6722 }; // Fallback Medan
					isLocating = false;
				}
			);
		} else {
			location = { lat: 3.5952, lon: 98.6722 };
			isLocating = false;
		}
	});

	const timeAgo = (dateStr: string) => {
		const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000);
		if (diff < 60) return `${diff} menit lalu`;
		return `${Math.floor(diff / 60)} jam lalu`;
	};
</script>

<div class="mx-auto max-w-5xl px-4 py-12" in:fade={{ duration: 400 }}>
	<!-- Header Halaman -->
	<div class="mb-10 text-center">
		<h1 class="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
			Forum Pelaporan Warga
		</h1>
		<p class="mx-auto mt-3 max-w-2xl font-medium text-slate-400">
			Lihat laporan terverifikasi dari warga. Masuk untuk mengirim laporan baru; laporan akan
			ditampilkan di peta setelah diverifikasi admin.
		</p>
	</div>

	{#if showCreateReport && auth.token}
		<div
			transition:fade={{ duration: 180 }}
			class="report-modal-backdrop fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
		>
			<div
				transition:fly={{ y: 24, duration: 280 }}
				class="report-modal-card relative z-[71] max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl md:p-8"
			>
				<!-- Efek Glow -->
				<div
					class="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-emerald-500 opacity-10 blur-[100px]"
				></div>

				<div class="relative z-10 mb-6 flex items-center justify-between gap-4">
					<h2 class="flex items-center gap-3 text-xl font-bold text-white">
						<span class="rounded-xl bg-emerald-500/20 p-2.5 text-emerald-400 shadow-inner">📢</span>
						Buat Laporan Baru
					</h2>
					<button
						type="button"
						aria-label="Tutup formulir laporan"
						onclick={() => (showCreateReport = false)}
						class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-lg text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
					>
						✕
					</button>
				</div>

				<div class="relative z-10 grid gap-8 md:grid-cols-2">
					<!-- Kolom Kiri: Jenis Bencana & Teks Laporan -->
					<div class="flex flex-col gap-5">
						<div>
							<div
								id="report-category-label"
								class="mb-2 block text-sm font-semibold text-slate-300"
							>
								Jenis Bencana
							</div>
							<DisasterCategoryPicker bind:value={category} labelId="report-category-label" />
						</div>
						<div>
							<label
								for="report-description"
								class="mb-2 block text-sm font-semibold text-slate-300">Apa yang Anda lihat?</label
							>
							<textarea
								id="report-description"
								bind:value={description}
								placeholder="Jelaskan secara detail (Contoh: Air sungai meluap dan merendam jalan setinggi lutut di depan pasar...)"
								class="h-36 w-full resize-none rounded-xl border border-slate-700 bg-slate-950/50 p-4 text-sm text-white transition-all placeholder:text-slate-600 focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none"
							></textarea>
						</div>
					</div>

					<!-- Kolom Kanan: Pengaturan & Lokasi -->
					<div class="flex flex-col gap-5">
						<div>
							<div
								id="report-severity-label"
								class="mb-2 block text-sm font-semibold text-slate-300"
							>
								Tingkat Keparahan
							</div>
							<div class="flex gap-2" role="group" aria-labelledby="report-severity-label">
								<button
									onclick={() => (severity = 'rendah')}
									class="flex-1 rounded-xl border-2 py-2.5 text-sm font-bold transition-all duration-300
              {severity === 'rendah'
										? 'border-green-500 bg-green-500/20 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
										: 'border-slate-700 bg-slate-950/50 text-slate-500 hover:border-slate-600'}"
									>Rendah</button
								>
								<button
									onclick={() => (severity = 'sedang')}
									class="flex-1 rounded-xl border-2 py-2.5 text-sm font-bold transition-all duration-300
              {severity === 'sedang'
										? 'border-orange-500 bg-orange-500/20 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
										: 'border-slate-700 bg-slate-950/50 text-slate-500 hover:border-slate-600'}"
									>Sedang</button
								>
								<button
									onclick={() => (severity = 'tinggi')}
									class="flex-1 rounded-xl border-2 py-2.5 text-sm font-bold transition-all duration-300
              {severity === 'tinggi'
										? 'border-red-500 bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
										: 'border-slate-700 bg-slate-950/50 text-slate-500 hover:border-slate-600'}"
									>Tinggi</button
								>
							</div>
						</div>

						<div>
							<p class="mb-2 block text-sm font-semibold text-slate-300">Lokasi Terdeteksi</p>
							<div
								class="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950/50 p-3.5"
							>
								{#if isLocating}
									<span class="flex animate-pulse items-center gap-2 text-sm text-slate-400">
										<div
											class="h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"
										></div>
										Mendeteksi GPS...
									</span>
								{:else}
									<span class="font-mono text-sm tracking-wider text-slate-300"
										>{location?.lat.toFixed(5)}, {location?.lon.toFixed(5)}</span
									>
									<span
										class="rounded border border-emerald-500/30 bg-emerald-500/20 px-2 py-1 text-[10px] font-semibold tracking-wide text-emerald-400"
										>GPS AKTIF</span
									>
								{/if}
							</div>
						</div>

						<div>
							<label for="report-image" class="mb-2 block text-sm font-semibold text-slate-300"
								>Foto Kejadian</label
							>
							<input
								id="report-image"
								type="file"
								accept="image/jpeg,image/png,image/webp"
								onchange={handleImage}
								class="block w-full rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-3 file:py-2 file:text-sm file:font-bold file:text-white"
							/>
							{#if imageName}
								<p class="mt-2 truncate text-xs text-slate-500">{imageName}</p>
							{/if}
							{#if imageData}
								<img
									src={imageData}
									alt="Pratinjau foto laporan"
									class="mt-3 h-32 w-full rounded-xl border border-slate-700 object-cover"
								/>
							{/if}
						</div>

						<button
							onclick={submitReport}
							disabled={isSubmitting || !description.trim() || !location}
							class="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 font-bold text-white shadow-lg transition-all duration-300 hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:bg-slate-800 disabled:text-slate-600"
						>
							{#if isSubmitting}
								<span class="animate-spin text-lg">⏳</span> Mengirim Laporan...
							{:else}
								Kirim Laporan Warga
							{/if}
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- FEED LAPORAN WARGA -->
	<div class="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
		<h2 class="flex items-center gap-2 text-2xl font-bold text-white">
			<span class="inline-block h-6 w-1.5 rounded-full bg-emerald-500"></span> Laporan Terbaru
		</h2>
		{#if auth.token}
			<button
				type="button"
				onclick={() => (showCreateReport = true)}
				class="flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-emerald-500"
			>
				📢 Buat Laporan Baru
			</button>
		{:else}
			<a
				href="/auth/login?redirect=%2Flapor"
				class="flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-emerald-500"
			>
				Masuk untuk Melapor
			</a>
		{/if}
	</div>

	<div class="space-y-4">
		{#if isLoading}
			<div class="flex flex-col items-center gap-3 py-10">
				<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-500"></div>
				<div class="animate-pulse text-sm text-slate-400">Memuat laporan warga...</div>
			</div>
		{:else if reports.length === 0}
			<div
				class="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 py-20 text-center text-slate-500"
			>
				<span class="mb-4 block text-5xl opacity-50">🏜️</span>
				<p class="text-lg font-medium text-slate-400">Belum ada laporan masuk.</p>
				<p class="mt-1 text-sm">Jadilah warga pertama yang melapor hari ini.</p>
			</div>
		{:else}
			{#each reports as report, i (report.id)}
				{@const kind = disasterCategory(report.category)}
				<!-- Kartu Laporan (Glassmorphism) -->
				<div
					class="flex flex-col gap-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-slate-700 hover:bg-slate-800/80 md:flex-row"
					in:fly={{ y: 20, duration: 300, delay: i * 50 }}
				>
					<!-- Indikator Tingkat Keparahan -->
					<div class="flex-shrink-0 md:w-32">
						{#if report.severity === 'tinggi'}
							<div
								class="flex h-full flex-col justify-center rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-red-400 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]"
							>
								<span class="mb-1 animate-pulse text-2xl">🚨</span>
								<span class="text-[10px] font-bold tracking-widest uppercase">Prioritas Tinggi</span
								>
							</div>
						{:else if report.severity === 'sedang'}
							<div
								class="flex h-full flex-col justify-center rounded-xl border border-orange-500/30 bg-orange-500/10 p-3 text-center text-orange-400 shadow-[inset_0_0_20px_rgba(249,115,22,0.1)]"
							>
								<span class="mb-1 text-2xl">⚠️</span>
								<span class="text-[10px] font-bold tracking-widest uppercase">Waspada</span>
							</div>
						{:else}
							<div
								class="flex h-full flex-col justify-center rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-center text-green-400 shadow-[inset_0_0_20px_rgba(34,197,94,0.1)]"
							>
								<span class="mb-1 text-2xl">👁️</span>
								<span class="text-[10px] font-bold tracking-widest uppercase">Pantauan</span>
							</div>
						{/if}
					</div>

					<!-- Konten Laporan -->
					<div class="flex-grow">
						<div class="mb-2 flex items-start justify-between">
							<div class="flex items-center gap-3">
								<div
									class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-lg shadow-inner"
								>
									👤
								</div>
								<div>
									<div class="text-sm font-bold text-slate-200">Warga Anonim</div>
									<div class="mt-0.5 text-[11px] font-medium text-slate-500">
										{timeAgo(report.created_at)}
									</div>
								</div>
							</div>
							<!-- Tag Verifikasi -->
							<span
								class="flex items-center gap-1.5 rounded-md border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold text-blue-400"
							>
								<span class="absolute h-1.5 w-1.5 animate-ping rounded-full bg-blue-400"></span>
								<span class="relative h-1.5 w-1.5 rounded-full bg-blue-400"></span> Menunggu Verifikasi
							</span>
						</div>

						<span
							class="mt-4 inline-flex items-center gap-1.5 rounded-md border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-300"
							>{`${kind.icon} ${kind.label}`}</span
						>
						<p class="my-4 text-sm leading-relaxed text-slate-300">{report.description}</p>
						{#if report.image_data}
							<img
								src={report.image_data}
								alt={`Foto laporan ${kind.label}`}
								class="mb-4 max-h-96 w-full rounded-xl border border-slate-700 object-cover"
							/>
						{/if}

						<div class="mt-2 flex items-center justify-between border-t border-slate-800 pt-3">
							<div class="flex items-center gap-1.5 font-mono text-xs text-slate-500">
								<span class="text-emerald-500">📍</span>
								{report.lat.toFixed(5)}, {report.lon.toFixed(5)}
							</div>
							<a
								href={`/peta?lat=${report.lat}&lon=${report.lon}`}
								class="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
							>
								🗺️ Cek Peta
							</a>
						</div>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>
