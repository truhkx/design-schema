import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,w as n}from"./if-defined-CARySXJh.js";import{t as r}from"./Text-C3do0IPT.js";import{t as i}from"./Button-DM0-zK5H.js";import{t as a}from"./Input-CF5u541t.js";import{t as o}from"./Stack-gnRbseNc.js";function s(e,t){return n`
    <ds-stack
      direction=${e.direction}
      gap=${e.gap}
      align=${e.align}
      justify=${e.justify}
      ?wrap=${e.wrap}
      .element=${e.element}
    >
      ${t}
    </ds-stack>
  `}var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z;function B(){return(B=e((()=>{t(),o(),i(),a(),r(),c=[`none`,`tight`,`normal`,`loose`,`section`],l=n`
  <ds-button label="Save changes"></ds-button>
  <ds-button variant="secondary" label="Preview"></ds-button>
  <ds-button variant="ghost" label="Cancel"></ds-button>
`,u={title:`Stack/Lit`,tags:[`autodocs`],argTypes:{direction:{control:`select`,options:[`vertical`,`horizontal`]},gap:{control:`select`,options:c},align:{control:`select`,options:[`start`,`center`,`end`,`stretch`]},justify:{control:`select`,options:[`start`,`center`,`end`,`between`]},wrap:{control:`boolean`},element:{control:`select`,options:[`div`,`section`,`nav`,`ul`,`ol`]}},args:{direction:`vertical`,gap:`normal`,align:`stretch`,justify:`start`,wrap:!1,element:`div`},render:e=>s(e,l)},d={},f={args:{direction:`vertical`}},p={args:{direction:`horizontal`,align:`center`}},m=e=>({args:{gap:e,direction:`horizontal`,align:`center`}}),h=m(`none`),g=m(`tight`),_=m(`normal`),v=m(`loose`),y=m(`section`),b={args:{align:`start`}},x={args:{align:`center`}},S={args:{align:`end`}},C={args:{align:`stretch`}},w=e=>({args:{justify:e,direction:`horizontal`,align:`center`}}),T=w(`start`),E=w(`center`),D=w(`end`),O=w(`between`),k={args:{direction:`horizontal`,align:`center`,wrap:!0},render:e=>n`<div style="max-inline-size: 16rem">${s(e,l)}</div>`},A={args:{element:`div`}},j={args:{element:`section`}},M={args:{element:`nav`,direction:`horizontal`,align:`center`}},N={args:{element:`ul`}},P={args:{element:`ol`}},F={args:{direction:`vertical`,gap:`normal`},render:e=>s(e,n`
        <ds-input label="Full name" name="name" type="text"></ds-input>
        <ds-input label="Email address" name="email" type="email"></ds-input>
        <ds-input label="Phone number" name="phone" type="tel"></ds-input>
      `)},I={args:{direction:`horizontal`,gap:`tight`,justify:`end`},render:e=>s(e,n`
        <ds-button variant="secondary" label="Cancel"></ds-button>
        <ds-button type="submit" label="Submit"></ds-button>
      `)},L={args:{direction:`vertical`,gap:`section`},render:e=>s(e,n`
        <ds-text>The first region of the page</ds-text>
        <ds-text>The second region of the page</ds-text>
        <ds-text>The third region of the page</ds-text>
      `)},R={args:{direction:`horizontal`,gap:`tight`,wrap:!0},render:e=>n`
    <div style="max-inline-size: 16rem">
      ${s(e,n`
          <ds-button variant="secondary" size="sm" label="All"></ds-button>
          <ds-button variant="ghost" size="sm" label="Open"></ds-button>
          <ds-button variant="ghost" size="sm" label="In review"></ds-button>
          <ds-button variant="ghost" size="sm" label="Merged"></ds-button>
          <ds-button variant="ghost" size="sm" label="Closed"></ds-button>
          <ds-button variant="ghost" size="sm" label="Archived"></ds-button>
        `)}
    </div>
  `},z=`Default.DirectionVertical.DirectionHorizontal.GapNone.GapTight.GapNormal.GapLoose.GapSection.AlignStart.AlignCenter.AlignEnd.AlignStretch.JustifyStart.JustifyCenter.JustifyEnd.JustifyBetween.Wrap.ElementDiv.ElementSection.ElementNav.ElementUl.ElementOl.FormFields.ButtonRow.PageSections.WrappingFilters`.split(`.`),d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    direction: 'vertical'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    direction: 'horizontal',
    align: 'center'
  }
}`,...p.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`gapStory('none')`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`gapStory('tight')`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`gapStory('normal')`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`gapStory('loose')`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`gapStory('section')`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    align: 'start'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    align: 'center'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    align: 'end'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    align: 'stretch'
  }
}`,...C.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`justifyStory('start')`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`justifyStory('center')`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`justifyStory('end')`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`justifyStory('between')`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    direction: 'horizontal',
    align: 'center',
    wrap: true
  },
  render: args => html\`<div style="max-inline-size: 16rem">\${renderStack(args, buttons)}</div>\`
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    element: 'div'
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    element: 'section'
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    element: 'nav',
    direction: 'horizontal',
    align: 'center'
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    element: 'ul'
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    element: 'ol'
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    direction: 'vertical',
    gap: 'normal'
  },
  render: args => renderStack(args, html\`
        <ds-input label="Full name" name="name" type="text"></ds-input>
        <ds-input label="Email address" name="email" type="email"></ds-input>
        <ds-input label="Phone number" name="phone" type="tel"></ds-input>
      \`)
}`,...F.parameters?.docs?.source},description:{story:`The usual vertical rhythm between fields in a form.`,...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    direction: 'horizontal',
    gap: 'tight',
    justify: 'end'
  },
  render: args => renderStack(args, html\`
        <ds-button variant="secondary" label="Cancel"></ds-button>
        <ds-button type="submit" label="Submit"></ds-button>
      \`)
}`,...I.parameters?.docs?.source},description:{story:`A row of actions at the end of a form or card, tightly spaced and pushed to the end.`,...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    direction: 'vertical',
    gap: 'section'
  },
  render: args => renderStack(args, html\`
        <ds-text>The first region of the page</ds-text>
        <ds-text>The second region of the page</ds-text>
        <ds-text>The third region of the page</ds-text>
      \`)
}`,...L.parameters?.docs?.source},description:{story:`The section rhythm between the regions of a page.`,...L.parameters?.docs?.description}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    direction: 'horizontal',
    gap: 'tight',
    wrap: true
  },
  render: args => html\`
    <div style="max-inline-size: 16rem">
      \${renderStack(args, html\`
          <ds-button variant="secondary" size="sm" label="All"></ds-button>
          <ds-button variant="ghost" size="sm" label="Open"></ds-button>
          <ds-button variant="ghost" size="sm" label="In review"></ds-button>
          <ds-button variant="ghost" size="sm" label="Merged"></ds-button>
          <ds-button variant="ghost" size="sm" label="Closed"></ds-button>
          <ds-button variant="ghost" size="sm" label="Archived"></ds-button>
        \`)}
    </div>
  \`
}`,...R.parameters?.docs?.source},description:{story:`A horizontal group that reflows onto new lines on narrow viewports instead of overflowing.`,...R.parameters?.docs?.description}}}})))()}B();export{x as AlignCenter,S as AlignEnd,b as AlignStart,C as AlignStretch,I as ButtonRow,d as Default,p as DirectionHorizontal,f as DirectionVertical,A as ElementDiv,M as ElementNav,P as ElementOl,j as ElementSection,N as ElementUl,F as FormFields,v as GapLoose,h as GapNone,_ as GapNormal,y as GapSection,g as GapTight,O as JustifyBetween,E as JustifyCenter,D as JustifyEnd,T as JustifyStart,L as PageSections,k as Wrap,R as WrappingFilters,z as __namedExportsOrder,u as default};