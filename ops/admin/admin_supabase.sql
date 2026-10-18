-- ops/admin/admin_supabase.sql
-- Administración: retirar (y reponer) lo publicado, con efecto en ~1 minuto (2026-10-18).
-- Ejecutar una vez en el SQL Editor, DESPUÉS de noticias, podcast_auto y opinion.
--
-- `retiradas` es una lista PÚBLICA de (tipo, slug): no contiene nada sensible. El middleware de
-- la web (functions/_middleware.js) la lee con la clave publicable y quita esas piezas de los
-- feeds sin esperar al siguiente despliegue. Solo los perfiles con es_admin retiran o reponen.

create table if not exists public.retiradas (
  tipo   text not null check (tipo in ('noticia', 'podcast', 'opinion')),
  slug   text not null,
  motivo text,
  por    uuid references public.perfiles(id),
  en     timestamptz not null default now(),
  primary key (tipo, slug)
);
alter table public.retiradas enable row level security;
drop policy if exists "retiradas: lectura pública" on public.retiradas;
create policy "retiradas: lectura pública" on public.retiradas for select using (true);
-- (solo tipo y slug son públicos; motivo y autor se leen con la service role o en el admin)
revoke select on public.retiradas from anon, authenticated;
grant select (tipo, slug) on public.retiradas to anon, authenticated;

create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select es_admin and not bloqueado from perfiles where id = auth.uid()), false)
$$;

-- Lo publicado ahora mismo, más lo retirado, para la página de administración.
create or replace function public.admin_publicado() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not es_admin() then raise exception 'SIN_PERMISO'; end if;
  return jsonb_build_object(
    'noticias', coalesce((select jsonb_agg(jsonb_build_object('slug', slug, 'titulo', titulo, 'fecha', publicado) order by publicado desc)
                 from noticias where estado = 'publicada' and caduca > now()), '[]'),
    'podcast',  coalesce((select jsonb_agg(jsonb_build_object('slug', slug, 'titulo', titulo, 'fecha', publicado) order by publicado desc)
                 from podcast_episodios where estado = 'publicado'), '[]'),
    'opinion',  coalesce((select jsonb_agg(jsonb_build_object('slug', slug, 'titulo', titulo || ' · ' || firma, 'fecha', publicado) order by publicado desc)
                 from opinion_articulos where estado = 'publicado'), '[]'),
    'retiradas', coalesce((select jsonb_agg(jsonb_build_object('tipo', tipo, 'slug', slug, 'motivo', motivo, 'en', en) order by en desc)
                 from (select * from retiradas order by en desc limit 50) r), '[]'));
end $$;

create or replace function public.admin_retirar(p_tipo text, p_slug text, p_motivo text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not es_admin() then raise exception 'SIN_PERMISO'; end if;
  insert into retiradas (tipo, slug, motivo, por) values (p_tipo, p_slug, nullif(trim(p_motivo), ''), auth.uid())
  on conflict (tipo, slug) do update set motivo = excluded.motivo, por = excluded.por, en = now();
  if p_tipo = 'noticia' then update noticias set estado = 'retirada', actualizado = now() where slug = p_slug;
  elsif p_tipo = 'podcast' then update podcast_episodios set estado = 'retirado' where slug = p_slug;
  elsif p_tipo = 'opinion' then update opinion_articulos set estado = 'retirado', motivo = coalesce(nullif(trim(p_motivo), ''), 'Retirado por la redacción') where slug = p_slug;
  end if;
end $$;

-- Reponer: deshace una retirada por error (la noticia vuelve solo si aún no ha caducado; el
-- ciclo borra las noticias retiradas en cuanto pasa, así que reponer una noticia rara vez sirve).
create or replace function public.admin_reponer(p_tipo text, p_slug text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not es_admin() then raise exception 'SIN_PERMISO'; end if;
  delete from retiradas where tipo = p_tipo and slug = p_slug;
  if p_tipo = 'noticia' then update noticias set estado = 'publicada', actualizado = now() where slug = p_slug and estado = 'retirada';
  elsif p_tipo = 'podcast' then update podcast_episodios set estado = 'publicado' where slug = p_slug and estado = 'retirado';
  elsif p_tipo = 'opinion' then update opinion_articulos set estado = 'publicado', motivo = null where slug = p_slug and estado = 'retirado';
  end if;
end $$;

-- El autor que retira su artículo de opinión: también inmediato.
create or replace function public.retirar_opinion(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_slug text;
begin
  update opinion_articulos set estado = 'retirado', motivo = 'Retirado por su autor'
   where id = p_id and autor_id = auth.uid() and estado <> 'retirado'
  returning slug into v_slug;
  if not found then raise exception 'NO_ENCONTRADO'; end if;
  if v_slug is not null then
    insert into retiradas (tipo, slug, motivo, por) values ('opinion', v_slug, 'Retirado por su autor', auth.uid())
    on conflict (tipo, slug) do nothing;
  end if;
end $$;

revoke all on function public.admin_publicado() from public, anon;
revoke all on function public.admin_retirar(text, text, text) from public, anon;
revoke all on function public.admin_reponer(text, text) from public, anon;
grant execute on function public.admin_publicado() to authenticated;
grant execute on function public.admin_retirar(text, text, text) to authenticated;
grant execute on function public.admin_reponer(text, text) to authenticated;
grant execute on function public.es_admin() to authenticated;
