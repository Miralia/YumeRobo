<script lang="ts">
	import { tick } from "svelte";
	import { prefersReducedMotion } from "svelte/motion";
	import { liquidGlass } from "$lib/utils/liquid-glass";
	import TelegramIcon from "$lib/components/TelegramIcon.svelte";

	type ContactKind = "telegram" | "email";

	let {
		kind,
		oncancel,
		onconfirm,
	}: {
		kind: ContactKind;
		oncancel: () => void;
		onconfirm: () => void;
	} = $props();

	let dialog = $state<HTMLDialogElement | null>(null);
	let confirmed = false;

	let serviceName = $derived(kind === "telegram" ? "Telegram" : "your email app");
	let title = $derived(kind === "telegram" ? "Open Telegram?" : "Open your email app?");
	let description = $derived(
		kind === "telegram"
			? "You’ll leave YumeRobo and open our Telegram channel in a new tab."
			: "You’ll leave YumeRobo and open a new message to YumeRobo@proton.me.",
	);

	$effect(() => {
		if (!dialog) return;

		document.documentElement.dataset.contactDialogOpen = "";
		dialog.showModal();
		if (!prefersReducedMotion.current) {
			dialog.animate([{ opacity: 0 }, { opacity: 1 }], {
				duration: 180,
				easing: "ease-out",
			});
		}

		return () => {
			delete document.documentElement.dataset.contactDialogOpen;
			if (dialog?.open) dialog.close();
		};
	});

	function dismiss() {
		dialog?.close();
	}

	function confirm() {
		confirmed = true;
		dialog?.close();
		onconfirm();
	}

	function handleClose() {
		if (!confirmed) oncancel();
	}

	function handleCancel(event: Event) {
		event.preventDefault();
		dismiss();
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) dismiss();
	}

	async function handleKeydown(event: KeyboardEvent) {
		if (event.key !== "Tab" || !dialog) return;

		const controls = Array.from(
			dialog.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'),
		);
		if (controls.length < 2) return;

		const first = controls[0];
		const last = controls[controls.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		} else if (!dialog.contains(document.activeElement)) {
			event.preventDefault();
			await tick();
			first.focus();
		}
	}
</script>

<dialog
	class="contact-dialog"
	bind:this={dialog}
	aria-labelledby="contact-dialog-title"
	aria-describedby="contact-dialog-description"
	oncancel={handleCancel}
	onclose={handleClose}
	onclick={handleBackdropClick}
	onkeydown={handleKeydown}
