"""Independent zipfile inspection of two synthetic browser downloads."""
import hashlib, json, pathlib, zipfile

directory = pathlib.Path(__file__).parent / 'headless-work-02' / 'downloads'
files = sorted(directory.iterdir())
if len(files) != 2:
    raise SystemExit('expected exactly two downloads')
documents = []
for file in files:
    with zipfile.ZipFile(file) as archive:
        info = archive.infolist()[0]
        raw = archive.read('usage.json')
        document = json.loads(raw)
        documents.append(document)
        result = {'sha256': hashlib.sha256(file.read_bytes()).hexdigest(), 'members': archive.namelist(),
                  'flags': info.flag_bits, 'extra': info.extra.hex(), 'crc_failure': archive.testzip(),
                  'runs': len(document['runs']), 'unique_ids': len({run['runId'] for run in document['runs']}),
                  'distinct_timelines': len({json.dumps(run['timeline'], sort_keys=True) for run in document['runs']}),
                  'names_present': any(name in raw.decode() for name in ['Synthetic A', 'Synthetic B', 'Synthetic C']),
                  'coverage': document['coverage'], 'achievements': document['achievements']}
        print(json.dumps(result, sort_keys=True))
        if result['members'] != ['usage.json'] or result['flags'] != 0 or result['extra'] or result['crc_failure'] is not None or result['runs'] != 2 or result['unique_ids'] != 2 or result['distinct_timelines'] != 2 or result['names_present']:
            raise SystemExit('independent archive check failed')
if documents[0] != documents[1]:
    raise SystemExit('repeat exports differed')
print('repeat documents identical')
