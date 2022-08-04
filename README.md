# Display RDF-Changesets

With help of [QuitStore](https://github.com/AKSW/QuitStore) and [Vue.js](https://vuejs.org/) we try to generate views helping to analyze Removals and Additions of Triples (RDF).

To understand how the QuitStore and its provenance feature works you read this [paper](https://arxiv.org/pdf/1805.03721.pdf).

This project is currently WIP.

## Form

If started a query against the given endpoint (type in another QuitStore-Provenance endpoint if needed) is executed which collects all commits.
You can select a commit and after this more queries are executed to collect the changesets.
The changesets will be visualized if parsed accordingly.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Future work

* beautify (bootstrap, css)
* add spinner during query execution
* add/include [RDFJS](https://rdf.js.org/) if needed and useful
* speed up (use local store so only one query is needed for orientation views.)
* create views for semantical changes (rdfs, owl)
* highlight diffs
