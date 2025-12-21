<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
 
 import QrGenerator from './QrGenerator.svelte';
 
  const { Story } = defineMeta({
    component: QrGenerator,
  });
</script>
 
<Story name="Default" />