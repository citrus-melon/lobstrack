<!-- Shared Card component for displaying sections -->
<script lang="ts">
  interface Props {
    title?: string;
    actions?: {onClick: () => {}, label: string}[];
    children?: import('svelte').Snippet;
  }

  let { title = '', actions = [], children }: Props = $props();
</script>

<section class="card">
  {#if title}
    <header><h2>{title}</h2></header>
  {/if}
  <div class="content">
    {@render children?.()}
  </div>
  {#if actions.length}
    <footer>
      {#each actions as action}
        <button onclick={action.onClick}>{action.label}</button>
      {/each}
    </footer>
  {/if}
</section>

<style>
.card {
  background: var(--card-bg, #fff);
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  margin: 1rem 0;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: relative;
}
header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  color: var(--accent, #2a5d8f);
}
footer {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
</style>
