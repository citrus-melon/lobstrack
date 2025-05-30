import type { PageLoad } from './$types';
import { supabase } from '$lib/supabase';

const loadHierarchy = async (itemId: string) => {
  const { data } = await supabase.rpc('get_item_hierarchy', { item_id: itemId });
  return data?.reverse() ?? [];
}

const loadChildren = async (itemId: string) => {
  const { data } = await supabase
    .from('items')
    .select('id, name, parent')
    .eq('parent', itemId);
  return data ?? [];
}

export const load: PageLoad = async ({ params }) => {
  const { data: item, error: err } = await supabase
    .from('items')
    .select('*')
    .eq('id', params.id)
    .single();

  if (err) throw new Error(err.message);

  return {
    item,
    locationHierarchy: loadHierarchy(params.id).catch(() => []),
    children: loadChildren(params.id).catch(() => []),
  };
};
