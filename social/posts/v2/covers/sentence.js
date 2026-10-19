// Cover: type only. The sentence, then where the money is.
cover('sentence', poster({ g: '#FBF9F3', label: 'Guidelines', bleed: false,
  words: () => S('headline', '“Applicants must demonstrate qualifying co-production status through a majority-held entity domiciled in a reciprocally recognised territory.”', 'class="mt-m soft" style="max-inline-size:30ch"'),
  obj: `<div style="height:100%;display:flex;align-items:flex-end">${S('display', `Somewhere in this sentence is ${circ('$10,000', 'wide', { l: '-5%', t: '-6%', w: '110%', h: '118%' })} for your next film, and we want to help you find it!!`, 'style="max-inline-size:16ch"')}</div>` }))
