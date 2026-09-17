import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-C5klQxY3.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./Button-DEGXCMgU.js";import{n as a,t as o}from"./AlertDialog-C71bym0J.js";function s({open:e,onConfirm:t,onCancel:n,...r}){let[a,s]=(0,c.useState)(e);return(0,c.useEffect)(()=>s(e),[e]),(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(i,{label:r.confirmLabel,onClick:()=>s(!0)}),(0,l.jsx)(o,{...r,open:a,onConfirm:()=>{t?.(),s(!1)},onCancel:e=>{n?.(e),s(!1)}})]})}var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S;function C(){return(C=e((()=>{c=t(),a(),r(),l=n(),u={title:`AlertDialog/React`,component:o,args:{open:!0,heading:`Delete 3 files?`,description:`They will be removed from all shared folders. This cannot be undone.`,tone:`danger`,confirmLabel:`Delete files`,confirmDisabled:!1},argTypes:{tone:{control:`inline-radio`,options:[`danger`,`warning`,`info`]}},render:e=>(0,l.jsx)(s,{...e}),tags:[`autodocs`]},d={},f={args:{tone:`danger`}},p={args:{tone:`warning`}},m={args:{tone:`info`}},h={args:{confirmDisabled:!0}},g={args:{open:!1}},_={args:{open:!0}},v={args:{open:!0,tone:`danger`,heading:`Delete 3 files?`,description:`They will be removed from all shared folders. This cannot be undone.`,confirmLabel:`Delete files`}},y={args:{open:!0,tone:`warning`,heading:`Leave without saving?`,description:`Your changes to this draft will be lost.`,confirmLabel:`Leave`,cancelLabel:`Keep editing`}},b={args:{open:!0,tone:`danger`,heading:`Cancel your subscription?`,description:`Your workspace stays read-only after the current billing period ends.`,confirmLabel:`Cancel subscription`,confirmDisabled:!0}},x={args:{open:!0,tone:`info`,heading:`Publish to the team?`,description:`Everyone in the workspace will be able to see this page.`,confirmLabel:`Publish`}},S=[`Default`,`ToneDanger`,`ToneWarning`,`ToneInfo`,`ConfirmDisabled`,`Closed`,`Keyboard`,`DeleteFiles`,`LeaveWithoutSaving`,`TypedConfirmation`,`PublishToTheTeam`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'danger'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'warning'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'info'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    confirmDisabled: true
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    open: false
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    open: true
  }
}`,..._.parameters?.docs?.source},description:{story:`Open with its trigger; the focusable children are Cancel and Confirm, the trigger sits behind the inert page.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    tone: 'danger',
    heading: 'Delete 3 files?',
    description: 'They will be removed from all shared folders. This cannot be undone.',
    confirmLabel: 'Delete files'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    tone: 'warning',
    heading: 'Leave without saving?',
    description: 'Your changes to this draft will be lost.',
    confirmLabel: 'Leave',
    cancelLabel: 'Keep editing'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    tone: 'danger',
    heading: 'Cancel your subscription?',
    description: 'Your workspace stays read-only after the current billing period ends.',
    confirmLabel: 'Cancel subscription',
    confirmDisabled: true
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    tone: 'info',
    heading: 'Publish to the team?',
    description: 'Everyone in the workspace will be able to see this page.',
    confirmLabel: 'Publish'
  }
}`,...x.parameters?.docs?.source}}}})))()}C();export{g as Closed,h as ConfirmDisabled,d as Default,v as DeleteFiles,_ as Keyboard,y as LeaveWithoutSaving,x as PublishToTheTeam,f as ToneDanger,m as ToneInfo,p as ToneWarning,b as TypedConfirmation,S as __namedExportsOrder,u as default};