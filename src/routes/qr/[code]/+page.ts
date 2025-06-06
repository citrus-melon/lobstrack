import { redirect, error } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';
import type { PageLoad } from './$types';
import { sqids } from '$lib/sqids';

export const load: PageLoad = async ({ params }) => {
  const [pointerId] = sqids.decode(params.code);
  if (!pointerId) throw error(404, 'Invalid QR code');

  const { data: pointer } = await supabase
    .from('pointers')
    .select('item')
    .eq('id', pointerId)
    .single();

  if (!pointer || !pointer.item) throw error(404, 'Pointer not found');
  throw redirect(302, `/item/${pointer.item}`);
};
