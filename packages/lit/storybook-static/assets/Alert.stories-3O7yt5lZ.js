import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Text-BrJPDVza.js";import{t as o}from"./Link-EdDzPEMK.js";import{O as s}from"./iframe-B0T1LYjz.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{t(),r(),s(),o(),a(),c={title:`Alert/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`dismiss`]}},argTypes:{tone:{control:`select`,options:[`info`,`success`,`warning`,`danger`]},live:{control:`select`,options:[`status`,`alert`,`off`]},dismissible:{control:`boolean`},heading:{control:`text`},children:{control:`text`}},args:{tone:`info`,live:`status`,dismissible:!1,children:`Some features are unavailable while you are offline.`},render:e=>i`
    <div style="inline-size: min(100%, 36rem)">
      <ds-alert
        tone=${e.tone}
        live=${e.live}
        heading=${n(e.heading)}
        ?dismissible=${e.dismissible}
        @dismiss=${e=>e.target.remove()}
        >${e.children}</ds-alert
      >
    </div>
  `},l={},u={args:{tone:`info`}},d={args:{tone:`success`}},f={args:{tone:`warning`}},p={args:{tone:`danger`}},m={args:{live:`status`}},h={args:{live:`alert`}},g={args:{live:`off`}},_={args:{dismissible:!0}},v={args:{tone:`danger`,live:`alert`,heading:`Payment failed`,children:`Your card was declined. Try another card or contact your bank.`}},y={args:{tone:`success`,heading:`Changes saved`,children:`Your notification preferences apply from the next digest.`}},b={args:{tone:`info`,dismissible:!0,children:`Some features are unavailable while you are offline.`}},x={args:{tone:`warning`,live:`off`,heading:`Trial ends in three days`,children:`Add a payment method to keep your workspace.`}},S={args:{tone:`warning`,heading:`Trial ends in three days`},render:e=>i`
    <div style="inline-size: min(100%, 36rem)">
      <ds-alert tone=${e.tone} live=${e.live} heading=${n(e.heading)} ?dismissible=${e.dismissible}>
        <ds-text
          >Add a payment method to keep your workspace.
          <ds-link href="#billing" label="Go to billing"></ds-link></ds-text
        >
      </ds-alert>
    </div>
  `},C=[`Default`,`ToneInfo`,`ToneSuccess`,`ToneWarning`,`ToneDanger`,`LiveStatus`,`LiveAlert`,`LiveOff`,`Dismissible`,`BlockingError`,`Saved`,`DismissibleNotice`,`PresentAtLoad`,`WithLink`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'info'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'success'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'warning'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'danger'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    live: 'status'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    live: 'alert'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    live: 'off'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'danger',
    live: 'alert',
    heading: 'Payment failed',
    children: 'Your card was declined. Try another card or contact your bank.'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'success',
    heading: 'Changes saved',
    children: 'Your notification preferences apply from the next digest.'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'info',
    dismissible: true,
    children: 'Some features are unavailable while you are offline.'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'warning',
    live: 'off',
    heading: 'Trial ends in three days',
    children: 'Add a payment method to keep your workspace.'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'warning',
    heading: 'Trial ends in three days'
  },
  render: args => html\`
    <div style="inline-size: min(100%, 36rem)">
      <ds-alert tone=\${args.tone} live=\${args.live} heading=\${ifDefined(args.heading)} ?dismissible=\${args.dismissible}>
        <ds-text
          >Add a payment method to keep your workspace.
          <ds-link href="#billing" label="Go to billing"></ds-link></ds-text
        >
      </ds-alert>
    </div>
  \`
}`,...S.parameters?.docs?.source}}}})))()}w();export{v as BlockingError,l as Default,_ as Dismissible,b as DismissibleNotice,h as LiveAlert,g as LiveOff,m as LiveStatus,x as PresentAtLoad,y as Saved,p as ToneDanger,u as ToneInfo,d as ToneSuccess,f as ToneWarning,S as WithLink,C as __namedExportsOrder,c as default};