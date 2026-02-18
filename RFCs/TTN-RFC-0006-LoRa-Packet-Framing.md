# TTN-RFC-0006
## Minimal LoRa Packet Framing for Non-Meshtastic Nodes
### Version 0.1

Status: Draft

This RFC defines a minimal, deterministic LoRa framing format for devices that
are not running Meshtastic but must exchange short messages with a TTN gateway.
It is intended for low-power nodes and constrained firmware.

---

## 1. Scope
- This framing is for LoRa point-to-point or star links only.
- It does not define modulation parameters (SF, BW, CR) or regional limits.
- It is transport-only; semantic interpretation happens in the TTN bridge.

---

## 2. Frame Layout (Bytes)
```
SOF  VER  FLAGS  SRC_ID  DST_ID  TYPE  SEQ  LEN  PAYLOAD...  CRC16  EOF
1    1    1      2       2       1     1    1    0..240     2      1
```

### Field Definitions
- `SOF`: Start-of-frame byte. Fixed value `0xA5`.
- `VER`: Protocol version. Fixed value `0x01`.
- `FLAGS`: Bitfield (LSB=bit0).
  - bit0: ACK_REQUIRED
  - bit1: ACK_FRAME
  - bit2: RESERVED
  - bit3: RESERVED
  - bits4-7: RESERVED (must be 0)
- `SRC_ID`: 16-bit unsigned source node ID, big-endian.
- `DST_ID`: 16-bit unsigned destination node ID, big-endian. Use `0xFFFF` for broadcast.
- `TYPE`: 1-byte message type.
  - `0x01`: TEXT (UTF-8)
  - `0x02`: TLV (compact binary)
  - `0x03`: PING
  - `0x04`: PONG
- `SEQ`: 8-bit sequence number (wraps at 255).
- `LEN`: Payload length in bytes (0..240).
- `PAYLOAD`: `LEN` bytes.
- `CRC16`: CRC-16/CCITT-FALSE over bytes `VER` through end of `PAYLOAD`.
- `EOF`: End-of-frame byte. Fixed value `0x5A`.

---

## 3. ACK Behavior (Minimal)
- If `ACK_REQUIRED` is set, receiver SHOULD send an ACK frame with:
  - `FLAGS.ACK_FRAME=1`, `TYPE=0x04`, `LEN=0`, and matching `SEQ`.
- Senders SHOULD retry up to 2 times with exponential backoff (e.g., 1s, 3s).
- If `ACK_REQUIRED` is not set, do not send ACKs.

---

## 4. Payload Guidance
- `TYPE=0x01` (TEXT) SHOULD be ASCII or UTF-8, under 120 bytes when possible.
- `TYPE=0x02` (TLV) uses 1-byte tag, 1-byte length, then value bytes.
- `TYPE=0x03` (PING) and `TYPE=0x04` (PONG) SHOULD have `LEN=0`.

---

## 5. Mapping to TTN Events
- The TTN bridge SHOULD translate TEXT payloads using the semantic rules engine.
- The TTN bridge SHOULD expose SRC_ID and DST_ID as `node:<id>` entities.
- If TLV tags map to known sensor types, populate structured payloads directly.

---

## 6. Compatibility
- Receivers MUST ignore frames with unsupported `VER`.
- Reserved flag bits MUST be ignored if non-zero.

End TTN-RFC-0006
