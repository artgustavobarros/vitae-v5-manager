# 0001 — Monólito TanStack Start + Postgres na VPS

Front e back no mesmo app TanStack Start, Postgres no mesmo docker-compose.
Rejeitados: back separado (Hono/Go) duplicaria a validação das regras V5;
Supabase self-hosted pesa ~10 containers e 4 GB+ de RAM na VPS.
Escala da mesa (~5 usuários) torna desempenho irrelevante.
