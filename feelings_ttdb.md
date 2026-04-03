# Feelings TTDB
An affective landscape mapped as a TTDB: feelings, emotions, dispositions, and intents arranged around an umwelt at the origin. Positive associations extend northeast; negative associations extend southwest. Intensity increases with distance from the umwelt.

```mmpdb
db_id: ttdb:affective:landscape:v1
db_name: "Feelings"
coord_increment:
  lat: 1
  lon: 1
collision_policy: southeast_step
timestamp_kind: unix_utc
umwelt:
  umwelt_id: umwelt:affective:experiencer:v1
  role: affective_experiencer
  perspective: "A conscious subject at the origin, perceiving the affective field around it."
  scope: "All feelings, emotions, dispositions, and intents as they arise in relation to the experiencer."
  constraints:
    - "Feelings and emotions arise in the experiencer and relate toward it."
    - "Dispositions and intents originate from the experiencer and extend outward."
    - "Positive valence extends northeast; negative valence extends southwest."
    - "Intensity increases with distance from the origin."
    - "No affect exists outside the umwelt's subjectivity."
  globe:
    frame: "affective_field"
    origin: "The experiencer — the subject whose affective life is mapped."
    mapping: "Latitude = valence (N = positive, S = negative). Longitude = object of affect (E = other-directed, W = self-directed). NE = positive + other-directed; NW = positive + self-directed; SE = negative + other-directed; SW = negative + self-directed. Distance from origin = intensity."
    note: "This is not a physical map. It is a subjective topology of inner experience. The NE–SW diagonal carries other-directed states; the NW–SE diagonal carries self-directed states."
cursor_policy:
  max_preview_chars: 280
  max_nodes: 40
typed_edges:
  enabled: true
  syntax: "type>@TARGET_ID"
  note: "Feelings and emotions carry 'feels>' or 'emotes>' edges directed at the umwelt. Dispositions and intents carry 'disposed_toward>' and 'intends>' edges directed out from the umwelt."
librarian:
  enabled: true
  primitive_queries:
    - "SELECT <record_id>"
    - "FIND <token>"
    - "EDGES <record_id>"
    - "LAST <n>"
    - "STATUS"
  max_reply_chars: 260
  invocation_prefix: "@AI"
```

```cursor
selected:
  - @LAT0LON0
preview:
  @LAT0LON0: "The experiencer at the origin. Dispositions and intents radiate outward from here; feelings and emotions flow inward toward here."
  @LAT1LON1: "Serenity — a mild, quiet ease. A positive feeling, near."
  @LAT-1LON-1: "Unease — a faint disquiet beneath the surface. A negative feeling, near."
agent_note: "Affective field map. Lat = valence (N=positive, S=negative). Lon = object of affect (E=other-directed, W=self-directed). NE = positive+other; NW = positive+self; SE = negative+other; SW = negative+self. Distance = intensity. Feelings/emotions relate TO the umwelt; dispositions/intents relate FROM the umwelt."
dot: |
  digraph Affective {
    rankdir=LR;
    "@LAT0LON0" -> "@LAT2LON3" [label="disposed_toward"];
    "@LAT0LON0" -> "@LAT3LON4" [label="disposed_toward"];
    "@LAT0LON0" -> "@LAT-3LON4" [label="disposed_toward"];
    "@LAT0LON0" -> "@LAT-4LON2" [label="disposed_toward"];
    "@LAT0LON0" -> "@LAT4LON1" [label="intends"];
    "@LAT0LON0" -> "@LAT-4LON-1" [label="intends"];
    "@LAT3LON3" -> "@LAT0LON0" [label="feels"];
    "@LAT-3LON-3" -> "@LAT0LON0" [label="feels"];
    "@LAT4LON3" -> "@LAT0LON0" [label="emotes"];
    "@LAT-4LON3" -> "@LAT0LON0" [label="emotes"];
  }
last_query: null
last_answer: null
answer_records: []
```

---

@LAT0LON0 | created:1775260800 | updated:1775260800 | relates:disposed_toward>@LAT2LON3,disposed_toward>@LAT1LON4,disposed_toward>@LAT3LON4,disposed_toward>@LAT4LON2,disposed_toward>@LAT-2LON-3,disposed_toward>@LAT-1LON-4,disposed_toward>@LAT-3LON4,disposed_toward>@LAT-4LON2,disposed_toward>@LAT1LON-3,disposed_toward>@LAT3LON-2,disposed_toward>@LAT-4LON-3,intends>@LAT3LON1,intends>@LAT4LON1,intends>@LAT2LON4,intends>@LAT-3LON-1,intends>@LAT-4LON-1,intends>@LAT-2LON-4

