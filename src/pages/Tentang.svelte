<div class="mx-auto max-w-4xl px-4 py-16">
	<h1 class="mb-6 text-center text-4xl font-extrabold tracking-tight text-white">
		Tentang SIGAP Bencana
	</h1>
	<div
		class="mx-auto mb-10 h-1 w-24 rounded-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]"
	></div>

	<div class="mx-auto prose prose-lg leading-relaxed text-slate-300 prose-invert">
		<p class="mb-4">
			<strong class="text-orange-500">SIGAP Bencana</strong> adalah platform peringatan dini dan pelaporan
			bencana berbasis integrasi data satelit, prakiraan cuaca, dan partisipasi warga.
		</p>
		<p class="mb-4">
			Indonesia menghadapi beragam ancaman, mulai dari banjir, tanah longsor, gempa bumi, erupsi
			gunung api, cuaca ekstrem, hingga kebakaran hutan dan lahan. Dampaknya sering terasa jauh dari
			sumber kejadian, misalnya kabut asap yang terbawa angin lintas provinsi. Karena itu, data
			resmi perlu dilengkapi dengan laporan langsung dari masyarakat di lapangan.
		</p>

		<h2 class="mt-8 mb-4 text-2xl font-bold text-white">Arsitektur & Data Pipeline</h2>
		<p class="mb-4">
			Sistem ini dibangun dengan arsitektur <em class="text-slate-200">Client-Server</em>: Vite dan
			Svelte SPA di sisi antarmuka, serta REST API Express.js dengan basis data PostgreSQL di sisi
			backend. Data diolah dari sumber terpercaya:
		</p>
		<ul class="mb-4 list-disc space-y-2 pl-6">
			<li>
				<strong class="text-orange-400">Laporan Warga:</strong> Kejadian bencana yang dikirim masyarakat
				beserta jenis, tingkat keparahan, dan lokasinya.
			</li>
			<li>
				<strong class="text-orange-400">NASA FIRMS:</strong> Pemantauan titik panas satelit (VIIRS) untuk
				kebakaran hutan dan lahan.
			</li>
			<li>
				<strong class="text-orange-400">Open-Meteo:</strong> Prakiraan cuaca, arah dan kecepatan angin,
				serta kualitas udara.
			</li>
			<li>
				<strong class="text-orange-400">AQICN / WAQI:</strong> Data stasiun pemantau kualitas udara dan
				konsentrasi PM2.5.
			</li>
		</ul>

		<!-- Kotak Kutipan (Dark Mode) -->
		<div class="my-8 rounded-r-xl border-l-4 border-orange-500 bg-slate-900 p-6 shadow-lg">
			<p class="m-0 font-medium text-slate-200 italic">
				"Kami menerjemahkan data kebencanaan yang rumit menjadi <strong
					class="text-orange-500 not-italic">aksi nyata</strong
				> (actionable insights) di tingkat lapangan, memastikan Anda mendapatkan perlindungan yang tepat
				waktu."
			</p>
		</div>
	</div>
</div>
