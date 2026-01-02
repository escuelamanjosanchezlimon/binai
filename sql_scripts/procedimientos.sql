create or replace function total_ingresos() 
returns numeric 
language sql as $$
   select coalesce(sum(case when tipo = 1 then monto else 0 end), 0)
        - coalesce(sum(case when tipo = 2 then monto else 0 end), 0)
        - coalesce(sum(case when tipo in (3, 4) then monto else 0 end), 0)
   from finanzas;
$$;




create or replace function totales_mes_actual()
returns table(
    total_ingreso numeric,
    total_gasto numeric,
    total_deuda numeric,
    total_prestamo numeric,
    suma_total_deudas numeric,
    suma_total_prestamos numeric
)
language sql
as $$
with mes_actual as (
    select *
    from finanzas
    where date_trunc('month', created_at) = date_trunc('month', current_date)
)
select
    coalesce(sum(case when tipo = 1 then monto else 0 end), 0) as total_ingreso,
    coalesce(sum(case when tipo = 2 then monto else 0 end), 0) as total_gasto,
    coalesce(sum(case when tipo = 3 then monto else 0 end), 0) as total_deuda,
    coalesce(sum(case when tipo = 4 then monto else 0 end), 0) as total_prestamo,
    (select coalesce(sum(monto),0) from finanzas where tipo = 3) as suma_total_deudas,
    (select coalesce(sum(monto),0) from finanzas where tipo = 4) as suma_total_prestamos
from mes_actual;
$$;




create or replace function public.actualizar_estado_habitos(
  cambios jsonb
)
returns void
language plpgsql
as $$
begin
  update habitos h
  set estado = (c->>'estado')::int
  from jsonb_array_elements(cambios) c
  where h.id = (c->>'id')::int;
end;
$$;



create or replace function ingresos_egresos_ultimos_3_meses()
returns table (
  mes date,
  total_ingresos numeric,
  total_egresos numeric
)
language sql
stable
as $$
with meses as (
  select generate_series(
    date_trunc('month', now() at time zone 'utc')::date - interval '2 months',
    date_trunc('month', now() at time zone 'utc')::date,
    interval '1 month'
  )::date as mes
)
select
  m.mes,
  coalesce(sum(case when f.tipo = 1 then f.monto end), 0) as total_ingresos,
  coalesce(sum(case when f.tipo = 2 then f.monto end), 0) as total_egresos
from meses m
left join finanzas f
  on date_trunc('month', f.created_at at time zone 'utc')::date = m.mes
group by m.mes
order by m.mes;
$$;
