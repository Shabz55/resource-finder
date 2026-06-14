export type ResourceTag =
  | "addictions"
  | "adult"
  | "alberta"
  | "atlantic-canada"
  | "british-columbia"
  | "caribbean"
  | "counselling"
  | "crisis"
  | "directory"
  | "east-asian"
  | "eating-disorders"
  | "english"
  | "free"
  | "french"
  | "in-person"
  | "indigenous"
  | "black"
  | "lgbtq"
  | "low-cost"
  | "manitoba"
  | "latino"
  | "middle-eastern"
  | "muslim"
  | "national"
  | "newcomer"
  | "north"
  | "ontario"
  | "peer-support"
  | "phone"
  | "quebec"
  | "racialized"
  | "regional"
  | "saskatchewan"
  | "self-guided"
  | "sexual-violence"
  | "south-asian"
  | "southeast-asian"
  | "student"
  | "text-chat"
  | "virtual"
  | "white"
  | "youth";

export type Answer = {
  label: string;
  detail: string;
  criteria: Partial<Record<ResourceTag, number>>;
};

export type Question = {
  kicker: string;
  title: string;
  answers: Answer[];
};

export type Resource = {
  id: string;
  name: string;
  region: string;
  service: string;
  focus: string[];
  focusText: string;
  mode: string;
  cost: string;
  age: string;
  languageHours: string;
  description: string;
  contact: string;
  serviceArea: string;
  website: string;
  notes: string;
  sourceSheet: string;
  tags: ResourceTag[];
};

export type ResourcePayload = {
  source: string;
  generatedAt: string;
  resourceCount: number;
  resources: Resource[];
};

export type ScoredResource = Resource & {
  score: number;
  matchedTags: ResourceTag[];
};

