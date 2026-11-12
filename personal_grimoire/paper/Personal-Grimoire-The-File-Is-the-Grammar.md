Working draft 0.2 · not submitted · 11 Nov 2026 (supersedes draft 0.1 of 14 Sep 2026, kept beside this file as `The File Is the Grammar.mhtml`)

# Personal Grimoire — The File Is the Grammar: Provenance-Preserving Question Answering over a Personal Corpus, without a Language Model

antfriend

Subjects

Computation and Language (cs.CL); Artificial Intelligence (cs.AI)

Keywords

personal knowledge graph, self-describing data, defeasible inheritance, attribution, controlled natural language, multilingual grammars, supersession, ambiguity

Comments

Artifact: `personal_grimoire/` (`index.html`, `personal_grimoire_ttdb.md`, TTG-RFC-0001–0005, `tests/`, `tools/`, and this `paper/` folder with the draft and its recorded results); licence in `LICENSE`. Benchmark data: bAbI v1.2, CC BY 3.0, not redistributed. Every path in this draft is relative to `personal_grimoire/`, one folder up from this file.

Abstract

Interfaces built on large language models answer in fluent text whose sources are opaque. We present Personal Grimoire, a question-answering system over one person's own words that can say only four kinds of thing: what the person said, what follows from it along a chain it shows, that the person has said both, and what no longer holds, with what was said since. Sentences are read as alternating nounish and verbish segments and written as subject–vector–object percepts, consolidated per episode into beliefs by evidence counting, and queried with vector algebra, declared rules and defeasible IS-A inheritance. Contradictions are kept as a fourth truth value rather than resolved. What the person did not assert (a choice, a stance, a reported clause, or a sentence the grammar can read two ways) is held: stored and searchable, never believed.

The system's distinguishing property is architectural. A single plain-text file is at once the data, the schema that data instantiates, the grammars that read it, every phrase of every reply, and a compressed specification of the interpreter. The interpreter contains no word of any natural language. We test this by substitution. Removing the grammar leaves the parser only word order. A Spanish grammar sits beside the English one and answers Spanish questions from English sayings, with no Spanish in the interpreter. On bAbI tasks 1 and 15, applying one fixed letter bijection to both the grammar and the data leaves all 1,000 question outcomes unchanged on each task, while a negative control scores 0%.

With one declared line of grammar data the system answers all 1,000 test questions of task 15 (basic deduction) correctly; with four it answers all 1,000 of task 1 (single supporting fact). In both it cites exactly the gold supporting facts as its grounds, at about 0.25 ms per question with no trained parameters. As shipped, without those lines, it scores 0% and 19.4%. Removing one flag from the grammar, the one that lets a later place retire an earlier one, drops task 1 to 54.9%. We discuss the narrow coverage this buys and position the approach as a self-describing, local-first alternative where attribution matters more than breadth.

## What the paper claims

None of the parts is new on its own. The contribution is the combination, and properties of it that can be checked.

1. **A self-describing artifact.** Instances, schema, grammar, reply phrases and interpreter specification share one record format. Conformance tests hold the prose specification, the README and the store's own description of the runtime's surface to the running code.
2. **Grammar as data, tested three ways:** deletion, a second language, and a letter permutation that must leave every outcome unchanged. A fourth check greps the interpreter for 822 grammar words and every reply phrase and finds none.
3. **Attributable answers by construction.** Grounds are typed *said*, *inferred*, *contested* or *superseded* and printed differently. On bAbI tasks 1 and 15 the cited grounds equal the gold supporting facts on every question.
4. **Deterministic consolidation.** Evidence is counted per episode, confidence is a Beta-mean (Laplace) estimate, and contradictions are kept as Belnap's *both*.
5. **Order without clocks or recency.** A vector the grammar declares `exclusive` lets a later saying retire an earlier one, in file order. Nothing else does: yes against no stays a contradiction however far apart the sayings are.
6. **Assertion is distinguished from utterance.** What *or* joins, what a stance verb or noun takes, what a relative word reports, and both readings of an ambiguous sentence are held, never believed. The owner settles an ambiguity by choosing a named reading.
7. **Readings are correctable without rewriting history.** A correction is an amendment record beside the episode, which is never touched. A grammar change is reported as a re-reading and writes nothing until the owner takes it.
8. **Several languages, one relational algebra.** Sentences choose a grammar; later languages borrow the first one's numbers and vector algebra. Merging the lexicons instead breaks 3 of 15 English parses.