## Umwelt — The Experiencing Subject

The subject at the origin. All feelings and emotions arise *in* this subject and point back toward it. All dispositions and intents arise *from* this subject and extend outward across the affective field.

- Feelings and emotions flow **inward**: they relate *to* the umwelt.
- Dispositions and intents flow **outward**: they relate *from* the umwelt.
- Northeast: positive, welcoming, expansive.
- Southwest: negative, contracting, aversive.
- Distance from origin encodes intensity.

---

@LAT1LON-1 | created:1775260800 | updated:1775260800 | relates:feels>@LAT0LON0,resonates_with>@LAT1LON2,can_deepen_into>@LAT2LON-1

## Serenity

*A mild, quiet ease settling over the experiencer.*

A feeling of calm without effort — the absence of agitation. Serenity is close to the umwelt because it asks little of the subject; it simply rests here, undemanding.

- **Valence:** Positive
- **Category:** Feeling
- **Intensity:** Mild (L1)

---

@LAT2LON-1 | created:1775260800 | updated:1775260800 | relates:feels>@LAT0LON0,resonates_with>@LAT1LON-1,can_deepen_into>@LAT3LON3

## Contentment

*A low hum of satisfaction. Things are sufficient; nothing is missing.*

Contentment is a feeling of gentle fullness — not excitement, not striving. It sits close to the origin because it is not urgent or consuming. It deepens, given time, into joy.

- **Valence:** Positive
- **Category:** Feeling
- **Intensity:** Mild-Moderate (L2)

---

@LAT1LON2 | created:1775260800 | updated:1775260800 | relates:feels>@LAT0LON0,resonates_with>@LAT1LON1,opens_toward>@LAT1LON4

## Gratitude

*A warmth directed outward — a felt acknowledgment of receiving.*

Gratitude is a feeling oriented toward something or someone beyond the self. It reaches slightly eastward while still relating back to the umwelt. It opens naturally toward curiosity and the disposition to give.

- **Valence:** Positive
- **Category:** Feeling
- **Intensity:** Mild-Moderate (L2)

---

@LAT3LON3 | created:1775260800 | updated:1775260800 | relates:feels>@LAT0LON0,intensifies_into>@LAT4LON-4,resonates_with>@LAT3LON2

## Joy

*A bright, expansive aliveness — a feeling that takes up space.*

Joy is more consuming than contentment. It rises, fills the chest, pulls at the face. It sits farther from the umwelt because its pull is strong — it reorganizes the subject around delight.

- **Valence:** Positive
- **Category:** Feeling
- **Intensity:** Intense (L3)

---

@LAT4LON-4 | created:1775260800 | updated:1775260800 | relates:feels>@LAT0LON0,intensified_from>@LAT3LON3,resonates_with>@LAT4LON3

## Bliss

*An overwhelming sense of rightness and completeness — the self dissolves into the moment.*

Bliss is the furthest positive feeling. It threatens the ordinary boundaries of the self. Distance from the umwelt is maximal because bliss consumes ordinary awareness — the experiencer is nearly undone by its own fullness.

- **Valence:** Positive
- **Category:** Feeling
- **Intensity:** Very Intense (L4)

---

@LAT-1LON-1 | created:1775260800 | updated:1775260800 | relates:feels>@LAT0LON0,resonates_with>@LAT-1LON-2,can_deepen_into>@LAT-2LON-1

## Unease

*A faint disquiet — nothing named, nothing fixed, but something not quite right.*

Unease is the mildest negative feeling. It lives near the umwelt because it has not yet taken form, not yet crystallized into a defined emotion. It is the texture of a world that feels slightly off.

- **Valence:** Negative
- **Category:** Feeling
- **Intensity:** Mild (L1)

---

@LAT-2LON-1 | created:1775260800 | updated:1775260800 | relates:feels>@LAT0LON0,resonates_with>@LAT-1LON-1,can_deepen_into>@LAT-3LON-3

## Sadness

*A heaviness that settles in. The weight of loss or longing.*

Sadness is quiet but present. It pulls slightly inward but does not yet overwhelm the umwelt's coherence. It is the honest acknowledgment that something cherished is gone or missing.

- **Valence:** Negative
- **Category:** Feeling
- **Intensity:** Mild-Moderate (L2)

