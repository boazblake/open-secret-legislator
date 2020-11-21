const IsLoading = m(
  "svg[xmlns='http://www.w3.org/2000/svg'][xmlns:xlink='http://www.w3.org/1999/xlink'][width='200px'][height='200px'][viewBox='0 0 100 100'][preserveAspectRatio='xMidYMid']",
  {
    style: {
      margin: "auto",
      background: "rgb(241, 242, 243)",
      display: "block",
      "shape-rendering": "auto"
    }
  },
  m(
    "path[d='M10 50A40 40 0 0 0 90 50A40 42 0 0 1 10 50'][fill='#85a2b6'][stroke='none'][transform='rotate(17.5738 50 51)']",
    m(
      "animateTransform[attributeName='transform'][type='rotate'][dur='1s'][repeatCount='indefinite'][keyTimes='0;1'][values='0 50 51;360 50 51']"
    )
  )
)


export default IsLoading
