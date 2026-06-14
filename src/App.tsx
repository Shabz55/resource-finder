import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  LifeBuoy,
  MapPin,
  Phone,
  RefreshCcw
} from "lucide-react";
import {
  Answer,
  ResourcePayload,
  ScoredResource,
  buildCriteria,
  questions,
  rankResources
} from "./survey";

type SurveyState = {
  step: number;
  selected: Answer[];
};

type ResourceState =
  | { status: "loading"; resources: [] }
  | { status: "ready"; resources: ResourcePayload["resources"] }
  | { status: "error"; resources: []; message: string };

const initialState: SurveyState = {
  step: 0,
  selected: []
};

function App() {
  const [state, setState] = useState<SurveyState>(initialState);
  const [resourceState, setResourceState] = useState<ResourceState>({
    status: "loading",
    resources: []
  });

  const hasResults = state.selected.length === questions.length;
  const currentQuestion = questions[state.step];
  const criteria = useMemo(() => buildCriteria(state.selected), [state.selected]);
  const hasCrisisIntent = Boolean(criteria.crisis);
  const rankedResources = useMemo(
    () => rankResources(resourceState.resources, state.selected).slice(0, 12),
    [resourceState.resources, state.selected]
  );
  const progress = hasResults
    ? 100
    : Math.round(((state.step + 1) / questions.length) * 100);

  useEffect(() => {
    fetch("/resources.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Resource file returned ${response.status}`);
        }
        return response.json() as Promise<ResourcePayload>;
      })
      .then((payload) =>
        setResourceState({ status: "ready", resources: payload.resources })
      )
      .catch((error: unknown) =>
        setResourceState({
          status: "error",
          resources: [],
          message: error instanceof Error ? error.message : "Could not load resources"
        })
      );
  }, []);

  function chooseAnswer(answer: Answer) {
    setState((current) => {
      const selected = current.selected.slice(0, current.step);
      selected[current.step] = answer;

      if (current.step === questions.length - 1) {
        return {
          step: current.step,
          selected
        };
      }

      return {
        step: current.step + 1,
        selected
      };
    });
  }

  function goBack() {
    setState((current) => {
      if (hasResults) {
        return {
          step: questions.length - 1,
          selected: current.selected.slice(0, questions.length - 1)
        };
      }

      return {
        step: Math.max(0, current.step - 1),
        selected: current.selected.slice(0, Math.max(0, current.step - 1))
      };
    });
  }

  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="app-title">
        <img
          className="hero-image"
          src="/assets/survey-tabletop.png"
          alt="Colorful cards and resource notes arranged on a bright tabletop"
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow">Resource finder</p>
          <h1 id="app-title">Find support that fits.</h1>
          <p className="intro">
            A simple way to narrow the resource list into a few mental health
            options that feel worth starting with.
          </p>
        </div>
      </section>

      <section className="survey-band" aria-live="polite">
        <div className="survey-layout">
          <ProgressPanel
            hasResults={hasResults}
            progress={progress}
            resourceCount={resourceState.resources.length}
            selectedCount={state.selected.length}
          />

          <article className="question-card">
            <div
              className="question-transition"
              key={hasResults ? "results" : currentQuestion.kicker}
            >
              {hasResults ? (
                <Results
                  hasCrisisIntent={hasCrisisIntent}
                  resourceState={resourceState}
                  resources={rankedResources}
                />
              ) : (
                <QuestionView question={currentQuestion} onChoose={chooseAnswer} />
              )}
            </div>

            <div className="survey-actions">
              <button
                className="icon-button dark"
                type="button"
                onClick={goBack}
                disabled={!hasResults && state.step === 0}
                aria-label="Go back"
                title="Back"
              >
                <ArrowLeft size={19} aria-hidden="true" />
              </button>
              <button
                className="icon-button"
                type="button"
                onClick={() => setState(initialState)}
                aria-label="Start over"
                title="Start over"
              >
                <RefreshCcw size={18} aria-hidden="true" />
              </button>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

function ProgressPanel({
  hasResults,
  progress,
  resourceCount,
  selectedCount
}: {
  hasResults: boolean;
  progress: number;
  resourceCount: number;
  selectedCount: number;
}) {
  return (
    <aside className="status-panel" aria-label="Survey progress">
      <div>
        <p className="panel-label">Progress</p>
        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="progress-copy">
          {hasResults ? "Results ready" : `Question ${selectedCount + 1} of ${questions.length}`}
        </p>
      </div>

      <div className="signal-list" aria-hidden="true">
        {questions.map((question, index) => (
          <span
            className={index < selectedCount || hasResults ? "active" : ""}
            key={question.kicker}
          />
        ))}
      </div>

      <div className="mini-note">
        <LifeBuoy size={18} aria-hidden="true" />
        <p>{resourceCount} resources loaded from the sheet.</p>
      </div>
    </aside>
  );
}

