// All plan content lives here so it is easy to edit.
// An exercise is {slot, v, s, r, t, rest, note, kind, log, top}
//   v    variant (or [block1, block2, block3]) = {id, name, yt?}
//        `id` is the tracking id: progress and suggestions follow the id week after week.
//   s    sets (number or per-block array)      r  reps text (string or per-block array)
//   t    'main' follows the week's RPE, 'iso' sits at RPE 8-9
//   kind 'barbell' | 'db' | 'machine' | 'cable' | 'bw' | 'band' (sets the weight jump size)
//   log  'wr' weight+reps (default) | 'reps' | 'time' | 'check'
//   top  true = gets a top set of 5 in the week-12 test week

export const BLOCKS = ['Foundation', 'Intensify', 'Peak'];

// [heavy-lift RPE, isolation RPE] per week, or 'deload' / 'test'
export const EFFORT = [
  ['7', '7-8'], ['8', '8'], ['8-9', '8-9'], 'deload',
  ['7-8', '8'], ['8', '8-9'], ['8-9', '9'], 'deload',
  ['8', '8-9'], ['8-9', '9'], ['9', '9'], 'test'
];

export const RIR = {
  '6': '4 or more reps left', '7': 'about 3 reps left', '7-8': '2 to 3 reps left',
  '8': 'about 2 reps left', '8-9': '1 to 2 reps left', '9': 'about 1 rep left'
};

export const POSMSG = [
  'First week of the block is easier on purpose. Pick weights you can crush.',
  'Add weight or reps wherever every set reached the top of the range.',
  'Push this week. Aim for personal bests with good form.'
];

export const blockOf = (week) => Math.floor((week - 1) / 4);
export const isDeload = (week) => EFFORT[week - 1] === 'deload';
export const isTest = (week) => EFFORT[week - 1] === 'test';
export const pick = (x, b) => (Array.isArray(x) ? x[b] : x);

export const DAYS = [
  { k: 'mon', label: 'Mon', tag: 'lower' },
  { k: 'tue', label: 'Tue', tag: 'upper' },
  { k: 'wed', label: 'Wed', tag: 'lower' },
  { k: 'thu', label: 'Thu', tag: 'rest' },
  { k: 'fri', label: 'Fri', tag: 'upper' },
  { k: 'sat', label: 'Sat', tag: 'lower' },
  { k: 'sun', label: 'Sun', tag: 'rest' }
];
export const TRAINING_DAYS = ['mon', 'tue', 'wed', 'fri', 'sat'];
export const ALL_SESSION_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export const WARM = {
  lower:
    '5 minutes of easy bike or incline walk. Then 10 leg swings each direction on each leg, 10 bodyweight hip thrusts with a mini-band, and 8 goblet squats. Ramp up your first lift: bar for 10, 50% for 5, 70% for 3, 85% for 1 to 2, then start the working sets.',
  upper:
    '5 minutes of easy rowing or bike. Then 15 band pull-aparts, 10 scapular pull-ups or dead hangs, and 10 band external rotations per side. Do 2 light ramp-up sets before your first press or pull.'
};

const V = (id, name, yt) => ({ id, name, yt });
const same = (id, name, yt) => V(id, name, yt);

// ---------------------------------------------------------------- GYM