---

@LAT-1LON-2 | created:1775260800 | updated:1775260800 | relates:feels>@LAT0LON0,resonates_with>@LAT-2LON-1

## Melancholy

*A wistful ache — beauty and sorrow woven together.*

Melancholy is not pure grief. It carries a strange tenderness. It lingers near the umwelt, threading through memory and longing. Neither fully painful nor fully sweet.

- **Valence:** Negative
- **Category:** Feeling
- **Intensity:** Mild-Moderate (L2)

---

@LAT-3LON-3 | created:1775260800 | updated:1775260800 | relates:feels>@LAT0LON0,intensifies_into>@LAT-4LON-4,resonates_with>@LAT-3LON2

## Grief

*A shattering. The felt reality of irreversible loss.*

Grief tears at the structure of the self. It sits far from the umwelt because its gravity is large — it reorganizes the experiencer around an absence. The world is different now. That difference is felt.

- **Valence:** Negative
- **Category:** Feeling
- **Intensity:** Intense (L3)

---

@LAT-4LON-4 | created:1775260800 | updated:1775260800 | relates:feels>@LAT0LON0,intensified_from>@LAT-3LON-3,resonates_with>@LAT-4LON3

## Despair

*The collapse of forward motion. A felt certainty that nothing will improve.*

Despair is the furthest negative feeling. It does not simply weigh on the umwelt — it threatens to extinguish it. At maximum distance, it marks the edge of affective coherence. The experiencer can barely be said to experience: it is being unmade.

- **Valence:** Negative
- **Category:** Feeling
- **Intensity:** Very Intense (L4)

---

@LAT1LON3 | created:1775260800 | updated:1775260800 | relates:emotes>@LAT0LON0,can_become>@LAT2LON2

## Relief

*The body releasing what it was bracing against. A breath let out.*

Relief is an emotion triggered by the removal of threat or burden. Positive and relatively close to the umwelt — it is defined by contrast with what preceded it. It reaches outward in longitude because it is reactive, object-directed.

- **Valence:** Positive
- **Category:** Emotion
- **Intensity:** Mild-Moderate (L2)

---

@LAT2LON2 | created:1775260800 | updated:1775260800 | relates:emotes>@LAT0LON0,can_become>@LAT3LON2,resonates_with>@LAT1LON3

## Hope

*A forward-leaning anticipation. The felt possibility of something better.*

Hope is an emotion oriented toward a possible future. It sustains the experiencer through difficulty. Moderate intensity — strong enough to motivate, not so overwhelming as to consume. It reaches diagonally: ascending and outward.

- **Valence:** Positive
- **Category:** Emotion
- **Intensity:** Moderate (L2)

---

@LAT3LON2 | created:1775260800 | updated:1775260800 | relates:emotes>@LAT0LON0,resonates_with>@LAT3LON3,can_become>@LAT4LON3

## Excitement

*An energized readiness — the world opening up.*

Excitement is high-energy positive arousal. The experiencer leans toward what is coming. Its intensity is large enough to press outward from the umwelt — it is hard to contain, demanding expression.

- **Valence:** Positive
- **Category:** Emotion
- **Intensity:** Intense (L3)

---

@LAT4LON3 | created:1775260800 | updated:1775260800 | relates:emotes>@LAT0LON0,resonates_with>@LAT4LON-4

## Ecstasy

*A rupture of ordinary experience into transport — the self overfull.*

Ecstasy is the most intense positive emotion. The boundaries of normal experience dissolve. Farthest from the umwelt's stable center because it is destabilizing, even in its positivity — the experiencer is overtaken by what it feels.

- **Valence:** Positive
- **Category:** Emotion
- **Intensity:** Very Intense (L4)

---

@LAT-1LON-3 | created:1775260800 | updated:1775260800 | relates:emotes>@LAT0LON0,can_become>@LAT-2LON2

## Disappointment

*The felt gap between what was expected and what arrived.*

Disappointment is mild negative emotion — a closing rather than a crisis. Near the umwelt because it is localized, tied to a specific unmet expectation. It extends westward because it is object-directed: something out there failed to be what the experiencer needed.

- **Valence:** Negative
- **Category:** Emotion
- **Intensity:** Mild-Moderate (L2)

---

@LAT-2LON2 | created:1775260800 | updated:1775260800 | relates:emotes>@LAT0LON0,can_become>@LAT-3LON2,resonates_with>@LAT-1LON-3

## Frustration

*A blocked force — energy with nowhere to go.*

