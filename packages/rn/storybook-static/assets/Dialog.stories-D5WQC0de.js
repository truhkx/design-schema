import{n as e,o as t}from"./rolldown-runtime-C0FnF6B9.js";import{t as n}from"./react-DiVRNtpo.js";import{n as r,o as i,r as a,t as o}from"./decorators-Dl4455ZU.js";import{i as s,r as c}from"./BottomSheet-CVGOiIhz.js";import{l}from"./iframe-CAToN8Eb.js";import{n as u,t as d}from"./Button-B0Tk0pjd.js";import{n as f,t as p}from"./Stack-l7fs4Elr.js";import{n as m,t as h}from"./Input-DDaWoxHS.js";import{n as g,t as _}from"./RadioGroup-Bz25nwJw.js";import{n as v,t as y}from"./Select-BW6rwOBr.js";function b(e){let[t,n]=x.useState(e.open);return x.useEffect(()=>n(e.open),[e.open]),(0,S.jsx)(c,{...e,open:t,onClose:t=>{e.onClose?.(t),n(!1)}})}var x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V;function H(){return(H=e((()=>{x=t(n(),1),u(),s(),m(),g(),v(),f(),i(),o(),S=l(),C={title:`Dialog/React Native`,component:c,decorators:[r()],render:e=>(0,S.jsx)(b,{...e}),args:{open:!0,heading:`Rename project`,children:(0,S.jsx)(h,{label:`Project name`,name:`name`,defaultValue:`Marketing site`}),footer:(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(d,{label:`Rename`,variant:`primary`}),(0,S.jsx)(d,{label:`Cancel`,variant:`secondary`})]})}},w={},T={args:{size:`sm`}},E={args:{size:`md`}},D={args:{size:`lg`}},O={args:{initialFocus:`first`}},k={args:{initialFocus:`title`}},A={args:{initialFocus:`close`}},j={args:{description:`The new name appears everywhere the project is listed.`}},M={args:{footer:void 0}},N={args:{hideHeading:!0}},P={args:{dismissible:!1}},F={args:{overrides:{radius:`radius.md`,border:`color.border.strong`,widthMd:`layout.maxWidth.prose`}}},I={args:{open:!0,heading:`Rename project`,children:(0,S.jsx)(h,{label:`Project name`,name:`name`,defaultValue:`Marketing site`}),footer:(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(d,{label:`Rename`,variant:`primary`}),(0,S.jsx)(d,{label:`Cancel`,variant:`secondary`})]})}},L={args:{open:!0,heading:`Invite people`,children:(0,S.jsxs)(p,{gap:`normal`,children:[(0,S.jsx)(h,{label:`Email address`,name:`email`,type:`email`}),(0,S.jsx)(y,{label:`Role`,name:`role`,options:[{value:`viewer`,label:`Viewer`},{value:`editor`,label:`Editor`},{value:`admin`,label:`Admin`}]})]}),footer:(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(d,{label:`Send invites`,variant:`primary`}),(0,S.jsx)(d,{label:`Cancel`,variant:`secondary`})]}),size:`sm`}},R={args:{open:!0,heading:`Choose a plan`,description:`You need a plan before you can invite anyone.`,children:(0,S.jsx)(_,{label:`Plan`,name:`plan`,options:[{value:`free`,label:`Free`},{value:`team`,label:`Team`},{value:`enterprise`,label:`Enterprise`}]}),footer:(0,S.jsx)(d,{label:`Continue`,variant:`primary`}),dismissible:!1}},z={args:{open:!0,heading:`Terms of service`,children:(0,S.jsxs)(p,{gap:`normal`,children:[(0,S.jsx)(a,{children:`These terms govern your use of the service and any content you create with it.`}),(0,S.jsx)(a,{children:`You keep ownership of your content. You grant us the rights needed to host and display it to the people you share it with.`}),(0,S.jsx)(a,{children:`We may change these terms. When we do, we will tell you before the change takes effect.`}),(0,S.jsx)(a,{children:`You can close your account at any time. Your content is deleted within thirty days of closing.`})]}),size:`lg`,initialFocus:`title`}},B={render:e=>{function t(){let[t,n]=x.useState(!0);return(0,S.jsxs)(p,{gap:`loose`,align:`start`,children:[(0,S.jsx)(d,{label:`Open dialog`,onPress:()=>n(!0)}),(0,S.jsx)(c,{...e,open:t,onClose:t=>{e.onClose?.(t),n(!1)},footer:(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(d,{label:`Rename`,variant:`primary`,onPress:()=>n(!1)}),(0,S.jsx)(d,{label:`Cancel`,variant:`secondary`,onPress:()=>n(!1)})]}),children:(0,S.jsxs)(p,{gap:`loose`,children:[(0,S.jsx)(h,{label:`Project name`,name:`name`,defaultValue:`Marketing site`}),(0,S.jsx)(h,{label:`Description`,name:`description`})]})})]})}return(0,S.jsx)(t,{})}},V=[`Default`,`SizeSm`,`SizeMd`,`SizeLg`,`InitialFocusFirst`,`InitialFocusTitle`,`InitialFocusClose`,`WithDescription`,`NoFooter`,`HideHeading`,`NotDismissible`,`WithOverrides`,`RenameProject`,`InvitePeople`,`MustBeAnswered`,`ReadingDialog`,`Keyboard`],w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'lg'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    initialFocus: 'first'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    initialFocus: 'title'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    initialFocus: 'close'
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'The new name appears everywhere the project is listed.'
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    footer: undefined
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    hideHeading: true
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    overrides: {
      radius: 'radius.md',
      border: 'color.border.strong',
      widthMd: 'layout.maxWidth.prose'
    }
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Rename project',
    children: <Input label="Project name" name="name" defaultValue="Marketing site" />,
    footer: <>\r
        <Button label="Rename" variant="primary" />\r
        <Button label="Cancel" variant="secondary" />\r
      </>
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Invite people',
    children: <Stack gap="normal">\r
        <Input label="Email address" name="email" type="email" />\r
        <Select label="Role" name="role" options={[{
        value: 'viewer',
        label: 'Viewer'
      }, {
        value: 'editor',
        label: 'Editor'
      }, {
        value: 'admin',
        label: 'Admin'
      }]} />\r
      </Stack>,
    footer: <>\r
        <Button label="Send invites" variant="primary" />\r
        <Button label="Cancel" variant="secondary" />\r
      </>,
    size: 'sm'
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Choose a plan',
    description: 'You need a plan before you can invite anyone.',
    children: <RadioGroup label="Plan" name="plan" options={[{
      value: 'free',
      label: 'Free'
    }, {
      value: 'team',
      label: 'Team'
    }, {
      value: 'enterprise',
      label: 'Enterprise'
    }]} />,
    footer: <Button label="Continue" variant="primary" />,
    dismissible: false
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Terms of service',
    children: <Stack gap="normal">\r
        <Text>These terms govern your use of the service and any content you create with it.</Text>\r
        <Text>You keep ownership of your content. You grant us the rights needed to host and display it to the people you share it with.</Text>\r
        <Text>We may change these terms. When we do, we will tell you before the change takes effect.</Text>\r
        <Text>You can close your account at any time. Your content is deleted within thirty days of closing.</Text>\r
      </Stack>,
    size: 'lg',
    initialFocus: 'title'
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: args => {
    function Open(): React.JSX.Element {
      const [open, setOpen] = React.useState(true);
      return <Stack gap="loose" align="start">\r
          <Button label="Open dialog" onPress={() => setOpen(true)} />\r
          <Dialog {...args} open={open} onClose={reason => {
          args.onClose?.(reason);
          setOpen(false);
        }} footer={<>\r
                <Button label="Rename" variant="primary" onPress={() => setOpen(false)} />\r
                <Button label="Cancel" variant="secondary" onPress={() => setOpen(false)} />\r
              </>}>\r
            <Stack gap="loose">\r
              <Input label="Project name" name="name" defaultValue="Marketing site" />\r
              <Input label="Description" name="description" />\r
            </Stack>\r
          </Dialog>\r
        </Stack>;
    }
    return <Open />;
  }
}`,...B.parameters?.docs?.source},description:{story:`Open with its trigger and several focusable children, for the axe gate and manual keyboard checks.`,...B.parameters?.docs?.description}}}})))()}H();export{w as Default,N as HideHeading,A as InitialFocusClose,O as InitialFocusFirst,k as InitialFocusTitle,L as InvitePeople,B as Keyboard,R as MustBeAnswered,M as NoFooter,P as NotDismissible,z as ReadingDialog,I as RenameProject,D as SizeLg,E as SizeMd,T as SizeSm,j as WithDescription,F as WithOverrides,V as __namedExportsOrder,C as default};