## The artifact as it stands

| Part | What it is |
| --- | --- |
| `index.html` | The whole runtime: a TTDB parser and byte-stable writer, a rule interpreter, a consolidator, a reasoner and a small sphere view. 205,460 bytes of script, no dependencies, no build step. |
| `personal_grimoire_ttdb.md` | The store, 96,481 bytes and 73 records: nine blueprint records, eight English grammar records, six Spanish ones, the README as a record, a scene, nine design beliefs, a conformance fixture, and a demo corpus of eight episodes. |
| `RFCs/` | TTG-RFC-0001–0005 (Toot Toot Grammar, 1.0 stable; RFC-0004 §4, time across a fleet of devices, is proposed and not implemented), with the TTDB, TTCP and TTN RFCs they depend on. |
| `tests/` | Three dependency-free Node scripts that run the shipping script: 326 engine checks, 200 documentation checks, 23 embedding checks. All pass. |
| `tools/` | The same engine from the command line: ask, feed, re-consolidate, re-read, and the bAbI harness. |
| `paper/` | This draft, draft 0.1 as saved (`The File Is the Grammar.mhtml`), and the recorded bAbI results (`babi_qa1_results.json`, `babi_qa15_results.json`). |

The store is laid out on a sphere. The origin `@LAT0LON0` is the owner. The prime meridian holds the blueprint (north) and the English grammar (south); the antimeridian holds Spanish. Things sit east and vectors west. Latitude 90 is the timeline of episodes, 91 the amendments, 95 documents, 96 a scene, 98 beliefs about the design, 99 the fixture.

## Results

bAbI v1.2 English, 1,000 questions per split (250 stories for task 15, 200 for task 1). Each story's facts are told to an emptied store, one episode per line. *Exact attribution* requires the answer to be correct and its quoted sentences to be exactly the gold supporting facts. Rerun on 11 Nov 2026 against the current runtime, the outcome hashes equal those recorded on 14 Sep 2026 in `paper/babi_qa1_results.json` and `paper/babi_qa15_results.json`, condition for condition. Source: `tools/babi.mjs`.

| Condition | Answer accuracy | Exact attribution | Intent chosen |
| --- | --- | --- | --- |
| **Task 15 · basic deduction · test** |  |  |  |
| Store as shipped | 0.0% | 0.0% | portrait (1,000) |
| + `phrase: afraid of \| afraid_of` | 100.0% | 100.0% | objectsOf (1,000) |
| + phrase, `exclusive` flag removed | 100.0% | 100.0% | objectsOf (1,000) |
| + phrase, letters permuted in grammar and data | 100.0% | 100.0% | identical per question |
| Control: permuted grammar, plain data | 0.0% | 0.0% | search (1,000) |
| **Task 1 · single supporting fact · test** |  |  |  |
| Store as shipped | 19.4% | 18.2% | objectsOf (1,000) |
| + four lines (below) | 100.0% | 100.0% | objectsOf (1,000) |
| + four lines, `exclusive` flag removed | 54.9% | 54.9% | objectsOf (1,000) |
| + four lines, letters permuted in grammar and data | 100.0% | 100.0% | identical per question |
| Control: permuted grammar, plain data | 0.0% | 0.0% | verify (1,000) |

The task 1 adaptation is three rules and one adverb, all grammar data:

```
rule: go_to X Y => in X Y | going somewhere puts you there
rule: journey_to X Y => in X Y | journeying somewhere puts you there
rule: travell_to X Y => in X Y | travelling somewhere puts you there
class: adverb | very … → class: adverb | back very …
```

The train splits give the same adapted, ablated, permuted and control rows for both tasks. As shipped, task 1 train reads 22.0% and 20.8%.

**≈0.25 ms** per question · **0** trained parameters · **205,460 B** interpreter script · **96,481 B** whole store, both grammars and demo corpus · **822** grammar words checked absent from the code · every adapted run repeated and found identical.

Both tasks are saturated by earlier neural models, so 100% is not the finding. The findings are zero training data, attribution equal to gold, invariance under permutation, and an ablation with a stated cause: task 1 asks where someone is *now*, and only the `exclusive` flag on `in` lets a later place retire an earlier one. Draft 0.1 reported 0% on task 1 for want of exactly these two things: a rule kind mapping *travelled to* onto location, and any power for order to settle anything. TTG-RFC-0003 §3.1 and TTG-RFC-0004 §3 added them as grammar data and a declared flag. Recency still settles no contradiction of yes against no.