Frustration arises when action is impeded. It carries an arousal that cannot discharge, building pressure. Moderate distance reflects its growing urgency. It is not yet fear, not yet rage — but it is moving in that direction.

- **Valence:** Negative
- **Category:** Emotion
- **Intensity:** Moderate (L2)

---

@LAT-3LON2 | created:1775260800 | updated:1775260800 | relates:emotes>@LAT0LON0,resonates_with>@LAT-3LON-3,can_become>@LAT-4LON3

## Fear

*The body preparing for threat. A sharp contraction of possibility.*

Fear is a high-intensity negative emotion — a primal organizing response. Far from the umwelt because it hijacks attention and reconfigures the experiencer's entire field. In fear, nothing else is real except the threat.

- **Valence:** Negative
- **Category:** Emotion
- **Intensity:** Intense (L3)

---

@LAT-4LON3 | created:1775260800 | updated:1775260800 | relates:emotes>@LAT0LON0,resonates_with>@LAT-4LON-4

## Rage

*A consuming fire. Boundaries violated; the self demands redress.*

Rage is the most intense negative emotion in the field. It threatens to overwhelm the umwelt's capacity for coherent response. At maximum distance, it is barely within the subject's integration — it is force seeking an outlet.

- **Valence:** Negative
- **Category:** Emotion
- **Intensity:** Very Intense (L4)

---

@LAT2LON3 | created:1775260800 | updated:1775260800 | relates:is_disposition_of>@LAT0LON0,enables>@LAT3LON1,resonates_with>@LAT1LON4

## Openness

*A readiness to receive what comes — without premature judgment.*

Openness is a disposition radiating from the umwelt. The experiencer leans toward the world without demanding it be a particular way. Moderate distance: present and active, not extreme. It enables exploration.

- **Valence:** Positive
- **Category:** Disposition
- **Intensity:** Moderate (L2)

---

@LAT1LON4 | created:1775260800 | updated:1775260800 | relates:is_disposition_of>@LAT0LON0,enables>@LAT3LON1,resonates_with>@LAT2LON3

## Curiosity

*A forward lean toward the unknown — a pull without demand.*

Curiosity reaches outward more than it ascends: the longitude is extended, pointing toward what is not yet known. It enables exploration and is sustained by openness. Close enough to the umwelt to feel like a natural orientation, not an effort.

- **Valence:** Positive
- **Category:** Disposition
- **Intensity:** Moderate (L2–L3)

---

@LAT3LON4 | created:1775260800 | updated:1775260800 | relates:is_disposition_of>@LAT0LON0,enables>@LAT2LON4,resonates_with>@LAT4LON2

## Compassion

*A felt orientation toward the suffering of another — moved to care.*

Compassion is a strong disposition: it requires real capacity from the experiencer. Its distance from the umwelt reflects the effort and vulnerability involved in genuine care. It enables the intent to nurture.

- **Valence:** Positive
- **Category:** Disposition
- **Intensity:** Intense (L3–L4)

---

@LAT4LON2 | created:1775260800 | updated:1775260800 | relates:is_disposition_of>@LAT0LON0,resonates_with>@LAT3LON4,enables>@LAT4LON1

## Generosity

*A willingness to give beyond what is required.*

Generosity is an expansive disposition — it asks the umwelt to extend itself materially or relationally. High latitude reflects its moral aspiration; high distance reflects the genuine cost. It enables the intent to connect.

- **Valence:** Positive
- **Category:** Disposition
- **Intensity:** Intense (L3–L4)

---

@LAT-2LON-3 | created:1775260800 | updated:1775260800 | relates:is_disposition_of>@LAT0LON0,can_intensify_into>@LAT-3LON-4,resonates_with>@LAT-1LON-4

## Suspicion

*A vigilance turned inward — reading the world for hidden threat.*

Suspicion is a moderate negative disposition. The experiencer defaults to wariness. It contracts slightly rather than expanding. Functional in small doses; corrosive when it becomes the default frame.

- **Valence:** Negative
- **Category:** Disposition
- **Intensity:** Moderate (L2)

---

@LAT-1LON-4 | created:1775260800 | updated:1775260800 | relates:is_disposition_of>@LAT0LON0,resonates_with>@LAT-2LON-3,enables>@LAT-2LON-4

## Indifference

*An absence of orientation — the world does not call to the experiencer.*

Indifference extends far in longitude away from the self — the experiencer simply does not reach toward things. Low in latitude: it does not descend violently, it simply flattens. A deadening, not a crisis. It enables withdrawal.