export const GYM = {
  mon: {
    title: 'Lower 1: squat and strength',
    time: 'About 70 minutes',
    focus: 'The heaviest leg day. Squat first while you’re fresh.',
    warm: 'lower',
    after: 'No cardio today.',
    ex: [
      {
        slot: 'a', kind: 'barbell', t: 'main', top: true, s: 4, r: ['5-6', '5', '4-6'], rest: '3 min',
        v: [V('squat', 'Back squat, 3-second lowering', 'x1T027SHlUQ'), V('squat', 'Back squat, 1-second pause at the bottom', 'x1T027SHlUQ'), V('squat', 'Back squat, full depth', 'x1T027SHlUQ')],
        note: 'Stance a little wider than your shoulders, toes out about 15°. Sit hips back and down, drive through the whole foot.'
      },
      {
        slot: 'b', kind: 'barbell', t: 'main', top: true, s: [3, 3, 4], r: ['8-10', '8-10', '6-8'], rest: '2 to 3 min',
        v: [V('hipthrust', 'Barbell hip thrust', 'OrFnJjrAEFU'), V('hipthrust', 'Barbell hip thrust, 2-second pause at the top', 'c7Im2zPPlwc'), V('hipthrust', 'Barbell hip thrust, heavy', 'OrFnJjrAEFU')],
        note: 'Chin tucked, ribs down, shins vertical at the top. Squeeze hard and don’t arch your lower back.'
      },
      {
        slot: 'c', kind: 'db', t: 'main', s: 3, r: '8-10 each leg', rest: '2 min',
        v: [V('bulgarian', 'DB Bulgarian split squat'), V('lunge', 'Walking lunge with a long step', 'VfiTjugSDCQ'), V('bulgarian', 'DB Bulgarian split squat')],
        note: 'A long step and a slight forward lean puts more load on the glutes. Weight is per hand.'
      },
      {
        slot: 'd', kind: 'machine', t: 'iso', s: 3, r: '8-10', rest: '90 sec',
        v: [V('lyingcurl', 'Lying leg curl', 'qtF4VICzrgc'), V('seatedcurl', 'Seated leg curl', 'GLkxU3SB_Uw'), V('lyingcurl', 'Lying leg curl', 'qtF4VICzrgc')],
        note: 'Lower for 3 seconds and squeeze at the top.'
      },
      {
        slot: 'e', kind: 'bw', t: 'iso', log: 'reps', s: 3, r: '8-12', rest: '60 sec',
        v: [V('hangknee', 'Hanging knee raise', 'mfHDPEwdWpg'), V('hangleg', 'Hanging leg raise', 'mfHDPEwdWpg'), V('hangleg', 'Hanging leg raise', 'mfHDPEwdWpg')],
        note: 'Curl your pelvis up at the top. No swinging.'
      }
    ]
  },
  tue: {
    title: 'Upper 1: back width and shoulders',
    time: 'About 65 minutes',
    focus: 'Wide lats and round shoulders make the waist look smaller.',
    warm: 'upper',
    after: 'After lifting: 20 to 30 minutes of easy cardio at a conversational pace.',
    ex: [
      {
        slot: 'a', kind: 'bw', t: 'main', top: true, s: 4, r: ['6-8', '6-8', '5-8'], rest: '2 min', wLabel: '+kg',
        v: [V('pullup', 'Pull-up or assisted pull-up', 'SqczJYIZXGw'), V('pullup', 'Pull-up, add weight once 4×8 is easy', 'SqczJYIZXGw'), V('pullup', 'Pull-up, weighted if you can', 'SqczJYIZXGw')],
        note: 'Full hang to chin over the bar. Log added weight in kg (leave blank for bodyweight). If you can’t reach 6 reps, use a band, the assist machine, or a lat pulldown for the same reps.'
      },
      { slot: 'b', kind: 'db', t: 'main', s: 3, r: '8-10', rest: '2 min', v: V('dbpress', 'Seated DB shoulder press'), note: 'Lower until your elbows reach 90° and keep your ribs down. Weight is per hand.' },
      { slot: 'c', kind: 'machine', t: 'main', s: 3, r: '8-10', rest: '2 min', v: V('csrow', 'Chest-supported row', '8raJEV0ksSk'), note: 'Pull your elbows toward your hips and squeeze for 1 second.' },
      { slot: 'd', kind: 'db', t: 'main', s: [2, 2, 3], r: '8-10', rest: '2 min', v: V('incline', 'Incline DB press, 45°', 'p2t9daxLpB8'), note: 'Keeps the chest in proportion without adding bulk. Weight is per hand.' },
      { slot: 'e', kind: 'cable', t: 'iso', s: [3, 4, 4], r: '10-15', rest: '60 sec', v: V('cablelat', 'Cable lateral raise', '0VvQ6olHi4I'), note: 'Cable between your legs, lean away, and lift out to the side with the back of your hand.' },
      { slot: 'f', kind: 'machine', t: 'iso', s: 3, r: '12-15', rest: '60 sec', v: V('revpec', 'Reverse pec deck', 'RDqcEtGi3BI'), note: 'Push the handles out, not back.' }
    ]
  },
  wed: {
    title: 'Lower 2: hinge and glute shape',
    time: 'About 65 minutes',
    focus: 'Hamstrings, glutes and calves, plus cable crunches for the abs.',
    warm: 'lower',
    after: 'No cardio today.',
    ex: [
      {
        slot: 'a', kind: 'barbell', t: 'main', top: true, s: [4, 4, 3], r: ['8-10', '8-10', '4-6'], rest: ['2 min', '2 min', '3 min'],
        v: [V('rdl', 'Romanian deadlift', 'E-lKh2yDzgo'), V('rdl', 'Romanian deadlift, 3-second lowering', 'E-lKh2yDzgo'), V('deadlift', 'Conventional or sumo deadlift', '4NjbwAbSkYw')],
        note: [
          'Push your hips back until you feel a hamstring stretch. Keep the bar close to your legs.',
          'Push your hips back until you feel a hamstring stretch. Keep the bar close to your legs.',
          'Reset between every rep. No touch-and-go.'
        ]
      },
      {
        slot: 'b', kind: 'db', t: 'iso', s: 3, r: '10-15', rest: '90 sec',
        v: [V('backext', '45° back extension, rounded upper back', 'ntiYM2RI5wA'), V('backext', '45° back extension, rounded upper back', 'ntiYM2RI5wA'), V('backext', '45° back extension, DB held at chest', 'ntiYM2RI5wA')],
        note: 'Round your upper back slightly and drive your hips into the pad. Squeeze your glutes at the top. Log any weight you hold.'
      },
      {
        slot: 'c', kind: 'db', t: 'main', s: 3, r: '8-10 each leg', rest: '90 sec',
        v: [V('stepup', 'DB step-up, high box'), V('curtsy', 'Deficit curtsy lunge'), V('stepup', 'DB step-up, high box, heavier')],
        note: 'Lean forward slightly and drive through the front heel. Weight is per hand.'
      },
      { slot: 'd', kind: 'cable', t: 'iso', s: [3, 3, 4], r: '12-15', rest: '90 sec', v: V('pullthrough', 'Cable pull-through', 'YSsIPZlnGKw'), note: 'Set your hips back for a deep glute stretch, then snap them forward.' },
      { slot: 'e', kind: 'machine', t: 'iso', s: 3, r: '12-15', rest: '60 sec', v: V('calf', 'Standing calf raise', 'z9jjr-_-wsM'), note: 'Pause at the bottom stretch and at the top.' },
      { slot: 'f', kind: 'cable', t: 'iso', s: 3, r: '10-15', rest: '60 sec', v: V('cablecrunch', 'Cable crunch'), note: 'Round your spine and bring your ribs toward your pelvis. Don’t pull with your arms.' },
      {
        slot: 'g', kind: 'band', t: 'iso', log: 'check', s: 2, r: '30 + 15 + 15 each side', rest: '30 sec between moves',
        v: V('pumpfin', 'Optional pump finisher: frog pump, banded lateral walk, band kickback', 'OegaGp_brPs'),
        note: 'About 8 minutes of band and bodyweight glute work. Skip it if you’re tired or short on time.'
      }
    ]
  },
  fri: {
    title: 'Upper 2: shoulders, arms and abs',
    time: 'About 60 minutes',
    focus: 'Higher reps and shorter rests for shoulder shape and a core that pulls everything in.',
    warm: 'upper',
    after: 'After lifting: 20 to 30 minutes of easy cardio at a conversational pace.',
    ex: [
      { slot: 'a', kind: 'machine', t: 'iso', s: [3, 4, 4], r: '10-12', rest: '90 sec', v: V('pulldown', 'Lat pulldown, neutral or close grip', 'o59FqNqbYwE'), note: 'Pull your elbows down and in. Touch the bar to your upper chest.' },
      {
        slot: 'b', kind: 'machine', t: 'iso', s: 3, r: '10-12', rest: '90 sec',
        v: [V('machpress', 'Machine shoulder press', 'flr4ohSl0j8'), V('arnold', 'Arnold press', 'rPj2QaSVBWs'), V('machpress', 'Machine shoulder press', 'flr4ohSl0j8')],
        note: 'Smooth reps through the full range.'
      },
      { slot: 'c', kind: 'db', t: 'iso', s: 3, r: '10-12 each side', rest: '90 sec', v: V('oarow', 'One-arm DB row'), note: 'Pull the dumbbell to your back pocket and stretch the lat at the bottom.' },
      { slot: 'd', kind: 'db', t: 'iso', s: 4, r: '12-20', rest: '45 sec', v: V('dblat', 'DB lateral raise, last set a drop set', 'y18whMZfRhY'), note: 'Light and strict. Lead with the elbow. No swinging. Weight is per hand.' },
      { slot: 'e', kind: 'cable', t: 'iso', s: 3, r: '12-15', rest: '45 sec', v: V('revfly', 'Reverse cable fly', 'uCV40OQMGpM'), note: 'Squeeze your rear delts and keep your shoulders down.' },
      { slot: 'f', kind: 'cable', t: 'iso', s: 2, r: '12-15', rest: '60 sec', v: V('curl', 'Cable biceps curl', 'fBZV_ToDWnM'), note: 'Arms are for balance, so keep this short.' },
      { slot: 'g', kind: 'cable', t: 'iso', s: 2, r: '12-15', rest: '60 sec', v: V('pushdown', 'Rope triceps pushdown', 'IvL3-3GxGjE'), note: 'Elbows pinned to your sides.' },
      {
        slot: 'h', kind: 'bw', t: 'iso', log: 'reps', s: 3, r: '8-12', rest: '60 sec',
        v: [V('rollout', 'Swiss ball roll-out'), V('abwheel', 'Ab wheel roll-out from your knees'), V('abwheel', 'Ab wheel roll-out from your knees')],
        note: 'Ribs down and glutes squeezed. Stop before your lower back sags.'
      },
      { slot: 'i', kind: 'bw', t: 'iso', log: 'time', s: 2, r: '30-40 sec each side', rest: '45 sec', v: V('sideplank', 'Side plank'), note: 'Straight line from head to heels. Log seconds per side.' }
    ]
  },
  sat: {
    title: 'Lower 3: glute pump',
    time: 'About 60 minutes',
    focus: 'Lighter weights, higher reps, and a lot of glute-medius work for shape.',
    warm: 'lower',
    after: 'No cardio today.',
    ex: [
      {
        slot: 'a', kind: 'barbell', t: 'iso', s: 3, r: '12-15', rest: '2 min',
        v: [V('hipthrust-pump', 'Barbell hip thrust, last set with a drop set', 'OrFnJjrAEFU'), V('hipthrust-pump', 'Barbell hip thrust, 1-second pause, last set with a drop set', 'c7Im2zPPlwc'), V('hipthrust-pump', 'Barbell hip thrust, 1-second pause, last set with a drop set', 'c7Im2zPPlwc')],
        note: 'On the last set, cut the weight by about 40% and do 15 more reps. Log the heavier part.'
      },
      { slot: 'b', kind: 'machine', t: 'iso', s: 3, r: '12-15', rest: '90 sec', v: V('legpress', 'Leg press, feet high and wide', 'GupsTxSmzg8'), note: 'Don’t lock your knees. Feet high and wide shifts the work to the glutes.' },
      {
        slot: 'c', kind: 'db', t: 'iso', s: 3, r: '10-15 each leg', rest: '60 sec',
        v: [V('slthrust', 'Single-leg hip thrust'), V('kickback', 'Cable glute kickback', 'hGZgeyXQ1J4'), V('slthrust', 'Single-leg hip thrust, DB on your hip')],
        note: 'Constant tension and a hard squeeze at the top of every rep.'
      },
      { slot: 'd', kind: 'machine', t: 'iso', s: 3, r: '15-25', rest: '60 sec', v: V('abduct', 'Seated hip abduction machine, last set with a drop set', 'vCHMWIzS3Gs'), note: 'Lean forward slightly and drive your knees out.' },
      {
        slot: 'e', kind: 'band', t: 'iso', log: 'check', s: 2, r: '30 + 15 steps each way', rest: '60 sec after both',
        v: V('pump2', 'Superset: frog pump, then banded side walk', 'OegaGp_brPs'), note: 'You’re chasing the pump here, not heavy weight.'
      },
      { slot: 'f', kind: 'machine', t: 'iso', s: 3, r: '15-20', rest: '60 sec', v: V('seatcalf', 'Seated calf raise', '-hAzO7PlGnk'), note: 'Slow reps with a pause at the bottom.' },
      {
        slot: 'g', kind: 'bw', t: 'iso', log: 'check', s: 2, r: '30 sec each', rest: '15 sec between moves',
        v: V('express', 'Optional express abs: V-sit, heel touches, reverse crunch, knee tuck'),
        note: 'A 6-minute circuit as a fourth core session. Skip it if your abs are still sore from Friday.'
      }
    ]
  }
};

