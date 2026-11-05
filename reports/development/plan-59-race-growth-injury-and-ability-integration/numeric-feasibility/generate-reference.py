"""Independent Decimal reference; Python stdlib only. Run once per new output path."""
from decimal import Decimal, getcontext, ROUND_HALF_EVEN
import json
from pathlib import Path

getcontext().prec = 100
getcontext().rounding = ROUND_HALF_EVEN
D = Decimal

def atan_series(x):
    total, term, n = D(0), x, 0
    while True:
        add = term / D(2 * n + 1)
        updated = total + (add if n % 2 == 0 else -add)
        if updated == total:
            return total
        total = updated
        term *= x * x
        n += 1
        if n > 10000:
            raise RuntimeError('atan iteration bound')

pi = 16 * atan_series(D(1) / 5) - 4 * atan_series(D(1) / 239)
turn = 1 << 32
q = 1 << 62
constants = []
gain = D(1)
for i in range(32):
    a = pi / 4 if i == 0 else atan_series(D(1) / (D(2) ** i))
    constants.append(int((a / (2 * pi) * turn).to_integral_value()))
    gain /= (D(1) + D(1) / (D(2) ** (2 * i))).sqrt()

def sincos(x):
    sin, cos, sterm, cterm, n = x, D(1), x, D(1), 1
    while True:
        sterm *= -(x * x) / D((2 * n) * (2 * n + 1))
        cterm *= -(x * x) / D((2 * n - 1) * (2 * n))
        sn, cn = sin + sterm, cos + cterm
        if sn == sin and cn == cos:
            return sin, cos
        sin, cos = sn, cn
        n += 1
        if n > 1000:
            raise RuntimeError('trig iteration bound')

angles = [0, 1, turn // 16, turn // 8, turn // 4 - 1, turn // 4,
          turn // 2, 3 * turn // 4, turn - 1]
vectors = []
for angle in angles:
    signed = angle if angle <= turn // 2 else angle - turn
    s, c = sincos(D(signed) * 2 * pi / turn)
    vectors.append({'angle': angle, 'sin_q62': str(int((s * q).to_integral_value())),
                    'cos_q62': str(int((c * q).to_integral_value()))})

result = {'generator': 'decimal-machin-taylor/v1', 'precision': 100, 'rounding': 'ROUND_HALF_EVEN',
          'angle_units': 'turn/2^32', 'scale': str(q), 'iterations': 32,
          'atan_turns': constants, 'gain_q62': str(int((gain * q).to_integral_value())),
          'vectors': vectors}
out = Path('reports/development/plan-59-race-growth-injury-and-ability-integration/numeric-feasibility/reference-v1.json')
with out.open('x', encoding='utf-8', newline='\n') as f:
    json.dump(result, f, indent=2)
    f.write('\n')
print(f'generated {len(constants)} constants and {len(vectors)} vectors')