## Outline

### 1 Introduction

- An LLM-shaped interface, rebuilt without a language model: input words find purchase, a reply is built, and every clause of it has a source.
- The four things it can say, shown with *Does Pixel chase mice?* and its chain pixel —is a→ cat ⟹ cat —chase→ mouse, and with *Is Pixel in the sun?* after *Pixel moved to the kitchen.*
- Why not call it a small language model: it defines no distribution over text and generates nothing. Replies are templates from the store filled with terms, counts and quotes.

*Status: to write. Framing settled in discussion; about one page.*

### 2 Related work

- Symbolic understanding: SHRDLU; controlled natural languages, Attempto Controlled English above all.
- Extraction and graphs: open information extraction; personal knowledge graphs.
- Reasoning: semantic networks, defeasible inheritance, default logic, truth maintenance, Belnap's four values, subjective logic, Datalog.
- Data: self-describing formats (NetCDF, Avro), datasheets, FAIR, OAIS, local-first software.
- Contrast: attribution and hallucination in LLM question answering; small language models.

*Status: to verify. The reference list below is from memory. Check every entry, and state plainly how this differs from ACE: ACE restricts what may be written; this reads whatever is written and holds what it cannot assert.*

### 3 The self-describing store

- One file across the MOF layers: episodes and terms (M0), term and percept blocks (M1), grammar kinds (M2), the record format itself (M3). TBox and ABox side by side, plus weighted beliefs about the design.
- Metacircular: grammar and blueprint are records in the format they define. Each blueprint record carries a `src:` line naming the RFC section it compresses.
- The README is a record too: `@LAT95LON0` shows the file itself, so documentation and store cannot drift unnoticed.
- A ninth blueprint record, `@LAT85LON0`, names the runtime's surface so the engine can be embedded from the store alone; a test holds it to the real exports and element ids.
- Rule of least power: the grammar can change what the interpreter says, never what it can do.
- Where the analogy stops: not a quine, not homoiconic; self-describing to a reader, not self-hosting.

*Status: argument drafted. Needs a figure: the MOF layer table beside real record IDs `@LAT90LON5`, `@LAT-10LON0`, `@LAT85LON0`.*

### 4 From words to beliefs

- Reading and classification. A clause is any alternating run of nounish and verbish segments, each a phrase or a list; one percept per verb, relating the segments either side of it.
- The percept line: sentence | subject | vector | object | polarity | quantifier, with a last column naming the reading when there are two. The sentence's shape is written beside it, for example `[pixel] {chases} [mice] that {eat} [cheese].`
- Consolidation over episodes, not sentences:

  conf = round(255 · (max(for, against) + 1) / (for + against + 2))

  One saying reads 170. *I like coffee* then *I do not like coffee* reads 128 and is contested.
- Verdicts as Belnap's values: Yes → true, No → false, Contested → both, Unknown → neither. *No longer* is not a fifth value: it is false with a retired ground and the ground that retired it.
- Reasoning order: said, transitive, inverse or symmetric, declared rules, inherited from the nearest IS-A ancestor. Specificity is the only defeasible rule, and an overruled ancestor is reported.
- Salience decays per episode, never per second, and EPS = sal × (255 − conf) / 255 picks the one question the system asks unprompted.

*Status: evidence in repo. TTG-RFC-0002, TTG-RFC-0003, TTG-RFC-0005, blueprint records `@LAT10LON0`–`@LAT80LON0`. Compress; don't re-derive.*

### 5 What was said, held, superseded and amended

- **Held.** Polarity `?`: what *or* joins, what *I doubt* or *the idea that* takes, what a relative word reports. Counted for neither side, never a contradiction, named when a question meets it. A denied *or* is a plain denial of each; an aside (*I think*, or parentheses) turns a hedge into a saying.
- **Two readings.** Where the grammar sees both, both are held under names `a` and `b` as one saying; the owner picks one and the choice is kept.
- **Mentions.** *Coffee.* is counted and searchable, and nothing is believed about it.
- **Supersession.** Along an `exclusive` vector a later object retires an earlier one. Order is the file's, episode then sentence, so the store needs no clock.
- **Amendments.** The owner overrules a reading by marking spans thing, vector or one term. The correction lives at `@LAT91LON<n>` beside episode `@LAT90LON<n>`, never counts twice, and is withdrawn by reading the sentence back the episode's way.
- **Re-readings.** A grammar edit, or the corpus's own growth (a chain verb learned from the owner's sentences), reads old sentences differently. The difference is reported under a hash of the grammar and written only when taken, in order, each in the context of the ones before it.

