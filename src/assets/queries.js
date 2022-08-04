var commitsQuery = `PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX qu: <http://purl.oclc.org/NET/ssnx/qu/qu#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX quit: <http://quit.aksw.org/vocab/>
SELECT DISTINCT ?activity ?commit_msg ?commit_id ?endTime ?mail  WHERE {
  ?activity a prov:Activity ; # a commit
  rdfs:label ?commit_msg ;
  prov:endedAtTime ?endTime ;
  quit:hex ?commit_id ;
  prov:wasAssociatedWith ?user .
  OPTIONAL{?activity quit:query ?query}
  ?user foaf:mbox ?mail .} ORDER BY DESC(?endTime) `

function getChangesets(commit_id, order="?s ?p"){
  return `PREFIX qu: <http://purl.oclc.org/NET/ssnx/qu/qu#>
  PREFIX prov: <http://www.w3.org/ns/prov#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX quit: <http://quit.aksw.org/vocab/>
  SELECT ?activity ?commit_msg ?endTime ?s ?p ?o ?type WHERE {
    {
      {
        SELECT DISTINCT ?activity ?commit_msg ?endTime ?additions_graph WHERE {
          ?activity a prov:Activity ; # a commit
            quit:hex "` + commit_id + `" ;
            prov:endedAtTime ?endTime ;
            quit:updates ?updates .
          ?updates quit:additions ?additions_graph .
        }
      }
      graph ?additions_graph {
        ?s ?p ?o .
        BIND(str("+") as ?type)
      }
    }
    UNION
    {
      {
        SELECT DISTINCT ?activity ?commit_msg ?endTime ?removals_graph WHERE {
          ?activity a prov:Activity ; # a commit
            quit:hex "` + commit_id + `" ;
            prov:endedAtTime ?endTime ;
            quit:updates ?updates .
          ?updates quit:removals ?removals_graph .
        }
      }
      graph ?removals_graph {
        ?s ?p ?o .
        BIND(str("-") as ?type)
      }
    }
  } ORDER BY ` + order  ;
}

export { getChangesets, commitsQuery }