export const questions: Question[] = [
  {
    kicker: "Location",
    title: "Where should we look first?",
    answers: [
      {
        label: "Alberta",
        detail: "Prioritize Alberta resources, with national options as backup.",
        criteria: { alberta: 9, national: 1 }
      },
      {
        label: "British Columbia",
        detail: "Prioritize BC resources, with national options as backup.",
        criteria: { "british-columbia": 9, national: 1 }
      },
      {
        label: "Saskatchewan",
        detail: "Prioritize Saskatchewan resources, with national options as backup.",
        criteria: { saskatchewan: 9, national: 1 }
      },
      {
        label: "Manitoba",
        detail: "Prioritize Manitoba resources, with national options as backup.",
        criteria: { manitoba: 9, national: 1 }
      },
      {
        label: "Canada-wide",
        detail: "Show national options that can work from anywhere.",
        criteria: { national: 5 }
      },
      {
        label: "Ontario",
        detail: "Prioritize Ontario resources, with national options as backup.",
        criteria: { ontario: 9, national: 1 }
      },
      {
        label: "Quebec",
        detail: "Prioritize Quebec resources, with national options as backup.",
        criteria: { quebec: 9, national: 1 }
      },
      {
        label: "Atlantic or Northern Canada",
        detail: "Atlantic Canada, Yukon, NWT, Nunavut, or national options.",
        criteria: { "atlantic-canada": 8, north: 8, national: 1 }
      }
    ]
  },
  {
    kicker: "Urgency",
    title: "How soon does support need to happen?",
    answers: [
      {
        label: "Right now",
        detail: "Safety, crisis, or immediate support is the priority.",
        criteria: { crisis: 10, phone: 3, "text-chat": 3, free: 2 }
      },
      {
        label: "Today or soon",
        detail: "I want a reachable support option, but it is not an emergency.",
        criteria: { phone: 3, "text-chat": 3, counselling: 2, "peer-support": 2 }
      },
      {
        label: "Ongoing support",
        detail: "I am looking for something steady, local, or repeatable.",
        criteria: { counselling: 4, "peer-support": 3, "in-person": 2, regional: 2 }
      },
      {
        label: "Just exploring",
        detail: "I want to browse options and save useful links.",
        criteria: { directory: 4, "self-guided": 4, virtual: 2 }
      }
    ]
  },
  {
    kicker: "Support type",
    title: "What kind of support sounds most useful?",
    answers: [
      {
        label: "Crisis line or safety help",
        detail: "A helpline, safety plan, or urgent mental health support.",
        criteria: { crisis: 8, phone: 2, "text-chat": 2, free: 1 }
      },
      {
        label: "Counselling or therapy",
        detail: "I want professional, clinical, or counselling support.",
        criteria: { counselling: 6, virtual: 1, "in-person": 1 }
      },
      {
        label: "Peer or community support",
        detail: "I want to talk with people who may understand the experience.",
        criteria: { "peer-support": 6, youth: 2 }
      },
      {
        label: "Browse resources",
        detail: "I want a hub, directory, app, or self-guided starting point.",
        criteria: { directory: 5, "self-guided": 4, virtual: 2 }
      }
    ]
  },
  {
    kicker: "Format",
    title: "How would you prefer to connect?",
    answers: [
      {
        label: "Phone",
        detail: "Calling or a live voice feels most helpful.",
        criteria: { phone: 5, crisis: 1 }
      },
      {
        label: "Text or chat",
        detail: "Typing feels more doable than talking out loud.",
        criteria: { "text-chat": 5, virtual: 2 }
      },
      {
        label: "Online or app",
        detail: "A website, app, or online service is easiest.",
        criteria: { virtual: 5, "self-guided": 2 }
      },
      {
        label: "In-person",
        detail: "I want a clinic, centre, or local service.",
        criteria: { "in-person": 5, regional: 2 }
      }
    ]
  },
  {
    kicker: "Age group",
    title: "What age group should the resource fit?",
    answers: [
      {
        label: "Youth or teens",
        detail: "Resources for young people, teens, or children.",
        criteria: { youth: 7 }
      },
      {
        label: "Young adults or students",
        detail: "Resources for post-secondary students or young adults.",
        criteria: { youth: 4, student: 6, adult: 2 }
      },
      {
        label: "Adults",
        detail: "Resources that are open to adults or all ages.",
        criteria: { adult: 5 }
      },
      {
        label: "Any age",
        detail: "Do not prioritize by age group.",
        criteria: {}
      }
    ]
  },
  {
    kicker: "Identity",
    title: "Should race or ethnicity shape the results?",
    answers: [
      {
        label: "Indigenous",
        detail: "First Nations, Inuit, Métis, and other Indigenous-specific supports.",
        criteria: { indigenous: 24 }
      },
      {
        label: "Black",
        detail: "African, Afro-Caribbean, or African-Canadian descent.",
        criteria: { black: 24, caribbean: 20, youth: 2 }
      },
      {
        label: "East Asian",
        detail: "Chinese, Korean, Japanese, or Taiwanese descent.",
        criteria: { "east-asian": 24 }
      },
      {
        label: "Latino",
        detail: "Latin American or Hispanic descent.",
        criteria: { latino: 24 }
      },
      {
        label: "Middle Eastern",
        detail: "Arab, Persian, or West Asian descent, including Afghan, Egyptian, Iranian, and related communities.",
        criteria: { "middle-eastern": 24, muslim: 8 }
      },
      {
        label: "South Asian",
        detail: "East Indian, Pakistani, Sri Lankan, Indo-Caribbean, and other South Asian descent.",
        criteria: { "south-asian": 24 }
      },
      {
        label: "Southeast Asian",
        detail: "Filipino, Vietnamese, Cambodian, Thai, and other Southeast Asian descent.",
        criteria: { "southeast-asian": 24 }
      },
      {
        label: "White",
        detail: "European descent.",
        criteria: { white: 16 }
      },
      {
        label: "No preference",
        detail: "Do not prioritize by race or ethnicity.",
        criteria: {}
      }
    ]
  },
  {
    kicker: "Sexuality",
    title: "Should sexuality or gender identity shape the results?",
    answers: [
      {
        label: "LGBTQ2S+ affirming support",
        detail: "Prioritize queer, trans, Two-Spirit, or questioning support.",
        criteria: { lgbtq: 8 }
      },
      {
        label: "Trans or gender-questioning support",
        detail: "Prioritize resources that explicitly mention trans or questioning support.",
        criteria: { lgbtq: 9, "peer-support": 1 }
      },
      {
        label: "No preference",
        detail: "Do not prioritize by sexuality or gender identity.",
        criteria: {}
      }
    ]
  },
  {
    kicker: "Cost",
    title: "What cost range works best?",
    answers: [
      {
        label: "Free only",
        detail: "Only show no-cost options near the top.",
        criteria: { free: 8 }
      },
      {
        label: "Free or low-cost",
        detail: "Sliding scale, pay-what-you-can, or affordable options are okay.",
        criteria: { free: 4, "low-cost": 6 }
      },
      {
        label: "Cost is flexible",
        detail: "The best fit matters more than the price.",
        criteria: { counselling: 1, "in-person": 1, virtual: 1 }
      },
      {
        label: "Not sure",
        detail: "Keep free resources nearby, but do not filter too hard.",
        criteria: { free: 2, directory: 1 }
      }
    ]
  },
  {
    kicker: "Language",
    title: "Do you prefer support in a specific language?",
    answers: [
      {
        label: "English",
        detail: "English-language resources should rank higher.",
        criteria: { english: 4 }
      },
      {
        label: "French",
        detail: "French support should rank higher.",
        criteria: { french: 6 }
      },
      {
        label: "Either English or French",
        detail: "Both English and French resources are useful.",
        criteria: { english: 2, french: 2 }
      },
      {
        label: "No preference",
        detail: "Do not prioritize by language.",
        criteria: {}
      }
    ]
  },
  {
    kicker: "Topic",
    title: "Is there a topic we should prioritize?",
    answers: [
      {
        label: "Stress, anxiety, or feeling low",
        detail: "General mental health support, counselling, or self-guided tools.",
        criteria: { counselling: 3, "self-guided": 3, "peer-support": 2 }
      },
      {
        label: "Substance use",
        detail: "Addiction or substance-use related resources should rank higher.",
        criteria: { addictions: 7, counselling: 2 }
      },
      {
        label: "Eating disorders",
        detail: "Eating disorder support should rank higher.",
        criteria: { "eating-disorders": 7, counselling: 2 }
      },
      {
        label: "Sexual violence",
        detail: "Sexual assault or sexual violence resources should rank higher.",
        criteria: { "sexual-violence": 7, crisis: 2, counselling: 2 }
      }
    ]
  }
];

