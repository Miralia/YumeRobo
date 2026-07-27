<script lang="ts">
    import { onMount } from "svelte";
    import { formatDateTime, getUserTimezone } from "$lib/utils/date";

    interface Props {
        value: string;
        class?: string;
    }

    let { value, class: className }: Props = $props();

    // Keep SSR and the first hydration pass deterministic, then correct the
    // display with the browser's IANA time zone as soon as the component mounts.
    let timeZone = $state("UTC");
    let formatted = $derived(formatDateTime(value, timeZone));

    onMount(() => {
        timeZone = getUserTimezone();
    });
</script>

<time datetime={formatted} class={className}>{formatted}</time>
