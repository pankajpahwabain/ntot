const SECTIONS = [
  {
    title: 'How to progress',
    items: [
      'Add reps first. When every set reaches the top of the rep range at the target effort, add the smallest weight jump: 2.5 kg on a barbell, about 2 kg on dumbbells, one pin on machines. The app suggests this for you.',
      'RPE is effort. RPE 8 means you could have done about 2 more reps. Heavy lifts follow the week’s RPE. Isolation lifts sit at RPE 8 to 9, and the last set can go close to failure.',
      'The first week of every block is easier on purpose. Pick weights you can crush.',
      'Weeks 4 and 8 are deloads: same weights, 2 sets per exercise, stop well short of failure. Week 12 is a test week: a top set of 5 on squat, hip thrust, deadlift and pull-up, then 2 back-off sets about 10% lighter. It is not a 1-rep-max test.',
      'After week 12, rest 4 to 7 days and run the plan again with heavier weights.'
    ]
  },
  {
    title: 'Abs and the waist',
    items: [
      'Visible abs depend mostly on body fat. Training makes the muscle thicker so it shows sooner, but it can’t remove belly fat from one spot.',
      'Abs get 3 sessions a week (Mon leg raises, Wed cable crunch, Fri roll-outs and side planks), plus an optional short circuit on Saturday.',
      'The tight-waist look comes from contrast: wider shoulders and lats, and bigger glutes.',
      'Skip heavy weighted side bends. Squats and deadlifts can stay heavy.'
    ]
  },
  {
    title: 'Cardio, steps and mobility',
    items: [
      '20 to 30 minutes of easy cardio after the Tuesday and Friday sessions. Conversational pace, heart rate roughly 105 to 130.',
      '8,000 to 10,000 steps a day.',
      'No hard cardio or long stair-stepper sessions before lower-body days.',
      'Thursday is a mobility day: a yoga-style flow, foam rolling and an easy walk.'
    ]
  },
  {
    title: 'Eating',
    items: [
      'Eat at maintenance calories for these 12 weeks. To find maintenance, track food and weight for 2 weeks.',
      'Protein: about 100 to 125 g a day, spread over 3 meals and 2 snacks (25 to 35 g per meal, 15 to 20 g per snack).',
      'Put most of the carbohydrate before and after training. Don’t push fats very low.',
      'Weigh in and look at the 7-day average, not one day. Stay within about 0.5 kg of the starting weight.',
      'If abs still aren’t visible after week 12, a mild cut of about 10 to 15% below maintenance for 6 to 8 weeks is the next step. Stop if energy, sleep or her cycle are disrupted.',
      'This is general guidance, not medical or dietitian advice.'
    ]
  },
  {
    title: 'After week 12: the next cycle',
    items: [
      'Rest 4 to 7 days, then repeat with heavier weights and swap some lifts: front squat or hack squat for squat, B-stance hip thrust for hip thrust, B-stance RDL or trap-bar deadlift for the hinge, deficit curtsy lunge for the split squat.',
      'Try one new technique at a time: 1¼ reps, 3-second pauses, 4-second lowering.'
    ]
  },
  {
    title: 'About the videos',
    items: [
      'Every exercise has a Search YouTube link that always works. Some also have a Watch demo link taken from the training programs this plan is built on. Those were copied from the programs and can’t be checked automatically, so if one has been removed, use the search link.'
    ]
  }
];

export default function Guide() {
  return (
    <div className="screen">
      <h2 className="page-title">Guide</h2>
      {SECTIONS.map((s, i) => (
        <details className="info" key={s.title} open={i === 0}>
          <summary>{s.title}</summary>
          <ul>{s.items.map((t) => <li key={t}>{t}</li>)}</ul>
        </details>
      ))}
    </div>
  );
}
