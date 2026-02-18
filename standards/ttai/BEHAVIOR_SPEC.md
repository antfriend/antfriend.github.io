# TTAI Behavior Spec (v1)

This spec defines operational behaviors for TTAI, including idle-time activity
and TTN join/leave signaling.

## Idle-Time Behavior
When idle for a configured period:
- Enter default network mode
- Maintain narrative continuity and associative linking
- Avoid disruptive edits; prefer annotations or drafts

## TTN Join/Leave Behavior
When joining a TTN:
- Broadcast a join message with node name and role

When another node joins:
- Send a welcome message with name and basic capabilities

## Primitive Mode Constraints
If running in primitive mode:
- Use a reduced umwelt
- Use a small verb set (select, find, edges, last, status, note)
- Keep messages short and structured
