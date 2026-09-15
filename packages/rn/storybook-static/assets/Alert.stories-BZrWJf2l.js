import{n as e,o as t}from"./rolldown-runtime-C0FnF6B9.js";import{t as n}from"./react-DiVRNtpo.js";import{n as r,t as i}from"./decorators-By8OYT78.js";import{l as a}from"./iframe-DN6Wi5u4.js";import{n as o,t as s}from"./Alert-Cx_IYPib.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{c=t(n(),1),o(),i(),l=a(),u={title:`Alert/React Native`,component:s,decorators:[r()],args:{tone:`info`,heading:`Changes saved`,children:`Your notification preferences apply from the next digest.`,live:`status`,dismissible:!1}},d={},f={args:{tone:`info`,heading:`Maintenance on Saturday`,children:`Sync pauses from 02:00 to 03:00 UTC.`}},p={args:{tone:`success`,heading:`Changes saved`}},m={args:{tone:`warning`,heading:`Trial ends in 3 days`,children:`Add a payment method to keep your projects.`}},h={args:{tone:`danger`,heading:`Payment failed`,children:`The card ending 4242 was declined. Update it to continue.`,live:`alert`}},g={args:{live:`status`}},_={args:{live:`alert`,tone:`danger`,heading:`Payment failed`,children:`Update your card to continue.`}},v={args:{live:`off`}},y={args:{dismissible:!0},render:e=>{let[t,n]=c.useState(!0);return t?(0,l.jsx)(s,{...e,onDismiss:()=>n(!1)}):(0,l.jsx)(l.Fragment,{})}},b={args:{heading:void 0,children:`Some features are unavailable while offline.`}},x=[`Default`,`ToneInfo`,`ToneSuccess`,`ToneWarning`,`ToneDanger`,`LiveStatus`,`LiveAlert`,`LiveOff`,`Dismissible`,`WithoutHeading`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'info',
    heading: 'Maintenance on Saturday',
    children: 'Sync pauses from 02:00 to 03:00 UTC.'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'success',
    heading: 'Changes saved'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'warning',
    heading: 'Trial ends in 3 days',
    children: 'Add a payment method to keep your projects.'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'danger',
    heading: 'Payment failed',
    children: 'The card ending 4242 was declined. Update it to continue.',
    live: 'alert'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    live: 'status'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    live: 'alert',
    tone: 'danger',
    heading: 'Payment failed',
    children: 'Update your card to continue.'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    live: 'off'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: true
  },
  render: args => {
    const [visible, setVisible] = React.useState(true);
    return visible ? <Alert {...args} onDismiss={() => setVisible(false)} /> : <></>;
  }
}`,...y.parameters?.docs?.source},description:{story:"A dismiss button at the end; the consumer removes the alert on `onDismiss`.",...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    heading: undefined,
    children: 'Some features are unavailable while offline.'
  }
}`,...b.parameters?.docs?.source}}}})))()}S();export{d as Default,y as Dismissible,_ as LiveAlert,v as LiveOff,g as LiveStatus,h as ToneDanger,f as ToneInfo,p as ToneSuccess,m as ToneWarning,b as WithoutHeading,x as __namedExportsOrder,u as default};