export const views = {
  front: {
    label: 'Front three-quarter',
    note: 'Round head/neck overlap, dimensional bill, body, tail, molded wing.',
    svg: `<svg viewBox="0 0 360 270" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Front three-quarter static rubber duck">
      <path class="duck-fill" d="M81 174 Q88 145 112 130 Q139 117 166 125 Q207 133 245 132 Q270 134 288 123 Q298 98 308 91 Q317 88 322 104 L329 151 Q341 183 325 211 Q307 239 257 242 Q150 252 102 237 Q72 225 81 174Z"/>
      <path class="duck-belly-shadow" d="M83 202 Q130 214 191 213 Q267 213 328 196 Q327 220 298 233 Q239 248 126 240 Q92 233 83 218Z"/>
      <path class="duck-fill" d="M123 139 Q91 121 99 73 Q105 36 139 22 Q181 3 216 29 Q244 52 235 99 Q229 129 205 145 Q165 157 123 139Z"/>
      <path class="duck-neck-line" d="M124 137 Q151 155 181 151"/>
      <path class="duck-highlight" d="M119 80 Q125 38 160 27 Q186 20 207 31"/>
      <path class="wing" d="M194 157 Q211 144 228 150 Q239 153 246 147 Q256 139 267 145 Q274 149 274 157 Q287 160 291 171 Q294 183 281 190 Q267 200 250 202 Q231 210 212 200 Q199 194 194 181 Q188 169 194 157Z"/>
      <path class="wing-groove" d="M244 153 Q252 164 265 166 M263 147 Q270 160 282 164"/>
      <path class="beak" d="M128 91 Q105 83 82 91 L46 94 Q33 98 35 110 L62 130 Q79 137 102 126 L135 112Z"/>
      <path class="beak-lower" d="M39 109 Q62 112 82 121 Q106 131 132 112 Q139 121 131 129 Q105 148 76 140 Q51 134 39 119Z"/>
      <path class="beak-seam" d="M43 108 Q75 110 103 123 Q120 127 133 115"/>
      <ellipse class="eye" cx="162" cy="79" rx="12" ry="16"/><circle class="eye-glint" cx="158" cy="73" r="4"/>
    </svg>`
  },
  side: {
    label: 'Side profile',
    note: 'Full profile tests the beak depth, neck seam, raised tail, and body run.',
    svg: `<svg viewBox="0 0 360 270" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Side profile static rubber duck facing left">
      <path class="duck-fill" d="M70 164 Q84 132 121 126 Q154 117 192 127 Q241 134 281 124 Q296 94 306 89 Q315 86 320 102 L328 151 Q339 181 322 209 Q306 236 264 241 Q160 251 104 236 Q62 225 70 164Z"/>
      <path class="duck-belly-shadow" d="M72 202 Q138 213 206 211 Q276 211 328 194 Q326 219 296 233 Q233 247 119 239 Q80 232 72 218Z"/>
      <path class="duck-fill" d="M132 136 Q101 119 104 74 Q106 33 140 21 Q179 7 209 31 Q234 51 230 92 Q227 126 201 143 Q162 154 132 136Z"/>
      <path class="duck-neck-line" d="M132 136 Q158 153 185 148"/>
      <path class="duck-highlight" d="M119 77 Q124 38 153 28 Q178 20 199 32"/>
      <path class="wing" d="M174 159 Q191 146 209 151 Q220 154 229 147 Q239 140 250 146 Q257 151 256 158 Q271 160 276 171 Q279 182 266 190 Q250 199 234 202 Q216 209 197 201 Q181 195 176 181 Q169 169 174 159Z"/>
      <path class="wing-groove" d="M226 154 Q235 164 250 166 M246 149 Q253 160 267 164"/>
      <path class="beak" d="M133 91 Q111 83 86 88 L43 95 Q30 99 33 110 L63 131 Q82 139 106 126 L140 111Z"/>
      <path class="beak-lower" d="M36 110 Q65 113 87 123 Q112 133 137 111 Q144 120 136 129 Q110 148 78 141 Q51 135 36 119Z"/>
      <path class="beak-seam" d="M41 108 Q72 110 101 124 Q120 128 139 114"/>
      <ellipse class="eye" cx="143" cy="77" rx="11" ry="15"/><circle class="eye-glint" cx="140" cy="71" r="4"/>
    </svg>`
  },
  rear: {
    label: 'Rear three-quarter',
    note: 'Face recedes; checks the far/near molded wings and raised tail.',
    svg: `<svg viewBox="0 0 360 270" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Rear three-quarter static rubber duck turned away">
      <path class="duck-fill" d="M68 169 Q83 139 119 128 Q162 117 208 130 Q250 137 283 123 Q297 96 307 91 Q316 89 321 105 L330 155 Q341 183 325 211 Q305 239 256 242 Q146 251 100 236 Q63 223 68 169Z"/>
      <path class="duck-belly-shadow" d="M71 203 Q138 213 207 211 Q280 210 329 194 Q327 219 298 233 Q234 247 115 239 Q79 233 71 218Z"/>
      <path class="far-wing" d="M99 163 Q117 147 134 153 Q146 157 150 172 Q145 186 126 191Z"/>
      <path class="duck-fill" d="M126 137 Q96 119 101 75 Q108 35 142 22 Q180 8 214 31 Q244 54 234 100 Q228 129 203 145 Q163 154 126 137Z"/>
      <path class="duck-neck-line" d="M128 137 Q156 154 185 149"/>
      <path class="duck-highlight" d="M119 77 Q128 38 160 28 Q188 21 210 36"/>
      <path class="wing" d="M156 155 Q176 140 193 147 Q207 152 215 144 Q225 137 236 144 Q244 148 244 156 Q259 159 263 171 Q267 182 253 190 Q237 199 221 201 Q202 209 183 200 Q166 194 160 180 Q153 167 156 155Z"/>
      <path class="wing-groove" d="M211 151 Q220 163 236 165 M234 147 Q241 158 255 164"/>
      <path class="tail-seam" d="M282 126 Q297 134 315 130"/>
    </svg>`
  },
  high: {
    label: 'High angle',
    note: 'Top-down foreshortening flattens the head and body while retaining the eye, bill, raised tail, and molded wing landmarks.',
    svg: `<svg viewBox="0 0 360 270" preserveAspectRatio="xMidYMax meet" role="img" aria-label="High angle static rubber duck">
      <path class="duck-fill" d="M58 155 Q65 120 112 109 Q157 99 207 107 Q260 117 290 103 Q301 82 310 79 Q318 77 323 93 L332 137 Q342 169 326 199 Q304 228 255 234 Q149 244 98 229 Q57 215 58 155Z"/>
      <path class="duck-belly-shadow" d="M61 195 Q135 207 207 204 Q281 202 330 186 Q326 211 297 224 Q232 239 115 231 Q76 225 61 211Z"/>
      <path class="duck-fill" d="M124 129 Q100 118 104 78 Q108 46 140 34 Q179 17 212 34 Q238 48 234 82 Q230 113 204 132 Q163 143 124 129Z"/>
      <path class="duck-neck-line" d="M126 128 Q154 142 185 137"/>
      <path class="duck-highlight" d="M119 73 Q126 43 157 35 Q185 28 209 40"/>
      <path class="wing" d="M191 145 Q210 129 228 135 Q240 138 248 131 Q258 124 269 131 Q277 135 276 143 Q291 146 296 157 Q300 169 286 177 Q270 186 253 189 Q235 196 216 187 Q200 181 196 169 Q188 156 191 145Z"/>
      <path class="wing-groove" d="M246 138 Q255 149 270 151 M267 132 Q274 145 288 150"/>
      <path class="beak" d="M126 85 Q105 80 82 84 L45 90 Q32 93 35 102 L63 119 Q81 126 104 114 L136 100Z"/>
      <path class="beak-lower" d="M39 102 Q66 105 87 114 Q110 123 133 100 Q140 108 132 117 Q107 134 77 128 Q52 123 39 112Z"/>
      <path class="beak-seam" d="M43 101 Q72 103 100 115 Q119 119 135 104"/>
      <ellipse class="eye" cx="163" cy="64" rx="10" ry="12"/><circle class="eye-glint" cx="160" cy="60" r="3"/>
    </svg>`
  },  low: {
    label: 'Low angle',
    note: 'Low view emphasizes underside and raised tail with consistent head/wing placement.',
    svg: `<svg viewBox="0 0 360 270" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Low angle static rubber duck">
      <path class="duck-fill" d="M76 154 Q90 128 124 125 Q163 120 205 130 Q253 138 286 126 Q298 98 308 94 Q317 92 322 108 L329 150 Q338 176 323 200 Q301 226 252 233 Q149 246 104 232 Q69 219 76 154Z"/>
      <path class="duck-belly-shadow" d="M77 200 Q142 211 208 209 Q278 208 328 192 Q323 214 295 225 Q233 241 118 234 Q83 228 77 212Z"/>
      <path class="duck-fill" d="M126 136 Q99 120 104 77 Q110 39 143 27 Q180 13 211 36 Q238 57 233 96 Q229 127 204 144 Q165 153 126 136Z"/>
      <path class="duck-neck-line" d="M128 136 Q154 150 185 146"/>
      <path class="duck-highlight" d="M121 79 Q129 43 161 34 Q190 26 210 42"/>
      <path class="wing" d="M194 156 Q211 143 229 149 Q240 152 248 145 Q258 138 269 145 Q277 149 276 157 Q290 160 294 171 Q297 183 283 190 Q267 199 251 201 Q232 208 214 200 Q198 194 194 181 Q188 168 194 156Z"/>
      <path class="wing-groove" d="M245 152 Q254 163 269 165 M266 146 Q273 159 287 163"/>
      <path class="beak" d="M129 92 Q107 85 84 92 L47 100 Q34 104 37 115 L64 134 Q82 142 106 130 L138 113Z"/>
      <path class="beak-lower" d="M41 115 Q68 118 89 127 Q113 137 136 113 Q143 122 135 131 Q109 149 79 142 Q53 137 41 125Z"/>
      <path class="beak-seam" d="M45 113 Q74 115 102 128 Q121 132 137 117"/>
      <ellipse class="eye" cx="154" cy="82" rx="11" ry="15"/><circle class="eye-glint" cx="151" cy="76" r="4"/>
    </svg>`
  }
};
