import{n as e,o as t}from"./rolldown-runtime-C0FnF6B9.js";import{t as n}from"./react-DiVRNtpo.js";import{n as r,t as i}from"./decorators-Dl4455ZU.js";import{l as a}from"./iframe-CAToN8Eb.js";import{n as o,t as s}from"./Button-B0Tk0pjd.js";import{n as c,t as l}from"./Stack-l7fs4Elr.js";import{n as u,t as d}from"./AlertDialog-C41X3hSB.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T;function E(){return(E=e((()=>{f=t(n(),1),u(),o(),c(),i(),p=a(),m={title:`AlertDialog/React Native`,component:d,decorators:[r()],args:{open:!0,heading:`Delete 3 files?`,description:`They will be removed from all shared folders. This cannot be undone.`,tone:`danger`,confirmLabel:`Delete files`,confirmDisabled:!1}},h={},g={args:{tone:`danger`}},_={args:{tone:`warning`,heading:`Leave without saving?`,description:`Your changes to this draft will be lost.`,confirmLabel:`Leave`}},v={args:{tone:`info`,heading:`Publish to the team?`,description:`Everyone in the workspace will be able to see this page.`,confirmLabel:`Publish`}},y={args:{open:!0,tone:`danger`,heading:`Delete 3 files?`,description:`They will be removed from all shared folders. This cannot be undone.`,confirmLabel:`Delete files`}},b={args:{open:!0,tone:`warning`,heading:`Leave without saving?`,description:`Your changes to this draft will be lost.`,confirmLabel:`Leave`,cancelLabel:`Keep editing`}},x={args:{open:!0,tone:`danger`,heading:`Cancel your subscription?`,description:`Your workspace stays read-only after the current billing period ends.`,confirmLabel:`Cancel subscription`,confirmDisabled:!0}},S={args:{open:!0,tone:`info`,heading:`Publish to the team?`,description:`Everyone in the workspace will be able to see this page.`,confirmLabel:`Publish`}},C={args:{overrides:{radius:`radius.sm`,footerGap:`layout.gap.normal`}}},w={render:e=>{function t(){let[t,n]=f.useState(!0);return(0,p.jsxs)(l,{gap:`loose`,align:`start`,children:[(0,p.jsx)(s,{label:`Delete files`,variant:`danger`,onPress:()=>n(!0)}),(0,p.jsx)(d,{...e,open:t,onCancel:()=>n(!1),onConfirm:()=>n(!1)})]})}return(0,p.jsx)(t,{})}},T=[`Default`,`ToneDanger`,`ToneWarning`,`ToneInfo`,`DeleteFiles`,`LeaveWithoutSaving`,`TypedConfirmation`,`PublishToTheTeam`,`WithOverrides`,`Keyboard`],h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'danger'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'warning',
    heading: 'Leave without saving?',
    description: 'Your changes to this draft will be lost.',
    confirmLabel: 'Leave'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'info',
    heading: 'Publish to the team?',
    description: 'Everyone in the workspace will be able to see this page.',
    confirmLabel: 'Publish'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    tone: 'danger',
    heading: 'Delete 3 files?',
    description: 'They will be removed from all shared folders. This cannot be undone.',
    confirmLabel: 'Delete files'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    tone: 'warning',
    heading: 'Leave without saving?',
    description: 'Your changes to this draft will be lost.',
    confirmLabel: 'Leave',
    cancelLabel: 'Keep editing'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    tone: 'danger',
    heading: 'Cancel your subscription?',
    description: 'Your workspace stays read-only after the current billing period ends.',
    confirmLabel: 'Cancel subscription',
    confirmDisabled: true
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    tone: 'info',
    heading: 'Publish to the team?',
    description: 'Everyone in the workspace will be able to see this page.',
    confirmLabel: 'Publish'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    overrides: {
      radius: 'radius.sm',
      footerGap: 'layout.gap.normal'
    }
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: args => {
    function Open(): React.JSX.Element {
      const [open, setOpen] = React.useState(true);
      return <Stack gap="loose" align="start">\r
          <Button label="Delete files" variant="danger" onPress={() => setOpen(true)} />\r
          <AlertDialog {...args} open={open} onCancel={() => setOpen(false)} onConfirm={() => setOpen(false)} />\r
        </Stack>;
    }
    return <Open />;
  }
}`,...w.parameters?.docs?.source},description:{story:`Open with its trigger, for the axe gate and manual keyboard checks. The dialog has\r
exactly two focusable children (Cancel, Confirm) and the trigger behind is inert, so\r
the three-focusable-children rule does not apply. The wrapper owns \`open\` as a consumer.`,...w.parameters?.docs?.description}}}})))()}E();export{h as Default,y as DeleteFiles,w as Keyboard,b as LeaveWithoutSaving,S as PublishToTheTeam,g as ToneDanger,v as ToneInfo,_ as ToneWarning,x as TypedConfirmation,C as WithOverrides,T as __namedExportsOrder,m as default};