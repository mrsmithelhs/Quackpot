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
    note: 'Head and body turn together: nape faces camera, near wing overlaps the back, far wing recedes, and the beak/eye barely clear the far edge.',
    svg: `<svg viewBox="0 0 360 270" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Rear three-quarter static rubber duck turned away">
      <path class="duck-fill" d="M104 170 Q113 138 147 128 Q183 119 219 129 Q255 136 277 122 Q289 99 300 96 Q309 96 315 111 L319 153 Q329 184 313 211 Q293 238 251 243 Q166 251 121 235 Q96 222 104 170Z"/>
      <path class="duck-belly-shadow" d="M108 203 Q162 213 217 210 Q274 207 317 193 Q313 218 284 233 Q230 248 137 239 Q111 233 108 218Z"/>
      <path class="far-wing" d="M91 160 Q106 140 124 147 Q140 153 143 171 Q138 187 118 191 Q100 183 91 160Z"/>
      <path class="duck-fill" d="M150 143 Q120 117 128 75 Q137 35 172 20 Q209 7 238 31 Q264 53 255 94 Q249 127 220 146 Q182 159 150 143Z"/>
      <path class="duck-highlight" d="M121 74 Q129 39 159 28 Q187 20 209 34"/>
      <path class="wing" d="M171 156 Q192 140 211 149 Q226 155 236 145 Q247 136 260 145 Q269 151 267 160 Q284 163 290 176 Q293 190 276 198 Q256 208 236 207 Q214 216 194 205 Q177 198 171 183 Q165 169 171 156Z"/>
      <path class="wing-groove" d="M228 154 Q240 166 256 167 M252 147 Q263 160 278 166"/>
      <path class="beak" d="M151 96 Q138 89 124 94 L101 102 Q94 106 98 114 L116 127 Q130 131 143 120 L157 110Z"/>
      <ellipse class="eye" cx="142" cy="81" rx="5" ry="8"/>
      <path class="tail-seam" d="M277 125 Q293 134 310 130"/>
    </svg>`
  },
  high: {
    label: 'High angle',
    note: 'Elevated foreshortening shows more crown and back; the paired wings sit on the turned body sides and the face compresses toward its near edge.',
    svg: `<svg viewBox="0 0 360 270" preserveAspectRatio="xMidYMax meet" role="img" aria-label="High angle static rubber duck">
      <path class="duck-fill" d="M58 155 Q65 120 112 109 Q157 99 207 107 Q260 117 290 103 Q301 82 310 79 Q318 77 323 93 L332 137 Q342 169 326 199 Q304 228 255 234 Q149 244 98 229 Q57 215 58 155Z"/>
      <path class="duck-belly-shadow" d="M61 195 Q135 207 207 204 Q281 202 330 186 Q326 211 297 224 Q232 239 115 231 Q76 225 61 211Z"/>
      <path class="far-wing" d="M97 138 Q111 119 129 126 Q146 132 149 152 Q145 171 126 176 Q108 168 97 138Z"/>
      <path class="duck-fill" d="M113 124 Q103 99 118 76 Q140 45 180 45 Q222 46 241 75 Q254 97 239 124 Q218 145 174 145 Q134 142 113 124Z"/>
      <path class="duck-neck-line" d="M126 128 Q154 142 185 137"/>
      <path class="duck-highlight" d="M119 73 Q126 43 157 35 Q185 28 209 40"/>
      <path class="wing" d="M236 133 Q254 122 273 133 Q289 145 285 166 Q278 182 259 181 Q241 174 236 155Z"/>
      <path class="wing-groove" d="M252 138 Q267 145 274 162"/>
      <path class="beak" d="M149 122 Q165 115 184 120 L204 131 Q208 137 200 142 Q180 151 159 141Z"/>
      <path class="beak-lower" d="M158 139 Q179 146 201 138 Q199 148 181 151 Q164 150 158 139Z"/>
      <ellipse class="eye" cx="145" cy="115" rx="7" ry="9"/><ellipse class="eye" cx="209" cy="115" rx="7" ry="9"/>
    </svg>`
  },
  low: {
    label: 'Low angle',
    note: 'Low view raises the head above a broad, shaded underside plane; near and far wings overlap the body at different scales.',
    svg: `<svg class="low-projection" viewBox="0 0 360 270" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Low angle static rubber duck">
      <path class="duck-fill" d="M76 154 Q90 128 124 125 Q163 120 205 130 Q253 138 286 126 Q298 98 308 94 Q317 92 322 108 L329 150 Q338 176 323 200 Q301 226 252 233 Q149 246 104 232 Q69 219 76 154Z"/>
      <path class="duck-belly-shadow" d="M64 190 Q120 178 184 184 Q261 190 313 173 Q326 197 309 214 Q282 234 218 240 Q133 242 84 226 Q63 214 64 190Z"/>
      <path class="far-wing" d="M96 159 Q111 143 130 150 Q144 157 146 173 Q140 188 122 189 Q104 181 96 159Z"/>
      <path class="duck-fill" d="M119 143 Q92 124 99 83 Q106 45 140 31 Q180 14 214 38 Q240 59 233 100 Q228 132 202 149 Q160 160 119 143Z"/>
      <path class="duck-neck-line" d="M128 136 Q154 150 185 146"/>
      <path class="duck-highlight" d="M121 79 Q129 43 161 34 Q190 26 210 42"/>
      <path class="wing" d="M177 159 Q198 144 218 152 Q234 158 244 147 Q256 138 269 148 Q277 155 273 164 Q291 168 294 181 Q294 194 276 200 Q256 207 237 207 Q215 214 196 203 Q180 196 177 182 Q171 170 177 159Z"/>
      <path class="wing-groove" d="M245 152 Q254 163 269 165 M266 146 Q273 159 287 163"/>
      <path class="beak" d="M121 99 Q104 91 87 97 L58 104 Q48 108 52 118 L76 132 Q94 136 111 125 L130 112Z"/>
      <path class="beak-lower" d="M41 115 Q68 118 89 127 Q113 137 136 113 Q143 122 135 131 Q109 149 79 142 Q53 137 41 125Z"/>
      <path class="beak-seam" d="M45 113 Q74 115 102 128 Q121 132 137 117"/>
      <ellipse class="eye" cx="154" cy="82" rx="11" ry="15"/><circle class="eye-glint" cx="151" cy="76" r="4"/>
    </svg>`
  }
};