>
		<section
			class="contact-dialog__panel liquid-surface liquid-surface--elevated"
			use:liquidGlass={{ interactive: false, refraction: 11 }}
	>
			<div class="contact-dialog__content">
				<div class="contact-dialog__icon" class:email={kind === "email"} aria-hidden="true">
					{#if kind === "telegram"}
						<TelegramIcon size={26} />
				{:else}
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<rect width="20" height="16" x="2" y="4" rx="2" />
						<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
					</svg>
				{/if}
			</div>
			<h2 id="contact-dialog-title">{title}</h2>
			<p id="contact-dialog-description">{description}</p>
		</div>

		<div class="contact-dialog__actions">
			<button class="dialog-action dialog-action--cancel" type="button" onclick={dismiss}>
				Cancel
			</button>
			<button class="dialog-action dialog-action--confirm" type="button" onclick={confirm}>
				Open {serviceName}
			</button>
		</div>
	</section>
</dialog>

<style>
	.contact-dialog {
		width: min(380px, calc(100vw - 32px));
		max-width: none;
		margin: auto;
		padding: 0;
		color: var(--color-label);
		background: transparent;
		border: 0;
		overflow: visible;
	}

	.contact-dialog::backdrop {
		background: rgba(12, 12, 18, 0.2);
		backdrop-filter: blur(18px) saturate(125%) brightness(0.94);
		-webkit-backdrop-filter: blur(18px) saturate(125%) brightness(0.94);
	}

	.contact-dialog__panel {
		background:
			linear-gradient(
				145deg,
				rgba(255, 255, 255, 0.3),
				rgba(255, 255, 255, 0.04) 44%,
				rgba(180, 210, 255, 0.06) 72%,
				rgba(255, 255, 255, 0.14)
			),
			color-mix(in srgb, var(--liquid-surface-elevated) 78%, transparent);
		border-color: color-mix(in srgb, var(--liquid-highlight) 58%, transparent);
		border-radius: 26px;
		box-shadow:
			inset 0 1px 0 color-mix(in srgb, #ffffff 68%, transparent),
			inset 1px 0 0 rgba(190, 220, 255, 0.12),
			inset -1px 0 0 rgba(255, 205, 235, 0.08),
			0 28px 70px rgba(0, 0, 0, 0.24),
			0 7px 22px rgba(0, 0, 0, 0.14);
		backdrop-filter: blur(32px) saturate(175%) brightness(1.04);
		-webkit-backdrop-filter: blur(32px) saturate(175%) brightness(1.04);
		transform-origin: center;
		animation: dialog-enter 220ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
	}

	.contact-dialog__panel::after {
		content: "";
		position: absolute;
		inset: 0;
		z-index: 3;
		padding: 1px;
		border-radius: inherit;
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.94),
			rgba(255, 255, 255, 0.24) 34%,
			rgba(255, 255, 255, 0.08) 62%,
			rgba(255, 255, 255, 0.46)
		);
		-webkit-mask:
			linear-gradient(#000 0 0) content-box,
			linear-gradient(#000 0 0);
		mask:
			linear-gradient(#000 0 0) content-box,
			linear-gradient(#000 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		pointer-events: none;
	}

	@supports (backdrop-filter: url("#liquid-glass-probe")) {
		.contact-dialog__panel:global([data-liquid-refraction]) {
			backdrop-filter:
				var(--liquid-refraction-filter)
				blur(32px)
				saturate(175%)
				brightness(1.04);
			-webkit-backdrop-filter:
				var(--liquid-refraction-filter)
				blur(32px)
				saturate(175%)
				brightness(1.04);
		}
	}

	.contact-dialog__content {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 28px 28px 24px;
		text-align: center;
	}

	.contact-dialog__icon {
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
		margin-bottom: 16px;
		color: #ffffff;
		background: #229ed9;
		border-radius: 14px;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.48),
			0 8px 18px color-mix(in srgb, #229ed9 35%, transparent);
	}

	.contact-dialog__icon.email {
		background: var(--color-accent);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.4),
			0 8px 18px color-mix(in srgb, var(--color-accent) 32%, transparent);
	}

	.contact-dialog__icon svg {
		width: 26px;
		height: 26px;
	}

	h2 {
		margin: 0;
		font-family: var(--font-sans);
		font-size: 20px;
		font-weight: 650;
		line-height: 1.2;
		letter-spacing: 0;
	}

	p {
		max-width: 300px;
		margin: 10px 0 0;
		color: var(--color-label-secondary);
		font-size: 14px;
		line-height: 1.45;
	}

	.contact-dialog__actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		padding: 0 16px 16px;
	}

	.dialog-action {
		min-width: 0;
		min-height: 48px;
		padding: 10px 12px;
		font-family: var(--font-sans);
		font-size: 15px;
		font-weight: 600;
		line-height: 1.2;
		letter-spacing: 0;
		border: 1px solid transparent;
		border-radius: 14px;
		cursor: pointer;
		transition:
			filter var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			transform var(--duration-fast) var(--ease-spring),
			box-shadow var(--duration-fast) var(--ease-out);
	}

	.dialog-action:focus-visible {
		filter: brightness(1.08);
	}

	.dialog-action:active {
		filter: brightness(0.94);
		transform: scale(0.97);
	}

	.dialog-action--cancel {
		color: var(--color-label);
		background: var(--liquid-control);
		border-color: var(--liquid-border);
		box-shadow:
			inset 0 1px 0 color-mix(in srgb, var(--liquid-highlight) 72%, transparent),
			0 2px 7px rgba(0, 0, 0, 0.1);
	}

	.dialog-action--confirm {
		color: #ffffff;
		background: #5856d6;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.32),
			0 3px 10px rgba(0, 0, 0, 0.14);
	}

	@media (hover: hover) and (pointer: fine) {
		.dialog-action:hover {
			filter: brightness(1.06);
			transform: translateY(-1px) scale(1.015);
		}

		.dialog-action--cancel:hover {
			background: var(--liquid-control-hover);
			border-color: color-mix(in srgb, var(--color-label) 18%, var(--liquid-border));
			box-shadow:
				inset 0 1px 0 color-mix(in srgb, var(--liquid-highlight) 82%, transparent),
				0 5px 12px rgba(0, 0, 0, 0.13);
		}

		.dialog-action--confirm:hover {
			background: #6664df;
			box-shadow:
				inset 0 1px 0 rgba(255, 255, 255, 0.38),
				0 6px 14px rgba(38, 36, 130, 0.24);
		}

		.dialog-action:active {
			filter: brightness(0.94);
			transform: scale(0.97);
		}
	}

	@keyframes dialog-enter {
		from {
			opacity: 0;
			transform: scale(0.92) translateY(8px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	@media (max-width: 360px) {
		.contact-dialog__actions {
			grid-template-columns: 1fr;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.contact-dialog__panel {
			animation: none;
		}
	}

	@media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
		.contact-dialog::backdrop {
			background: rgba(0, 0, 0, 0.58);
			backdrop-filter: none;
			-webkit-backdrop-filter: none;
		}

		.contact-dialog__panel {
			background: var(--liquid-surface-opaque);
			backdrop-filter: none;
			-webkit-backdrop-filter: none;
		}
	}

	@media (forced-colors: active) {
		.contact-dialog::backdrop {
			background: rgba(0, 0, 0, 0.65);
			backdrop-filter: none;
			-webkit-backdrop-filter: none;
		}

		.dialog-action {
			color: ButtonText;
			background: ButtonFace;
			border-color: ButtonBorder;
			box-shadow: none;
		}

		.contact-dialog__panel {
			color: CanvasText;
			background: Canvas;
			border-color: ButtonBorder;
			box-shadow: none;
			backdrop-filter: none;
			-webkit-backdrop-filter: none;
		}

		.contact-dialog__panel::after {
			display: none;
		}
	}
</style>
