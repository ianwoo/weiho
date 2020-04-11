import React, { useState, useEffect } from 'react';

import Sigma from 'react-sigma';

import SigmaLoader from "./Sigma/Loader";
import NodeShapes from "./Sigma/NodeShapes";

const graphData = {
  nodes: [
    {id: 'nA', label: 'A', x: 1, y: 1, size: 24},
    {id: 'nB', label: 'B', x: 3, y: 1, size: 24},
    {id: 'nC', label: 'C', x: 2, y: 4, size: 24},
    {id: 'nD', label: 'D', x: 1, y: 6, size: 24},
    {id: 'nE', label: 'E', x: 6, y: 2, size: 24},
    {id: 'nF', label: 'F', x: 5, y: 4, size: 24},
    {id: 'nG', label: 'G', x: 6, y: 6, size: 24},
    {id: 'nH', label: 'H', x: 8, y: 6, size: 24}
  ],
  edges: [
    {id: 'e0', source: 'nA', target: 'nB', color: '#0000ff'},
    {id: 'e1', source: 'nA', target: 'nD', color: '#0000ff'},
    {id: 'e2', source: 'nA', target: 'nC', color: '#0000ff'},
    {id: 'e3', source: 'nB', target: 'nE', color: '#0000ff'},
    {id: 'e4', source: 'nB', target: 'nC', color: '#0000ff'},
    {id: 'e5', source: 'nB', target: 'nF', color: '#0000ff'},
    {id: 'e6', source: 'nC', target: 'nF', color: '#0000ff'},
    {id: 'e7', source: 'nD', target: 'nG', color: '#0000ff'},
    {id: 'e8', source: 'nE', target: 'nG', color: '#0000ff'},
    {id: 'e9', source: 'nF', target: 'nG', color: '#0000ff'},
    {id: 'e10', source: 'nG', target: 'nH', color: '#0000ff'},
  ]
}