export function buildCriteria(selected: Answer[]) {
  return selected.reduce<Partial<Record<ResourceTag, number>>>((criteria, answer) => {
    for (const [tag, weight] of Object.entries(answer.criteria) as [ResourceTag, number][]) {
      criteria[tag] = (criteria[tag] ?? 0) + weight;
    }
    return criteria;
  }, {});
}

export function rankResources(resources: Resource[], selected: Answer[]) {
  const criteria = buildCriteria(selected);
  const selectedRegionalTags = REGION_TAGS.filter((tag) => criteria[tag]);
  const hasRegionalPreference = selectedRegionalTags.length > 0;

  return resources
    .map<ScoredResource>((resource) => {
      const matchedTags = resource.tags.filter((tag) => criteria[tag]);
      const score = matchedTags.reduce((total, tag) => total + (criteria[tag] ?? 0), 0);
      const regionBoost = selectedRegionalTags.some((tag) => resource.tags.includes(tag)) ? 18 : 0;
      const crisisBoost = criteria.crisis && resource.tags.includes("crisis") ? 12 : 0;
      const ethnicityBoost =
        (criteria.black && resource.tags.includes("black") ? 80 : 0) +
        (criteria.caribbean && resource.tags.includes("caribbean") ? 60 : 0) +
        (criteria["east-asian"] && resource.tags.includes("east-asian") ? 80 : 0) +
        (criteria.latino && resource.tags.includes("latino") ? 80 : 0) +
        (criteria["middle-eastern"] && resource.tags.includes("middle-eastern") ? 80 : 0) +
        (criteria["south-asian"] && resource.tags.includes("south-asian") ? 80 : 0) +
        (criteria["southeast-asian"] && resource.tags.includes("southeast-asian") ? 80 : 0) +
        (criteria.white && resource.tags.includes("white") ? 40 : 0);
      const identityBoost =
        (criteria.indigenous && resource.tags.includes("indigenous") ? 80 : 0) +
        (criteria.black && resource.tags.includes("black") ? 42 : 0) +
        (criteria.caribbean && resource.tags.includes("caribbean") ? 36 : 0) +
        (criteria["east-asian"] && resource.tags.includes("east-asian") ? 42 : 0) +
        (criteria.latino && resource.tags.includes("latino") ? 42 : 0) +
        (criteria["middle-eastern"] && resource.tags.includes("middle-eastern") ? 42 : 0) +
        (criteria["south-asian"] && resource.tags.includes("south-asian") ? 42 : 0) +
        (criteria["southeast-asian"] && resource.tags.includes("southeast-asian") ? 42 : 0) +
        (criteria.white && resource.tags.includes("white") ? 16 : 0) +
        (criteria.muslim && resource.tags.includes("muslim") ? 24 : 0) +
        (criteria.racialized && resource.tags.includes("racialized") ? 16 : 0) +
        (criteria.lgbtq && resource.tags.includes("lgbtq") ? 8 : 0) +
        (criteria.newcomer && resource.tags.includes("newcomer") ? 16 : 0);
      const fallbackBoost =
        !hasRegionalPreference && resource.tags.includes("national") ? 1 : 0;

      return {
        ...resource,
        score: score + regionBoost + crisisBoost + ethnicityBoost + identityBoost + fallbackBoost,
        matchedTags
      };
    })
    .filter((resource) => resource.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

const REGION_TAGS: ResourceTag[] = [
  "alberta",
  "atlantic-canada",
  "british-columbia",
  "manitoba",
  "north",
  "ontario",
  "quebec",
  "saskatchewan"
];
