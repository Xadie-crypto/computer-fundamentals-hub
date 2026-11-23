import json, glob, re, collections, sys
files = ['systems','apps','programming','networks','trends','laws']
total = 0
errors = []
ids = set()
for f in files:
    data = json.load(open(f'data/{f}.json', encoding='utf8'))
    qs = data['questions']
    c = collections.Counter(q['t'] for q in qs)
    total += len(qs)
    print(f"{f:12} total={len(qs):3}  mc={c['mc']:2} id={c['id']:2} tf={c['tf']:2}")
    for q in qs:
        qid=q['id']
        if qid in ids: errors.append(f"dup id {qid}")
        ids.add(qid)
        if not q.get('q') or not q.get('e'): errors.append(f"{qid}: missing q/e")
        if q['t']=='mc':
            if len(q.get('o',[])) != 4: errors.append(f"{qid}: {len(q.get('o',[]))} options")
            if not isinstance(q.get('a'), int) or not (0 <= q['a'] < len(q.get('o',[]))): errors.append(f"{qid}: bad answer index")
            if len(set(q.get('o',[]))) != 4: errors.append(f"{qid}: duplicate options")
        elif q['t']=='id':
            if not isinstance(q.get('a'), list) or not q['a']: errors.append(f"{qid}: bad id answer")
        elif q['t']=='tf':
            if not isinstance(q.get('a'), bool): errors.append(f"{qid}: tf answer not bool")
            marks = re.findall(r'\[\[(.+?)\]\]', q['q'])
            if q['a'] is False:
                if not marks: errors.append(f"{qid}: false tf without [[marker]]")
                if not q.get('fix'): errors.append(f"{qid}: false tf without fix")
            else:
                if marks: errors.append(f"{qid}: true tf has marker")
print(f"\nTOTAL {total}")
print("\nERRORS:", len(errors))
for e in errors[:60]: print(" -", e)
# MC answer distribution
dist=collections.Counter()
for f in files:
    for q in json.load(open(f'data/{f}.json', encoding='utf8'))['questions']:
        if q['t']=='mc': dist[q['a']]+=1
print("MC answer index distribution:", dict(dist))
