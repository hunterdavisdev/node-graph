<script lang="ts">
  import { fade } from "svelte/transition";

  export let x: number;
  export let y: number;
  export let open: boolean;

  export let onAddNode: () => any;
  export let onResetGraph: () => any;

  let modal: HTMLDivElement;

  $: if (modal) {
    modal.style.left = `${x.toString()}px`;
    modal.style.top = `${y.toString()}px`;
  }
</script>

{#if open}
  <div class="modal" class:open bind:this={modal} in:fade>
    <!-- Modal content -->
    <div class="modal-content">
      <button on:click={onAddNode}>Add Node</button>
      <button on:click={onResetGraph}>Reset Graph</button>
    </div>
  </div>
{/if}

<style>
  .modal {
    display: none;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 220px;
  }

  .modal.open {
    display: block;
  }

  /* Modal Content/Box */
  .modal-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-radius: 4px;
    padding: 1rem;
    background-color: #3b3b3b78;
    color: black;
  }

  .modal-content button {
    padding: 8px 16px;
    border: 0;
    background-color: mediumspringgreen;
    color: rgb(39, 39, 39);
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    width: 100%;
  }
</style>
