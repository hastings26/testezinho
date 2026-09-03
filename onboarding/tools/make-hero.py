"""Generate the pixel-art hero sprite sheet (4 frames of 16x24, facing right).

Usage:  python3 tools/make-hero.py     ->  hero.png (+ hero_preview.png at 6x)

Frames, left to right: idle, walk A, walk B, cheer. map.css slices the sheet
with background-size: 400% 100%. Edit the pixel rows below to restyle the
avatar; every row must be exactly 16 characters and each frame 24 rows.
"""
from PIL import Image

PAL = {
    '.': None,
    'K': (26, 20, 48),        # outline
    'H': (74, 48, 34),        # hair
    'h': (108, 72, 50),       # hair highlight
    'S': (245, 200, 155),     # skin
    's': (214, 163, 120),     # skin shade
    'E': (26, 20, 48),        # eye
    'B': (29, 78, 216),       # Pax8 blue shirt
    'b': (22, 56, 160),       # shirt shade
    'T': (0, 208, 156),       # teal accent
    'P': (44, 58, 92),        # trousers
    'p': (32, 43, 70),        # trousers shade
    'O': (58, 40, 28),        # shoes
    'W': (240, 240, 245),     # highlight / lanyard card
}

HEAD = [
    '................',
    '.....KKKKKK.....',
    '....KHHHHHHK....',
    '...KHHhhhhHHK...',
    '...KHHHHHHHHK...',
    '...KHSSSSSSSK...',
    '...KSSESSESSK...',
    '...KSSSSSSSSK...',
    '...KSsSSSSsSK...',
    '....KSSSSSSK....',
    '.....KKSSKK.....',
]

# body rows are shared, legs/arms swap per frame
def body(arm_l, arm_r):
    return [
        '...KKBBBBBBKK...',
        '..K%BBBTTBBB&K..'.replace('%', arm_l).replace('&', arm_r),
        '..K%BBWTTBBB&K..'.replace('%', arm_l).replace('&', arm_r),
        '..K%BBBTTBBB&K..'.replace('%', arm_l).replace('&', arm_r),
        '...KbBBBBBBbK...',
        '...KbBBBBBBbK...',
        '...KKPPPPPPKK...',
    ]

LEGS = {
    'stand': [
        '...KPPPKKPPPK...',
        '...KPPK..KPPK...',
        '...KPPK..KPPK...',
        '...KOOK..KOOK...',
        '..KKOOK..KOOKK..',
        '..KKKKK..KKKKK..',
    ],
    'stepA': [
        '...KPPPKKPPPK...',
        '..KPPPK...KPPK..',
        '..KPPK.....KPPK.',
        '..KOOK.....KOOK.',
        '.KKOOKK...KKOOKK',
        '.KKKKK.....KKKK.',
    ],
    'stepB': [
        '...KPPPKKPPPK...',
        '...KPPK..KPPPK..',
        '....KPPK..KPPK..',
        '....KOOK..KOOK..',
        '...KKOOK.KKOOKK.',
        '...KKKKK..KKKKK.',
    ],
    'cheer': [
        '...KPPPKKPPPK...',
        '...KPPK..KPPK...',
        '..KPPK....KPPK..',
        '..KOOK....KOOK..',
        '.KKOOK....KOOKK.',
        '.KKKKK....KKKKK.',
    ],
}

FRAMES = [
    ('idle',  'S', 'S', 'stand'),   # arms down
    ('walkA', 's', 'S', 'stepA'),
    ('walkB', 'S', 's', 'stepB'),
    ('cheer', 'T', 'T', 'cheer'),
]

CHEER_ARMS = [
    '..S..KKBBKK..S..',
    '..S.KBBBTTBBK.S.',
    '..KKKBBWTTBBKKK.',
    '...KbBBBTTBBbK..',
    '...KbBBBBBBbK...',
    '...KbBBBBBBbK...',
    '...KKPPPPPPKK...',
]

W, HGT = 16, 24
sheet = Image.new('RGBA', (W * len(FRAMES), HGT), (0, 0, 0, 0))

for i, (name, arm_l, arm_r, legs) in enumerate(FRAMES):
    rows = list(HEAD)
    rows += CHEER_ARMS if name == 'cheer' else body(arm_l, arm_r)
    rows += LEGS[legs]
    # walk frames bob one pixel
    if name in ('walkB',):
        rows = rows[1:] + ['.' * W]
    assert len(rows) == HGT, (name, len(rows))
    for y, row in enumerate(rows):
        assert len(row) == W, (name, y, len(row), row)
        for x, ch in enumerate(row):
            col = PAL[ch]
            if col:
                sheet.putpixel((i * W + x, y), col + (255,))

sheet.save('hero.png')
sheet.resize((W * len(FRAMES) * 6, HGT * 6), Image.NEAREST).save('hero_preview.png')
print('wrote hero.png', sheet.size)
