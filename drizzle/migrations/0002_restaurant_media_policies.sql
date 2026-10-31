create policy "Anyone reads restaurant media" on storage.objects for select to anon, authenticated
  using (bucket_id = 'restaurant-media');
create policy "Owners upload restaurant media" on storage.objects for insert to authenticated
  with check (bucket_id = 'restaurant-media' and public.owns_restaurant(((storage.foldername(name))[1])::uuid));
create policy "Owners update restaurant media" on storage.objects for update to authenticated
  using (bucket_id = 'restaurant-media' and public.owns_restaurant(((storage.foldername(name))[1])::uuid));
create policy "Owners delete restaurant media" on storage.objects for delete to authenticated
  using (bucket_id = 'restaurant-media' and public.owns_restaurant(((storage.foldername(name))[1])::uuid));