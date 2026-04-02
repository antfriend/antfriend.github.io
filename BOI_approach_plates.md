# BOI Approach Plates — TTDB

```mmpdb
db_id: kboi_approach_plates_2604
db_name: "Boise Airport (KBOI) Approach Plates — FAA d-TPP Cycle 2604"
coord_increment: 0.1
collision_policy: southeast_step
timestamp_kind: unix
umwelt:
  umwelt_id: boi_nav
  role: approach_navigator
  perspective: pilot_inbound
  scope: terminal_area_kboi
  constraints: [FAA_public_domain, cycle_2604]
  globe:
    frame: geographic_decimal
    origin: kboi_airport_reference_point
    mapping: real_lat_lon_at_0.1deg_steps
    note: >
      IDs encode real-world decimal degrees at 0.1° resolution.
      @LATxLON where LAT = round(lat/0.1), LON = round(lon/0.1).
      1 LAT step ≈ 11.1 km. 1 LON step ≈ 8.0 km at 43.5°N.
      Approaches placed at IAF positions on extended runway centerlines (~17 nm out).
      STARs placed at confirmed or estimated entry fix positions.
      BEWTE/SPUUD/KYAAN positions confirmed via OpenNav. KOURT/SADYL estimated.
cursor_policy:
  max_preview_chars: 300
  max_nodes: 20
typed_edges:
  enabled: true
  syntax: "<type>@<TARGET_ID>"
  note: "sequence=next in flight flow; alternate=parallel option; references=back-link to approach"
librarian:
  enabled: true
  primitive_queries: [NEXT, PREV, ALT, LIST, SHOW]
  max_reply_chars: 400
  invocation_prefix: "LIB>"
```

```cursor
selected:
- @428x-1166
preview: {}
agent_note: "KBOI plate graph. Navigate: pick a STAR → sequence to approach → sequence to airport diagram. Query with NEXT/ALT/LIST."
dot: ""
last_query: ""
last_answer: ""
answer_records: []
```

---

@436x-1162 | created:1775165626 | updated:1775165626 | relates: references>@437x-1158, references>@435x-1158, references>@437x-1166, references>@435x-1166
## Airport Diagram: Airport Diagram

