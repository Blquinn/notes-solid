import { FragmentProps } from "solid-headless/dist/types/utils/Fragment";
import { Accessor, Show } from "solid-js";

export interface ModalProps extends FragmentProps {
  open: Accessor<boolean>
  onClose: () => void;

  classBackdrop?: string
  classModal?: string
  classBody?: string;
  classFooter?: string;
  classButtonPositive?: string;
  classButtonNeutral?: string;
  buttonTextCancel?: string;
  buttonTextConfirm?: string;
  buttonTextSubmit?: string;
}

// // Props (buttons)
// /** Provide classes for neutral buttons, such as Cancel. */
// export let buttonNeutral = 'variant-ghost-surface';
// /** Provide classes for positive actions, such as Confirm or Submit. */
// export let buttonPositive = 'variant-filled-primary';
// /** Override the text for the Cancel button. */
// export let buttonTextCancel = 'Cancel';
// /** Override the text for the Confirm button. */
// export let buttonTextConfirm = 'Confirm';
// /** Override the text for the Submit button. */
// export let buttonTextSubmit = 'Submit';

export default function Modal(props: ModalProps) {
  const classBody = props.classBody ?? 'max-h-[200px] overflow-hidden';
  const classFooter = props.classFooter ?? 'flex justify-end space-x-2';
  const classButtonPositive = props.classButtonPositive ?? 'variant-filled-primary';
  const classButtonNeutral = props.classButtonNeutral ?? 'variant-ghost-surface';
  const buttonTextCancel = props.buttonTextCancel ?? 'Cancel';
  const buttonTextConfirm = props.buttonTextConfirm = 'Confirm';
  const buttonTextSubmit = props.buttonTextSubmit = 'Submit';

  function onClose(): void {
    props.onClose();
  }

  function onBackdropInteraction(event: MouseEvent | TouchEvent): void {
    if (!(event.target instanceof Element)) return;
    if (event.target.classList.contains('modal-backdrop')) onClose();
    /** @event {{ event }} backdrop - Fires on backdrop interaction.  */
    // dispatch('backdrop', event);
  }

  // function onConfirm(): void {
  // 	// if ($modalStore[0].response) $modalStore[0].response(true);
  // 	// modalStore.close();
  // }

  // function onPromptSubmit(): void {
  // 	// if ($modalStore[0].response) $modalStore[0].response(promptValue);
  // 	// modalStore.close();
  // }


  return (
    <Show when={props.open()}>
      <div
        class={`modal-backdrop z-50 fixed left-0 top-0 h-screen w-screen bg-surface-backdrop-token flex justify-center items-center ${props.classBackdrop ?? ''}`}
        onMouseDown={onBackdropInteraction}
        onTouchStart={onBackdropInteraction}
        // transition:fade={{ duration }}
        data-testid="modal-backdrop"
      >
        {/* <!-- Modal --> */}
        <div
          class={`modal card p-4 ${props.classModal ?? ''}`}
          // transition:fly={{ duration, opacity: 0, y: 100 }}
          // use:focusTrap={true}
          data-testid="modal"
          role="dialog"
          aria-modal="true"
        // aria-label={$modalStore[0].title}
        >
          {/* {props.children} */}
          <Show when={props.children}>
            <article class={`modal-body ${classBody}`}>{props.children}</article>
          </Show>

          {/* <input class="modal-prompt-input input" type="text" bind:value={promptValue} /> */}

          <footer class={`modal-footer ${classFooter}`}>
            <button class={`btn ${classButtonNeutral}`} onClick={onClose}>{buttonTextCancel}</button>
            {/* <button class={`btn ${classButtonPositive}`} onClick={onPromptSubmit} disabled={!promptValue}>{buttonTextSubmit}</button> */}
          </footer>
          {/* {#if $modalStore[0]?.title}
        <header class="modal-header {regionHeader}">{@html $modalStore[0].title}</header>
      {/if}
      {#if $modalStore[0]?.body}
        <article class="modal-body {regionBody}">{@html $modalStore[0].body}</article>
      {/if}
      {#if $modalStore[0]?.image && typeof $modalStore[0]?.image === 'string'}
        <img class="modal-image {cModalImage}" src={$modalStore[0]?.image} alt="Modal" />
      {/if}
      {#if $modalStore[0].type === 'alert'}
        <footer class="modal-footer {regionFooter}">
          <button class="btn {buttonNeutral}" on:click={onClose}>{buttonTextCancel}</button>
        </footer>
      {:else if $modalStore[0].type === 'confirm'}
        <footer class="modal-footer {regionFooter}">
        <button class="btn {buttonNeutral}" on:click={onClose}>{buttonTextCancel}</button>
        <button class="btn {buttonPositive}" on:click={onConfirm}>{buttonTextConfirm}</button>
      </footer>
      {:else if $modalStore[0].type === 'prompt'}
        <input class="modal-prompt-input input" type="text" bind:value={promptValue} />
          <footer class="modal-footer {regionFooter}">
          <button class="btn {buttonNeutral}" on:click={onClose}>{buttonTextCancel}</button>
          <button class="btn {buttonPositive}" on:click={onPromptSubmit} disabled={!promptValue}>{buttonTextSubmit}</button>
        </footer>
      {:else if $modalStore[0].type === 'component'}
        <svelte:component this={$modalStore[0].component?.ref} {...$modalStore[0].component?.props} {parent}>
          {@html $modalStore[0].component?.slot}
        </svelte:component>
      {/if} */}
        </div>
      </div>
    </Show>
  );
}
