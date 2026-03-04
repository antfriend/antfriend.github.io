# Dice TTDB
An inscribed-cube TTDB with equal-distance vertices on the globe. Optional `z` elevation is supported; defaults to `0` at figurative sea level.

```mmpdb
db_id: mmpdb:sample:dice
db_name: "Dice"
coord_increment:
  lat: 1
  lon: 1
collision_policy: southeast_step
timestamp_kind: unix_utc
umwelt:
  umwelt_id: umwelt:tte:agent:dice:v1
  role: dice_librarian
  perspective: "A lattice of dice geometry mapped onto a globe."
  scope: "A single dice-themed TTDB instance."
  constraints:
    - "Coordinates express a figurative geometry, not physical measurement."
  globe:
    frame: "dice_globe"
    origin: "A cube inscribed in a sphere."
    mapping: "Vertices and marks are mapped onto spherical coordinates."
    note: "Optional record header field `z` is supported; default is 0 at sea level."
cursor_policy:
  max_preview_chars: 280
  max_nodes: 25
typed_edges:
  enabled: true
  syntax: "type>@TARGET_ID"
  note: "Typed edges connect matching latitudes and longitudes."
librarian:
  enabled: true
  primitive_queries:
    - "SELECT <record_id>"
    - "FIND <token>"
    - "EDGES <record_id>"
    - "LAST <n>"
    - "STATUS"
  max_reply_chars: 240
  invocation_prefix: "@AI"
```

```cursor
selected:
  - @LAT35.264LON45.0
preview:
  @LAT35.264LON45.0: "Cube vertex at sea level (z=0)."
agent_note: "Dice TTDB. Cube vertices are equal-distance points on the globe."
```

---

@LAT35.264LON45.0 | created:1760000000 | updated:1760000000 | z:0 | relates:lat>@LAT35.264LON135.0,lat>@LAT35.264LON-135.0,lat>@LAT35.264LON-45.0,lon>@LAT-35.264LON45.0

## Cube Vertex NE
North hemisphere vertex at lon 45. Latitudinally linked to other north vertices; longitudinally linked to its south counterpart.

---

@LAT35.264LON135.0 | created:1760000001 | updated:1760000001 | z:0 | relates:lat>@LAT35.264LON45.0,lat>@LAT35.264LON-135.0,lat>@LAT35.264LON-45.0,lon>@LAT-35.264LON135.0

## Cube Vertex NW
North hemisphere vertex at lon 135.

---

@LAT35.264LON-135.0 | created:1760000002 | updated:1760000002 | z:0 | relates:lat>@LAT35.264LON45.0,lat>@LAT35.264LON135.0,lat>@LAT35.264LON-45.0,lon>@LAT-35.264LON-135.0

## Cube Vertex SW
North hemisphere vertex at lon -135.

---

@LAT35.264LON-45.0 | created:1760000003 | updated:1760000003 | z:0 | relates:lat>@LAT35.264LON45.0,lat>@LAT35.264LON135.0,lat>@LAT35.264LON-135.0,lon>@LAT-35.264LON-45.0

## Cube Vertex SE
North hemisphere vertex at lon -45.

---

@LAT-35.264LON45.0 | created:1760000004 | updated:1760000004 | z:0 | relates:lat>@LAT-35.264LON135.0,lat>@LAT-35.264LON-135.0,lat>@LAT-35.264LON-45.0,lon>@LAT35.264LON45.0

## Cube Vertex NE (South)
South hemisphere vertex at lon 45.

---

@LAT-35.264LON135.0 | created:1760000005 | updated:1760000005 | z:0 | relates:lat>@LAT-35.264LON45.0,lat>@LAT-35.264LON-135.0,lat>@LAT-35.264LON-45.0,lon>@LAT35.264LON135.0

## Cube Vertex NW (South)
South hemisphere vertex at lon 135.

---

@LAT-35.264LON-135.0 | created:1760000006 | updated:1760000006 | z:0 | relates:lat>@LAT-35.264LON45.0,lat>@LAT-35.264LON135.0,lat>@LAT-35.264LON-45.0,lon>@LAT35.264LON-135.0

