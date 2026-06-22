import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
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
import masterOogwayImage from "../assets/master-oogway-kung-fu-panda.gif";
import poohImage from "../assets/pooh meme.jpeg";

type SurveyState = {
  step: number;
  responses: Answer[][];
  completed: boolean;
};

type ResourceState =
  | { status: "loading"; resources: [] }
  | { status: "ready"; resources: ResourcePayload["resources"] }
  | { status: "error"; resources: []; message: string };

const initialState: SurveyState = {
  step: 0,
  responses: [],
  completed: false
};

function App() {
  const [state, setState] = useState<SurveyState>(initialState);
  const [surveyVisible, setSurveyVisible] = useState(false);
  const surveyRef = useRef<HTMLElement>(null);
  const [resourceState, setResourceState] = useState<ResourceState>({
    status: "loading",
    resources: []
  });

  const hasResults = state.completed;
  const currentQuestion = questions[state.step];
  const selectedAnswers = useMemo(() => state.responses.flat(), [state.responses]);
  const criteria = useMemo(() => buildCriteria(selectedAnswers), [selectedAnswers]);
  const hasCrisisIntent = Boolean(criteria.crisis);
  const skippedToCrisisResults = selectedAnswers.some(
    (answer) => answer.finishSurvey
  );
  const rankedResources = useMemo(
    () => rankResources(resourceState.resources, selectedAnswers).slice(0, 12),
    [resourceState.resources, selectedAnswers]
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

  useEffect(() => {
    const survey = surveyRef.current;
    if (!survey) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!hasResults) {
          setSurveyVisible(entry.isIntersecting);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(survey);
    return () => observer.disconnect();
  }, [hasResults]);

  function chooseAnswer(answer: Answer) {
    setState((current) => {
      const responses = current.responses.slice(0, current.step + 1);
      responses[current.step] = [answer];

      if (answer.finishSurvey || current.step === questions.length - 1) {
        return {
          step: current.step,
          responses,
          completed: true
        };
      }

      return {
        step: current.step + 1,
        responses,
        completed: false
      };
    });
  }

  function toggleAnswer(answer: Answer) {
    setState((current) => {
      const responses = current.responses.slice(0, current.step + 1);
      const currentAnswers = responses[current.step] ?? [];

      if (answer.exclusive) {
        responses[current.step] = currentAnswers.some((item) => item.label === answer.label)
          ? []
          : [answer];
      } else {
        const withoutExclusive = currentAnswers.filter((item) => !item.exclusive);
        const isSelected = withoutExclusive.some((item) => item.label === answer.label);
        responses[current.step] = isSelected
          ? withoutExclusive.filter((item) => item.label !== answer.label)
          : [...withoutExclusive, answer];
      }

      return { ...current, responses };
    });
  }

  function continueSurvey() {
    setState((current) => {
      if (!(current.responses[current.step]?.length > 0)) {
        return current;
      }

      if (current.step === questions.length - 1) {
        return { ...current, completed: true };
      }

      return {
        step: current.step + 1,
        responses: current.responses,
        completed: false
      };
    });
  }

  function goBack() {
    setState((current) => {
      if (hasResults) {
        const lastAnsweredStep = current.responses.length - 1;
        return {
          step: Math.max(0, lastAnsweredStep),
          responses: current.responses,
          completed: false
        };
      }

      const previousStep = Math.max(0, current.step - 1);
      return {
        step: previousStep,
        responses: current.responses.slice(0, previousStep + 1),
        completed: false
      };
    });
  }

  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="app-title">
        <div className="hero-content">
          <div className="hero-copy">
            <h1 id="app-title">
              Find The Mental Health Resource That's <em>Actually</em> Meant For You
            </h1>
            <p className="intro">
              Because support isn't one-size-fits-all
            </p>
            <button
              className="start-quiz-button"
              type="button"
              onClick={() =>
                surveyRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start"
                })
              }
            >
              Start quiz
              <ArrowDown size={20} aria-hidden="true" />
            </button>
          </div>
          <img
            className="hero-header-image"
            src={poohImage}
            alt="Two friends sitting together beneath a colorful sky"
          />
        </div>
      </section>

      <section
        className="survey-band"
        ref={surveyRef}
        aria-live="polite"
        tabIndex={-1}
      >
        <div
          className={`survey-layout ${
            surveyVisible || hasResults ? "survey-visible" : ""
          }`}
        >
          <ProgressPanel
            hasResults={hasResults}
            progress={progress}
            currentStep={state.step}
          />

          <article className="question-card survey-enter-right">
            <div
              className="question-transition"
              key={
                hasResults
                  ? "results"
                  : currentQuestion.kicker
              }
            >
              {hasResults ? (
                <Results
                  hasCrisisIntent={hasCrisisIntent}
                  skippedToCrisisResults={skippedToCrisisResults}
                  resourceState={resourceState}
                  resources={rankedResources}
                />
              ) : (
                <QuestionView
                  question={currentQuestion}
                  selectedAnswers={state.responses[state.step] ?? []}
                  onChoose={chooseAnswer}
                  onToggle={toggleAnswer}
                />
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
              {!hasResults && currentQuestion.multiple && (
                <button
                  className="continue-button"
                  type="button"
                  onClick={continueSurvey}
                  disabled={!state.responses[state.step]?.length}
                >
                  Continue
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              )}
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
  currentStep
}: {
  hasResults: boolean;
  progress: number;
  currentStep: number;
}) {
  return (
    <aside className="status-panel survey-enter-left" aria-label="Survey progress">
      <div>
        <p className="panel-label">Progress</p>
        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="progress-copy">
          {hasResults ? "Results ready" : `Question ${currentStep + 1} of ${questions.length}`}
        </p>
      </div>

      <div className="signal-list" aria-hidden="true">
        {questions.map((question, index) => (
          <span
            className={index <= currentStep || hasResults ? "active" : ""}
            key={question.kicker}
          />
        ))}
      </div>

    </aside>
  );
}

