<script>
  import { Splitpanes, Pane } from 'splitpanes'
  import 'splitpanes/dist/splitpanes.css'
  import { getChangesets, commitsQuery } from './assets/queries.js'
  import axios from 'axios'
  //import {SparqlJsonParser} from "sparqljson-parse"; // Maybe futere work


  export default {
    name: 'App',
    components: { Splitpanes, Pane },
    data() {
      return {
        left: "Links",
        right: "Rechts",
        commits: [],
        currentCommit: "",
        orientation: "s",
        endpoint: "http://localhost:5000/provenance",
        index: {'s': [], 'p': [], 'o': []}

      }
    },
    watch: {
      currentCommit(commit) {
        this.fireQueries(commit)
      },
      endpoint(url) {
        this.sparqlQuery(commitsQuery, "commits")
      }
    },
    methods: {
      fireQueries: function(commit_id){
        commit_id = commit_id.slice(1, -1)
        this.sparqlQuery(getChangesets(commit_id), "changesets_s")
        this.sparqlQuery(getChangesets(commit_id, "?p ?s"), "changesets_p")
        this.sparqlQuery(getChangesets(commit_id, "?o ?s"), "changesets_o")
      },
      splitChangesets: function(data, orientation="s"){
        const lookup = {"s": ["p", "o"], "p": ["s", "o"], "o": ["s", "p"]}
        var index = {}
        var current = ""

        for (let k in data) {
          var i = data[k][orientation]

          if (i != current) {
            index[i] = {'"-"': [], '"+"': []}
          }

          index[i][data[k].type].push(data[k][lookup[orientation][0]] + " " + data[k][lookup[orientation][1]])
          current = i

        }

        this.index[orientation] = index

      },
      sparqlQuery: function(querystring, querytype){
        var component = this

        const headers = {
          "Accept": "application/json",
          "Content-Type": "application/sparql-query"
        }
        var res = {}
        const data = {
          querystring
        }
        axios.post(component.endpoint, querystring, { headers })
          .then(response => {
            var res_array = response.data.results.bindings
            var data = []
            var currentValue = ""

            for (let i in res_array) {
              var entry = {}

              for (let key in res_array[i]) {
                switch (res_array[i][key].type ) {
                  case "uri":
                    currentValue = "<" + res_array[i][key].value + ">"
                    break ;
                  case "bnode":
                    currentValue = res_array[i][key].value
                    break ;
                  case "literal":
                    currentValue = '"' + res_array[i][key].value + '"'

                    if ("datatype" in res_array[i][key]) {
                      currentValue = currentValue + "^^<" + res_array[i][key].datatype + ">"
                    }

                    if ("xml:lang" in res_array[i][key]) {
                      currentValue = currentValue + "@" + res_array[i][key]['xml:lang']
                    }

                    break ;
                }

                entry[key] = currentValue
                currentValue = ""
              }
              data.push(entry)
            }

            switch (querytype) {
              case "commits":
                component.commits = data
                //component.currentCommit = data[0].commit_id
                break ;
              case "changesets_s":
                component.splitChangesets(data)
                break;
              case "changesets_p":
                component.splitChangesets(data, "p")
                break;
              case "changesets_o":
                component.splitChangesets(data, "o")
                break;
            }
          })

      }
    },
    created() {
      this.sparqlQuery(commitsQuery, "commits")
    },
  }
</script>

<template>
  <div>
    <h2>Endpoint</h2>
    <input v-model="endpoint" width="90" :placeholder="endpoint" />
  </div>
  <div>
    <h2>Commits</h2>
    <select  v-model="currentCommit">

        <option v-for="commitData, i in commits" :value="commitData.commit_id">
          {{ commitData.commit_msg + " - " + commitData.mail }}
        </option>
    </select>
  </div>
  <div>
    <h2>Orientation</h2>
    <label>
      <input type="radio" id="subjects" v-model="orientation" value="s" /> By subjects
    </label>
    <label>
      <input type="radio" id="predicates" v-model="orientation" value="p" /> By predicates
    </label>
    <label>
      <input type="radio" id="objects" v-model="orientation" value="o" /> By objects
    </label>
  </div>
  <splitpanes class="default-theme container-with-height" style="height: 200px" vertical :push-other-panes="false">
    <pane min-size="50" id="leftCol" class="col split"><h2>Removals</h2></pane>
    <pane min-size="50" id="rightCol" class="col split"><h2>Additions</h2></pane>
  </splitpanes>
  <span v-for="values, iri in index[orientation]" :key="iri">
    <center><h4>{{ iri }}</h4></center>
    <splitpanes class="default-theme">
      <pane min-size="50" v-for="tuples, type in values" :key="tuples">
        <div v-for="tuple in tuples">{{ tuple }}</div>
      </pane>
    </splitpanes>
  </span>
</template>
