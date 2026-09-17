import{n as e,o as t}from"./rolldown-runtime-C0FnF6B9.js";import{t as n}from"./react-DiVRNtpo.js";import{n as r,t as i}from"./decorators-Dl4455ZU.js";import{a,n as o,r as s,t as c}from"./Toast-C6ML4OqV.js";import{l}from"./iframe-CAToN8Eb.js";import{n as u,t as d}from"./Button-B0Tk0pjd.js";import{n as f,t as p}from"./Stack-l7fs4Elr.js";var m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P;function F(){return(F=e((()=>{m=t(n(),1),u(),f(),s(),i(),h=l(),g={title:`Toast/React Native`,component:c,decorators:[r({fit:!0})],args:{message:`Message sent`,tone:`neutral`,duration:`short`,dismissible:!0}},_={},v={args:{tone:`neutral`,message:`Link copied`}},y={args:{tone:`success`,message:`Changes saved`}},b={args:{tone:`warning`,message:`Connection unstable`}},x={args:{tone:`danger`,message:`Upload failed`,duration:`persistent`}},S={args:{duration:`short`}},C={args:{duration:`long`}},w={args:{duration:`persistent`,message:`3 files deleted`,actionLabel:`Undo`}},T={args:{message:`3 files moved to Archive`,actionLabel:`Undo`,duration:`persistent`}},E={args:{message:`3 files moved to Archive`,actionLabel:`Undo`,duration:`persistent`}},D={args:{message:`Changes saved`,tone:`success`}},O={args:{message:`Export ready`,actionLabel:`View`,duration:`long`}},k={args:{message:`Upload failed`,tone:`danger`,actionLabel:`Retry`,duration:`persistent`}},A={args:{dismissible:!1}},j={args:{overrides:{radius:`radius.full`,maxWidth:`layout.maxWidth.content`}}},M={render:e=>{function t(){let{toast:t,dismiss:n}=a();return m.useEffect(()=>()=>n(),[n]),(0,h.jsx)(d,{label:`Show toast`,onPress:()=>void t({...e})})}return(0,h.jsx)(o,{children:(0,h.jsx)(t,{})})}},N={render:e=>{function t(){let[t,n]=m.useState(!0);return(0,h.jsxs)(p,{gap:`loose`,align:`start`,children:[(0,h.jsx)(d,{label:`Show toasts`,onPress:()=>n(!0)}),t?(0,h.jsxs)(p,{gap:`tight`,align:`start`,children:[(0,h.jsx)(c,{...e,message:`3 files deleted`,actionLabel:`Undo`,duration:`persistent`,onDismiss:()=>n(!1)}),(0,h.jsx)(c,{...e,message:`Export ready`,tone:`success`,actionLabel:`View`,duration:`persistent`})]}):null]})}return(0,h.jsx)(t,{})}},P=[`Default`,`ToneNeutral`,`ToneSuccess`,`ToneWarning`,`ToneDanger`,`DurationShort`,`DurationLong`,`DurationPersistent`,`WithAction`,`UndoADelete`,`Saved`,`BackgroundResult`,`FailedUpload`,`NotDismissible`,`WithOverrides`,`WithProvider`,`Keyboard`],_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'neutral',
    message: 'Link copied'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'success',
    message: 'Changes saved'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'warning',
    message: 'Connection unstable'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'danger',
    message: 'Upload failed',
    duration: 'persistent'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    duration: 'short'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    duration: 'long'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    duration: 'persistent',
    message: '3 files deleted',
    actionLabel: 'Undo'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    message: '3 files moved to Archive',
    actionLabel: 'Undo',
    duration: 'persistent'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    message: '3 files moved to Archive',
    actionLabel: 'Undo',
    duration: 'persistent'
  }
}`,...E.parameters?.docs?.source},description:{story:`The reason most reversible actions need no AlertDialog; an action makes the toast persistent.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    message: 'Changes saved',
    tone: 'success'
  }
}`,...D.parameters?.docs?.source},description:{story:`The plain confirmation of something the user did not have to watch.`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    message: 'Export ready',
    actionLabel: 'View',
    duration: 'long'
  }
}`,...O.parameters?.docs?.source},description:{story:`A result that arrived on its own, with one way to look at it.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    message: 'Upload failed',
    tone: 'danger',
    actionLabel: 'Retry',
    duration: 'persistent'
  }
}`,...k.parameters?.docs?.source},description:{story:`A danger toast, persistent so nobody misses the one they needed.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    overrides: {
      radius: 'radius.full',
      maxWidth: 'layout.maxWidth.content'
    }
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: args => {
    function Trigger(): React.JSX.Element {
      const {
        toast,
        dismiss
      } = useToast();
      React.useEffect(() => () => dismiss(), [dismiss]);
      return <Button label="Show toast" onPress={() => void toast({
        ...args
      })} />;
    }
    return <ToastProvider>\r
        <Trigger />\r
      </ToastProvider>;
  }
}`,...M.parameters?.docs?.source},description:{story:"The imperative API: `useToast()` inside a `ToastProvider`; `dismiss()` clears every toast on cleanup.",...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: args => {
    function Demo(): React.JSX.Element {
      const [visible, setVisible] = React.useState(true);
      return <Stack gap="loose" align="start">\r
          <Button label="Show toasts" onPress={() => setVisible(true)} />\r
          {visible ? <Stack gap="tight" align="start">\r
              <Toast {...args} message="3 files deleted" actionLabel="Undo" duration="persistent" onDismiss={() => setVisible(false)} />\r
              <Toast {...args} message="Export ready" tone="success" actionLabel="View" duration="persistent" />\r
            </Stack> : null}\r
        </Stack>;
    }
    return <Demo />;
  }
}`,...N.parameters?.docs?.source},description:{story:`Open with its trigger and several focusable children, for the axe gate and manual keyboard checks.`,...N.parameters?.docs?.description}}}})))()}F();export{O as BackgroundResult,_ as Default,C as DurationLong,w as DurationPersistent,S as DurationShort,k as FailedUpload,N as Keyboard,A as NotDismissible,D as Saved,x as ToneDanger,v as ToneNeutral,y as ToneSuccess,b as ToneWarning,E as UndoADelete,T as WithAction,j as WithOverrides,M as WithProvider,P as __namedExportsOrder,g as default};