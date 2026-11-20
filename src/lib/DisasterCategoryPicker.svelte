<script lang="ts">
	import { DISASTER_CATEGORIES } from './disaster';

	let { value = $bindable(), labelId }: { value: string; labelId: string } = $props();
</script>

<select
	bind:value
	aria-labelledby={labelId}
	class="w-full cursor-pointer appearance-none rounded-xl border-2 border-slate-700 bg-slate-950/50 px-4 py-3 text-sm font-semibold text-slate-300 transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
	style="background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M5 7.5L10 12.5L15 7.5' stroke='%2394A3B8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E&quot;); background-repeat: no-repeat; background-position: right 0.75rem center;"
>
	{#each DISASTER_CATEGORIES as option (option.value)}
		<option value={option.value}>{`${option.icon} ${option.label}`}</option>
	{/each}
</select>
