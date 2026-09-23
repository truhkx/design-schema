import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Link-EdDzPEMK.js";import{O as o}from"./iframe-Dy0IL05G.js";var s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{t(),r(),o(),a(),s={title:`Alert/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`dismiss`]}},argTypes:{tone:{control:`select`,options:[`info`,`success`,`warning`,`danger`]},live:{control:`select`,options:[`status`,`alert`,`off`]},dismissible:{control:`boolean`},heading:{control:`text`},children:{control:`text`}},args:{tone:`info`,live:`status`,dismissible:!1,children:`Some features are unavailable while you are offline.`},render:e=>i`
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
  `},c={},l={args:{tone:`info`}},u={args:{tone:`success`}},d={args:{tone:`warning`}},f={args:{tone:`danger`}},p={args:{live:`status`}},m={args:{live:`alert`}},h={args:{live:`off`}},g={args:{dismissible:!0}},_={args:{tone:`danger`,live:`alert`,heading:`Payment failed`,children:`Your card was declined. Try another card or contact your bank.`}},v={args:{tone:`success`,heading:`Changes saved`,children:`Your notification preferences apply from the next digest.`}},y={args:{tone:`info`,dismissible:!0,children:`Some features are unavailable while you are offline.`}},b={args:{tone:`warning`,live:`off`,heading:`Trial ends in three days`,children:`Add a payment method to keep your workspace.`}},x={args:{heading:`Changes saved`}},S={args:{tone:`danger`,heading:`Payment failed`},render:e=>i`
    <div style="inline-size: min(100%, 36rem)">
      <ds-alert
        tone=${e.tone}
        live=${e.live}
        heading=${n(e.heading)}
        ?dismissible=${e.dismissible}
        @dismiss=${e=>e.target.remove()}
      >
        Your card was declined.
        <ds-link href="/billing" label="Update your payment method" tone="inherit"></ds-link> to keep your plan.
      </ds-alert>
    </div>
  `},C=[`Default`,`ToneInfo`,`ToneSuccess`,`ToneWarning`,`ToneDanger`,`LiveStatus`,`LiveAlert`,`LiveOff`,`Dismissible`,`BlockingError`,`Saved`,`DismissibleNotice`,`PresentAtLoad`,`WithHeading`,`WithLink`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'info'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'success'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'warning'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'danger'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    live: 'status'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    live: 'alert'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    live: 'off'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'danger',
    live: 'alert',
    heading: 'Payment failed',
    children: 'Your card was declined. Try another card or contact your bank.'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'success',
    heading: 'Changes saved',
    children: 'Your notification preferences apply from the next digest.'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'info',
    dismissible: true,
    children: 'Some features are unavailable while you are offline.'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'warning',
    live: 'off',
    heading: 'Trial ends in three days',
    children: 'Add a payment method to keep your workspace.'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'Changes saved'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'danger',
    heading: 'Payment failed'
  },
  render: args => html\`
    <div style="inline-size: min(100%, 36rem)">
      <ds-alert
        tone=\${args.tone}
        live=\${args.live}
        heading=\${ifDefined(args.heading)}
        ?dismissible=\${args.dismissible}
        @dismiss=\${(event: Event) => (event.target as HTMLElement).remove()}
      >
        Your card was declined.
        <ds-link href="/billing" label="Update your payment method" tone="inherit"></ds-link> to keep your plan.
      </ds-alert>
    </div>
  \`
}`,...S.parameters?.docs?.source}}}})))()}w();export{_ as BlockingError,c as Default,g as Dismissible,y as DismissibleNotice,m as LiveAlert,h as LiveOff,p as LiveStatus,b as PresentAtLoad,v as Saved,f as ToneDanger,l as ToneInfo,u as ToneSuccess,d as ToneWarning,x as WithHeading,S as WithLink,C as __namedExportsOrder,s as default};