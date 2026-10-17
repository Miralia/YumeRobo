<script lang="ts">
    import { onMount } from "svelte";
    import { formatDateTime, getUserTimezone } from "$lib/utils/date";

    interface Props {
        value: string;
    }

    let { value }: Props = $props();

    // Keep SSR and the first hydration pass deterministic, then correct the
    // display with the browser's IANA time zone as soon as the component mounts.
    let timeZone = $state("UTC");
    let formatted = $derived(formatDateTime(value, timeZone));

    onMount(() => {
        timeZone = getUserTimezone();
    });
</script>

<!-- An invalid value formats to an empty `dateTime`: omit the attribute
     rather than emitting `datetime=""`, which would be a wrong instant. -->
<time datetime={formatted.dateTime || undefined}>{formatted.label}</time>
