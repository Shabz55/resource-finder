export type ResourceTag =
  | "addictions"
  | "adult"
  | "alberta"
  | "atlantic-canada"
  | "british-columbia"
  | "caribbean"
  | "child"
  | "counselling"
  | "crisis"
  | "directory"
  | "east-asian"
  | "education"
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
  | "family-caregiver"
  | "middle-eastern"
  | "mens-mental-health"
  | "muslim"
  | "national"
  | "newcomer"
  | "north"
  | "northwest-territories"
  | "nunavut"
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
  | "trauma"
  | "virtual"
  | "white"
  | "young-adult"
  | "yukon"
  | "youth";

export type Answer = {
  label: string;
  detail: string;
  criteria: Partial<Record<ResourceTag, number>>;
  finishSurvey?: boolean;
  exclusive?: boolean;
};

export type Question = {
  kicker: string;
  title: string;
  answers: Answer[];
  multiple?: boolean;
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
    title: "First things first, where are we looking today?",
    answers: [
      {
        label: "Alberta",
        detail: "",
        criteria: { alberta: 9, national: 1 }
      },
      {
        label: "Atlantic Canada (Nova Scotia, New Brunswick, PEI, NFL)",
        detail: "",
        criteria: { "atlantic-canada": 9, national: 1 }
      },
      {
        label: "British Columbia",
        detail: "",
        criteria: { "british-columbia": 9, national: 1 }
      },
      {
        label: "Manitoba",
        detail: "",
        criteria: { manitoba: 9, national: 1 }
      },
      {
        label: "Northwest Territories",
        detail: "",
        criteria: { "northwest-territories": 9, national: 1 }
      },
      {
        label: "Nunavut",
        detail: "",
        criteria: { nunavut: 9, national: 1 }
      },
      {
        label: "Ontario",
        detail: "",
        criteria: { ontario: 9, national: 1 }
      },
      {
        label: "Quebec",
        detail: "",
        criteria: { quebec: 9, national: 1 }
      },
      {
        label: "Saskatchewan",
        detail: "",
        criteria: { saskatchewan: 9, national: 1 }
      },
      {
        label: "Yukon",
        detail: "",
        criteria: { yukon: 9, national: 1 }
      }
    ]
  },
  {
    kicker: "Urgency",
    title: "How soon does support need to happen?",
    answers: [
      {
        label: "Right now",
        detail: "Safety, crisis, or immediate support is the priority",
        criteria: { crisis: 14, phone: 3, "text-chat": 3, free: 2 },
        finishSurvey: true
      },
      {
        label: "Today or soon",
        detail: "I'd like to connect with support in the near future, but it's not an emergency",
        criteria: { phone: 3, "text-chat": 3, counselling: 2, "peer-support": 2 }
      },
      {
        label: "Ongoing support",
        detail: "I'm looking for something consistent that can support me long term",
        criteria: { counselling: 4, "peer-support": 3, "in-person": 2, regional: 2 }
      },
      {
        label: "Just exploring",
        detail: "I'm curious about what's available and want to see my options",
        criteria: { directory: 4, "self-guided": 4, virtual: 2 }
      }
    ]
  },
  {
    kicker: "Your wishlist",
    title: "Let's make your wishlist, what are you hoping to find? (PS. you can add more than one)",
    multiple: true,
    answers: [
      {
        label: "Crisis support",
        detail: "I need some immediate contacts I can reach out to when I need help",
        criteria: { crisis: 8, phone: 2, "text-chat": 2, free: 1 }
      },
      {
        label: "Professional help",
        detail: "Counselling or therapy sounds cool",
        criteria: { counselling: 6, virtual: 1, "in-person": 1 }
      },
      {
        label: "Peer or community support",
        detail: "I want to talk to other people who might understand what I'm going through",
        criteria: { "peer-support": 6 }
      },
      {
        label: "Education",
        detail: "What is mental health and why does everyone keep talking about it?",
        criteria: { education: 8, "self-guided": 3 }
      },
      {
        label: "Resource hub",
        detail: "Resources, resources, and oh look... more resources",
        criteria: { directory: 5, "self-guided": 4, virtual: 2 }
      }
    ]
  },
  {
    kicker: "Format",
    title: "How would you prefer to connect? (PS. you can add more than one)",
    multiple: true,
    answers: [
      {
        label: "Call/text",
        detail: "Let me stay in my bed",
        criteria: { phone: 5, "text-chat": 5}
      },
      {
        label: "Online or app",
        detail: "Let me stay in my bed",
        criteria: { virtual: 5, "self-guided": 2 }
      },
      {
        label: "In-person",
        detail: "Maybe it's time to get out of my bed",
        criteria: { "in-person": 5, regional: 2 }
      }
    ]
  },
  {
    kicker: "Age group",
    title: "Which age group are you?",
    answers: [
      {
        label: "Child (<12)",
        detail: "",
        criteria: { child: 8, youth: 3 }
      },
      {
        label: "Youth (13-17)",
        detail: "",
        criteria: { youth: 8 }
      },
      {
        label: "Young adult (18-25)",
        detail: "",
        criteria: { "young-adult": 8, student: 2, adult: 2 }
      },
      {
        label: "Adult (25+)",
        detail: "",
        criteria: { adult: 8 }
      }
    ]
  },
  {
    kicker: "Language",
    title: "Do you prefer support in a specific language?",
    answers: [
      {
        label: "English",
        detail: "",
        criteria: { english: 6 }
      },
      {
        label: "French",
        detail: "",
        criteria: { french: 8 }
      }
    ]
  },
  {
    kicker: "Budget",
    title: "What's your budget looking like?",
    answers: [
      {
        label: "$0 is my favourite number",
        detail: "",
        criteria: { free: 9 }
      },
      {
        label: "I can spend a little",
        detail: "",
        criteria: { free: 3, "low-cost": 8 }
      },
      {
        label: "Cost isn't a deciding factor",
        detail: "",
        criteria: { counselling: 1, "in-person": 1, virtual: 1 }
      }
    ]
  },
  {
    kicker: "A little more about you",
    title: "Do any of these sound like you or the support you're looking for? (PS. you can add more than one)",
    multiple: true,
    answers: [
      {
        label: "Family or caregiver support",
        detail: "",
        criteria: { "family-caregiver": 10 }
      },
      {
        label: "Substance use support",
        detail: "",
        criteria: { addictions: 10, counselling: 2 }
      },
      {
        label: "2SLGBTQIA+ community",
        detail: "",
        criteria: { lgbtq: 14 }
      },
      {
        label: "Indigenous support",
        detail: "",
        criteria: { indigenous: 18 }
      },
      {
        label: "Men's mental health",
        detail: "",
        criteria: { "mens-mental-health": 12 }
      },
      {
        label: "Trauma support",
        detail: "",
        criteria: { trauma: 12, counselling: 2 }
      },
      {
        label: "Muslim women",
        detail: "",
        criteria: { muslim: 16 }
      },
      {
        label: "Black youth",
        detail: "",
        criteria: { black: 18, youth: 6 }
      },
      {
        label: "None of these",
        detail: "",
        criteria: {},
        exclusive: true
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
  const crisisOnly = selected.some((answer) => answer.finishSurvey);
  const selectedRegionalTags = REGION_TAGS.filter((tag) => criteria[tag]);
  const hasRegionalPreference = selectedRegionalTags.length > 0;
  const hasNationalPreference = !hasRegionalPreference && Boolean(criteria.national);
  const eligibleResources = resources.filter((resource) => {
    const isNationalResource = resource.region.startsWith("National");
    const isSelectedRegion = selectedRegionalTags.some((tag) =>
      REGION_NAMES_BY_TAG[tag]?.includes(resource.region)
    );

    const matchesLocation = hasRegionalPreference
      ? isNationalResource || isSelectedRegion
      : hasNationalPreference
        ? isNationalResource
        : true;

    if (!matchesLocation) {
      return false;
    }

    if (crisisOnly) {
      return resource.tags.includes("crisis");
    }

    return true;
  });

  return eligibleResources
    .map<ScoredResource>((resource) => {
      const matchedTags = resource.tags.filter((tag) => criteria[tag]);
      const score = matchedTags.reduce((total, tag) => total + (criteria[tag] ?? 0), 0);
      const regionBoost = selectedRegionalTags.some((tag) =>
        REGION_NAMES_BY_TAG[tag]?.includes(resource.region)
      )
        ? 30
        : 0;
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
  "northwest-territories",
  "nunavut",
  "ontario",
  "quebec",
  "saskatchewan",
  "yukon"
];

const REGION_NAMES_BY_TAG: Partial<Record<ResourceTag, string[]>> = {
  alberta: ["Alberta"],
  "atlantic-canada": ["Atlantic Canada"],
  "british-columbia": ["British Columbia"],
  manitoba: ["Manitoba"],
  "northwest-territories": ["Northwest Territories"],
  nunavut: ["Nunavut"],
  ontario: ["Ontario"],
  quebec: ["Quebec"],
  saskatchewan: ["Saskatchewan"],
  yukon: ["Yukon"]
};
