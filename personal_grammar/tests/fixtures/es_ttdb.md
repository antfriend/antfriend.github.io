# Fixture — a Spanish grammar on the same runtime

```mmpdb
db_id: personal-grammar-es-fixture
db_name: Spanish fixture (tests only)
coord_increment:
  lat: 1
  lon: 1
collision_policy: southeast_step
timestamp_kind: unix
umwelt:
  umwelt_id: fixture-es
  role: librarian
  perspective: a test that the runtime holds no English
  scope: four sentences
  globe:
    frame: grammar-sphere
    origin: "@LAT0LON0"
    mapping: "as personal_grammar_ttdb.md"
cursor_policy:
  max_preview_chars: 256
  max_nodes: 64
typed_edges:
  enabled: true
  syntax: "type@LATxLONy"
librarian:
  enabled: true
  primitive_queries: []
  max_reply_chars: 480
```

```cursor
selected:
  - "@LAT0LON0"
preview:
  "@LAT0LON0": "yo"
agent_note: "fixture"
last_query: ""
last_answer: ""
answer_records: []
```

---

@LAT0LON0 | created:1789257600 | updated:1789257600 | relates:

**yo**

```ttdb-sphere
thing_lon: 5 175
vector_lon: -175 -5
term_lat: -60 60
adjacent: 0.5 3
step: 0.1
episode_lane: 90
self_lemma: yo
```

```ttdb-term
class: thing
lemma: yo
forms: yo
seen: 0
asked: 0
```

---

@LAT-10LON0 | created:1789257600 | updated:1789257600 | relates:

**Gramática — léxico**

```ttdb-grammar
kind: lexicon
lang: es
class: det | el la los las un una unos unas
class: poss | su sus tu tus
class: quant_all | todos todas cada
class: quant_some | algunos algunas muchos muchas
class: quant_none | ningún ninguna
class: self | yo me mi mí
class: anaphor | él ella ellos ellas
class: prep | en de a con por para sobre sin
class: conj | y o pero
class: subord | porque cuando si aunque
class: aux | suele
class: cop | es son soy eres somos está están estoy era eran ser
class: hav | tiene tienen tengo tenemos
class: modal | puede pueden puedo debe deben
class: neg | no nunca nada
class: wh | qué quién quiénes dónde cuándo
class: adverb | muy también siempre ya
sentence_end: . ! ?
clause_break: ; :
question_mark: ?
list_sep: ,
generic_det: un una
```

---

@LAT-20LON0 | created:1789257600 | updated:1789257600 | relates:

**Gramática — morfología**

```ttdb-grammar
kind: morphology
noun_keep: lunes crisis
plural: ones | ón
plural: es | -
plural: s | -
plural_guard: ss
verb: en | er | ar ir
verb: an | ar
verb: o | er | ar ir
verb: e | er | ar ir
verb: a | ar
verb_guard: ss
progressive_ending: ndo
participle_ending: ado
double_keep: l r
min_stem: 2
```

---

@LAT-30LON0 | created:1789257600 | updated:1789257600 | relates:

**Gramática — verbos semilla**

```ttdb-grammar
kind: seed
seed: comer beber cazar dormir nadar volar amar vivir
```

---

@LAT-40LON0 | created:1789257600 | updated:1789257600 | relates:

**Gramática — álgebra**

```ttdb-grammar
kind: vectors
role: class_of | es_un
role: property | es
role: possession | tiene
role: comention | con
role: episode_edge | percibe
role: negation_prefix | no_
role: phrasal_join | _
vector: es_un | transitive | - | es un
vector: es | - | - | es
vector: tiene | - | - | tiene
vector: con | symmetric weak | - | aparece con
inherits: es_un
```

---

@LAT-50LON0 | created:1789257600 | updated:1789257600 | relates:

**Gramática — preguntas**

```ttdb-grammar
kind: questions
wh_thing: qué quién quiénes
wh_place: dónde | en
about: háblame describe sobre
describe_max_words: 2
```

---

@LAT-60LON0 | created:1789257600 | updated:1789257600 | relates:

**Gramática — respuestas**

```ttdb-grammar
kind: responses
label_said: dijiste
label_inferred: inferido, no dicho
label_contested: dijiste ambas cosas
affirm: Sí.
deny: No.
affirm_inferred: Probablemente — se sigue de lo que dijiste.
deny_inferred: Probablemente no — se sigue de lo que dijiste.
contest: Tus palabras no están de acuerdo.
unknown: Tus palabras todavía no llegan a eso.
noted: Anotado: {percepts} de {sentences}.
noted_nothing: Guardado, pero sin percepción.
episode_title: Episodio {n} — {source}
source_typed: escrito
no_purchase: Sin agarre: {words}.
unit_percept: percepción | percepciones
unit_sentence: frase | frases
```

---

@LAT-70LON0 | created:1789257600 | updated:1789257600 | relates:

**Gramática — números**

```ttdb-grammar
kind: numbers
prior_for: 1
prior_against: 1
weight_partial: 0.5
belief_conf_threshold: 128
inherit_decay: 0.85
max_hops: 4
answer_max_items: 6
search_max_items: 5
suggest_eps_min: 40
with_max_pairs: 3
said_max_chars: 400
```

---

@LAT98LON1 | created:1789257600 | updated:1789257600 | relates:

**tail**
