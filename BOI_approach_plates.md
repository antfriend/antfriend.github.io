# BOI Network Approach Plates — TTDB

```mmpdb
db_id: boi_network_approach_plates_2604
db_name: "BOI Network Approach Plates — FAA d-TPP Cycle 2604"
coord_increment: 0.1
collision_policy: southeast_step
timestamp_kind: unix
umwelt:
  umwelt_id: boi_network_nav
  role: approach_navigator
  perspective: pilot_inbound
  scope: idaho_and_nearby_terminals
  constraints: [FAA_public_domain, cycle_2604]
  globe:
    frame: geographic_decimal
    origin: kboi_airport_reference_point
    mapping: real_lat_lon_at_0.1deg_steps
    note: >
      IDs encode real-world decimal degrees at 0.1° resolution.
      @LATxLON where LAT=round(lat/0.1), LON=round(lon/0.1).
      1 LAT step ≈ 11.1 km. 1 LON step ≈ 8.0 km at 43.5°N.
      Approaches at IAF on extended centerline (~17 nm out).
      STARs at confirmed or estimated entry fix positions.
cursor_policy:
  max_preview_chars: 300
  max_nodes: 20
typed_edges:
  enabled: true
  syntax: "<type>@<TARGET_ID>"
  note: "sequence=next in flight flow; alternate=parallel option; references=back-link; nearby=adjacent airport"
librarian:
  enabled: true
  primitive_queries: [NEXT, PREV, ALT, LIST, SHOW]
  max_reply_chars: 400
  invocation_prefix: "LIB>"
airports_included: [KBOI]
```

```cursor
selected:
- @436x-1162
preview: {}
agent_note: "BOI network plate graph (1 airports). Navigate: STAR → approach → airport diagram → nearby airports. Query with NEXT/ALT/LIST."
dot: ""
last_query: ""
last_answer: ""
answer_records: []
```

# KBOI — Boise Airport / Gowen Field  *(tier 1: local)*

---

@436x-1162 | created:1775254769 | updated:1775254769 | relates: references>@437x-1158, references>@437x-1166, references>@435x-1166, references>@435x-1158
## Airport Diagram: Airport Diagram

