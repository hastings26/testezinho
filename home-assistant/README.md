# Home Assistant — outage of 3 August 2026 and the fix

## What happened

Home Assistant restarted on **2026-08-03 at 18:06** and five cloud
integrations never reconnected. All 153 dead entities carry that identical
`last_changed` timestamp, which is what pins the cause to the restart rather
than to five separate device failures.

| Integration | Entities down | Anchor to test |
|---|---|---|
| Ring (front door, gate, garden, back garden) | 31 | `camera.front_door_live_view` |
| Ecovacs Matrix10 Ultra (sub-entities) | 48 | `select.matrix10_ultra_cleaning_mode` |
| Tuya plugs (Cheirinho, LED lights 2, Grandona, Smart Plug) | 28 | `switch.cheirinho_socket_1` |
| TVs (bedroom, Samsung 85) | 11 | `media_player.bedroom_1_bedroom_tv` |
| iPhone companion app | 11 | `sensor.as_iphone_ssid` |

## Why the automations stopped even though three still read "on"

`arm_ring_cameras_when_everyone_leaves_home` and its disarm counterpart
trigger on presence. When the companion app stopped reporting,
`device_tracker.as_iphone` did not go unavailable — it **froze on `home`**
and has not changed since 3 August. To Home Assistant, nobody has left the
house in ten days, so the "everyone leaves" trigger has never fired. Even if
it had, every Ring entity it targets is unavailable.

Last genuine trigger: **27 July**. The cameras have not been armed
automatically since.

The fourth automation, `goodnight_bridge`, is a separate fault: it reports
`mode: None` and `last_triggered: None`, while the working automations report
`mode: single`. That is a config failing to load at startup — it was built in
the UI against `device_id` references that no longer resolve.

## Fix, in order

### 1. Re-authenticate the integrations (must be done by hand — 2FA)

Settings → Devices & Services. Anything needing attention shows a
**Reconfigure** or **Re-authenticate** button.

- **Ring** — expect an OTP challenge; do this one first, it is the security-
  relevant one.
- **Tuya** — cloud tokens expire; re-link the account.
- **TVs** — may need re-pairing and an on-screen accept.
- **iPhone companion app** — open the app on the phone, Settings →
  Companion App → check the server connection. This one also restores
  presence, which unblocks both Ring automations.

After each, confirm the anchor entity above has left `unavailable`.

### 2. Replace the broken automation

`automations/goodnight_bridge.yaml` — same `id`, so history and the entity
name carry over. Uses `entity_id` throughout instead of `device_id`, so
re-pairing a device no longer breaks it, and `continue_on_error` so one
offline entity does not abort the rest of the sequence.

One assumption is flagged in the file: `switch.quarto_switch_1` is taken to
be the bedroom light, since it is the only live bedroom-named switch. If the
real trigger is `light.strip_lights`, add it to the trigger list.

### 3. Install the watchdog

`automations/integration_watchdog.yaml` — two automations. One alerts when an
anchor entity is unavailable for 15 minutes; the other sweeps 10 minutes
after every restart and reports whatever did not come back. Alerts go to a
persistent notification first, because that path works even when the phone is
the thing that went offline.

This is the part that prevents a repeat. The outage was invisible for ten
days purely because nothing was watching.

### 4. Surface it on the casa page

Not yet done — it needs the `hastingshub` repository, which is not attached
to this session. The plan is an *Automations & Scripts* section on
`/lab/casa/` with toggles for automations and run buttons for the 17 scripts
and `scene.film_scene`, going through the existing `/lab/api/ha` proxy.

## How this was diagnosed

Read-only, through the existing gated worker proxy at
`https://hastingshub.com/lab/api/ha`, which returns the full entity state
list. Nothing was actuated. That endpoint appears to be read-only, so
steps 2 and 3 have to be applied in Home Assistant itself.

## Security note

The lab password was pasted into a chat transcript twice while working on
this. Rotate it and update the worker gate.
