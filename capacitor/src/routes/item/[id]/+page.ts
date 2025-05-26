import type { PageLoad } from './$types';
import { supabase } from '$lib/supabase';

export const load: PageLoad = async ({ params }) => {
  const id = params.id;
  let item = null;
  let locationHierarchy = [];
  let error: string | null = null;

  const { data, error: err } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single();
  if (err) {
    error = err.message;
  } else {
    item = data;
    const { data: hierarchy, error: hierErr } = await supabase.rpc('get_item_hierarchy', { item_id: id });
    if (!hierErr && hierarchy) {
      locationHierarchy = hierarchy.reverse();
    }
  }
  console.log('hi')
  return { item, locationHierarchy, error };
};