// ---------------------------------------------------------------- HOME

export const HOME = {
  mon: {
    title: 'Home Lower A', time: 'About 45 minutes', focus: 'Single-leg strength and glute work with dumbbells and a couch.', warm: 'lower', after: 'No cardio today.',
    ex: [
      { slot: 'a', kind: 'db', t: 'main', s: 4, r: '8-12 each leg', rest: '90 sec', v: V('h-bulg', 'DB Bulgarian split squat'), note: 'Weight is per hand.' },
      { slot: 'b', kind: 'db', t: 'main', s: 4, r: '10-15 each leg', rest: '90 sec', v: V('h-slthrust', 'Single-leg hip thrust, back on a couch'), note: 'Hold a dumbbell on your hip once bodyweight gets easy.' },
      { slot: 'c', kind: 'db', t: 'main', s: 3, r: '10-12', rest: '90 sec', v: V('h-rdl', 'DB Romanian deadlift'), note: 'Weight is per hand. Push your hips back and keep the dumbbells close.' },
      { slot: 'd', kind: 'bw', t: 'iso', log: 'reps', s: 3, r: '30', rest: '45 sec', v: V('h-frog', 'Frog pump'), note: 'Hard squeeze at the top of every rep.' },
      { slot: 'e', kind: 'bw', t: 'iso', log: 'reps', s: 3, r: '10-15', rest: '45 sec', v: V('h-lyingleg', 'Lying leg raise'), note: 'Keep your lower back pressed down.' }
    ]
  },
  tue: {
    title: 'Home Upper A', time: 'About 40 minutes', focus: 'Push-ups, rows and shoulder work.', warm: 'upper', after: 'After lifting: 20 to 30 minutes of easy cardio at a conversational pace.',
    ex: [
      { slot: 'a', kind: 'bw', t: 'main', log: 'reps', s: 4, r: '8-15', rest: '90 sec', v: V('h-pushup', 'Push-up'), note: 'Stop 2 reps short of failure. Slow lowering.' },
      { slot: 'b', kind: 'db', t: 'main', s: 4, r: '8-12 each side', rest: '90 sec', v: V('h-row', 'One-arm DB row'), note: 'Pull to your back pocket and stretch at the bottom.' },
      { slot: 'c', kind: 'db', t: 'main', s: 3, r: '8-12', rest: '90 sec', v: V('h-press', 'Pike press or DB shoulder press'), note: 'Weight is per hand if you use dumbbells.' },
      { slot: 'd', kind: 'db', t: 'iso', s: 4, r: '12-20', rest: '45 sec', v: V('h-lat', 'DB lateral raise'), note: 'Light and strict. Weight is per hand.' },
      { slot: 'e', kind: 'db', t: 'iso', s: 3, r: '12-15', rest: '45 sec', v: V('h-rear', 'Bent-over rear delt raise'), note: 'Hinge forward and raise out to the sides.' }
    ]
  },
  wed: {
    title: 'Home Lower B', time: 'About 45 minutes', focus: 'Quads, hamstrings and glutes with a core finisher.', warm: 'lower', after: 'No cardio today.',
    ex: [
      { slot: 'a', kind: 'db', t: 'main', s: 4, r: '10-15', rest: '90 sec', v: V('h-goblet', 'Heels-elevated DB goblet squat'), note: 'Heels on a plate or small step. Sit straight down.' },
      { slot: 'b', kind: 'bw', t: 'iso', log: 'reps', s: 3, r: '5-8', rest: '90 sec', v: V('h-nordic', 'Nordic or sliding leg curl'), note: 'Lower as slowly as you can.' },
      { slot: 'c', kind: 'db', t: 'main', s: 3, r: '10 each leg', rest: '90 sec', v: V('h-revlunge', 'Deficit reverse lunge'), note: 'Weight is per hand.' },
      { slot: 'd', kind: 'band', t: 'iso', log: 'reps', s: 4, r: '15-20', rest: '60 sec', v: V('h-bridge', 'Banded glute bridge'), note: 'Hold a 2-second squeeze at the top.' },
      { slot: 'e', kind: 'band', t: 'iso', log: 'reps', s: 3, r: '20-25', rest: '45 sec', v: V('h-abd', 'Side-lying hip abduction'), note: 'Toes pointing slightly down.' },
      { slot: 'f', kind: 'bw', t: 'iso', log: 'reps', s: 3, r: '15-20', rest: '45 sec', v: V('h-bicycle', 'Bicycle crunch', 'UzVC4oW00rM'), note: 'Slow and controlled.' }
    ]
  },
  fri: {
    title: 'Home Upper B', time: 'About 40 minutes', focus: 'Shoulder shape, back and core.', warm: 'upper', after: 'After lifting: 20 to 30 minutes of easy cardio at a conversational pace.',
    ex: [
      { slot: 'a', kind: 'bw', t: 'iso', log: 'reps', s: 3, r: '8-15', rest: '90 sec', v: V('h-fepush', 'Feet-elevated push-up'), note: 'Stop 2 reps short of failure.' },
      { slot: 'b', kind: 'db', t: 'iso', s: 3, r: '10-12', rest: '90 sec', v: V('h-invrow', 'Inverted row or one-arm row', 'qMej4KCwReE'), note: 'Pull your elbows toward your hips.' },
      { slot: 'c', kind: 'band', t: 'iso', log: 'reps', s: 3, r: '8 each', rest: '60 sec', v: V('h-ytwl', 'Y-T-W-L raises'), note: 'Light weights or no weights. Slow reps.' },
      { slot: 'd', kind: 'db', t: 'iso', s: 4, r: '12-20', rest: '45 sec', v: V('h-lat2', 'DB lateral raise'), note: 'Weight is per hand.' },
      { slot: 'e', kind: 'bw', t: 'iso', log: 'time', s: 3, r: '20 sec', rest: '45 sec', v: V('h-rkc', 'RKC plank', 'k1H-CF00T3I'), note: 'Squeeze everything as hard as you can. Log seconds.' },
      { slot: 'f', kind: 'bw', t: 'iso', log: 'time', s: 2, r: '30 sec each side', rest: '45 sec', v: V('h-sideplank', 'Side plank'), note: 'Log seconds per side.' }
    ]
  },
  sat: {
    title: 'Home Lower C: pump', time: 'About 40 minutes', focus: 'Band and bodyweight glute circuit.', warm: 'lower', after: 'No cardio today.',
    ex: [
      {
        slot: 'a', kind: 'band', t: 'iso', log: 'check', s: 3, r: 'Rounds', rest: '60 sec between rounds',
        v: V('h-circuit', 'Circuit: side-lying hip abduction 20 each leg, frog pump 50, band quadruped hip extension 20 each leg, lateral band walk 20 each way', 'XPantXkn-Dg'),
        note: 'Tick each round as you finish it.'
      },
      { slot: 'b', kind: 'bw', t: 'iso', log: 'reps', s: 3, r: '30', rest: '45 sec', v: V('h-pulse', 'Squat pulse'), note: 'Pulse in the bottom third of the squat.' },
      { slot: 'c', kind: 'bw', t: 'iso', log: 'reps', s: 3, r: '20', rest: '45 sec', v: V('h-calf', 'Calf raise'), note: 'Slow reps with a pause at the bottom.' }
    ]
  }
};