**Airport:** KBOI — Boise Airport / Gowen Field  
**Position:** 43.5644°N 116.2228°W (airport reference point)  
**Chart code:** APD  
**FAA PDF:** `00057AD.PDF`  
**d-TPP cycle:** 2604  
**Source:** public domain, [aeronav.faa.gov](https://aeronav.faa.gov/d-tpp/2604/00057AD.PDF)  

![AIRPORT DIAGRAM](boi_plates/images/00057AD.png)

---

@437x-1158 | created:1775165626 | updated:1775165626 | relates: sequence>@436x-1162, alternate>@435x-1158, alternate>@437x-1166, alternate>@435x-1166
## Approach: ILS Or LOC RWY 28R

**Airport:** KBOI — Boise Airport / Gowen Field  
**Position:** ~43.7°N 115.8°W — IAF east of airport on RWY 28R extended centerline (north parallel runway)  
**Chart code:** IAP  
**FAA PDF:** `00057IL28R.PDF`  
**d-TPP cycle:** 2604  
**Source:** public domain, [aeronav.faa.gov](https://aeronav.faa.gov/d-tpp/2604/00057IL28R.PDF)  

![ILS OR LOC RWY 28R](boi_plates/images/00057IL28R.png)

---

@435x-1158 | created:1775165626 | updated:1775165626 | relates: sequence>@436x-1162, alternate>@437x-1158, alternate>@437x-1166, alternate>@435x-1166
## Approach: RNAV (GPS) Y RWY 28L

**Airport:** KBOI — Boise Airport / Gowen Field  
**Position:** ~43.5°N 115.8°W — IAF east of airport on RWY 28L extended centerline (south parallel runway)  
**Chart code:** IAP  
**FAA PDF:** `00057RY28L.PDF`  
**d-TPP cycle:** 2604  
**Source:** public domain, [aeronav.faa.gov](https://aeronav.faa.gov/d-tpp/2604/00057RY28L.PDF)  

![RNAV (GPS) Y RWY 28L](boi_plates/images/00057RY28L.png)

---

@437x-1166 | created:1775165626 | updated:1775165626 | relates: sequence>@436x-1162, alternate>@437x-1158, alternate>@435x-1158, alternate>@435x-1166
## Approach: RNAV (GPS) Y RWY 10L

**Airport:** KBOI — Boise Airport / Gowen Field  
**Position:** ~43.7°N 116.6°W — IAF west of airport on RWY 10L extended centerline (north parallel runway)  
**Chart code:** IAP  
**FAA PDF:** `00057RY10L.PDF`  
**d-TPP cycle:** 2604  
**Source:** public domain, [aeronav.faa.gov](https://aeronav.faa.gov/d-tpp/2604/00057RY10L.PDF)  

![RNAV (GPS) Y RWY 10L](boi_plates/images/00057RY10L.png)

---

@435x-1166 | created:1775165626 | updated:1775165626 | relates: sequence>@436x-1162, alternate>@437x-1158, alternate>@435x-1158, alternate>@437x-1166
## Approach: RNAV (GPS) Y RWY 10R

**Airport:** KBOI — Boise Airport / Gowen Field  
**Position:** ~43.5°N 116.6°W — IAF west of airport on RWY 10R extended centerline (south parallel runway)  
**Chart code:** IAP  
**FAA PDF:** `00057RY10R.PDF`  
**d-TPP cycle:** 2604  
**Source:** public domain, [aeronav.faa.gov](https://aeronav.faa.gov/d-tpp/2604/00057RY10R.PDF)  

![RNAV (GPS) Y RWY 10R](boi_plates/images/00057RY10R.png)

---

@440x-1164 | created:1775165626 | updated:1775165626 | relates: sequence>@437x-1158, sequence>@435x-1158, sequence>@437x-1166, sequence>@435x-1166, alternate>@433x-1157, alternate>@442x-1159, alternate>@438x-1166, alternate>@428x-1166
## STAR: BEWTE Four

**Airport:** KBOI — Boise Airport / Gowen Field  
**Position:** 44.008°N 116.431°W — confirmed (OpenNav). NNW of KBOI, ~26 nm north, ~9 nm west.  
**Chart code:** STAR  
**FAA PDF:** `00057BEWTE.PDF`  
**d-TPP cycle:** 2604  
**Source:** public domain, [aeronav.faa.gov](https://aeronav.faa.gov/d-tpp/2604/00057BEWTE.PDF)  

![BEWTE FOUR](boi_plates/images/00057BEWTE.png)

---

@433x-1157 | created:1775165626 | updated:1775165626 | relates: sequence>@437x-1158, sequence>@435x-1158, sequence>@437x-1166, sequence>@435x-1166, alternate>@440x-1164, alternate>@442x-1159, alternate>@438x-1166, alternate>@428x-1166
## STAR: SPUUD Four

**Airport:** KBOI — Boise Airport / Gowen Field  
**Position:** 43.274°N 115.678°W — confirmed (OpenNav). SE of KBOI, ~17 nm south, ~23 nm east.  
**Chart code:** STAR  
**FAA PDF:** `00057SPUUD.PDF`  
**d-TPP cycle:** 2604  
**Source:** public domain, [aeronav.faa.gov](https://aeronav.faa.gov/d-tpp/2604/00057SPUUD.PDF)  

![SPUUD FOUR](boi_plates/images/00057SPUUD.png)

---

@442x-1159 | created:1775165626 | updated:1775165626 | relates: sequence>@437x-1158, sequence>@435x-1158, sequence>@437x-1166, sequence>@435x-1166, alternate>@440x-1164, alternate>@433x-1157, alternate>@438x-1166, alternate>@428x-1166
## STAR: KOURT Four

**Airport:** KBOI — Boise Airport / Gowen Field  
**Position:** ~44.2°N 115.9°W — estimated NNE of KBOI. Exact fix coordinates not in public databases; position estimated from STAR chart geometry.  
**Chart code:** STAR  
**FAA PDF:** `00057KOURT.PDF`  
**d-TPP cycle:** 2604  
**Source:** public domain, [aeronav.faa.gov](https://aeronav.faa.gov/d-tpp/2604/00057KOURT.PDF)  

![KOURT FOUR](boi_plates/images/00057KOURT.png)

---

@438x-1166 | created:1775165626 | updated:1775165626 | relates: sequence>@437x-1158, sequence>@435x-1158, sequence>@437x-1166, sequence>@435x-1166, alternate>@440x-1164, alternate>@433x-1157, alternate>@442x-1159, alternate>@428x-1166
## STAR: KYAAN Four

**Airport:** KBOI — Boise Airport / Gowen Field  
**Position:** 43.830°N 116.645°W — confirmed (OpenNav). WNW of KBOI, ~16 nm north, ~18 nm west.  
**Chart code:** STAR  
**FAA PDF:** `00057KYAAN.PDF`  
**d-TPP cycle:** 2604  
**Source:** public domain, [aeronav.faa.gov](https://aeronav.faa.gov/d-tpp/2604/00057KYAAN.PDF)  

![KYAAN FOUR](boi_plates/images/00057KYAAN.png)

---

@428x-1166 | created:1775165626 | updated:1775165626 | relates: sequence>@437x-1158, sequence>@435x-1158, sequence>@437x-1166, sequence>@435x-1166, alternate>@440x-1164, alternate>@433x-1157, alternate>@442x-1159, alternate>@438x-1166
## STAR: SADYL Four

**Airport:** KBOI — Boise Airport / Gowen Field  
**Position:** ~42.8°N 116.6°W — estimated SSW of KBOI. Exact fix coordinates not in public databases; position estimated from STAR chart geometry.  
**Chart code:** STAR  
**FAA PDF:** `00057SADYL.PDF`  
**d-TPP cycle:** 2604  
**Source:** public domain, [aeronav.faa.gov](https://aeronav.faa.gov/d-tpp/2604/00057SADYL.PDF)  

![SADYL FOUR](boi_plates/images/00057SADYL.png)

---