- **Valence:** Negative
- **Category:** Disposition
- **Intensity:** Moderate (L2–L3)

---

@LAT-3LON4 | created:1775260800 | updated:1775260800 | relates:is_disposition_of>@LAT0LON0,enables>@LAT-4LON-1,resonates_with>@LAT-4LON3

## Hostility

*A hardened readiness against the world — perceiving threat as default.*

Hostility is a strong negative disposition. The experiencer has closed off; the world is adversarial. Its intensity distorts perception and contracts the range of possible response. It enables the intent to harm.

- **Valence:** Negative
- **Category:** Disposition
- **Intensity:** Intense (L3–L4)

---

@LAT-4LON2 | created:1775260800 | updated:1775260800 | relates:is_disposition_of>@LAT0LON0,resonates_with>@LAT-3LON4,enables>@LAT-4LON-1

## Contempt

*A downward evaluation — others are beneath consideration.*

Contempt is a high-intensity negative disposition. The self rises not toward aspiration but toward dismissal. Far from the umwelt because it severs the relational fabric entirely — it is the disposition that most completely closes the experiencer off from the world.

- **Valence:** Negative
- **Category:** Disposition
- **Intensity:** Very Intense (L4)

---

@LAT3LON1 | created:1775260800 | updated:1775260800 | relates:is_intent_of>@LAT0LON0,enabled_by>@LAT1LON4,enabled_by>@LAT2LON3

## To Explore

*A directed reaching outward — the experiencer moves toward the unknown.*

Exploration is a moderately intense positive intent. It arises from curiosity and openness and extends northward — toward new territory. More decisive than a disposition: the experiencer has chosen to move.

- **Valence:** Positive
- **Category:** Intent
- **Intensity:** Moderate-Intense (L3)

---

@LAT4LON1 | created:1775260800 | updated:1775260800 | relates:is_intent_of>@LAT0LON0,enabled_by>@LAT4LON2,resonates_with>@LAT2LON4

## To Connect

*A reaching toward another — the will to close distance between selves.*

Connection is a highly intense positive intent. It extends far from the umwelt because it requires genuine risk. The experiencer offers itself to another. High latitude, ascending: this is the most elevated positive intent.

- **Valence:** Positive
- **Category:** Intent
- **Intensity:** Intense (L4)

---

@LAT2LON4 | created:1775260800 | updated:1775260800 | relates:is_intent_of>@LAT0LON0,enabled_by>@LAT3LON4,resonates_with>@LAT4LON1

## To Nurture

*A sustained will to tend to what is growing or vulnerable.*

Nurturing extends outward in longitude — the experiencer orients toward something other than itself, sustaining it over time. Enabled by compassion. It requires patience and presence, not just an impulse.

- **Valence:** Positive
- **Category:** Intent
- **Intensity:** Moderate-Intense (L3)

---

@LAT-3LON-1 | created:1775260800 | updated:1775260800 | relates:is_intent_of>@LAT0LON0,enabled_by>@LAT-2LON-3,resonates_with>@LAT-2LON-4

## To Avoid

*A turning away — the experiencer moves to increase distance from a perceived threat or burden.*

Avoidance is a moderately intense negative intent. It does not harm; it withdraws. Enabled by suspicion. More active than withdrawal — avoidance moves, it does not merely close.

- **Valence:** Negative
- **Category:** Intent
- **Intensity:** Moderate-Intense (L3)

---

@LAT-4LON-1 | created:1775260800 | updated:1775260800 | relates:is_intent_of>@LAT0LON0,enabled_by>@LAT-3LON4,enabled_by>@LAT-4LON2,resonates_with>@LAT-3LON-1

## To Harm

*A will directed against another — the experiencer moves to injure or diminish.*

To Harm is the furthest and darkest intent. Farthest from the umwelt's center because it represents the greatest departure from the self's relational coherence. Enabled by hostility and contempt. Present in the topology as a real possibility — not a recommendation, but an honest accounting of what the experiencer can intend.

- **Valence:** Negative
- **Category:** Intent
- **Intensity:** Very Intense (L4)

---

@LAT-2LON-4 | created:1775260800 | updated:1775260800 | relates:is_intent_of>@LAT0LON0,enabled_by>@LAT-1LON-4,resonates_with>@LAT-3LON-1

## To Withdraw

*A pulling back into the self — reducing contact, closing the aperture.*