*Status: evidence in repo. TTG-RFC-0004 §2–3, TTG-RFC-0005, beliefs `@LAT98LON3`, `@LAT98LON6`, `@LAT98LON9`. New since draft 0.1; needs one worked example per bullet from the suite.*

### 6 Two languages, one algebra

- Membership by `lang:`; later languages borrow numbers and vector algebra and add only labels and phrases.
- Per-sentence choice by whichever grammar recognises more words; replies in the question's language, quotes in the speaker's.
- What the second language forced into data: head position of a phrase (last in English, first in Spanish), the object mark *a*, the speaker's own verb ending for dropped subjects, and number agreement to find a subject that stands behind its verb.
- Negative result: one merged lexicon breaks 3 of 15 English parses (*a*, *no*, head position).
- What does not cross: content words until linked with `is_a`, verbs only one rule at a time (`cazar X Y => chase X Y`).

*Status: evidence in repo. TTG-RFC-0001 §11, belief `@LAT98LON7`, the Spanish records `@LAT-10LON180`–`@LAT-60LON180`, fixture `tests/fixtures/es_ttdb.md`.*

### 7 Evaluation

- **7.1 Substitution.** Delete the grammar; add Spanish; the leak check over 822 words, every reply phrase and every declared number.
- **7.2 bAbI.** Tasks 1 and 15, both splits, with the permutation test, its control, and the `exclusive` ablation.
- **7.3 A small-LM baseline.** One or two 1–3B models on the same stories: accuracy, whether cited sentences match gold, latency, determinism.
- **7.4 Coverage on real notes.** Share of sentences yielding a percept, share held, and percept precision on a few hundred hand-labelled sentences.
- **7.5 Rebuilding from the store.** A third party's embedding found what the store alone did not tell an agent; Blueprint 9 and `tests/embed.test.mjs` came of it. Make the exercise systematic.

*Status: 7.1 and 7.2 done; 7.3–7.5 to do. 7.3 is the result reviewers will ask for first.*

### 8 Limitations and disclosures

- Modifiers are dropped unless joined into one term. Tense and modality are not read. Adverbs after a verb and attributive adjectives are blind spots (`@LAT98LON5`).
- Relative clauses lean on what the owner has said of a verb. Where the grammar cannot see a second reading, the reading with a verb wins.
- Held is all-or-nothing: *Pixel is a cat or a dog* holds both, which is safe and says less than the sentence did.
- Spanish: verb-first questions, adjectives agreeing in number, and dropped subjects other than the speaker's are not read.
- The lemmatizer guesses, and a wrong first lemma sticks. The task 1 rule is keyed to `travell_to` because that is the lemma it produces for *travelled*.
- bAbI tasks use a handful of sentence templates, and the README asks for no task-specific tricks. The adaptation lines are that, declared: one phrase for task 15, three rules and one adverb for task 1, each naming words the task uses. They were written after reading test stories; the train splits give the same results.
- Language-independent question rules were added to the interpreter during the first evaluation (stranded preposition; copula before a declared phrase), each with regression tests on non-bAbI sentences.
- No recency for contradictions: a change of mind reads as a contradiction, by design. `exclusive` is a claim about a relation, not about the owner.
- A file is one episode however long, replies quote rather than generate, and the browser's `localStorage` bounds the corpus.
- Time across several devices (TTG-RFC-0004 §4) is specified and not implemented.

*Status: list ready. Honesty here is what makes 100% believable.*

### 9 Conclusion and future work

- bAbI ships its tasks in Hindi: a third grammar, and the first subject–object–verb one.
- RuleTaker and ProofWriter, whose closed- and open-world settings include an *unknown* answer.
- More bAbI tasks that the new machinery should reach: two and three supporting facts, yes/no questions, lists.
- Rule kinds for the parser's blind spots, each declared in the grammar; linking vectors across languages more than one rule at a time.
- A fleet of devices ordering one person's sayings on a shared pulse (TTN-RFC-0010).

