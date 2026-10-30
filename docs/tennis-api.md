# 🎾 Tennis API Documentation (v2.9.4)

Documentación técnica para la integración de datos de tenis en tiempo real.

**Base URL:** `https://api.api-tennis.com/tennis/`
**Auth:** Requiere `APIkey` como parámetro en el query string.

---

## 📌 Índice de Métodos

- [Event Types](#1-event-types) - Tipos de torneos soportados.
- [Tournaments](#2-tournaments) - Lista de torneos por plan.
- [Fixtures](#3-fixtures) - Partidos programados y resultados pasados.
- [Livescore](#4-livescore) - Marcadores en tiempo real.
- [H2H (Head to Head)](#5-h2h-head-to-head) - Comparativa entre dos jugadores.
- [Standings](#6-standings) - Rankings ATP/WTA.
- [Players](#7-players) - Perfiles y estadísticas de jugadores.
- [Odds](#8-odds) - Cuotas de apuestas (Pre-match).
- [Live Odds](#9-live-odds) - Cuotas en vivo.

---

## 🛠 1. Event Types

Devuelve la lista de tipos de eventos (Atp Singles, Wta Doubles, etc.) según tu suscripción.

- **Endpoint:** `?method=get_events`
- **URL Ejemplo:** `https://api.api-tennis.com/tennis/?method=get_events&APIkey=TU_KEY`

---

## 🏆 2. Tournaments

Lista de todos los torneos disponibles.

- **Endpoint:** `?method=get_tournaments`
- **Campos clave:** `tournament_key`, `event_type_key`.

---

## 📅 3. Fixtures

Consulta partidos para un rango de fechas específico.

- **Endpoint:** `?method=get_fixtures`
- **Parámetros:**
  - `date_start` (yyyy-mm-dd) **[Obligatorio]**
  - `date_stop` (yyyy-mm-dd) **[Obligatorio]**
  - `player_key` (opcional)
  - `match_key` (opcional)

---

## ⚡ 4. Livescore

Partidos que se están jugando en este momento.

- **Endpoint:** `?method=get_livescore`
- **Información extra:** Incluye `pointbypoint` y `event_serve` (quién saca).

---

## 🤜🤛 5. H2H (Head to Head)

Historial de enfrentamientos directos entre dos jugadores.

- **Endpoint:** `?method=get_H2H`
- **Parámetros:** - `first_player_key`
  - `second_player_key`

---

## 📈 6. Standings

Clasificación mundial actual.

- **Endpoint:** `?method=get_standings`
- **Parámetros:** `event_type` (Valores: `ATP` o `WTA`).

---

## 👤 7. Players

Perfil detallado de un jugador.

- **Endpoint:** `?method=get_players`
- **Parámetros:** `player_key`
- **Data:** Devuelve cumpleaños, títulos y victorias por superficie (clay, hard, grass).

---

## 💰 8. Odds (Cuotas)

Cuotas de diferentes casas de apuestas (bet365, bwin, 1xbet, etc.).

- **Endpoint:** `?method=get_odds`
- **Mercados:** Home/Away, Correct Score, Set Betting.

---

## 📺 9. Live Odds

Cuotas actualizadas durante el transcurso del partido.

- **Endpoint:** `?method=get_live_odds`
- **Estado:** Indica si la cuota está suspendida (`suspended: Yes/No`).

---

> [!NOTE]
> **Formato de Fecha:** Siempre usa `YYYY-MM-DD`.
> **Timezone:** Por defecto es `Europe/Berlin`. Puedes cambiarlo con el parámetro `&timezone=America/New_York`.
>
