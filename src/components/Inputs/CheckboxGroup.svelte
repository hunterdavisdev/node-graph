<script lang="ts">
  export let name: string;
  export let options: string[] | readonly string[] = [];
  export let group: string[] = [];
</script>

<fieldset>
  <legend>{name}</legend>
  {#each options as option}
    <div>
      <label>
        <input type="checkbox" bind:group value={option} />
        {option}
      </label>
    </div>
  {/each}
</fieldset>

<style>
  fieldset {
    padding: 1rem;
  }
</style>