export const REST = {
  thu: {
    title: 'Mobility and recovery day',
    body: [
      'A 20-minute yoga-style flow: a hip opener, a hamstring opener and a heart (chest) opener. Hold each pose for 5 slow breaths and repeat the flow twice.',
      'Then foam roll for 2 to 3 minutes each on the glutes, quads, lats and upper back.',
      'Finish with a 30 to 40 minute easy walk if you feel like it.',
      'Eat at maintenance, drink water, and sleep 7 to 8 hours. This is when the glutes actually grow.'
    ]
  },
  sun: {
    title: 'Rest day',
    body: [
      'Take a longer easy walk, stretch, and plan the week’s food.',
      'Look at your log. Which lifts are ready for more weight on Monday?'
    ]
  }
};

// ---------------------------------------------------------------- helpers

export function exercisesFor(day, mode) {
  const src = mode === 'home' ? HOME : GYM;
  return src[day] || null;
}

export function variantFor(ex, week) {
  return pick(ex.v, blockOf(week));
}

export function setsFor(ex, week) {
  const b = blockOf(week);
  let s = pick(ex.s, b);
  if (isDeload(week)) s = Math.min(s, 2);
  else if (isTest(week)) s = ex.top ? 3 : Math.max(2, s - 1);
  return s;
}