## Cube Vertex SW (South)
South hemisphere vertex at lon -135.

---

@LAT-35.264LON-45.0 | created:1760000007 | updated:1760000007 | z:0 | relates:lat>@LAT-35.264LON45.0,lat>@LAT-35.264LON135.0,lat>@LAT-35.264LON-135.0,lon>@LAT35.264LON-45.0

## Cube Vertex SE (South)
South hemisphere vertex at lon -45.
---

@LAT0.0LON0.0 | created:1760000100 | updated:1760000100 | z:11

## Pip: Face 1 Center (Front)
Die face 1 center pip on the front face.

---

@LAT20.0LON130.0 | created:1760000101 | updated:1760000101 | z:22

## Pip: Face 2 Top-Left (Back)
Die face 2 pip.

---

@LAT-20.0LON170.0 | created:1760000102 | updated:1760000102 | z:22

## Pip: Face 2 Bottom-Right (Back)
Die face 2 pip.

---

@LAT20.0LON70.0 | created:1760000103 | updated:1760000103 | z:33

## Pip: Face 3 Top-Left (East)
Die face 3 pip.

---

@LAT0.0LON90.0 | created:1760000104 | updated:1760000104 | z:33

## Pip: Face 3 Center (East)
Die face 3 pip.

---

@LAT-20.0LON110.0 | created:1760000105 | updated:1760000105 | z:33

## Pip: Face 3 Bottom-Right (East)
Die face 3 pip.

---

@LAT20.0LON-110.0 | created:1760000106 | updated:1760000106 | z:44

## Pip: Face 4 Top-Left (West)
Die face 4 pip.

---

@LAT20.0LON-70.0 | created:1760000107 | updated:1760000107 | z:44

## Pip: Face 4 Top-Right (West)
Die face 4 pip.

---

@LAT-20.0LON-110.0 | created:1760000108 | updated:1760000108 | z:44

## Pip: Face 4 Bottom-Left (West)
Die face 4 pip.

---

@LAT-20.0LON-70.0 | created:1760000109 | updated:1760000109 | z:44

## Pip: Face 4 Bottom-Right (West)
Die face 4 pip.

---

@LAT80.0LON-20.0 | created:1760000110 | updated:1760000110 | z:55

## Pip: Face 5 Top-Left (North)
Die face 5 pip.

---

@LAT80.0LON20.0 | created:1760000111 | updated:1760000111 | z:55

## Pip: Face 5 Top-Right (North)
Die face 5 pip.

---

@LAT60.0LON0.0 | created:1760000112 | updated:1760000112 | z:55

## Pip: Face 5 Center (North)
Die face 5 pip.

---

@LAT40.0LON-20.0 | created:1760000113 | updated:1760000113 | z:55

## Pip: Face 5 Bottom-Left (North)
Die face 5 pip.

---

@LAT40.0LON20.0 | created:1760000114 | updated:1760000114 | z:55

## Pip: Face 5 Bottom-Right (North)
Die face 5 pip.

---

@LAT-40.0LON-20.0 | created:1760000115 | updated:1760000115 | z:66

## Pip: Face 6 Top-Left (South)
Die face 6 pip.

---

@LAT-60.0LON-20.0 | created:1760000116 | updated:1760000116 | z:66

## Pip: Face 6 Mid-Left (South)
Die face 6 pip.

---

@LAT-80.0LON-20.0 | created:1760000117 | updated:1760000117 | z:66

## Pip: Face 6 Bottom-Left (South)
Die face 6 pip.

---

@LAT-40.0LON20.0 | created:1760000118 | updated:1760000118 | z:66

## Pip: Face 6 Top-Right (South)
Die face 6 pip.

---

@LAT-60.0LON20.0 | created:1760000119 | updated:1760000119 | z:66

## Pip: Face 6 Mid-Right (South)
Die face 6 pip.

---

@LAT-80.0LON20.0 | created:1760000120 | updated:1760000120 | z:66

## Pip: Face 6 Bottom-Right (South)
Die face 6 pip.
