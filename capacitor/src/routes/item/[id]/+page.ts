import type { PageLoad } from './$types';
import { supabase } from '$lib/supabase';
import type { Tables } from '$lib/database.types';

export const load: PageLoad = async ({ params }) => {
  const id = params.id;
  let item = null;
  let locationHierarchy: Partial<Tables<"items">>[] = [];
  let children: Partial<Tables<"items">>[] = [];

  const { data, error: err } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single();
  if (err) {
    throw new Error(err.message);
  } else {
    item = data;
    const { data: hierarchy, error: hierErr } = await supabase.rpc('get_item_hierarchy', { item_id: id });
    if (!hierErr && hierarchy) {
      locationHierarchy = hierarchy.reverse();
    }
    // Fetch children
    const { data: childData, error: childErr } = await supabase
      .from('items')
      .select('id, name, parent')
      .eq('parent', id);
    if (!childErr && childData) {
      children = childData;
    }
  }
  return { item, locationHierarchy, children };
};
