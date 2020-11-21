import m from 'mithril'
import { legislatorsUrl, membersUrl } from './model.js'
import IsLoading from './is-loading'
import {flatten,head,map,path, pluck,propEq,traverse} from 'ramda'
import Task from 'data.task'

const log = m => v => {console.log(m,v); return v}

const getLegislators = (mdl) => state => mdl.HTTP(legislatorsUrl(state))

const getMembers = mdl => cid => mdl.HTTP(membersUrl(cid)(mdl.data.year()))

const saveLegislators = mdl => legislators => {
  mdl.data.legislators = legislators;
  return legislators
}

const loadLegislatorsData = mdl =>
  traverse(Task.of, getLegislators(mdl), mdl.states)
    .map(map(path(['response', 'legislator'])))
    .map(flatten)
    .map(pluck('@attributes'))
    .map(saveLegislators(mdl))

const loadMemberProfile = mdl => legislators =>
  traverse(Task.of, getMembers(mdl), pluck('cid', legislators))
  .map(map(path(['response', 'member_profile'])))
  .map(flatten)
  .map(pluck('@attributes'))

const loadData = mdl => state => {
  state.status = 'loading'
  const onSuccess =members => {
    mdl.data.legislators.map(leg => {
      leg.data = head(members.filter(propEq('member_id', leg.cid)))
    })
    state.status = 'loaded'
  }
  const onError =err => {
    console.error(err)
    state.status = 'failed'
  }

  loadLegislatorsData(mdl).chain(loadMemberProfile(mdl)).fork(onError, onSuccess)
}


const PlotFinances = () => {
  return {
    oncreate:({dom, attrs:{mdl}}) => {
      let data = {type:'bar',
                  x:mdl.data.legislators.map(l => l.firstlast),
                  y:mdl.data.legislators.map(l => l.data.net_high)
                }
console.log('data', data)
      return mdl.data.legislators && Plotly.newPlot('chart', [data]);
    },
    view:({attrs:{mdl}}) =>
       m('.', {id:'chart',style:{width: '100vw', height: '600px'}})
  }
}

const Legislators = (mdl) => {
  const state = {
    status: 'loading'
  }
  return {
    oninit: () => loadData(mdl)(state),
    view: () => m('.',
    state.status == 'loading' && IsLoading,
    state.status == 'failed' && 'FAILED',
    state.status == 'loaded' && [
      m(PlotFinances, {mdl}),
      m('input[type="range"]', {min: 2008, max:2016, step:1,value:mdl.data.year(), onchange:e => {mdl.data.year(e.target.value);
      loadData(mdl)(state)
      } }),
      m('h1',mdl.data.year())
    ],
    )
  }
}

export default Legislators
