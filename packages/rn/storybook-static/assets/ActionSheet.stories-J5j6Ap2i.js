import{n as e,o as t}from"./rolldown-runtime-C0FnF6B9.js";import{t as n}from"./react-DiVRNtpo.js";import{n as r,t as i}from"./decorators-By8OYT78.js";import{l as a}from"./iframe-DN6Wi5u4.js";import{n as o,t as s}from"./Button-DLGJ8fI_.js";import{n as c,t as l}from"./Stack-Cq5Eu48m.js";import{n as u,t as d}from"./ActionSheet-D5VjAGi_.js";var f,p,m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{f=t(n(),1),u(),o(),c(),i(),p=a(),m={title:`ActionSheet/React Native`,component:d,decorators:[r()],args:{open:!0,heading:`Photo.jpg`,actions:[{id:`share`,label:`Share`,icon:`external`},{id:`rename`,label:`Rename`},{id:`duplicate`,label:`Duplicate`},{id:`archive`,label:`Archive`,disabled:!0},{id:`delete`,label:`Delete photo`,tone:`danger`}]}},h={},g={args:{heading:void 0}},_={args:{cancelLabel:`Not now`}},v={args:{dismissible:!1}},y={args:{overrides:{radius:`radius.full`,scrim:`color.overlay.scrim`}}},b={render:e=>{function t(){let[t,n]=f.useState(!0);return(0,p.jsxs)(l,{gap:`loose`,align:`start`,children:[(0,p.jsx)(s,{label:`More actions`,onPress:()=>n(!0)}),(0,p.jsx)(d,{...e,open:t,onClose:()=>n(!1),onAction:()=>n(!1)})]})}return(0,p.jsx)(t,{})}},x=[`Default`,`NoHeading`,`CustomCancelLabel`,`NotDismissible`,`WithOverrides`,`Keyboard`],h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    heading: undefined
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    cancelLabel: 'Not now'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    overrides: {
      radius: 'radius.full',
      scrim: 'color.overlay.scrim'
    }
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: args => {
    function Open(): React.JSX.Element {
      const [open, setOpen] = React.useState(true);
      return <Stack gap="loose" align="start">\r
          <Button label="More actions" onPress={() => setOpen(true)} />\r
          <ActionSheet {...args} open={open} onClose={() => setOpen(false)} onAction={() => setOpen(false)} />\r
        </Stack>;
    }
    return <Open />;
  }
}`,...b.parameters?.docs?.source},description:{story:`Open with its trigger and several focusable children, for the axe gate and manual keyboard checks.`,...b.parameters?.docs?.description}}}})))()}S();export{_ as CustomCancelLabel,h as Default,b as Keyboard,g as NoHeading,v as NotDismissible,y as WithOverrides,x as __namedExportsOrder,m as default};