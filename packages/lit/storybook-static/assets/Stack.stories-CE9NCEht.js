import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{t as r}from"./Button-TSn-G4Vm.js";import{t as i}from"./Stack-CZSvFm0E.js";var a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A;function j(){return(j=e((()=>{t(),i(),r(),a={title:`Stack/Lit`,tags:[`autodocs`],argTypes:{direction:{control:`select`,options:[`vertical`,`horizontal`]},gap:{control:`select`,options:[`none`,`tight`,`normal`,`loose`,`section`]},align:{control:`select`,options:[`start`,`center`,`end`,`stretch`]},justify:{control:`select`,options:[`start`,`center`,`end`,`between`]},wrap:{control:`boolean`},element:{control:`select`,options:[`div`,`section`,`nav`,`ul`,`ol`]}},args:{direction:`vertical`,gap:`normal`,align:`stretch`,justify:`start`,wrap:!1,element:`div`},render:e=>n`
    <ds-stack
      direction=${e.direction}
      gap=${e.gap}
      align=${e.align}
      justify=${e.justify}
      ?wrap=${e.wrap}
      .element=${e.element}
    >
      <ds-button label="Save changes"></ds-button>
      <ds-button variant="secondary" label="Preview"></ds-button>
      <ds-button variant="ghost" label="Cancel"></ds-button>
    </ds-stack>
  `},o={},s={args:{direction:`vertical`}},c={args:{direction:`horizontal`,align:`center`}},l=e=>({args:{gap:e,direction:`horizontal`,align:`center`}}),u=l(`none`),d=l(`tight`),f=l(`normal`),p=l(`loose`),m=l(`section`),h={args:{align:`start`}},g={args:{align:`center`}},_={args:{align:`end`}},v={args:{align:`stretch`}},y=e=>({args:{justify:e,direction:`horizontal`,align:`center`}}),b=y(`start`),x=y(`center`),S=y(`end`),C=y(`between`),w={args:{direction:`horizontal`,align:`center`,wrap:!0},render:e=>n`
    <div style="max-inline-size: 20rem">
      <ds-stack direction=${e.direction} gap=${e.gap} align=${e.align} justify=${e.justify} ?wrap=${e.wrap} .element=${e.element}>
        <ds-button label="Save changes"></ds-button>
        <ds-button variant="secondary" label="Preview"></ds-button>
        <ds-button variant="secondary" label="Duplicate"></ds-button>
        <ds-button variant="ghost" label="Cancel"></ds-button>
      </ds-stack>
    </div>
  `},T={args:{element:`div`}},E={args:{element:`section`}},D={args:{element:`nav`,direction:`horizontal`,align:`center`}},O={args:{element:`ul`}},k={args:{element:`ol`}},A=[`Default`,`Vertical`,`Horizontal`,`GapNone`,`GapTight`,`GapNormal`,`GapLoose`,`GapSection`,`AlignStart`,`AlignCenter`,`AlignEnd`,`AlignStretch`,`JustifyStart`,`JustifyCenter`,`JustifyEnd`,`JustifyBetween`,`Wrap`,`ElementDiv`,`ElementSection`,`ElementNav`,`ElementUl`,`ElementOl`],o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    direction: 'vertical'
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    direction: 'horizontal',
    align: 'center'
  }
}`,...c.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`gapStory('none')`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`gapStory('tight')`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`gapStory('normal')`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`gapStory('loose')`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`gapStory('section')`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    align: 'start'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    align: 'center'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    align: 'end'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    align: 'stretch'
  }
}`,...v.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`justifyStory('start')`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`justifyStory('center')`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`justifyStory('end')`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`justifyStory('between')`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    direction: 'horizontal',
    align: 'center',
    wrap: true
  },
  render: args => html\`
    <div style="max-inline-size: 20rem">
      <ds-stack direction=\${args.direction} gap=\${args.gap} align=\${args.align} justify=\${args.justify} ?wrap=\${args.wrap} .element=\${args.element}>
        <ds-button label="Save changes"></ds-button>
        <ds-button variant="secondary" label="Preview"></ds-button>
        <ds-button variant="secondary" label="Duplicate"></ds-button>
        <ds-button variant="ghost" label="Cancel"></ds-button>
      </ds-stack>
    </div>
  \`
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    element: 'div'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    element: 'section'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    element: 'nav',
    direction: 'horizontal',
    align: 'center'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    element: 'ul'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    element: 'ol'
  }
}`,...k.parameters?.docs?.source}}}})))()}j();export{g as AlignCenter,_ as AlignEnd,h as AlignStart,v as AlignStretch,o as Default,T as ElementDiv,D as ElementNav,k as ElementOl,E as ElementSection,O as ElementUl,p as GapLoose,u as GapNone,f as GapNormal,m as GapSection,d as GapTight,c as Horizontal,C as JustifyBetween,x as JustifyCenter,S as JustifyEnd,b as JustifyStart,s as Vertical,w as Wrap,A as __namedExportsOrder,a as default};