**Airport:** KBOI — Boise Airport / Gowen Field  
**Position:** 43.564°N 116.223°W — KBOI airport reference point  
**Chart code:** APD  
**FAA PDF:** `00057AD.PDF`  
**d-TPP cycle:** 2604  
**Source:** public domain, [aeronav.faa.gov](https://aeronav.faa.gov/d-tpp/2604/00057AD.PDF)  

![AIRPORT DIAGRAM](boi_plates/images/00057AD.png)

---

@437x-1158 | created:1775254769 | updated:1775254769 | relates: sequence>@436x-1162, alternate>@437x-1166, alternate>@435x-1166, alternate>@435x-1158
## Approach: Ils Or Loc Rwy 28R

**Airport:** KBOI — Boise Airport / Gowen Field  
**Position:** 43.700°N 115.830°W (estimated) — IAF east of airport, RWY 28R (north parallel), ~17 nm  
**Chart code:** IAP  
**FAA PDF:** `00057IL28R.PDF`  
**d-TPP cycle:** 2604  
**Source:** public domain, [aeronav.faa.gov](https://aeronav.faa.gov/d-tpp/2604/00057IL28R.PDF)  

![ILS OR LOC RWY 28R](boi_plates/images/00057IL28R.png)

---

@437x-1166 | created:1775254769 | updated:1775254769 | relates: sequence>@436x-1162, alternate>@437x-1158, alternate>@435x-1166, alternate>@435x-1158
## Approach: Rnav (Gps) Y Rwy 10L

**Airport:** KBOI — Boise Airport / Gowen Field  
**Position:** 43.700°N 116.620°W (estimated) — IAF west of airport, RWY 10L (north parallel), ~17 nm  
**Chart code:** IAP  
**FAA PDF:** `00057RY10L.PDF`  
**d-TPP cycle:** 2604  
**Source:** public domain, [aeronav.faa.gov](https://aeronav.faa.gov/d-tpp/2604/00057RY10L.PDF)  

![RNAV (GPS) Y RWY 10L](boi_plates/images/00057RY10L.png)

---

@435x-1166 | created:1775254769 | updated:1775254769 | relates: sequence>@436x-1162, alternate>@437x-1158, alternate>@437x-1166, alternate>@435x-1158
## Approach: Rnav (Gps) Y Rwy 10R

**Airport:** KBOI — Boise Airport / Gowen Field  
**Position:** 43.500°N 116.620°W (estimated) — IAF west of airport, RWY 10R (south parallel), ~17 nm  
**Chart code:** IAP  
**FAA PDF:** `00057RY10R.PDF`  
**d-TPP cycle:** 2604  
**Source:** public domain, [aeronav.faa.gov](https://aeronav.faa.gov/d-tpp/2604/00057RY10R.PDF)  

![RNAV (GPS) Y RWY 10R](boi_plates/images/00057RY10R.png)

---

@435x-1158 | created:1775254769 | updated:1775254769 | relates: sequence>@436x-1162, alternate>@437x-1158, alternate>@437x-1166, alternate>@435x-1166
## Approach: Rnav (Gps) Y Rwy 28L

**Airport:** KBOI — Boise Airport / Gowen Field  
**Position:** 43.500°N 115.830°W (estimated) — IAF east of airport, RWY 28L (south parallel), ~17 nm  
**Chart code:** IAP  
**FAA PDF:** `00057RY28L.PDF`  
**d-TPP cycle:** 2604  
**Source:** public domain, [aeronav.faa.gov](https://aeronav.faa.gov/d-tpp/2604/00057RY28L.PDF)  

![RNAV (GPS) Y RWY 28L](boi_plates/images/00057RY28L.png)

---

@440x-1164 | created:1775254769 | updated:1775254769 | relates: sequence>@437x-1158, sequence>@437x-1166, sequence>@435x-1166, sequence>@435x-1158, alternate>@433x-1157, alternate>@442x-1159, alternate>@438x-1166, alternate>@428x-1166
## STAR: Bewte Four

**Airport:** KBOI — Boise Airport / Gowen Field  
**Position:** 44.008°N 116.431°W — Confirmed via OpenNav. NNW of KBOI, ~26 nm N, ~9 nm W.  
**Chart code:** STAR  
**FAA PDF:** `00057BEWTE.PDF`  
**d-TPP cycle:** 2604  
**Source:** public domain, [aeronav.faa.gov](https://aeronav.faa.gov/d-tpp/2604/00057BEWTE.PDF)  

![BEWTE FOUR](boi_plates/images/00057BEWTE.png)

---

@433x-1157 | created:1775254769 | updated:1775254769 | relates: sequence>@437x-1158, sequence>@437x-1166, sequence>@435x-1166, sequence>@435x-1158, alternate>@440x-1164, alternate>@442x-1159, alternate>@438x-1166, alternate>@428x-1166
## STAR: Spuud Four

**Airport:** KBOI — Boise Airport / Gowen Field  
**Position:** 43.274°N 115.678°W — Confirmed via OpenNav. SE of KBOI, ~17 nm S, ~23 nm E.  
**Chart code:** STAR  
**FAA PDF:** `00057SPUUD.PDF`  
**d-TPP cycle:** 2604  
**Source:** public domain, [aeronav.faa.gov](https://aeronav.faa.gov/d-tpp/2604/00057SPUUD.PDF)  

![SPUUD FOUR](boi_plates/images/00057SPUUD.png)

---

@442x-1159 | created:1775254769 | updated:1775254769 | relates: sequence>@437x-1158, sequence>@437x-1166, sequence>@435x-1166, sequence>@435x-1158, alternate>@440x-1164, alternate>@433x-1157, alternate>@438x-1166, alternate>@428x-1166
## STAR: Kourt Four

**Airport:** KBOI — Boise Airport / Gowen Field  
**Position:** 44.200°N 115.900°W (estimated) — Estimated NNE of KBOI. Not in public fix databases.  
**Chart code:** STAR  
**FAA PDF:** `00057KOURT.PDF`  
**d-TPP cycle:** 2604  
**Source:** public domain, [aeronav.faa.gov](https://aeronav.faa.gov/d-tpp/2604/00057KOURT.PDF)  

![KOURT FOUR](boi_plates/images/00057KOURT.png)

---

@438x-1166 | created:1775254769 | updated:1775254769 | relates: sequence>@437x-1158, sequence>@437x-1166, sequence>@435x-1166, sequence>@435x-1158, alternate>@440x-1164, alternate>@433x-1157, alternate>@442x-1159, alternate>@428x-1166
## STAR: Kyaan Four

**Airport:** KBOI — Boise Airport / Gowen Field  
**Position:** 43.830°N 116.645°W — Confirmed via OpenNav. WNW of KBOI, ~16 nm N, ~18 nm W.  
**Chart code:** STAR  
**FAA PDF:** `00057KYAAN.PDF`  
**d-TPP cycle:** 2604  
**Source:** public domain, [aeronav.faa.gov](https://aeronav.faa.gov/d-tpp/2604/00057KYAAN.PDF)  

![KYAAN FOUR](boi_plates/images/00057KYAAN.png)

---

@428x-1166 | created:1775254769 | updated:1775254769 | relates: sequence>@437x-1158, sequence>@437x-1166, sequence>@435x-1166, sequence>@435x-1158, alternate>@440x-1164, alternate>@433x-1157, alternate>@442x-1159, alternate>@438x-1166
## STAR: Sadyl Four

**Airport:** KBOI — Boise Airport / Gowen Field  
**Position:** 42.800°N 116.600°W (estimated) — Estimated SSW of KBOI. Not in public fix databases.  
**Chart code:** STAR  
**FAA PDF:** `00057SADYL.PDF`  
**d-TPP cycle:** 2604  
**Source:** public domain, [aeronav.faa.gov](https://aeronav.faa.gov/d-tpp/2604/00057SADYL.PDF)  

![SADYL FOUR](boi_plates/images/00057SADYL.png)

---
