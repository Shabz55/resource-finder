# Resource Compass

A Vite + React + TypeScript prototype that asks a short survey and recommends mental health resources from an editable spreadsheet.

## Run The App

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`.

## Update Resources

The app reads normalized data from `public/resources.json`.

After editing the source spreadsheet, regenerate the JSON:

```bash
npm run import:resources
```

By default, the importer reads:

```text
/Users/shahbazqureshi/Downloads/(My Copy) List of Help-Seeking Resources.xlsx
```

You can point it at another workbook and output path:

```bash
python3 scripts/import_resources.py path/to/resources.xlsx public/resources.json
```

Then rebuild or restart the dev server:

```bash
npm run build
```

## How Matching Works

`scripts/import_resources.py` converts the workbook's regional tabs into one consistent resource list. It infers tags from fields like focus, service type, mode, cost, language, description, and service area.

The survey answers in `src/survey.ts` produce weighted criteria. The app scores each resource by matching those criteria to the inferred tags, then shows the highest-scoring resources.
