const api = '4fbc39be8c00b4af07a6f182c64d5c1a'
const baseUrl ='http://www.opensecrets.org/api/?method='
const apiKey = `&output=json&apikey=${api}`
const legislatorUrl = state => `getLegislators&id=${state}`
const memberUrl = cid => year => `memPFDprofile&year=${year}&cid=${cid}`
import Task from 'data.task'
import m from 'mithril'


const HTTP = url => new Task((rej, res)=> m.request(url).then(res,rej))

export const legislatorsUrl = state => `${baseUrl}${legislatorUrl(state)}${apiKey}`
export const membersUrl = cid =>year=> `${baseUrl}${memberUrl(cid)(year)}${apiKey}`


const states = [ 'AL',
'MT', 'AK','NE', 'AZ','NV', 'AR','NH', 'CA', 'NJ', 'CO',
                 'NM', 'CT','NY', 'DE','NC', 'FL','ND', 'GA','OH', 'HI','OK',
                 'ID','OR', 'IL','PA', 'IN','RI', 'IA','SC', 'KS','SD', 'KY','TN',
                 'LA','TX', 'ME','UT', 'MD','VT', 'MA','VA', 'MI','WA', 'MN','WV', 'MS','WI',
                 'MO','WY', ]

const model = {
  HTTP,
  states,
  data: {legislators:null,details: null, year: Stream(2016) },
  err: null,
  state: null,
  settings: {}
}

export default model