export function effortLabel(ex, week) {
  const e = EFFORT[week - 1];
  if (e === 'deload') return 'RPE 6';
  if (e === 'test') return ex.top ? 'RPE 9 top set' : 'RPE 7';
  return 'RPE ' + (ex.t === 'main' ? e[0] : e[1]);
}

export function weekBanner(week) {
  const b = blockOf(week);
  const pos = (week - 1) % 4;
  const e = EFFORT[week - 1];
  const title = `Week ${week} of 12, Block ${b + 1}: ${BLOCKS[b]}`;
  if (e === 'deload') {
    return { title, text: 'Deload. Keep last week’s weights, do only 2 sets per exercise, and stop well short of failure.', effort: 'Effort: RPE 6 (4 or more reps left).' };
  }
  if (e === 'test') {
    return { title, text: 'Test week. Work up to one top set of 5 on squat, hip thrust, deadlift and pull-up, then 2 back-off sets about 10% lighter. Everything else is one set lighter at RPE 7.', effort: 'After this week, rest 4 to 7 days, then restart the plan with heavier weights.' };
  }
  return {
    title,
    text: POSMSG[pos],
    effort: `Heavy lifts: RPE ${e[0]} (${RIR[e[0]]}). Isolation lifts: RPE ${e[1]} (${RIR[e[1]]}).`
  };
}

const search = (q) => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);

// Direct demo links come from the programs in the PDFs she was given (not verified live),
// so there is always a YouTube search link next to them as a fallback.
export function videoLinks(variant) {
  const links = [];
  if (variant.yt) links.push({ label: 'Watch demo', url: 'https://youtu.be/' + variant.yt });
  const base = variant.name.replace(/^(Optional|Superset|Circuit):\s*/i, '').split(',')[0];
  links.push({ label: 'Search YouTube', url: search(base + ' form tutorial') });
  return links;
}

export const TRACK_NAMES = (() => {
  const names = {
    squat: 'Back squat', hipthrust: 'Hip thrust (heavy day)', 'hipthrust-pump': 'Hip thrust (pump day)',
    rdl: 'Romanian deadlift', deadlift: 'Deadlift', pullup: 'Pull-up'
  };
  for (const src of [GYM, HOME]) {
    for (const day of Object.values(src)) {
      for (const ex of day.ex) {
        const list = Array.isArray(ex.v) ? ex.v : [ex.v];
        for (const v of list) if (!names[v.id]) names[v.id] = v.name.replace(/^(Optional|Superset|Circuit):\s*/i, '').split(',')[0];
      }
    }
  }
  return names;
})();