*Status: to write. Half a page.*

## Before submitting

- Evaluation harness in the repo, deterministic, with a negative control. Done.
- Run the small-LM baseline (7.3). Without it the comparison in the abstract is only rhetorical.
- Check every reference, and confirm arXiv's current cs moderation policy for system papers.
- Get an endorsement for cs.CL if this is a first submission there.
- Archive the exact code and store on Zenodo for a DOI, and cite that version.
- Disclose AI assistance in writing and engineering; AI tools cannot be listed as authors.
- Attribute bAbI (CC BY 3.0), and don't redistribute the data in the repo.

## Reproduce

```
# bAbI v1.2 (CC BY 3.0); the original host is gone, a mirror remains
curl -LO https://s3.amazonaws.com/text-datasets/babi_tasks_1-20_v1-2.tar.gz
tar -xzf babi_tasks_1-20_v1-2.tar.gz

cd personal_grimoire
node tools/babi.mjs ../tasks_1-20_v1-2/en/qa15_basic-deduction_test.txt --json paper/babi_qa15_results.json
node tools/babi.mjs ../tasks_1-20_v1-2/en/qa1_single-supporting-fact_test.txt --json paper/babi_qa1_results.json
node tests/app.test.mjs    # engine: parses, questions, shapes, substitution, Spanish, leak check
node tests/docs.test.mjs   # prose, README and surface record held to the code
node tests/embed.test.mjs  # the page as a host that embeds the engine sees it
```

## References to verify

1. Weston, J., Bordes, A., Chopra, S., et al. (2015). Towards AI-complete question answering: A set of prerequisite toy tasks. arXiv:1502.05698.
2. Clark, P., Tafjord, O., & Richardson, K. (2020). Transformers as soft reasoners over language. IJCAI.
3. Tafjord, O., Dalvi, B., & Clark, P. (2021). ProofWriter: Generating implications, proofs, and abductive statements over natural language. Findings of ACL.
4. Winograd, T. (1972). *Understanding Natural Language*. Academic Press.
5. Fuchs, N. E., Kaljurand, K., & Kuhn, T. (2008). Attempto Controlled English for knowledge representation. Reasoning Web.
6. Kuhn, T. (2014). A survey and classification of controlled natural languages. *Computational Linguistics*, 40(1).
7. Banko, M., Cafarella, M. J., Soderland, S., Broadhead, M., & Etzioni, O. (2007). Open information extraction from the web. IJCAI.
8. Balog, K., & Kenter, T. (2019). Personal knowledge graphs: A research agenda. ICTIR.
9. Collins, A. M., & Quillian, M. R. (1969). Retrieval time from semantic memory. *Journal of Verbal Learning and Verbal Behavior*, 8(2).
10. Brachman, R. J. (1983). What IS-A is and isn't. *IEEE Computer*, 16(10).
11. Touretzky, D. S. (1986). *The Mathematics of Inheritance Systems*. Morgan Kaufmann.
12. Reiter, R. (1980). A logic for default reasoning. *Artificial Intelligence*, 13.
13. Doyle, J. (1979). A truth maintenance system. *Artificial Intelligence*, 12.
14. Belnap, N. D. (1977). A useful four-valued logic. In *Modern Uses of Multiple-Valued Logic*.
15. Jøsang, A. (2016). *Subjective Logic*. Springer.
16. Tulving, E. (1972). Episodic and semantic memory. In *Organization of Memory*.
17. Ranta, A. (2011). *Grammatical Framework: Programming with Multilingual Grammars*. CSLI.
18. Gebru, T., et al. (2021). Datasheets for datasets. *Communications of the ACM*, 64(12).
19. Wilkinson, M. D., et al. (2016). The FAIR guiding principles for scientific data management and stewardship. *Scientific Data*, 3.
20. Kleppmann, M., Wiggins, A., van Hardenberg, P., & McGranaghan, M. (2019). Local-first software. Onward!
21. Berners-Lee, T., & Mendelsohn, N. (2006). The rule of least power. W3C TAG finding.
22. Object Management Group. Meta Object Facility (MOF) specification; ISO 14721, Open Archival Information System (OAIS).
23. Ceri, S., Gottlob, G., & Tanca, L. (1989). What you always wanted to know about Datalog (and never dared to ask). *IEEE Transactions on Knowledge and Data Engineering*, 1(1).
