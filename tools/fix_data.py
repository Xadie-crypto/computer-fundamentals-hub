import json, random, collections, os

fixes = {
"ss-103": ("MS-DOS supports [[multiple users]] working at the same time.", "single-user", []),
"ss-104": ("MS-DOS [[supports a graphical user interface]], which is why a mouse is used to operate it.", "does not support a graphical user interface", ["does not support", "no gui", "does not support gui"]),
"ss-106": ("Linux is a [[closed-source]] operating system.", "open-source", []),
"ss-109": ("Symbian [[includes a virtual memory system]] for managing memory.", "lacks a virtual memory system", ["lacks", "no virtual memory", "lacks virtual memory"]),
"ss-111": ("iOS [[allows users to install applications from any third-party source]] without restrictions.", "does not allow third-party installations", ["does not allow third party installations", "does not allow"]),
"as-087": ("Windows is classified as [[application software]].", "system software", []),
"as-090": ("Multimedia software [[cannot record]] audio or video.", "can record", []),
"as-092": ("Freeware [[always includes the source code]] for the program.", "does not include the source code", ["open source", "no source code", "does not include source code"]),
"as-093": ("Shareware is [[free forever and never requires registration]].", "free only for a trial period", ["trial only", "not free forever", "requires registration"]),
"as-095": ("Freemium [[gives all premium features for free with no payment option]].", "charges for premium features", ["premium features are paid", "not all free"]),
"as-096": ("Crippleware [[provides all the features of the software during its trial period]].", "trialware", []),
"as-097": ("[[Trialware]] limits the number of features available during the trial.", "crippleware", []),
"as-099": ("[[Presentation software]] is mainly used to compute number-intensive problems.", "spreadsheet software", ["spreadsheet"]),
"pl-087": ("First generation languages use [[English-like statements]] instead of binary.", "machine language", ["binary", "machine code"]),
"pl-089": ("Assembly language is [[harder to read]] than raw binary code.", "easier", ["easier to read"]),
"pl-091": ("Third generation programs can [[run directly without any translation]].", "must be translated", ["need translation", "needs translation", "must be translated first"]),
"pl-093": ("In the lesson, Python is classified as a [[fifth generation]] language.", "fourth generation", []),
"pl-096": ("[[A compiler]] translates a program one line at a time while it runs.", "an interpreter", ["interpreter"]),
"pl-099": ("SQL is classified as a [[third generation]] language.", "fourth generation", []),
"pl-100": ("Assembly language is a [[high-level]] language.", "low-level", []),
"nt-088": ("Routers are used [[only to connect one computer to a single network]].", "to join multiple networks together", ["join multiple networks", "join networks"]),
"nt-090": ("A switch and a NIC are the [[same]] device.", "not the same", ["different", "not same"]),
"nt-092": ("A MAN typically spans [[multiple continents]].", "a city or metropolitan area", ["a city", "between cities", "metropolitan area"]),
"nt-094": ("In the client-server model, [[clients provide services and servers request them]].", "servers provide services and clients request them", ["servers provide"]),
"nt-095": ("[[Bus topology]] connects all computers to a central hub.", "star topology", ["star"]),
"nt-100": ("[[TCP]] is the protocol routers use to select the best path to a destination.", "IP", ["internet protocol"]),
"et-102": ("The internet penetration rate in the Philippines was [[82.4%]] in January 2022.", "68.0%", ["68"]),
"et-104": ("[[Fewer than half]] of the world's population used social media in April 2022.", "more than half", ["more than half"]),
"et-105": ("[[1G]] provided encrypted digital calls and SMS messaging.", "2G", []),
"et-107": ("3G was four times [[slower]] than 2G.", "faster", []),
"et-109": ("Edge computing [[increases latency]] by sending all data to a distant cloud.", "reduces latency", ["reduces", "decreases latency"]),
"et-112": ("Filipinos [[trust social media more]] than traditional media such as TV and newspapers.", "trust traditional media more", ["trust traditional media"]),
"et-115": ("Human augmentation is one of the three trends [[discussed in detail]] in the lesson.", "not discussed in detail", ["not discussed"]),
"lw-086": ("R.A. 10175 is the [[Data Privacy Act]] of 2012.", "Cybercrime Prevention Act", ["cybercrime prevention act of 2012"]),
"lw-089": ("R.A. 9995 [[allows]] secret recording of people in private places.", "prohibits", ["does not allow"]),
"lw-092": ("Cybersquatting is a [[legal]] business practice under Philippine law.", "illegal", ["punishable", "criminal"]),
"lw-095": ("A data breach must be reported to the NPC within [[30 days]].", "72 hours", []),
"lw-096": ("R.A. 9775 applies [[only to printed materials]] and not to online content.", "to all media, including online content", ["all media", "online content", "also to online content"]),
"lw-098": ("R.A. 10175 [[does not cover]] libel committed online.", "covers", ["does cover"]),
"lw-099": ("Consent under R.A. 10173 may be [[implied from a person's silence]].", "freely given, specific, and informed", ["freely given specific and informed", "explicit consent", "must be freely given"]),
}

files = ['systems','apps','programming','networks','trends','laws']
applied = 0
dist_before = collections.Counter()
dist_after = collections.Counter()

for f in files:
    path = f'data/{f}.json'
    data = json.load(open(path, encoding='utf8'))
    for q in data['questions']:
        if q['id'] in fixes:
            q['q'], q['fix'], accept = fixes[q['id']]
            if accept:
                q['accept'] = accept
            applied += 1
        if q['t'] == 'mc':
            dist_before[q['a']] += 1
            rng = random.Random(q['id'])
            correct = q['o'][q['a']]
            opts = q['o'][:]
            rng.shuffle(opts)
            q['o'] = opts
            q['a'] = opts.index(correct)
            dist_after[q['a']] += 1
    # write one question per line for readability
    with open(path, 'w', encoding='utf8', newline='\n') as fh:
        fh.write('{\n  "topic": %s,\n  "questions": [\n' % json.dumps(data['topic']))
        lines = ['    ' + json.dumps(q, ensure_ascii=False, separators=(',', ':')) for q in data['questions']]
        fh.write(',\n'.join(lines))
        fh.write('\n  ]\n}\n')

print('fixes applied:', applied)
print('MC distribution before:', dict(sorted(dist_before.items())))
print('MC distribution after :', dict(sorted(dist_after.items())))