function QuestionView({
  question,
  selectedAnswers,
  onChoose,
  onToggle
}: {
  question: (typeof questions)[number];
  selectedAnswers: Answer[];
  onChoose: (answer: Answer) => void;
  onToggle: (answer: Answer) => void;
}) {
  return (
    <>
      <h2>{formatQuestionTitle(question.title)}</h2>
      <div className="answers">
        {question.answers.map((answer) => (
          <button
            className={`answer-button ${
              selectedAnswers.some((item) => item.label === answer.label)
                ? "selected"
                : ""
            }`}
            type="button"
            key={answer.label}
            onClick={() =>
              question.multiple ? onToggle(answer) : onChoose(answer)
            }
            aria-pressed={
              question.multiple
                ? selectedAnswers.some((item) => item.label === answer.label)
                : undefined
            }
          >
            <span>{answer.label}</span>
            {answer.detail && <small>{answer.detail}</small>}
          </button>
        ))}
      </div>
    </>
  );
}

function formatQuestionTitle(title: string) {
  const noteStart = title.indexOf(" (PS.");

  if (noteStart === -1) {
    return title;
  }

  return (
    <>
      {title.slice(0, noteStart)}
      <span className="question-note">{title.slice(noteStart)}</span>
    </>
  );
}

function Results({
  hasCrisisIntent,
  skippedToCrisisResults,
  resourceState,
  resources
}: {
  hasCrisisIntent: boolean;
  skippedToCrisisResults: boolean;
  resourceState: ResourceState;
  resources: ScoredResource[];
}) {
  if (resourceState.status === "loading") {
    return (
      <>
        <h2>Loading resources...</h2>
      </>
    );
  }

  if (resourceState.status === "error") {
    return (
      <>
        <h2>We could not load the resource sheet.</h2>
        <p className="disclaimer">{resourceState.message}</p>
      </>
    );
  }

  return (
    <>
      {hasCrisisIntent && <CrisisBanner />}

      {!skippedToCrisisResults && <ResultsIntro />}

      <h2>{resources.length ? "Here are a few places to start" : "No close matches yet."}</h2>

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

function ResultsIntro() {
  return (
    <section className="results-reveal">
      <img
        className="results-reveal-image"
        src={masterOogwayImage}
        alt="Master Oogway smiling"
      />
      <div className="results-reveal-copy">
        <h2>Results are in... and we've got a match!</h2>
        <p>
          Based on your responses and the preferences you shared (great choices,
          by the way), we've selected a few resources that we think could be a
          great fit for you. Give them a try, see what clicks, and don't be afraid
          to shop around a little - finding the right support is all about finding
          what works for you.
        </p>
        <p>
          And remember, it takes a lot of courage to seek help. We're proud of you
          for taking this step and making it this far. We wish you all the best as
          you continue your mental health journey ;)
        </p>
        <p className="results-signature">- Jack.org Team</p>
      </div>
    </section>
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

export default App;