function QuestionView({
  question,
  onChoose
}: {
  question: (typeof questions)[number];
  onChoose: (answer: Answer) => void;
}) {
  return (
    <>
      <p className="question-kicker">{question.kicker}</p>
      <h2>{question.title}</h2>
      <div className="answers">
        {question.answers.map((answer) => (
          <button
            className="answer-button"
            type="button"
            key={answer.label}
            onClick={() => onChoose(answer)}
          >
            <span>{answer.label}</span>
            <small>{answer.detail}</small>
          </button>
        ))}
      </div>
    </>
  );
}

function Results({
  hasCrisisIntent,
  resourceState,
  resources
}: {
  hasCrisisIntent: boolean;
  resourceState: ResourceState;
  resources: ScoredResource[];
}) {
  if (resourceState.status === "loading") {
    return (
      <>
        <p className="question-kicker">Almost there</p>
        <h2>Loading resources...</h2>
      </>
    );
  }

  if (resourceState.status === "error") {
    return (
      <>
        <p className="question-kicker">Resource list unavailable</p>
        <h2>We could not load the resource sheet.</h2>
        <p className="disclaimer">{resourceState.message}</p>
      </>
    );
  }

  return (
    <>
      {hasCrisisIntent && <CrisisBanner />}

      <p className="question-kicker">Best matches</p>
      <h2>{resources.length ? "Here are a few places to start." : "No close matches yet."}</h2>

      <p className="results-intro">
        Matches are ranked from the resource sheet using your location, support type,
        preferred format, and access needs.
      </p>

      <div className="resource-list">
        {resources.length ? (
          resources.map((resource) => (
            <ResourceCard resource={resource} key={resource.id} />
          ))
        ) : (
          <p className="disclaimer">
            Try starting over with broader answers, or check national/crisis resources
            first if support is urgent.
          </p>
        )}
      </div>

      <p className="disclaimer">
        This survey is informational and not a diagnosis. If there is immediate
        danger, contact emergency services or call/text 988 in Canada or the U.S.
      </p>
    </>
  );
}

function CrisisBanner() {
  return (
    <aside className="crisis-banner" role="note" aria-label="Crisis support">
      <LifeBuoy size={22} aria-hidden="true" />
      <div>
        <p className="crisis-title">If this is immediate, start here.</p>
        <p>
          If you or someone else is in immediate danger, call emergency services.
          For suicide crisis support in Canada or the U.S., call or text 988.
        </p>
      </div>
    </aside>
  );
}

function ResourceCard({ resource }: { resource: ScoredResource }) {
  const website = normalizedUrl(resource.website);

  return (
    <article className="resource-card">
      <div className="resource-card-header">
        <div>
          <p className="resource-region">
            <MapPin size={15} aria-hidden="true" />
            {resource.region}
            {resource.serviceArea ? ` · ${resource.serviceArea}` : ""}
          </p>
          <h3>{resource.name}</h3>
        </div>
        <span className="score-pill">{matchLabel(resource.score)}</span>
      </div>

      <p className="resource-description">
        {resource.description || resource.focusText || resource.service}
      </p>

      <div className="resource-tags">
        {resource.matchedTags.slice(0, 5).map((tag) => (
          <span key={tag}>{tag.replace(/-/g, " ")}</span>
        ))}
      </div>

      <dl className="resource-meta">
        {resource.service && (
          <>
            <dt>Service</dt>
            <dd>{resource.service}</dd>
          </>
        )}
        {resource.focusText && (
          <>
            <dt>Focus</dt>
            <dd>{resource.focusText}</dd>
          </>
        )}
        {resource.cost && (
          <>
            <dt>Cost</dt>
            <dd>{resource.cost}</dd>
          </>
        )}
        {resource.languageHours && (
          <>
            <dt>Hours</dt>
            <dd>{resource.languageHours}</dd>
          </>
        )}
      </dl>

      <div className="resource-actions">
        {resource.contact && resource.contact !== "--" && (
          <p className="contact-line">
            <Phone size={16} aria-hidden="true" />
            {resource.contact}
          </p>
        )}
        {website && (
          <a href={website} target="_blank" rel="noreferrer">
            <ExternalLink size={16} aria-hidden="true" />
            Visit resource
          </a>
        )}
      </div>
    </article>
  );
}

function normalizedUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.includes(" ")) {
    return "";
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function matchLabel(score: number) {
  if (score >= 35) {
    return "Best match";
  }

  if (score >= 20) {
    return "Strong match";
  }

  return "Good fit";
}

export default App;
