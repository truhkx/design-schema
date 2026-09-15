import{n as e,o as t}from"./rolldown-runtime-C0FnF6B9.js";import{t as n}from"./react-DiVRNtpo.js";import{n as r,t as i}from"./decorators-By8OYT78.js";import{l as a}from"./iframe-DN6Wi5u4.js";import{n as o,t as s}from"./Button-DLGJ8fI_.js";import{n as c,t as l}from"./Stack-Cq5Eu48m.js";import{n as u,t as d}from"./Input-C100LZZX.js";import{n as f,t as p}from"./AlertDialog-TFvntjdp.js";var m,h,g,_,v,y,b,x,S,C,w,T;function E(){return(E=e((()=>{m=t(n(),1),f(),o(),u(),c(),i(),h=a(),g={title:`AlertDialog/React Native`,component:p,decorators:[r()],args:{open:!0,heading:`Delete 3 files?`,description:`They will be removed from all shared folders. This cannot be undone.`,tone:`danger`,confirmLabel:`Delete files`,confirmDisabled:!1}},_={},v={args:{tone:`danger`,confirmLabel:`Delete files`}},y={args:{tone:`warning`,heading:`Leave without saving?`,description:`Your changes will be lost. This cannot be undone.`,confirmLabel:`Leave page`}},b={args:{tone:`info`,heading:`Switch workspaces?`,description:`You will be moved to the Marketing workspace.`,confirmLabel:`Switch workspace`}},x={args:{tone:`warning`,heading:`Leave without saving?`,description:`Your changes will be lost. This cannot be undone.`,confirmLabel:`Leave page`,cancelLabel:`Keep editing`}},S={args:{confirmDisabled:!0}},C={args:{overrides:{radius:`radius.full`,border:`color.border.strong`}}},w={render:e=>{function t(){let[t,n]=m.useState(!0);return(0,h.jsxs)(l,{gap:`loose`,align:`start`,children:[(0,h.jsx)(s,{label:`Delete files`,variant:`danger`,onPress:()=>n(!0)}),(0,h.jsx)(d,{label:`Project name`,name:`name`,defaultValue:`Marketing site`}),(0,h.jsx)(d,{label:`Description`,name:`description`}),(0,h.jsx)(p,{...e,open:t,onCancel:()=>n(!1),onConfirm:()=>n(!1)})]})}return(0,h.jsx)(t,{})}},T=[`Default`,`ToneDanger`,`ToneWarning`,`ToneInfo`,`CustomCancelLabel`,`ConfirmDisabled`,`WithOverrides`,`Keyboard`],_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'danger',
    confirmLabel: 'Delete files'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'warning',
    heading: 'Leave without saving?',
    description: 'Your changes will be lost. This cannot be undone.',
    confirmLabel: 'Leave page'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'info',
    heading: 'Switch workspaces?',
    description: 'You will be moved to the Marketing workspace.',
    confirmLabel: 'Switch workspace'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'warning',
    heading: 'Leave without saving?',
    description: 'Your changes will be lost. This cannot be undone.',
    confirmLabel: 'Leave page',
    cancelLabel: 'Keep editing'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    confirmDisabled: true
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    overrides: {
      radius: 'radius.full',
      border: 'color.border.strong'
    }
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: args => {
    function Open(): React.JSX.Element {
      const [open, setOpen] = React.useState(true);
      return <Stack gap="loose" align="start">\r
          <Button label="Delete files" variant="danger" onPress={() => setOpen(true)} />\r
          <Input label="Project name" name="name" defaultValue="Marketing site" />\r
          <Input label="Description" name="description" />\r
          <AlertDialog {...args} open={open} onCancel={() => setOpen(false)} onConfirm={() => setOpen(false)} />\r
        </Stack>;
    }
    return <Open />;
  }
}`,...w.parameters?.docs?.source},description:{story:`Open with its trigger and several focusable children, for the axe gate and manual keyboard checks.`,...w.parameters?.docs?.description}}}})))()}E();export{S as ConfirmDisabled,x as CustomCancelLabel,_ as Default,w as Keyboard,v as ToneDanger,b as ToneInfo,y as ToneWarning,C as WithOverrides,T as __namedExportsOrder,g as default};