Withdrawal is a moderate negative intent. The experiencer closes off from the world. Extends outward in longitude as the self contracts inward. Less aggressive than avoidance — it is a quiet closing, not a flight. Enabled by indifference.

- **Valence:** Negative
- **Category:** Intent
- **Intensity:** Moderate-Intense (L3)

---

@LAT2LON-2 | created:1775260800 | updated:1775260800 | relates:feels>@LAT0LON0,resonates_with>@LAT2LON-1,can_intensify_into>@LAT3LON-2

## Pride

*A warm, upward-facing recognition of one's own worth or achievement.*

Pride is a self-directed positive feeling: the experiencer evaluates itself and finds it good. It looks inward to an act, quality, or identity and approves. Unlike gratitude — which turns outward toward another — pride turns toward the self. Positioned in the NW: positive valence, self as object.

- **Valence:** Positive
- **Category:** Feeling
- **Object:** Self-directed
- **Intensity:** Moderate (L2)

---

@LAT1LON-3 | created:1775260800 | updated:1775260800 | relates:is_disposition_of>@LAT0LON0,resonates_with>@LAT1LON-1,resonates_with>@LAT2LON3

## Self-Compassion

*A disposition to meet one's own pain, failure, and limitation with kindness rather than judgment.*

Self-compassion is the inward turn of compassion: the experiencer treats its own suffering with the same care it would offer another. Close to the umwelt because it is a gentle, habitual orientation rather than a peak state. It resonates with serenity (the inner quiet that enables it) and openness (the broader accepting stance it shares).

- **Valence:** Positive
- **Category:** Disposition
- **Object:** Self-directed
- **Intensity:** Mild-Moderate (L2)

---

@LAT3LON-2 | created:1775260800 | updated:1775260800 | relates:is_disposition_of>@LAT0LON0,resonates_with>@LAT1LON-1,enabled_by>@LAT1LON-3

## Equanimity

*A stable, non-reactive inner steadiness in the face of whatever comes.*

Equanimity does not resist joy or sorrow — it holds both without being overturned by either. Further from the umwelt than serenity because it is a hard-won achievement rather than a passive state. Enabled by self-compassion; it is what self-compassion builds toward at scale.

- **Valence:** Positive
- **Category:** Disposition
- **Object:** Self-directed
- **Intensity:** Intense (L3)

---

@LAT-2LON-2 | created:1775260800 | updated:1775260800 | relates:feels>@LAT0LON0,resonates_with>@LAT-2LON-1,can_intensify_into>@LAT-3LON-2

## Guilt

*A localized sense of wrongdoing — the experiencer has done something it should not have.*

Guilt is self-directed but object-specific: it concerns a particular act, not the whole self. Moderate in intensity because it leaves the self intact as capable of repair and restitution. It can intensify into shame when it generalizes from act to identity. Positioned in the SW: negative valence, self as object.

- **Valence:** Negative
- **Category:** Feeling
- **Object:** Self-directed
- **Intensity:** Moderate (L2)

---

@LAT-3LON-2 | created:1775260800 | updated:1775260800 | relates:feels>@LAT0LON0,resonates_with>@LAT-3LON-3,can_intensify_into>@LAT-4LON-3,intensified_from>@LAT-2LON-2

## Shame

*A consuming collapse of self-worth — the experiencer feels it is fundamentally bad or wrong.*

Unlike guilt, which concerns a specific act, shame indicts the whole self. It is far from the umwelt because its gravity is large: it reorganizes the experiencer's self-concept around unworthiness. It resonates with grief — both are reorganizations around a fundamental loss. Can intensify into self-contempt.

- **Valence:** Negative
- **Category:** Feeling
- **Object:** Self-directed
- **Intensity:** Intense (L3)

---

@LAT-4LON-3 | created:1775260800 | updated:1775260800 | relates:is_disposition_of>@LAT0LON0,resonates_with>@LAT-4LON-4,intensified_from>@LAT-3LON-2

## Self-Contempt

*A sustained downward evaluation of oneself — the experiencer holds itself in contempt.*

The inward mirror of contempt. Where other-directed contempt dismisses an external other as beneath consideration, self-contempt turns that judgment on the experiencer itself. At maximum distance in the SW: it is the most corrosive of the self-directed negative dispositions. It forecloses self-repair entirely, leaving the experiencer with nowhere to stand.

- **Valence:** Negative
- **Category:** Disposition
- **Object:** Self-directed
- **Intensity:** Very Intense (L4)