function App() {

  const [settings,] = useState({batchEdgesDrawing: true,
                                drawEdges: true,
                                drawLabels: true,
                                drawEdgeLabels: true,
                                hideEdgesOnMove: false,
                                animationsTime: 3000,
                                clone: false,
                                doubleClickEnabled: true,
                                mouseWheelEnabled: true,
                                minNodeSize: 5,
                                maxNodeSize: 10,
                                minArrowSize: 2,
                                minEdgeSize: 0.5,
                                maxEdgeSize: 1,
                                defaultNodeBorderColor: "#000",
                                defaultHoverLabelBGColor: "transparent",
                                labelHoverColor: "transparent",
                                defaultLabelSize: 11
                              })
  const [style,] = useState({ maxWidth: "1200px", height: "600px"})

  const [source, setSource] = useState(0)
  const [destination, setDestination] = useState(7)
  const [highlightedPath, setHighlightedPath] = useState(pathfinderSigma(graphData.nodes,
                                                                        graphData.edges,
                                                                        graphData.nodes[0],
                                                                        graphData.nodes[7],
                                                                        'shortestPath'))

  const [disabledDestinations, setDisabledDestinations] = useState({b: false, c: false, d: false, e: false, f: false, g: false})
  const [disabledSources, setDisabledSources] = useState({b: false, c: false, d: false, e: false, f: false, g: false})

  useEffect(()=>{
    if (source === '0') {
      setDisabledDestinations({b: false, c: false, d: false, e: false, f: false, g: false})
    } else if (source === '1') {
      setDisabledDestinations({b: true, c: false, d: true, e: false, f: false, g: false})
    } else if (source === '2') {
      setDisabledDestinations({b: true, c: true, d: true, e: true, f: false, g: false})
    } else if (source > 2) {
      setDisabledDestinations({b: true, c: true, d: true, e: true, f: true, g: false})
    } else if (source === '6') {
      setDisabledDestinations({b: true, c: true, d: true, e: true, f: true, g: true})
    }
  },[source])

  useEffect(()=>{
    if (['1','3'].includes(destination)) {
      setDisabledSources({b: true, c: true, d: true, e: true, f: true, g: true})
    } else if (['2','4'].includes(destination)) {
      setDisabledSources({b: false, c: true, d: true, e: true, f: true, g: true})
    } else if (destination === '5') {
      setDisabledSources({b: false, c: false, d: true, e: true, f: true, g: true})
    } else if (destination === '6') {
      setDisabledSources({b: false, c: false, d: false, e: false, f: false, g: true})
    } else if (destination === '7') {
      setDisabledSources({b: false, c: false, d: false, e: false, f: false, g: false})
    }
  },[destination])

  useEffect(()=>{
    setHighlightedPath(pathfinderSigma(graphData.nodes,
      graphData.edges,
      graphData.nodes[source],
      graphData.nodes[destination],
      'shortestPath'))
  },[source,destination,graphData])

  //TEST ONE: RETURN ALL PATHS
  //I wrote this code to seamlessly accept the data format used by Sigma / the data provided by the test
  function pathfinderSigma(sigmaNodes, sigmaEdges, startingNode, destinationNode, testQuestion) {
    let map = new Map()

    sigmaNodes.forEach(node => {
      map.set(node.id, mapTargets(node))
    })

    function mapTargets(node) {
      let targetsArray = []
      sigmaEdges.forEach(edge => {
        if (edge.source === node.id) {
          targetsArray.push(edge.target)
        }
      })
      return targetsArray
    }

    function breadthFirstSearch(start, end) {
      const firstDepth = map.get(start)
      let allPaths = []
      firstDepth.forEach( (node) => allPaths.push([start, node]) )

      const checkIfDone = (path) => path.slice(-1)[0] === end

      while (testQuestion === 'allPaths' ? !allPaths.every(checkIfDone) : !allPaths.some(checkIfDone)) {
        allPaths.forEach(path => {
          if (path.slice(-1)[0] === end) {
            return
          }
          let nextDepth = map.get(path.slice(-1)[0])
          if (nextDepth.length > 1) {
            for (let index = 1; index < nextDepth.length; index++) {
              allPaths.push([...path, nextDepth[index]])
            }
          }
          path.push(nextDepth[0])
        })
      }

      return testQuestion === 'allPaths' ? allPaths : allPaths.filter(path => path.slice(-1)[0] === end)
    }
    return breadthFirstSearch(startingNode.id, destinationNode.id)
  }

  console.log('Question 1: All Paths')
  console.log( pathfinderSigma(graphData.nodes,
                               graphData.edges,
                               graphData.nodes[0],
                               graphData.nodes[7],
                               'allPaths'))

  //TEST TWO: SHORTEST PATH
  //While it would have been simple enough to just sort the output from the above test question to answer for
  //shortest path, I decided instead to modify the recursion condition because since the edges are unweighted, and
  //therefore the only way to find the shortest path is with a breadth-first search instead of a depth-first search,
  //the moment the first path to the destination node is found the shortest path has also already been found with
  //no need to continue searching. Multiple shortest paths are returned if there is a tie.

  console.log('Question 2: Shortest Path')
  console.log( pathfinderSigma(graphData.nodes,
                               graphData.edges,
                               graphData.nodes[0],
                               graphData.nodes[7],
                               'shortestPath'))

  //TEST THREE: DYNAMICALLY RENDERING SHORTEST PATH
  //I set a useState hook (highlightedPath) at the top of the component to handle rendering the shortest path between two nodes
  //I also created a useEffect hook to dynamically re-render the highlighted path when source and destination are changed
  //I also created two extra useEffect hooks to disable the select options that would cause crashes
  let highlightedEdges = graphData.edges.map((edge) => {
    if (highlightedPath[0].includes(edge.source) && highlightedPath[0].includes(edge.target)) {
      return {...edge, color: '#ff0000'}
    } else {
      return edge
    }
  })

  const highlightedGraphData = {...graphData, edges: highlightedEdges}

  return (
    <div className="App">
      <h1>Diginex Tech Test</h1>
      Source
      <select id='source-select' value={source} onChange={(e) => {setSource(e.target.value)}}>
        <option value = {0}>{graphData.nodes[0].id}</option>
        <option value = {1} disabled={disabledSources.b ? true : null}>{graphData.nodes[1].id}</option>
        <option value = {2} disabled={disabledSources.c ? true : null}>{graphData.nodes[2].id}</option>
        <option value = {3} disabled={disabledSources.d ? true : null}>{graphData.nodes[3].id}</option>
        <option value = {4} disabled={disabledSources.e ? true : null}>{graphData.nodes[4].id}</option>
        <option value = {5} disabled={disabledSources.f ? true : null}>{graphData.nodes[5].id}</option>
        <option value = {6} disabled={disabledSources.g ? true : null}>{graphData.nodes[6].id}</option>
        <option value = {7} disabled>{graphData.nodes[7].id}</option>
      </select>
      Destination
      <select id='destination-select' value={destination} onChange={(e) => {setDestination(e.target.value)}}>
        <option value = {0} disabled>{graphData.nodes[0].id}</option>
        <option value = {1} disabled={disabledDestinations.b ? true : null}>{graphData.nodes[1].id}</option>
        <option value = {2} disabled={disabledDestinations.c ? true : null}>{graphData.nodes[2].id}</option>
        <option value = {3} disabled={disabledDestinations.d ? true : null}>{graphData.nodes[3].id}</option>
        <option value = {4} disabled={disabledDestinations.e ? true : null}>{graphData.nodes[4].id}</option>
        <option value = {5} disabled={disabledDestinations.f ? true : null}>{graphData.nodes[5].id}</option>
        <option value = {6} disabled={disabledDestinations.g ? true : null}>{graphData.nodes[6].id}</option>
        <option value = {7} >{graphData.nodes[7].id}</option>
      </select>
      <Sigma
          renderer="canvas"
          settings={settings}
          style={style}
        >
          <SigmaLoader graph={highlightedGraphData}>
            <NodeShapes default="circle" />
          </SigmaLoader>
      </Sigma>
    </div>
  );
}

export default App;
